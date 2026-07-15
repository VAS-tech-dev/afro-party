/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * Good enough as a first line of defense against form spam / bursts. Note that
 * on serverless (Vercel) each instance has its own memory, so this is
 * best-effort, not a hard global cap. For strict global limits, swap the Map
 * for a shared store (e.g. Upstash Redis) — the function signature stays the
 * same.
 */

type Timestamps = number[];
const buckets = new Map<string, Timestamps>();

export interface RateLimitResult {
  success: boolean;
  /** Seconds until the caller may retry (only meaningful when blocked). */
  retryAfter: number;
}

/**
 * @param key       Identifier to limit on (e.g. client IP + route).
 * @param limit     Max allowed requests within the window.
 * @param windowMs  Window length in milliseconds.
 */
export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const hits = (buckets.get(key) ?? []).filter((t) => t > windowStart);

  if (hits.length >= limit) {
    const oldest = hits[0] ?? now;
    return { success: false, retryAfter: Math.ceil((oldest + windowMs - now) / 1000) };
  }

  hits.push(now);
  buckets.set(key, hits);

  // Opportunistic cleanup to keep the map from growing unbounded.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      const fresh = v.filter((t) => t > windowStart);
      if (fresh.length === 0) buckets.delete(k);
      else buckets.set(k, fresh);
    }
  }

  return { success: true, retryAfter: 0 };
}

/** Best-effort client IP extraction from a Next.js request's headers. */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return headers.get('x-real-ip') ?? 'unknown';
}
