import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = authenticateToken(req);
    if (error) return error;

    const result = await query(
      `SELECT a.*, e.title as event_title, e.date as event_date, e.location as event_location, e.capacity as event_capacity
       FROM attendees a
       JOIN events e ON a.event_id = e.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [user.id]
    );
    return NextResponse.json({ registrations: result.rows });
  } catch (err) {
    console.error('Get My Registrations error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
