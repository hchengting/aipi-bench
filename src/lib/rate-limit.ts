// Lightweight in-memory rate limiter using a native Map.
// Suitable for single-instance deployments behind a reverse proxy.

interface RateLimitEntry {
  failures: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILURES = 5;

function getEntry(key: string): RateLimitEntry {
  const now = Date.now();
  const existing = store.get(key);
  if (existing && now <= existing.resetAt) {
    return existing;
  }
  const fresh: RateLimitEntry = { failures: 0, resetAt: now + WINDOW_MS };
  store.set(key, fresh);
  return fresh;
}

/** Check if the key is currently rate limited. */
export function isRateLimited(key: string): { limited: boolean; retryAfter?: number } {
  const entry = getEntry(key);
  if (entry.failures >= MAX_FAILURES) {
    const retryAfter = Math.ceil((entry.resetAt - Date.now()) / 1000);
    return { limited: true, retryAfter: Math.max(retryAfter, 1) };
  }
  return { limited: false };
}

/** Record a failed attempt for the key. */
export function recordFailure(key: string): void {
  const entry = getEntry(key);
  entry.failures += 1;
}

/** Clear the rate limit entry (e.g., on successful login). */
export function clearRateLimit(key: string): void {
  store.delete(key);
}

/** Extract the client IP from a NextRequest behind nginx. */
export function getClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}

// Periodic cleanup to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000); // every 5 minutes
