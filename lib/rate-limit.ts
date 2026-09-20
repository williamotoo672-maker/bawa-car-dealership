import { sql } from "./db";

/**
 * A simple sliding-window rate limiter backed by Neon (no extra
 * infrastructure needed). Returns true if the request is allowed, false if
 * the caller has exceeded `limit` requests within `windowSeconds`.
 *
 * Fails open (allows the request) if the rate_limits table or database is
 * unreachable, so a database hiccup never takes the whole site down — it
 * just means rate limiting is temporarily not enforced. This is logged so
 * it's visible in your Vercel function logs.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const [row] = await sql`
      INSERT INTO rate_limits (key, count, window_start)
      VALUES (${key}, 1, now())
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
          THEN 1
          ELSE rate_limits.count + 1
        END,
        window_start = CASE
          WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
          THEN now()
          ELSE rate_limits.window_start
        END
      RETURNING count;
    `;
    return row.count <= limit;
  } catch (err) {
    console.error("Rate limit check failed (allowing request):", err);
    return true;
  }
}

/** Best-effort client IP extraction behind Vercel's proxy. */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
