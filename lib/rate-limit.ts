// Simple sliding window rate-limiter for API protection

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const trackerStore = new Map<string, RateLimitTracker>();

export function checkRateLimit(
  identifier: string,
  limit: number = 20,
  windowMs: number = 60 * 1000
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const entry = trackerStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    const newEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    trackerStore.set(identifier, newEntry);
    return {
      success: true,
      remaining: limit - 1,
      reset: newEntry.resetTime,
    };
  }

  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  entry.count += 1;
  trackerStore.set(identifier, entry);

  return {
    success: true,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  };
}
