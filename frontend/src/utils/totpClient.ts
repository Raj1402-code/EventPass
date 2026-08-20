// Frontend TOTP client helper (Uses Web Crypto API)

const STEP_SECONDS = 30;

export async function generateClientTotpToken(secret: string, timestampMs = Date.now()): Promise<string> {
  if (!secret) return '00000000';
  const timeBucket = Math.floor(timestampMs / 1000 / STEP_SECONDS);
  const inputStr = `bucket:${timeBucket}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  
  const signature = await window.crypto.subtle.sign(
    'HMAC', cryptoKey, encoder.encode(inputStr)
  );
  
  const hashArray = Array.from(new Uint8Array(signature));
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hex.substring(0, 8).toUpperCase();
}

export function getTimeRemainingSeconds(timestampMs = Date.now()): number {
  const seconds = Math.floor(timestampMs / 1000);
  return STEP_SECONDS - (seconds % STEP_SECONDS);
}
