import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateToken, requireRole } from '@/lib/auth';

function generateId(prefix: string) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export async function GET(req: NextRequest) {
  try {
    const { user, error } = authenticateToken(req);
    if (error) return error;

    let result;
    if (user.role === 'organizer') {
      result = await query('SELECT * FROM events WHERE organizer_id = $1 ORDER BY created_at DESC', [user.id]);
    } else {
      result = await query('SELECT * FROM events ORDER BY created_at DESC');
    }
    return NextResponse.json({ events: result.rows });
  } catch (err) {
    console.error('Get Events error:', err);
    return NextResponse.json({ error: 'Internal server error fetching events.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = authenticateToken(req);
    if (error) return error;
    
    const roleCheck = requireRole(user, 'organizer');
    if (roleCheck.error) return roleCheck.error;

    const body = await req.json();
    const { title, description, date, location, capacity, isGroupEvent, minGroupSize, maxGroupSize, registrationDeadline } = body;

    if (!title || !date || !location || !capacity) {
      return NextResponse.json({ error: 'Title, date, location, and capacity are required.' }, { status: 400 });
    }

    const parsedCapacity = parseInt(capacity, 10);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return NextResponse.json({ error: 'Capacity must be a positive integer.' }, { status: 400 });
    }

    const isGroup = Boolean(isGroupEvent);
    const minSize = isGroup && minGroupSize ? parseInt(minGroupSize, 10) : null;
    const maxSize = isGroup && maxGroupSize ? parseInt(maxGroupSize, 10) : null;
    const regDeadline = registrationDeadline ? new Date(registrationDeadline).toISOString() : null;

    const eventId = generateId('evt');

    await query(
      `INSERT INTO events (id, title, description, date, location, capacity, checked_in_count, organizer_id, is_group_event, min_group_size, max_group_size, registration_deadline)
       VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8, $9, $10, $11)`,
      [eventId, title.trim(), description || '', new Date(date).toISOString(), location.trim(), parsedCapacity, user.id, isGroup, minSize, maxSize, regDeadline]
    );

    const newEvent = await query('SELECT * FROM events WHERE id = $1', [eventId]);
    return NextResponse.json({ message: 'Event created successfully.', event: newEvent.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('Create Event error:', err);
    return NextResponse.json({ error: 'Internal server error while creating event.' }, { status: 500 });
  }
}
