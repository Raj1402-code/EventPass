import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { generateToken } from '@/lib/auth';

function generateId() {
  return 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, reg_no, email, password, role, otp } = body;

    if (!name || !reg_no || !email || !password || !role || !otp) {
      return NextResponse.json({ error: 'Name, registration number, email, password, role, and OTP are required.' }, { status: 400 });
    }

    if (!['organizer', 'attendee'].includes(role)) {
      return NextResponse.json({ error: 'Role must be either "organizer" or "attendee".' }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    if (!emailLower.endsWith('@vit.edu.in') && !emailLower.endsWith('@vitstudent.ac.in')) {
      return NextResponse.json({ error: 'Only VIT emails (@vit.edu.in or @vitstudent.ac.in) are allowed.' }, { status: 400 });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400 });
    }

    const otpRes = await query('SELECT * FROM otp_codes WHERE email = $1', [emailLower]);
    if (otpRes.rows.length === 0) {
      return NextResponse.json({ error: 'No OTP requested for this email. Please request a new OTP.' }, { status: 400 });
    }

    const otpRecord = otpRes.rows[0];
    if (otpRecord.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP code.' }, { status: 400 });
    }
    
    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    await query('DELETE FROM otp_codes WHERE email = $1', [emailLower]);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = generateId();

    await query(
      'INSERT INTO users (id, name, reg_no, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, name.trim(), reg_no.trim().toUpperCase(), emailLower, passwordHash, role]
    );

    const user = { id: userId, name: name.trim(), reg_no: reg_no.trim().toUpperCase(), email: emailLower, role };
    const token = generateToken(user);

    return NextResponse.json({
      message: 'User registered successfully.',
      user,
      token
    }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Internal server error during registration.' }, { status: 500 });
  }
}
