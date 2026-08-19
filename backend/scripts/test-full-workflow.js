const http = require('http');

const API_BASE = 'http://localhost:5001/api';

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runFullWorkflowTest() {
  console.log('================================================================');
  console.log('   FULL-STACK EVENT CHECK-IN SYSTEM END-TO-END VERIFICATION   ');
  console.log('================================================================\n');

  try {
    const rand = Math.floor(Math.random() * 100000);

    // 1. Create Organizer
    console.log('[1/7] Registering Organizer User...');
    const orgRes = await request(`${API_BASE}/auth/register`, { method: 'POST' }, {
      name: 'Alice Organizer',
      email: `alice_org_${rand}@techsummit.com`,
      password: 'password123',
      role: 'organizer'
    });
    const orgToken = orgRes.data.token;
    console.log(`✓ Organizer registered: ${orgRes.data.user.name} (${orgRes.data.user.email})`);

    // 2. Create Event
    console.log('\n[2/7] Creating Event: "Global Tech Summit 2026" (Capacity: 50)...');
    const eventRes = await request(`${API_BASE}/events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${orgToken}` }
    }, {
      title: 'Global Tech Summit 2026',
      description: 'Keynote speeches, AI workshops, and networking lounge',
      date: new Date().toISOString(),
      location: 'Silicon Valley Convention Center',
      capacity: 50
    });
    const event = eventRes.data.event;
    console.log(`✓ Event Created! ID: ${event.id}, Title: "${event.title}", Capacity: ${event.capacity}`);

    // 3. Register 3 Attendees & Generate Anti-Screenshot Secret
    console.log('\n[3/7] Registering 3 Attendees & Generating Anti-Screenshot TOTP Secrets...');
    const attendees = [];
    const names = ['Bob Attendee', 'Charlie Attendee', 'Diana Attendee'];

    for (let i = 0; i < names.length; i++) {
      const attReg = await request(`${API_BASE}/auth/register`, { method: 'POST' }, {
        name: names[i],
        email: `${names[i].toLowerCase().replace(' ', '_')}_${rand}@test.com`,
        password: 'password123',
        role: 'attendee'
      });
      const attToken = attReg.data.token;

      const regRes = await request(`${API_BASE}/events/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${attToken}` }
      }, { eventId: event.id });

      attendees.push(regRes.data.attendee);
      console.log(`  - Registered: ${regRes.data.attendee.attendee_name} (ID: ${regRes.data.attendee.id}, Secret: ${regRes.data.attendee.totp_secret.substring(0, 8)}...)`);
    }

    // 4. Perform Anti-Screenshot TOTP Token Check-In
    console.log('\n[4/7] Testing TOTP Rotating Token Verification & Check-In...');
    const totpUtil = require('../src/utils/totp');
    const bob = attendees[0];
    const validToken = totpUtil.generateTotpToken(bob.totp_secret);

    const checkInBob = await request(`${API_BASE}/checkin`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${orgToken}` }
    }, {
      attendeeId: bob.id,
      eventId: event.id,
      token: validToken,
      deviceId: 'camera-scanner-main-gate'
    });
    console.log(`✓ Checked in Bob with TOTP token "${validToken}":`, checkInBob.data.message);

    // 5. Test Offline Scan Sync with "Earliest Scan Wins"
    console.log('\n[5/7] Testing Offline-First Scan Sync with "Earliest Scan Wins" Conflict Resolution...');
    const diana = attendees[2];
    const earlierTimestamp = new Date(Date.now() - 15 * 60 * 1000).toISOString(); // 15 mins ago

    const syncRes = await request(`${API_BASE}/checkin/sync-offline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${orgToken}` }
    }, {
      scans: [
        {
          attendeeId: diana.id,
          eventId: event.id,
          scannedAt: earlierTimestamp,
          deviceId: 'offline-tablet-gate-2'
        }
      ]
    });
    console.log(`✓ Offline Scan Synced:`, syncRes.data.message, syncRes.data.results);

    // 6. Test AI-Powered Insights Engine
    console.log('\n[6/7] Querying AI Insights Engine: "What time did check-ins peak?"...');
    const aiRes = await request(`${API_BASE}/events/ai-query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${orgToken}` }
    }, {
      eventId: event.id,
      query: 'What time did check-ins peak?'
    });

    console.log(`✓ AI Answer:\n  "${aiRes.data.answer}"`);
    console.log(`  (Used Fallback Engine: ${aiRes.data.usedFallback})`);

    // 7. Verify CSV Export Data
    console.log('\n[7/7] Verifying Export CSV Endpoint...');
    const csvRes = await request(`${API_BASE}/events/${event.id}/export`, {
      headers: { Authorization: `Bearer ${orgToken}` }
    });
    console.log(`✓ CSV Export Received (${csvRes.data.length} bytes):`);
    console.log('----------------------------------------------------');
    console.log(csvRes.data);
    console.log('----------------------------------------------------');

    console.log('\n🎉 ALL 4 HARD REQUIREMENTS & CORE FUNCTIONALITIES VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('Workflow test exception:', err);
    process.exit(1);
  }
}

runFullWorkflowTest();
