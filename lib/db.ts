import { Pool } from 'pg';

let pool: Pool | null = null;

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
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
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
  )`,
  `ALTER TABLE events ADD COLUMN IF NOT EXISTS is_group_event BOOLEAN DEFAULT FALSE`,
  `ALTER TABLE events ADD COLUMN IF NOT EXISTS min_group_size INT`,
  `ALTER TABLE events ADD COLUMN IF NOT EXISTS max_group_size INT`,
  `ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ`,
  `ALTER TABLE attendees DROP CONSTRAINT IF EXISTS attendees_event_id_user_id_key`
];

export async function initDB() {
  if (pool) return;
  const dbUrl = process.env.POSTGRES_URL || 'postgres://rajkumar@localhost:5432/event_checkin';
  
  pool = new Pool({
    connectionString: dbUrl,
    connectionTimeoutMillis: 5000,
    ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  for (const sql of MIGRATION_STATEMENTS) {
    try {
      await pool.query(sql);
    } catch (e: any) {
      if (!e.message.includes('already exists')) {
        console.error("Migration failed:", sql, e);
      }
    }
  }
}

export async function query(text: string, params: any[] = []) {
  if (!pool) await initDB();
  return await pool!.query(text, params);
}

export async function transaction(callback: (txQuery: (sql: string, params?: any[]) => Promise<any>) => Promise<any>) {
  if (!pool) await initDB();
  const client = await pool!.connect();
  try {
    await client.query('BEGIN');
    const txQuery = async (sql: string, params: any[] = []) => {
      return await client.query(sql, params);
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
