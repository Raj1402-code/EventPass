import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = authenticateToken(req);
    if (error) return error;

    const result = await query('SELECT id, name, reg_no, email, role, created_at FROM users WHERE id = $1', [user.id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ user: result.rows[0] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
