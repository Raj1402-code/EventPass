import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateToken, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = authenticateToken(req);
    if (error) return error;

    const roleCheck = requireRole(user, 'organizer');
    if (roleCheck.error) return roleCheck.error;

    const id = (await params).id;

    const eventRes = await query('SELECT * FROM events WHERE id = $1', [id]);
    if (eventRes.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    const attendeesRes = await query(
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

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="event-${id}-attendees.csv"`
      }
    });
  } catch (err) {
    console.error('Export CSV error:', err);
    return NextResponse.json({ error: 'Internal server error exporting CSV.' }, { status: 500 });
  }
}
