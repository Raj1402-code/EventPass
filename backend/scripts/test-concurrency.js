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

async function runConcurrencyTest() {
  console.log('================================================================');
  console.log('   POSTGRESQL ROW LOCKING & CONCURRENCY TEST SUITE   ');
  console.log('================================================================\n');

  try {
    // 1. Health check
    console.log('[1/5] Verifying Backend Server Health...');
    const health = await request(`${API_BASE}/health`);
    if (health.status !== 200) {
      throw new Error(`Server unhealthy: ${JSON.stringify(health)}`);
    }
    console.log('✓ Backend Server is alive on port 5001.\n');

    // 2. Setup Organizer & Attendee
    console.log('[2/5] Creating Organizer & Attendee Accounts...');
    const rand = Math.floor(Math.random() * 1000000);
    const orgEmail = `org_concurrency_${rand}@test.com`;
    const attEmail = `att_concurrency_${rand}@test.com`;

    const orgReg = await request(`${API_BASE}/auth/register`, { method: 'POST' }, {
      name: 'Organizer Concurrency Tester',
      email: orgEmail,
      password: 'password123',
      role: 'organizer'
    });
    const orgToken = orgReg.data.token;

    const attReg = await request(`${API_BASE}/auth/register`, { method: 'POST' }, {
      name: 'Single Attendee Tester',
      email: attEmail,
      password: 'password123',
      role: 'attendee'
    });
    const attToken = attReg.data.token;
    console.log('✓ Accounts created successfully.\n');

    // 3. Create Event & Register Attendee
    console.log('[3/5] Creating Test Event and Event Registration...');
    const eventRes = await request(`${API_BASE}/events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${orgToken}` }
    }, {
      title: `Concurrency Lock Test Event ${rand}`,
      description: 'Testing 100 simultaneous check-ins for 1 ticket',
      date: new Date().toISOString(),
      location: 'Main Stage',
      capacity: 100
    });
    const eventId = eventRes.data.event.id;

    const regRes = await request(`${API_BASE}/events/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${attToken}` }
    }, { eventId });

    const attendeeId = regRes.data.attendee.id;
    console.log(`✓ Event created (ID: ${eventId}). Attendee registered (ID: ${attendeeId}).\n`);

    // 4. FIRE 100 CONCURRENT CHECK-IN REQUESTS FOR SAME ATTENDEE
    console.log('[4/5] 🚀 FIRING 100 SIMULTANEOUS CONCURRENT CHECK-IN REQUESTS...');
    const TOTAL_REQUESTS = 100;
    const promises = [];

    const startTime = Date.now();

    for (let i = 0; i < TOTAL_REQUESTS; i++) {
      promises.push(
        request(`${API_BASE}/checkin`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${orgToken}` }
        }, {
          attendeeId,
          eventId,
          deviceId: `test-device-${i}`
        })
      );
    }

    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    results.forEach((res) => {
      if (res.status === 200 && res.data.success) {
        successCount++;
      } else if (res.status === 409) {
        duplicateCount++;
      } else {
        errorCount++;
      }
    });

    console.log(`\n------------------ TEST 1 RESULTS (100 CONCURRENT SCANS) ------------------`);
    console.log(`Total Requests Fired:    ${TOTAL_REQUESTS}`);
    console.log(`Execution Time:          ${duration} ms`);
    console.log(`Successful Check-ins:    ${successCount}  (Expected: 1)`);
    console.log(`Rejected Duplicate Scans: ${duplicateCount} (Expected: 99)`);
    console.log(`Other Errors:            ${errorCount}   (Expected: 0)`);
    console.log(`----------------------------------------------------------------------------\n`);

    if (successCount === 1 && duplicateCount === 99) {
      console.log('✅ TEST 1 PASSED: PostgreSQL Row-Locking perfectly prevented duplicate check-ins!\n');
    } else {
      console.error('❌ TEST 1 FAILED: Expected 1 success and 99 duplicate rejections.\n');
      process.exit(1);
    }

    // 5. TEST EVENT CAPACITY LOCK CONCURRENCY
    console.log('[5/5] 🚀 FIRING CONCURRENT REQUESTS TO TEST CAPACITY LOCKING (Capacity = 1, Requests = 10)...');
    
    // Create Event with Initial Capacity = 10 to allow 10 registrations
    const capEventRes = await request(`${API_BASE}/events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${orgToken}` }
    }, {
      title: `Capacity Limit Lock Event ${rand}`,
      date: new Date().toISOString(),
      location: 'VIP Suite',
      capacity: 10
    });
    const capEventId = capEventRes.data.event.id;

    // Register 10 distinct attendees
    const attIds = [];
    for (let i = 0; i < 10; i++) {
      const u = await request(`${API_BASE}/auth/register`, { method: 'POST' }, {
        name: `Cap User ${i}`,
        email: `cap_user_${i}_${rand}_${i}@test.com`,
        password: 'password123',
        role: 'attendee'
      });
      const r = await request(`${API_BASE}/events/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${u.data.token}` }
      }, { eventId: capEventId });
      
      if (r.data && r.data.attendee) {
        attIds.push(r.data.attendee.id);
      }
    }

    // Direct DB query to set capacity = 1 for capacity lock testing
    const db = require('../src/config/db');
    await db.query('UPDATE events SET capacity = 1 WHERE id = $1', [capEventId]);

    // Fire 10 simultaneous check-ins for different registered attendees at capacity = 1
    const capPromises = attIds.map(attId =>
      request(`${API_BASE}/checkin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${orgToken}` }
      }, {
        attendeeId: attId,
        eventId: capEventId
      })
    );

    const capResults = await Promise.all(capPromises);

    let capSuccess = 0;
    let capRejected = 0;

    capResults.forEach((res) => {
      if (res.status === 200) {
        capSuccess++;
      } else if (res.status === 400 && res.data.error && res.data.error.includes('CAPACITY_EXCEEDED')) {
        capRejected++;
      }
    });

    console.log(`\n------------------ TEST 2 RESULTS (CAPACITY LOCK) ------------------`);
    console.log(`Total Requests Fired:        10`);
    console.log(`Successful Check-ins:        ${capSuccess}  (Expected: 1)`);
    console.log(`Rejected Capacity Overflows: ${capRejected}  (Expected: 9)`);
    console.log(`--------------------------------------------------------------------\n`);

    if (capSuccess === 1 && capRejected === 9) {
      console.log('✅ TEST 2 PASSED: Capacity lock atomicity verified successfully!\n');
      console.log('🎉 ALL CONCURRENCY HARD REQUIREMENTS FULLY VERIFIED AND PASSED PROOF CRITERIA!');
    } else {
      console.error(`❌ TEST 2 FAILED: Expected 1 capacity success and 9 capacity rejections. Got ${capSuccess} success, ${capRejected} rejected.`);
      process.exit(1);
    }

  } catch (err) {
    console.error('Concurrency Test Script Exception:', err);
    process.exit(1);
  }
}

runConcurrencyTest();
