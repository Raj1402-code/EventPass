const db = require('../config/db');
const { generateTotpSecret } = require('../utils/totp');

function generateId(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

// Create new event (Organizer only)
async function createEvent(req, res) {
  try {
    const { title, description, date, location, capacity, isGroupEvent, minGroupSize, maxGroupSize, registrationDeadline } = req.body;

    if (!title || !date || !location || !capacity) {
      return res.status(400).json({ error: 'Title, date, location, and capacity are required.' });
    }

    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({ error: 'Capacity must be a positive integer.' });
    }

    const isGroup = Boolean(isGroupEvent);
    const minSize = isGroup && minGroupSize ? parseInt(minGroupSize, 10) : null;
    const maxSize = isGroup && maxGroupSize ? parseInt(maxGroupSize, 10) : null;
    const regDeadline = registrationDeadline ? new Date(registrationDeadline).toISOString() : null;

    const eventId = generateId('evt');

    await db.query(
      `INSERT INTO events (id, title, description, date, location, capacity, checked_in_count, organizer_id, is_group_event, min_group_size, max_group_size, registration_deadline)
       VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8, $9, $10, $11)`,
      [eventId, title.trim(), description || '', new Date(date).toISOString(), location.trim(), parsedCapacity, req.user.id, isGroup, minSize, maxSize, regDeadline]
    );

    const newEvent = await db.query('SELECT * FROM events WHERE id = $1', [eventId]);
    return res.status(201).json({ message: 'Event created successfully.', event: newEvent.rows[0] });
  } catch (err) {
    console.error('Create Event error:', err);
    return res.status(500).json({ error: 'Internal server error while creating event.' });
  }
}

// Update existing event (Organizer only)
async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const { title, description, date, location, capacity, registrationDeadline } = req.body;

    const eventRes = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const event = eventRes.rows[0];
    if (event.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to edit this event.' });
    }

    if (!title || !date || !location || !capacity) {
      return res.status(400).json({ error: 'Title, date, location, and capacity are required.' });
    }

    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({ error: 'Capacity must be a positive integer.' });
    }

    const regDeadline = registrationDeadline ? new Date(registrationDeadline).toISOString() : null;

    await db.query(
      `UPDATE events 
       SET title = $1, description = $2, date = $3, location = $4, capacity = $5, registration_deadline = $6
       WHERE id = $7`,
      [title.trim(), description || '', new Date(date).toISOString(), location.trim(), parsedCapacity, regDeadline, id]
    );

    const updatedEvent = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    return res.json({ message: 'Event updated successfully.', event: updatedEvent.rows[0] });
  } catch (err) {
    console.error('Update Event error:', err);
    return res.status(500).json({ error: 'Internal server error while updating event.' });
  }
}

// Get list of events
async function getEvents(req, res) {
  try {
    let result;
    if (req.user.role === 'organizer') {
      result = await db.query('SELECT * FROM events WHERE organizer_id = $1 ORDER BY created_at DESC', [req.user.id]);
    } else {
      result = await db.query('SELECT * FROM events ORDER BY created_at DESC');
    }
    return res.json({ events: result.rows });
  } catch (err) {
    console.error('Get Events error:', err);
    return res.status(500).json({ error: 'Internal server error fetching events.' });
  }
}

// Get single event details with live attendee statistics
async function getEventById(req, res) {
  try {
    const { id } = req.params;
    const eventRes = await db.query('SELECT * FROM events WHERE id = $1', [id]);

    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const event = eventRes.rows[0];

    const attendeesRes = await db.query(
      `SELECT a.id, a.attendee_name, a.attendee_email, a.status, a.checked_in_at, a.created_at, a.totp_secret
       FROM attendees a
       WHERE a.event_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );

    return res.json({
      event,
      attendees: attendeesRes.rows
    });
  } catch (err) {
    console.error('Get Event By Id error:', err);
    return res.status(500).json({ error: 'Internal server error fetching event details.' });
  }
}

// Register Attendee for an Event
async function registerForEvent(req, res) {
  try {
    const { eventId, groupMembers } = req.body; // groupMembers: [{name, email}]

    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required.' });
    }

    const eventRes = await db.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const event = eventRes.rows[0];

    // Check registration deadline
    if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
      return res.status(403).json({ error: 'Registration deadline has passed.' });
    }

    // Determine attendees to register
    let attendeesToRegister = [];
    if (event.is_group_event && groupMembers && Array.isArray(groupMembers) && groupMembers.length > 0) {
      const size = groupMembers.length;
      if (event.min_group_size && size < event.min_group_size) {
        return res.status(400).json({ error: `Group size must be at least ${event.min_group_size}.` });
      }
      if (event.max_group_size && size > event.max_group_size) {
        return res.status(400).json({ error: `Group size cannot exceed ${event.max_group_size}.` });
      }
      attendeesToRegister = groupMembers;
    } else {
      attendeesToRegister = [{ name: req.user.name, email: req.user.email }];
    }

    // Check event capacity
    const regCountRes = await db.query('SELECT COUNT(*) as count FROM attendees WHERE event_id = $1', [eventId]);
    const currentTotalRegs = parseInt(regCountRes.rows[0].count, 10);
    if (currentTotalRegs + attendeesToRegister.length > event.capacity) {
      return res.status(400).json({ error: 'Event registration capacity reached.' });
    }

    // Check existing registration
    const existing = await db.query('SELECT * FROM attendees WHERE event_id = $1 AND user_id = $2', [eventId, req.user.id]);
    if (existing.rows.length > 0) {
      return res.json({
        message: 'Already registered for this event.',
        attendees: existing.rows
      });
    }

    // Use a transaction to register all attendees
    const newAttendees = await db.transaction(async (txQuery) => {
      const inserted = [];
      for (const member of attendeesToRegister) {
        const attendeeId = generateId('att');
        const totpSecret = generateTotpSecret();
        
        await txQuery(
          `INSERT INTO attendees (id, event_id, user_id, attendee_name, attendee_email, totp_secret, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'registered')`,
          [attendeeId, eventId, req.user.id, member.name, member.email, totpSecret]
        );
        inserted.push({ id: attendeeId, name: member.name, email: member.email, status: 'registered' });
      }
      return inserted;
    });

    return res.status(201).json({
      message: 'Successfully registered for event.',
      attendees: newAttendees
    });
  } catch (err) {
    console.error('Register for Event error:', err);
    return res.status(500).json({ error: 'Internal server error registering for event.' });
  }
}

// Get Attendee registrations for current logged-in attendee
async function getMyRegistrations(req, res) {
  try {
    const result = await db.query(
      `SELECT a.*, e.title as event_title, e.date as event_date, e.location as event_location, e.capacity as event_capacity
       FROM attendees a
       JOIN events e ON a.event_id = e.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    return res.json({ registrations: result.rows });
  } catch (err) {
    console.error('Get My Registrations error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

// Export CSV of event attendees (Organizer only)
async function exportCSV(req, res) {
  try {
    const { id } = req.params;

    const eventRes = await db.query('SELECT * FROM events WHERE id = $1', [id]);
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const attendeesRes = await db.query(
      `SELECT a.id, a.attendee_name, a.attendee_email, a.status, a.checked_in_at, a.created_at
       FROM attendees a
       WHERE a.event_id = $1
       ORDER BY a.created_at ASC`,
      [id]
    );

    let csvContent = 'Attendee ID,Name,Email,Status,Checked-In At,Registered At\n';
    attendeesRes.rows.forEach(att => {
      const checkedInAt = att.checked_in_at ? new Date(att.checked_in_at).toISOString() : 'N/A';
      const registeredAt = new Date(att.created_at).toISOString();
      csvContent += `"${att.id}","${att.attendee_name}","${att.attendee_email}","${att.status}","${checkedInAt}","${registeredAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="event-${id}-attendees.csv"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('Export CSV error:', err);
    return res.status(500).json({ error: 'Internal server error exporting CSV.' });
  }
}

module.exports = {
  createEvent,
  updateEvent,
  getEvents,
  getEventById,
  registerForEvent,
  getMyRegistrations,
  exportCSV
};
