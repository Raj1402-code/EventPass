const { Pool } = require('pg');
const { PGlite } = require('@electric-sql/pglite');
const path = require('path');
const fs = require('fs');

let dbClient = null;
let isPGlite = false;

// Initialize database schema statements
const MIGRATION_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('organizer', 'attendee')),
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS events (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      date TIMESTAMPTZ NOT NULL,
      location VARCHAR(255) NOT NULL,
      capacity INT NOT NULL CHECK (capacity > 0),
      checked_in_count INT NOT NULL DEFAULT 0,
      organizer_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS attendees (
      id VARCHAR(64) PRIMARY KEY,
      event_id VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      attendee_name VARCHAR(255) NOT NULL,
      attendee_email VARCHAR(255) NOT NULL,
      totp_secret VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'checked_in')),
      checked_in_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(event_id, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS check_in_logs (
      id VARCHAR(64) PRIMARY KEY,
      event_id VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      attendee_id VARCHAR(64) NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
      scanned_at TIMESTAMPTZ NOT NULL,
      synced_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      device_id VARCHAR(255) DEFAULT 'default-device',
      is_offline_sync BOOLEAN DEFAULT FALSE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_attendees_event_status ON attendees(event_id, status)`,
  `CREATE INDEX IF NOT EXISTS idx_checkin_logs_event_time ON check_in_logs(event_id, scanned_at)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS reg_no VARCHAR(50)`,
  `CREATE TABLE IF NOT EXISTS otp_codes (
      email VARCHAR(255) PRIMARY KEY,
      otp VARCHAR(10) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
  )`
];

async function initDB() {
  const currentUser = process.env.USER || 'rajkumar';
  const dbUrl = process.env.DATABASE_URL || `postgres://${currentUser}@localhost:5432/event_checkin`;
  
  try {
    const testPool = new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 2000
    });
    const client = await testPool.connect();
    client.release();
    dbClient = testPool;
    console.log('✓ Successfully connected to Native PostgreSQL Server at:', dbUrl);
  } catch (err) {
    console.log('Native PostgreSQL server not available at', dbUrl, '-> Initializing WASM PGlite Engine...');
    const dataDir = path.join(__dirname, '../../pgdata');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    dbClient = new PGlite(dataDir);
    isPGlite = true;
    console.log('✓ PGlite PostgreSQL Engine initialized at', dataDir);
  }

  // Execute each migration statement individually
  for (const sql of MIGRATION_STATEMENTS) {
    await query(sql);
  }
  console.log('✓ Database Schema initialized successfully.');
}

async function query(text, params = []) {
  if (!dbClient) {
    await initDB();
  }
  if (isPGlite) {
    const res = await dbClient.query(text, params);
    return { rows: res.rows, rowCount: res.rows ? res.rows.length : 0 };
  } else {
    const res = await dbClient.query(text, params);
    return res;
  }
}

// Transaction wrapper for strict ACID row locking
async function transaction(callback) {
  if (!dbClient) {
    await initDB();
  }

  if (isPGlite) {
    return await dbClient.transaction(async (tx) => {
      const txQuery = async (sql, params = []) => {
        const res = await tx.query(sql, params);
        return { rows: res.rows, rowCount: res.rows ? res.rows.length : 0 };
      };
      return await callback(txQuery);
    });
  } else {
    const client = await dbClient.connect();
    try {
      await client.query('BEGIN');
      const txQuery = async (sql, params = []) => {
        const res = await client.query(sql, params);
        return res;
      };
      const result = await callback(txQuery);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = {
  initDB,
  query,
  transaction
};
