const crypto = require('crypto');

const STEP_SECONDS = 30;

function generateTotpSecret() {
  return crypto.randomBytes(20).toString('hex');
}

function generateTotpToken(secret, timestampMs = Date.now()) {
  const timeBucket = Math.floor(timestampMs / 1000 / STEP_SECONDS);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`bucket:${timeBucket}`);
  // Take first 8 chars hex for clean token presentation
  return hmac.digest('hex').substring(0, 8).toUpperCase();
}

function verifyTotpToken(secret, token, timestampMs = Date.now()) {
  if (!token || !secret) return false;
  
  const currentBucket = Math.floor(timestampMs / 1000 / STEP_SECONDS);
  const normalizedToken = token.trim().toUpperCase();

  // Allow current time bucket, previous bucket (-30s), and next bucket (+30s)
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

function getTimeRemainingSeconds(timestampMs = Date.now()) {
  const seconds = Math.floor(timestampMs / 1000);
  return STEP_SECONDS - (seconds % STEP_SECONDS);
}

module.exports = {
  STEP_SECONDS,
  generateTotpSecret,
  generateTotpToken,
  verifyTotpToken,
  getTimeRemainingSeconds
};
