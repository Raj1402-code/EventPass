import { NextRequest, NextResponse } from 'next/server';
import { transaction } from '@/lib/db';
import { authenticateToken, requireRole } from '@/lib/auth';

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
    const { scans } = body;

    if (!Array.isArray(scans) || scans.length === 0) {
      return NextResponse.json({ error: 'Scans array is required for offline sync.' }, { status: 400 });
    }

    const sortedScans = [...scans].sort((a, b) => new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime());
    const syncResults = [];

    for (const scan of sortedScans) {
      const { attendeeId, eventId, token, scannedAt, deviceId } = scan;
      const scanTimestamp = scannedAt ? new Date(scannedAt).toISOString() : new Date().toISOString();
      const scanTimeMs = new Date(scanTimestamp).getTime();

      try {
        const itemResult = await transaction(async (tx) => {
          const attRes = await tx(
            'SELECT id, event_id, status, totp_secret, attendee_name, attendee_email, checked_in_at FROM attendees WHERE id = $1 AND event_id = $2 FOR UPDATE',
            [attendeeId, eventId]
          );

          if (attRes.rows.length === 0) {
            return { attendeeId, success: false, reason: 'Ticket not found' };
          }

          const attendee = attRes.rows[0];

          if (attendee.status === 'checked_in') {
            const existingTime = new Date(attendee.checked_in_at).getTime();
            if (scanTimeMs < existingTime) {
              await tx(
                'UPDATE attendees SET checked_in_at = $1 WHERE id = $2',
                [scanTimestamp, attendeeId]
              );
              return {
                attendeeId,
                success: true,
                resolution: 'EARLIEST_SCAN_WINS_UPDATED_TIMESTAMP',
                checkedInAt: scanTimestamp
              };
            } else {
              return {
                attendeeId,
                success: false,
                resolution: 'LATER_OFFLINE_SCAN_IGNORED',
                existingCheckedInAt: attendee.checked_in_at
              };
            }
          }

          const updateAtt = await tx(
            `UPDATE attendees
             SET status = 'checked_in', checked_in_at = $1
             WHERE id = $2 AND status = 'registered'
             RETURNING id, attendee_name, checked_in_at`,
            [scanTimestamp, attendeeId]
          );

          if (updateAtt.rows.length === 0) {
            return { attendeeId, success: false, reason: 'Already checked in' };
          }

          const updateEvt = await tx(
            `UPDATE events
             SET checked_in_count = checked_in_count + 1
             WHERE id = $1 AND checked_in_count < capacity
             RETURNING checked_in_count, capacity`,
            [eventId]
          );

          if (updateEvt.rows.length === 0) {
            throw new Error('CAPACITY_EXCEEDED');
          }

          const logId = generateLogId();
          await tx(
            `INSERT INTO check_in_logs (id, event_id, attendee_id, scanned_at, device_id, is_offline_sync)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [logId, eventId, attendeeId, scanTimestamp, deviceId || 'offline-sync', true]
          );

          return {
            attendeeId,
            success: true,
            resolution: 'OFFLINE_SCAN_SYNCED',
            checkedInCount: updateEvt.rows[0].checked_in_count,
            capacity: updateEvt.rows[0].capacity
          };
        });

        syncResults.push(itemResult);
      } catch (err: any) {
        syncResults.push({ attendeeId, success: false, error: err.message });
      }
    }

    return NextResponse.json({
      message: `Processed ${syncResults.length} offline scans.`,
      results: syncResults
    });
  } catch (err) {
    console.error('Offline sync error:', err);
    return NextResponse.json({ error: 'Internal server error during sync.' }, { status: 500 });
  }
}
