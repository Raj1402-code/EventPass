import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateToken, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const eventRes = await query('SELECT * FROM events WHERE id = $1', [id]);

    if (eventRes.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    const event = eventRes.rows[0];

    const attendeesRes = await query(
      `SELECT a.id, a.attendee_name, a.attendee_email, a.status, a.checked_in_at, a.created_at, a.totp_secret
       FROM attendees a
       WHERE a.event_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );

    return NextResponse.json({
      event,
      attendees: attendeesRes.rows
    });
  } catch (err) {
    console.error('Get Event By Id error:', err);
    return NextResponse.json({ error: 'Internal server error fetching event details.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = authenticateToken(req);
    if (error) return error;

    const roleCheck = requireRole(user, 'organizer');
    if (roleCheck.error) return roleCheck.error;

    const id = (await params).id;
    const body = await req.json();
    const { title, description, date, location, capacity, registrationDeadline } = body;

    const eventRes = await query('SELECT * FROM events WHERE id = $1', [id]);
    if (eventRes.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    const event = eventRes.rows[0];
    if (event.organizer_id !== user.id) {
      return NextResponse.json({ error: 'You do not have permission to edit this event.' }, { status: 403 });
    }

    if (!title || !date || !location || !capacity) {
      return NextResponse.json({ error: 'Title, date, location, and capacity are required.' }, { status: 400 });
    }

    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return NextResponse.json({ error: 'Capacity must be a positive integer.' }, { status: 400 });
    }

    const regDeadline = registrationDeadline ? new Date(registrationDeadline).toISOString() : null;

    await query(
      `UPDATE events 
       SET title = $1, description = $2, date = $3, location = $4, capacity = $5, registration_deadline = $6
       WHERE id = $7`,
      [title.trim(), description || '', new Date(date).toISOString(), location.trim(), parsedCapacity, regDeadline, id]
    );

    const updatedEvent = await query('SELECT * FROM events WHERE id = $1', [id]);
    return NextResponse.json({ message: 'Event updated successfully.', event: updatedEvent.rows[0] });
  } catch (err) {
    console.error('Update Event error:', err);
    return NextResponse.json({ error: 'Internal server error while updating event.' }, { status: 500 });
  }
}
