const bcrypt = require('bcryptjs');
const { crypto } = require('crypto');
const db = require('../config/db');
const { generateToken } = require('../middleware/auth');
const nodemailer = require('nodemailer');

function generateId() {
  return 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

async function register(req, res) {
  try {
    const { name, reg_no, email, password, role, otp } = req.body;

    if (!name || !reg_no || !email || !password || !role || !otp) {
      return res.status(400).json({ error: 'Name, registration number, email, password, role, and OTP are required.' });
    }

    if (!['organizer', 'attendee'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either "organizer" or "attendee".' });
    }

    const emailLower = email.toLowerCase().trim();
    if (!emailLower.endsWith('@vit.edu.in') && !emailLower.endsWith('@vitstudent.ac.in')) {
      return res.status(400).json({ error: 'Only VIT emails (@vit.edu.in or @vitstudent.ac.in) are allowed.' });
    }

    // Check existing user
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Check OTP
    const otpRes = await db.query('SELECT * FROM otp_codes WHERE email = $1', [emailLower]);
    if (otpRes.rows.length === 0) {
      return res.status(400).json({ error: 'No OTP requested for this email. Please request a new OTP.' });
    }

    const otpRecord = otpRes.rows[0];
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP code.' });
    }
    
    if (new Date(otpRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Clear OTP
    await db.query('DELETE FROM otp_codes WHERE email = $1', [emailLower]);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = generateId();

    await db.query(
      'INSERT INTO users (id, name, reg_no, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, name.trim(), reg_no.trim().toUpperCase(), emailLower, passwordHash, role]
    );

    const user = { id: userId, name: name.trim(), reg_no: reg_no.trim().toUpperCase(), email: emailLower, role };
    const token = generateToken(user);

    return res.status(201).json({
      message: 'User registered successfully.',
      user,
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const dbUser = result.rows[0];
    const isMatch = await bcrypt.compare(password, dbUser.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role };
    const token = generateToken(user);

    return res.json({
      message: 'Login successful.',
      user,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
}

async function getMe(req, res) {
  try {
    const result = await db.query('SELECT id, name, reg_no, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

async function sendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    
    const emailLower = email.toLowerCase().trim();
    if (!emailLower.endsWith('@vit.edu.in') && !emailLower.endsWith('@vitstudent.ac.in')) {
      return res.status(400).json({ error: 'Only VIT emails (@vit.edu.in or @vitstudent.ac.in) are allowed.' });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.query(
      `INSERT INTO otp_codes (email, otp, expires_at) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
      [emailLower, otp, expiresAt]
    );

    // Send email
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
      // Use Ethereal Email for testing
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

    return res.json({ message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ error: 'Failed to send OTP.' });
  }
}

module.exports = {
  register,
  login,
  getMe,
  sendOtp
};
