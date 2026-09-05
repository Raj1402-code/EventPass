import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';
import { authenticateToken } from '@/lib/auth';
import crypto from 'crypto';

function generateId(prefix: string) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

function generateTotpSecret() {
  return crypto.randomBytes(20).toString('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = authenticateToken(req);
    if (error) return error;

    const body = await req.json();
    const { eventId, groupMembers } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required.' }, { status: 400 });
    }

    const eventRes = await query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (eventRes.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    const event = eventRes.rows[0];

    if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
      return NextResponse.json({ error: 'Registration deadline has passed.' }, { status: 403 });
    }

    let attendeesToRegister = [];
    if (event.is_group_event && groupMembers && Array.isArray(groupMembers) && groupMembers.length > 0) {
      const size = groupMembers.length;
      if (event.min_group_size && size < event.min_group_size) {
        return NextResponse.json({ error: `Group size must be at least ${event.min_group_size}.` }, { status: 400 });
      }
      if (event.max_group_size && size > event.max_group_size) {
        return NextResponse.json({ error: `Group size cannot exceed ${event.max_group_size}.` }, { status: 400 });
      }
      attendeesToRegister = groupMembers;
    } else {
      attendeesToRegister = [{ name: user.name, email: user.email }];
    }

    const regCountRes = await query('SELECT COUNT(*) as count FROM attendees WHERE event_id = $1', [eventId]);
    const currentTotalRegs = parseInt(regCountRes.rows[0].count, 10);
    if (currentTotalRegs + attendeesToRegister.length > event.capacity) {
      return NextResponse.json({ error: 'Event registration capacity reached.' }, { status: 400 });
    }

    const existing = await query('SELECT * FROM attendees WHERE event_id = $1 AND user_id = $2', [eventId, user.id]);
    if (existing.rows.length > 0) {
      return NextResponse.json({
        message: 'Already registered for this event.',
        attendees: existing.rows
      });
    }

    const newAttendees = await transaction(async (txQuery) => {
      const inserted = [];
      for (const member of attendeesToRegister) {
        const attendeeId = generateId('att');
        const totpSecret = generateTotpSecret();
        
        await txQuery(
          `INSERT INTO attendees (id, event_id, user_id, attendee_name, attendee_email, totp_secret, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'registered')`,
          [attendeeId, eventId, user.id, member.name, member.email, totpSecret]
        );
        inserted.push({ id: attendeeId, name: member.name, email: member.email, status: 'registered' });
      }
      return inserted;
    });

    return NextResponse.json({
      message: 'Successfully registered for event.',
      attendees: newAttendees
    }, { status: 201 });
  } catch (err) {
    console.error('Register for Event error:', err);
    return NextResponse.json({ error: 'Internal server error registering for event.' }, { status: 500 });
  }
}
