import type { Context, Next } from "hono";

/**
 * In-memory sliding window rate limiter.
 * Tracks request timestamps per key (IP-based) and enforces
 * a maximum number of requests within a rolling time window.
 *
 * Note: This is per-isolate, so limits are approximate across
 * multiple Cloudflare edge instances. Sufficient for basic abuse prevention.
 */

const DEFAULT_WINDOW_MS = 60_000; // 1 minute
const DEFAULT_MAX_REQUESTS = 20;

/** Map of rate-limit key → array of request timestamps */
const requestLog = new Map<string, number[]>();

/** Periodic cleanup interval (5 minutes) */
const CLEANUP_INTERVAL_MS = 300_000;
let lastCleanup = Date.now();

/**
 * Removes expired entries from the request log to prevent unbounded memory growth.
 */
function cleanupStaleEntries(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  const cutoff = now - windowMs;

  for (const [key, timestamps] of requestLog) {
    const valid = timestamps.filter((t) => t > cutoff);
    if (valid.length === 0) {
      requestLog.delete(key);
    } else {
      requestLog.set(key, valid);
    }
  }
}

/**
 * Determines the client identifier for rate limiting.
 * Uses CF-Connecting-IP (Cloudflare) → X-Forwarded-For → X-Real-IP → "unknown".
 */
function getClientIp(c: Context): string {
  return (
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for")?.split(",")[0].trim() ??
    c.req.header("x-real-ip") ??
    "unknown"
  );
}

/**
 * Checks if the request origin matches the same domain as the Worker.
 * Same-origin requests are exempt from rate limiting.
 */
function isSameOrigin(c: Context): boolean {
  const origin = c.req.header("origin");
  const referer = c.req.header("referer");

  // Get the request host (the Worker's own domain)
  const requestHost = new URL(c.req.url).host;

  if (origin) {
    try {
      return new URL(origin).host === requestHost;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      return new URL(referer).host === requestHost;
    } catch {
      return false;
    }
  }

  // No origin or referer — could be a direct API call, apply rate limit
  return false;
}

type RateLimitOptions = {
  windowMs?: number;
  maxRequests?: number;
};

/**
 * Rate limiting middleware for Hono.
 * Exempts same-origin requests; limits external origins by client IP.
 *
 * @param options.windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param options.maxRequests - Max requests per window (default: 20)
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? DEFAULT_MAX_REQUESTS;

  return async (c: Context, next: Next) => {
    // Same-origin requests bypass rate limiting
    if (isSameOrigin(c)) {
      return next();
    }

    // Cleanup stale entries periodically
    cleanupStaleEntries(windowMs);

    const key = getClientIp(c);
    const now = Date.now();
    const cutoff = now - windowMs;

    // Get existing timestamps and filter to current window
    const timestamps = (requestLog.get(key) ?? []).filter((t) => t > cutoff);

    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - timestamps.length);
    c.header("X-RateLimit-Limit", maxRequests.toString());
    c.header("X-RateLimit-Remaining", remaining.toString());
    c.header(
      "X-RateLimit-Reset",
      Math.ceil((cutoff + windowMs) / 1000).toString(),
    );

    if (timestamps.length >= maxRequests) {
      const retryAfter = Math.ceil(
        (timestamps[0] + windowMs - now) / 1000,
      );
      c.header("Retry-After", retryAfter.toString());
      return c.json(
        { error: "Rate limit exceeded. Maximum 20 requests per minute." },
        429,
      );
    }

    // Record this request
    timestamps.push(now);
    requestLog.set(key, timestamps);

    return next();
  };
}
