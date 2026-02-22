import { redis } from "@/lib/redis";
import type { RateLimitResult } from "@/types/api";

/**
 * Rate limiting utilities.
 * Implements BR-001 (anonymous IP: 3/day) and BR-002 (free user: 20/month).
 * Uses Redis INCR + EXPIREAT for atomic, TTL-bounded counters.
 *
 * Docs: api-standards.md §8
 */

// ---------------------------------------------------------------------------
// Anonymous IP rate limit — 3 generations / 24 hours (BR-001)
// ---------------------------------------------------------------------------

const ANON_LIMIT = 3;
const ANON_TTL_SECONDS = 24 * 60 * 60; // 24 hours

/**
 * Check and increment the anonymous IP-based rate limit.
 * Redis key: `rate:anon:{ipHash}`
 */
export async function checkAnonRateLimit(
  ipHash: string
): Promise<RateLimitResult> {
  const key = `rate:anon:${ipHash}`;
  const now = Date.now();
  const resetAt = new Date(now + ANON_TTL_SECONDS * 1000);

  const count = await redis.incr(key);
  if (count === 1) {
    // First request in this window — set expiry
    await redis.expire(key, ANON_TTL_SECONDS);
  }

  // Re-read the actual TTL so resetAt is accurate if key already existed
  const ttl = await redis.ttl(key);
  const actualResetAt =
    ttl > 0 ? new Date(now + ttl * 1000) : resetAt;

  return {
    allowed: count <= ANON_LIMIT,
    remaining: Math.max(0, ANON_LIMIT - count),
    limit: ANON_LIMIT,
    resetAt: actualResetAt,
  };
}

// ---------------------------------------------------------------------------
// Authenticated free-user monthly rate limit — 20 / calendar month (BR-002)
// ---------------------------------------------------------------------------

const FREE_MONTHLY_LIMIT = 20;

/**
 * Check the free-user monthly generation quota using the PostgreSQL counter.
 * This function only checks — incrementing happens in generation-service.ts
 * after a successful generation (to avoid counting failed requests).
 *
 * @param generationCount  Current value of User.generation_count
 * @param resetAt          User.generation_reset_at — the start of the next window
 */
export function checkFreeUserQuota(
  generationCount: number,
  resetAt: Date
): RateLimitResult {
  return {
    allowed: generationCount < FREE_MONTHLY_LIMIT,
    remaining: Math.max(0, FREE_MONTHLY_LIMIT - generationCount),
    limit: FREE_MONTHLY_LIMIT,
    resetAt,
  };
}

// ---------------------------------------------------------------------------
// Hash helpers
// ---------------------------------------------------------------------------

/**
 * Deterministically hash a string using the Web Crypto API (SHA-256).
 * Used for IP addresses and prompts — we never store raw values.
 */
export async function sha256Hex(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
