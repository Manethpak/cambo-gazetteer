import type { MiddlewareHandler } from "hono";

type RateLimitBinding = "API_RATE_LIMITER" | "SEARCH_RATE_LIMITER" | "LOOKUP_RATE_LIMITER";

/** Native counters are shared within a Cloudflare location, without D1 writes. */
export function rateLimit(
  binding: RateLimitBinding = "API_RATE_LIMITER",
): MiddlewareHandler<{ Bindings: Env }> {
  return async (c, next) => {
    if (c.req.method === "OPTIONS") return next();

    // Cloudflare supplies this header. Origin/Referer and forwarded headers
    // are client-controlled and must never grant an exemption or a new quota.
    const ip = c.req.header("cf-connecting-ip") || "unknown";
    const { success } = await c.env[binding].limit({ key: `cambo-gazetteer:${ip}` });
    if (!success) {
      c.header("Retry-After", "60");
      c.header("Cache-Control", "no-store");
      return c.json({ error: "Rate limit exceeded. Please retry in 60 seconds." }, 429);
    }
    return next();
  };
}
