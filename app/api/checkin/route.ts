import { NextRequest, NextResponse } from 'next/server';
import { transaction } from '@/lib/db';
import { authenticateToken, requireRole } from '@/lib/auth';
import { verifyTotpToken } from '@/lib/totp';

function generateLogId() {
  return 'log_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = authenticateToken(req);
    if (error) return error;

    const roleCheck = requireRole(user, 'organizer');
    if (roleCheck.error) return roleCheck.error;

    const body = await req.json();
    const { attendeeId, eventId, token, scannedAt, deviceId } = body;

    if (!attendeeId || !eventId) {
      return NextResponse.json({ error: 'attendeeId and eventId are required.' }, { status: 400 });
    }

    const scanTimestamp = scannedAt ? new Date(scannedAt).toISOString() : new Date().toISOString();
    const scanTimeMs = new Date(scanTimestamp).getTime();

    const result = await transaction(async (tx) => {
      const attRes = await tx(
        'SELECT id, event_id, status, totp_secret, attendee_name, attendee_email, checked_in_at FROM attendees WHERE id = $1 AND event_id = $2 FOR UPDATE',
        [attendeeId, eventId]
      );

      if (attRes.rows.length === 0) {
        return { status: 404, error: 'Attendee ticket record not found for this event.' };
      }

      const attendee = attRes.rows[0];

      if (token) {
        const isValid = verifyTotpToken(attendee.totp_secret, token, scanTimeMs);
        if (!isValid) {
          return { status: 400, error: 'ERR_EXPIRED_QR_CODE: Invalid or expired anti-screenshot QR token.' };
        }
      }

      if (attendee.status === 'checked_in') {
        return {
          status: 409,
          error: 'DUPLICATE_CHECKIN: Attendee has already been checked in.',
          attendee: {
            id: attendee.id,
            name: attendee.attendee_name,
            checkedInAt: attendee.checked_in_at
          }
        };
      }

      const updateAttRes = await tx(
        `UPDATE attendees
         SET status = 'checked_in', checked_in_at = $1
         WHERE id = $2 AND event_id = $3 AND status = 'registered'
         RETURNING id, attendee_name, attendee_email, status, checked_in_at`,
        [scanTimestamp, attendeeId, eventId]
      );

      if (updateAttRes.rows.length === 0) {
        return { status: 409, error: 'DUPLICATE_CHECKIN: Concurrent check-in collision detected.' };
      }

      const updateEventRes = await tx(
        `UPDATE events
         SET checked_in_count = checked_in_count + 1
         WHERE id = $1 AND checked_in_count < capacity
         RETURNING id, title, capacity, checked_in_count`,
        [eventId]
      );

      if (updateEventRes.rows.length === 0) {
        throw new Error('CAPACITY_EXCEEDED: Event is at maximum capacity.');
      }

      const updatedEvent = updateEventRes.rows[0];
      const updatedAttendee = updateAttRes.rows[0];

      const logId = generateLogId();
      await tx(
        `INSERT INTO check_in_logs (id, event_id, attendee_id, scanned_at, device_id, is_offline_sync)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [logId, eventId, attendeeId, scanTimestamp, deviceId || 'camera-scanner', false]
      );

      return {
        status: 200,
        success: true,
        message: 'Check-in successful!',
        attendee: updatedAttendee,
        eventStats: {
          checkedInCount: updatedEvent.checked_in_count,
          capacity: updatedEvent.capacity
        }
      };
    });

    return NextResponse.json(result, { status: result.status });
  } catch (err: any) {
    if (err.message.includes('CAPACITY_EXCEEDED')) {
      return NextResponse.json({ error: 'CAPACITY_EXCEEDED: Maximum event capacity reached.' }, { status: 400 });
    }
    console.error('Check-in transaction error:', err);
    return NextResponse.json({ error: 'Internal server error during check-in transaction.' }, { status: 500 });
  }
}
