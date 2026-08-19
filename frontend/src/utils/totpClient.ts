// Frontend TOTP client helper (Uses Web Crypto API or simple HMAC algorithm)

const STEP_SECONDS = 30;

// Simple string hash for TOTP token generation matching backend Sha256 bucket logic
export function generateClientTotpToken(secret: string, timestampMs = Date.now()): string {
  if (!secret) return '00000000';
  const timeBucket = Math.floor(timestampMs / 1000 / STEP_SECONDS);
  const inputStr = `bucket:${timeBucket}:${secret}`;
  
  let hash = 0;
  for (let i = 0; i < inputStr.length; i++) {
    const char = inputStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const hex = Math.abs(hash).toString(16).padStart(8, '0').substring(0, 8).toUpperCase();
  return hex;
}

export function getTimeRemainingSeconds(timestampMs = Date.now()): number {
  const seconds = Math.floor(timestampMs / 1000);
  return STEP_SECONDS - (seconds % STEP_SECONDS);
}
