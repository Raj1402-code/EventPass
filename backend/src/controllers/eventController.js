const db = require('../config/db');
const { generateTotpSecret } = require('../utils/totp');

function generateId(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

// Create new event (Organizer only)
async function createEvent(req, res) {
  try {
    const { title, description, date, location, capacity } = req.body;

    if (!title || !date || !location || !capacity) {
      return res.status(400).json({ error: 'Title, date, location, and capacity are required.' });
    }

    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({ error: 'Capacity must be a positive integer.' });
    }

    const eventId = generateId('evt');

    await db.query(
      `INSERT INTO events (id, title, description, date, location, capacity, checked_in_count, organizer_id)
       VALUES ($1, $2, $3, $4, $5, $6, 0, $7)`,
      [eventId, title.trim(), description || '', new Date(date).toISOString(), location.trim(), parsedCapacity, req.user.id]
    );

    const newEvent = await db.query('SELECT * FROM events WHERE id = $1', [eventId]);
    return res.status(201).json({ message: 'Event created successfully.', event: newEvent.rows[0] });
  } catch (err) {
    console.error('Create Event error:', err);
    return res.status(500).json({ error: 'Internal server error while creating event.' });
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
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required.' });
    }

    const eventRes = await db.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const event = eventRes.rows[0];

    // Check existing registration
    const existing = await db.query('SELECT * FROM attendees WHERE event_id = $1 AND user_id = $2', [eventId, req.user.id]);
    if (existing.rows.length > 0) {
      return res.json({
        message: 'Already registered for this event.',
        attendee: existing.rows[0]
      });
    }

    // Check event capacity
    const regCountRes = await db.query('SELECT COUNT(*) as count FROM attendees WHERE event_id = $1', [eventId]);
    const currentTotalRegs = parseInt(regCountRes.rows[0].count, 10);
    if (currentTotalRegs >= event.capacity) {
      return res.status(400).json({ error: 'Event registration capacity reached.' });
    }

    const attendeeId = generateId('att');
    const totpSecret = generateTotpSecret();

    await db.query(
      `INSERT INTO attendees (id, event_id, user_id, attendee_name, attendee_email, totp_secret, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'registered')`,
      [attendeeId, eventId, req.user.id, req.user.name, req.user.email, totpSecret]
    );

    const newAttendee = await db.query('SELECT * FROM attendees WHERE id = $1', [attendeeId]);
    return res.status(201).json({
      message: 'Successfully registered for event.',
      attendee: newAttendee.rows[0]
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
  getEvents,
  getEventById,
  registerForEvent,
  getMyRegistrations,
  exportCSV
};
