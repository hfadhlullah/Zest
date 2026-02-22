import { NextRequest, NextResponse } from "next/server";
import { verifyClerkWebhook } from "@/lib/webhook-verifier";
import {
  createUser,
  updateUserEmail,
  softDeleteUser,
} from "@/lib/user-service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{
      email_address: string;
      primary: boolean;
    }>;
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/webhooks/clerk
 *
 * Handles Clerk lifecycle events:
 * - user.created → Create User record in PostgreSQL
 * - user.updated → Sync email field
 * - user.deleted → Soft-delete User record (set deleted_at)
 * - Other events → Acknowledge silently
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const event = await verifyClerkWebhook(request);

    // Extract clerk_id from event data
    const clerkId = event.data.id;
    if (!clerkId) {
      console.warn("[Clerk Webhook] Event missing user ID:", event.type);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Get primary email from email_addresses array
    const primaryEmail =
      event.data.email_addresses?.find((e) => e.primary)?.email_address ?? "";

    // Route by event type
    if (event.type === "user.created") {
      if (!primaryEmail) {
        console.warn(`[Clerk Webhook] user.created missing email for ${clerkId}`);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const user = await createUser(clerkId, primaryEmail);
      console.log(
        `[Clerk Webhook] Created user: ${clerkId} (ID: ${user.id})`
      );

      return NextResponse.json(
        { received: true, user_id: user.id },
        { status: 200 }
      );
    }

    if (event.type === "user.updated") {
      if (!primaryEmail) {
        console.warn(`[Clerk Webhook] user.updated missing email for ${clerkId}`);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const user = await updateUserEmail(clerkId, primaryEmail);
      console.log(
        `[Clerk Webhook] Updated user email: ${clerkId} → ${primaryEmail}`
      );

      return NextResponse.json(
        { received: true, user_id: user.id },
        { status: 200 }
      );
    }

    if (event.type === "user.deleted") {
      const user = await softDeleteUser(clerkId);
      console.log(
        `[Clerk Webhook] Soft-deleted user: ${clerkId} (ID: ${user.id})`
      );

      return NextResponse.json(
        { received: true, user_id: user.id, deleted: true },
        { status: 200 }
      );
    }

    // Unknown event type — acknowledge silently
    console.log(`[Clerk Webhook] Ignoring unknown event type: ${event.type}`);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";

    // Signature verification failure → 401
    if (errorMsg.includes("signature verification failed")) {
      console.error("[Clerk Webhook] Signature verification failed:", errorMsg);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Database error or other issue → 500
    console.error("[Clerk Webhook] Error processing webhook:", errorMsg);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
