import { db } from "@/lib/db";
import { resetGenerationQuota, shouldResetGenerationQuota } from "@/lib/date-utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Free tier: 10 generations per month
const FREE_TIER_QUOTA = 10;

// Paid tier: unlimited (for MVP, we'll use a very large number)
const PAID_TIER_QUOTA = 10000;

// ---------------------------------------------------------------------------
// Usage Service
// ---------------------------------------------------------------------------

/**
 * Checks if a user has exceeded their generation quota.
 * Resets the quota if the reset date has passed.
 *
 * @param userId - The user ID (from Zest DB)
 * @returns Object with quota info: { allowed, remaining, limit, resetAt }
 */
export async function checkGenerationQuota(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if quota should be reset
  if (shouldResetGenerationQuota(user.generation_reset_at)) {
    const { generationCount, generationResetAt } = resetGenerationQuota();
    await db.user.update({
      where: { id: userId },
      data: {
        generation_count: generationCount,
        generation_reset_at: generationResetAt,
      },
    });
    return {
      allowed: true,
      remaining: getLimitForPlan(user.plan),
      limit: getLimitForPlan(user.plan),
      resetAt: generationResetAt,
    };
  }

  const limit = getLimitForPlan(user.plan);
  const remaining = Math.max(0, limit - user.generation_count);
  const allowed = remaining > 0;

  return {
    allowed,
    remaining,
    limit,
    resetAt: user.generation_reset_at,
  };
}

/**
 * Increments a user's generation count.
 * Should be called after a successful generation.
 *
 * @param userId - The user ID
 * @returns Updated user record
 */
export async function incrementGenerationCount(userId: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      generation_count: {
        increment: 1,
      },
    },
  });
}

/**
 * Gets the generation limit for a user's plan.
 *
 * @param plan - The user's plan ("free" or "paid")
 * @returns The generation limit
 */
export function getLimitForPlan(plan: "free" | "paid"): number {
  switch (plan) {
    case "free":
      return FREE_TIER_QUOTA;
    case "paid":
      return PAID_TIER_QUOTA;
    default:
      return FREE_TIER_QUOTA;
  }
}
