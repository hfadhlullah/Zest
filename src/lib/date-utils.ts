/**
 * Calculates the first day of the next month at 00:00:00 UTC.
 * Used to initialize `generation_reset_at` for new users.
 *
 * @returns Date object set to midnight on the first day of next month
 */
export function getFirstDayOfNextMonth(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
  return nextMonth;
}

/**
 * Checks if generation quota has been reset for a user.
 * Returns true if today's date is >= the user's `generation_reset_at`.
 *
 * @param resetAt - The user's generation_reset_at date
 * @returns true if quota should be reset
 */
export function shouldResetGenerationQuota(resetAt: Date): boolean {
  return new Date() >= resetAt;
}

/**
 * Resets the generation quota and calculates the next reset date.
 * Called when a user's monthly quota resets.
 *
 * @returns Object with reset count (0) and next reset date
 */
export function resetGenerationQuota(): {
  generationCount: number;
  generationResetAt: Date;
} {
  return {
    generationCount: 0,
    generationResetAt: getFirstDayOfNextMonth(),
  };
}
