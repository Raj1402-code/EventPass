import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;
    if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    
    const emailLower = email.toLowerCase().trim();
    if (!emailLower.endsWith('@vit.edu.in') && !emailLower.endsWith('@vitstudent.ac.in')) {
      return NextResponse.json({ error: 'Only VIT emails (@vit.edu.in or @vitstudent.ac.in) are allowed.' }, { status: 400 });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await query(
      `INSERT INTO otp_codes (email, otp, expires_at) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
      [emailLower, otp, expiresAt]
    );

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"EventPass AI" <${process.env.EMAIL_USER}>`,
        to: emailLower,
        subject: 'EventPass AI - Registration OTP',
        text: `Your verification code is: ${otp}\n\nIt will expire in 10 minutes.`
      });
      console.log(`Real OTP sent to ${emailLower}`);
    } else {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      const info = await transporter.sendMail({
        from: '"EventPass AI" <test@ethereal.email>',
        to: emailLower,
        subject: 'EventPass AI - Registration OTP',
        text: `Your verification code is: ${otp}\n\nIt will expire in 10 minutes.`
      });

      console.log(`\n============================`);
      console.log(`OTP EMAIL SENT (TEST MODE)`);
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      console.log(`============================\n`);
    }

    return NextResponse.json({ message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('Send OTP error:', err);
    return NextResponse.json({ error: 'Failed to send OTP.' }, { status: 500 });
  }
}
