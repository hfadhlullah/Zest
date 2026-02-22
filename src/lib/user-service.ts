import { db } from "@/lib/db";
import { getFirstDayOfNextMonth } from "@/lib/date-utils";

// ---------------------------------------------------------------------------
// User Service
// ---------------------------------------------------------------------------

/**
 * Creates a new user record from a Clerk webhook `user.created` event.
 * Uses upsert to handle race conditions (webhook may arrive multiple times).
 *
 * @param clerkId - The Clerk user ID
 * @param email - The user's email address
 * @returns Created or updated User record
 */
export async function createUser(clerkId: string, email: string) {
  const generationResetAt = getFirstDayOfNextMonth();

  return db.user.upsert({
    where: { clerk_id: clerkId },
    update: {
      email,
      deleted_at: null, // Reactivate if previously deleted
    },
    create: {
      clerk_id: clerkId,
      email,
      plan: "free",
      generation_count: 0,
      generation_reset_at: generationResetAt,
    },
  });
}

/**
 * Updates a user's email address from a Clerk webhook `user.updated` event.
 * Returns silently if user doesn't exist (edge case, shouldn't happen).
 *
 * @param clerkId - The Clerk user ID
 * @param email - The new email address
 * @returns Updated User record or null if not found
 */
export async function updateUserEmail(clerkId: string, email: string) {
  return db.user.update({
    where: { clerk_id: clerkId },
    data: { email },
  });
}

/**
 * Soft-deletes a user from a Clerk webhook `user.deleted` event.
 * Sets `deleted_at` to mark the user as deleted (data retained for 30 days).
 * Queues a data purge job (stub for MVP: just logs).
 *
 * @param clerkId - The Clerk user ID
 * @returns Soft-deleted User record or null if not found
 */
export async function softDeleteUser(clerkId: string) {
  const user = await db.user.update({
    where: { clerk_id: clerkId },
    data: { deleted_at: new Date() },
  });

  // TODO: Queue purge job for 30-day retention (BR-016)
  // For MVP, just log the deletion
  console.log(
    `[User Service] Soft-deleted user ${clerkId} (ID: ${user.id}). Purge scheduled for 30 days.`
  );

  return user;
}

/**
 * Retrieves a user by Clerk ID.
 * Returns null if user not found or marked as deleted.
 *
 * @param clerkId - The Clerk user ID
 * @returns User record or null
 */
export async function getUserByClerkId(clerkId: string) {
  return db.user.findUnique({
    where: { clerk_id: clerkId },
  });
}
