/**
 * Server-side auth helper (ZEST-018).
 *
 * `getCurrentUser()` wraps Clerk's `auth()` and returns the Zest user
 * record from PostgreSQL (id + plan).  Returns `null` for anonymous requests
 * so callers can handle both cases without throwing.
 */

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export interface CurrentUser {
  /** Internal Zest UUID from the `users` table */
  userId: string;
  plan: "free" | "paid";
}

/**
 * Returns `{ userId, plan }` for authenticated requests, or `null` for anonymous.
 *
 * NOTE: This performs a DB lookup — call it once per request and pass the
 * result down rather than calling it multiple times.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const dbUser = await prisma.user.findUnique({
    where: { clerk_id: clerkUserId },
    select: { id: true, plan: true },
  });

  if (!dbUser) return null;

  return {
    userId: dbUser.id,
    plan: dbUser.plan,
  };
}
