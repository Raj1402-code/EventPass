const db = require('../config/db');
const { verifyTotpToken } = require('../utils/totp');

function generateLogId() {
  return 'log_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

// Single Real-Time Scan Check-In (Organizer scanning attendee)
async function performCheckIn(req, res) {
  const io = req.app.get('io');
  const { attendeeId, eventId, token, scannedAt, deviceId } = req.body;

  if (!attendeeId || !eventId) {
    return res.status(400).json({ error: 'attendeeId and eventId are required.' });
  }

  const scanTimestamp = scannedAt ? new Date(scannedAt).toISOString() : new Date().toISOString();
  const scanTimeMs = new Date(scanTimestamp).getTime();

  try {
    const result = await db.transaction(async (tx) => {
      // Step 1: Row Lock attendee record with FOR UPDATE
      const attRes = await tx(
        'SELECT id, event_id, status, totp_secret, attendee_name, attendee_email, checked_in_at FROM attendees WHERE id = $1 AND event_id = $2 FOR UPDATE',
        [attendeeId, eventId]
      );

      if (attRes.rows.length === 0) {
        return { status: 404, error: 'Attendee ticket record not found for this event.' };
      }

      const attendee = attRes.rows[0];

      // Step 2: Validate Anti-Screenshot TOTP Rotating Token (if provided)
      if (token) {
        const isValid = verifyTotpToken(attendee.totp_secret, token, scanTimeMs);
        if (!isValid) {
          return { status: 400, error: 'ERR_EXPIRED_QR_CODE: Invalid or expired anti-screenshot QR token.' };
        }
      }

      // Step 3: Check duplicate check-in
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

      // Step 4: Atomic Row Update for Attendee Status
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

      // Step 5: Atomic Event Capacity Guard & Increment
      const updateEventRes = await tx(
        `UPDATE events
         SET checked_in_count = checked_in_count + 1
         WHERE id = $1 AND checked_in_count < capacity
         RETURNING id, title, capacity, checked_in_count`,
        [eventId]
      );

      if (updateEventRes.rows.length === 0) {
        // Rollback capacity overflow
        throw new Error('CAPACITY_EXCEEDED: Event is at maximum capacity.');
      }

      const updatedEvent = updateEventRes.rows[0];
      const updatedAttendee = updateAttRes.rows[0];

      // Step 6: Log Audit Trail
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

    if (result.status === 200 && io) {
      // Emit real-time Socket.io update to room
      io.to(`event_${eventId}`).emit('checkin:update', {
        eventId,
        attendee: result.attendee,
        checkedInCount: result.eventStats.checkedInCount,
        capacity: result.eventStats.capacity,
        timestamp: scanTimestamp
      });
    }

    return res.status(result.status).json(result);
  } catch (err) {
    if (err.message.includes('CAPACITY_EXCEEDED')) {
      return res.status(400).json({ error: 'CAPACITY_EXCEEDED: Maximum event capacity reached.' });
    }
    console.error('Check-in transaction error:', err);
    return res.status(500).json({ error: 'Internal server error during check-in transaction.' });
  }
}

// Offline Scan Sync Endpoint (Earliest Scan Wins Conflict Resolution)
async function syncOfflineScans(req, res) {
  const io = req.app.get('io');
  const { scans } = req.body; // Array of offline scan objects

  if (!Array.isArray(scans) || scans.length === 0) {
    return res.status(400).json({ error: 'Scans array is required for offline sync.' });
  }

  // Sort scans chronological ASC by scannedAt
  const sortedScans = [...scans].sort((a, b) => new Date(a.scannedAt) - new Date(b.scannedAt));
  const syncResults = [];

  for (const scan of sortedScans) {
    const { attendeeId, eventId, token, scannedAt, deviceId } = scan;
    const scanTimestamp = scannedAt ? new Date(scannedAt).toISOString() : new Date().toISOString();
    const scanTimeMs = new Date(scanTimestamp).getTime();

    try {
      const itemResult = await db.transaction(async (tx) => {
        const attRes = await tx(
          'SELECT id, event_id, status, totp_secret, attendee_name, attendee_email, checked_in_at FROM attendees WHERE id = $1 AND event_id = $2 FOR UPDATE',
          [attendeeId, eventId]
        );

        if (attRes.rows.length === 0) {
          return { attendeeId, success: false, reason: 'Ticket not found' };
        }

        const attendee = attRes.rows[0];

        // "Earliest Scan Wins" Conflict Resolution
        if (attendee.status === 'checked_in') {
          const existingTime = new Date(attendee.checked_in_at).getTime();
          if (scanTimeMs < existingTime) {
            // Offline scan occurred EARLIER than current DB timestamp. Update timestamp to earlier scan!
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

        // Perform Check-in for previously unchecked attendee
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

      // Socket update per synced item if event stats changed
      if (itemResult.success && itemResult.checkedInCount && io) {
        io.to(`event_${eventId}`).emit('checkin:update', {
          eventId,
          checkedInCount: itemResult.checkedInCount,
          capacity: itemResult.capacity,
          isOfflineSync: true
        });
      }
    } catch (err) {
      syncResults.push({ attendeeId, success: false, error: err.message });
    }
  }

  return res.json({
    message: `Processed ${syncResults.length} offline scans.`,
    results: syncResults
  });
}

module.exports = {
  performCheckIn,
  syncOfflineScans
};
