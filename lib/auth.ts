import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-event-checkin-jwt-key-2026';

export function generateToken(user: any) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  let token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.split(' ')[1] : null;
  
  if (!token) {
    const url = new URL(req.url);
    token = url.searchParams.get('token');
  }

  if (!token) {
    return { error: NextResponse.json({ error: 'Authentication required. Token missing.' }, { status: 401 }) };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { user: decoded as any };
  } catch (err) {
    return { error: NextResponse.json({ error: 'Invalid or expired token.' }, { status: 403 }) };
  }
}

export function requireRole(user: any, ...roles: string[]) {
  if (!user) {
    return { error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) };
  }
  if (!roles.includes(user.role)) {
    return { error: NextResponse.json({ error: `Access denied. Required role: ${roles.join(' or ')}` }, { status: 403 }) };
  }
  return { success: true };
}
