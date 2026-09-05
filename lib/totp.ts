import crypto from 'crypto';

const STEP_SECONDS = 30;

export function generateTotpSecret() {
  return crypto.randomBytes(20).toString('hex');
}

export function generateTotpToken(secret: string, timestampMs = Date.now()) {
  const timeBucket = Math.floor(timestampMs / 1000 / STEP_SECONDS);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`bucket:${timeBucket}`);
  return hmac.digest('hex').substring(0, 8).toUpperCase();
}

export function verifyTotpToken(secret: string, token: string, timestampMs = Date.now()) {
  if (!token || !secret) return false;
  
  const currentBucket = Math.floor(timestampMs / 1000 / STEP_SECONDS);
  const normalizedToken = token.trim().toUpperCase();

  const bucketsToTest = [currentBucket, currentBucket - 1, currentBucket + 1];

  for (const bucket of bucketsToTest) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`bucket:${bucket}`);
    const validToken = hmac.digest('hex').substring(0, 8).toUpperCase();
    if (validToken === normalizedToken) {
      return true;
    }
  }

  return false;
}

export function getTimeRemainingSeconds(timestampMs = Date.now()) {
  const seconds = Math.floor(timestampMs / 1000);
  return STEP_SECONDS - (seconds % STEP_SECONDS);
}
