import { Webhook } from "svix";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WebhookEvent {
  id: string;
  object: "event";
  type: string;
  created_at: number;
  data: {
    id: string;
    object: string;
    primary_email_address_id?: string;
    email_addresses?: Array<{
      id: string;
      email_address: string;
      primary: boolean;
    }>;
    external_id?: string;
  };
}

// ---------------------------------------------------------------------------
// Webhook Verification
// ---------------------------------------------------------------------------

/**
 * Verifies a Clerk webhook request using Svix signature validation.
 *
 * @param request - The incoming HTTP request with Svix headers
 * @returns Parsed webhook event data
 * @throws Error with status 401 if signature is invalid
 */
export async function verifyClerkWebhook(
  request: Request
): Promise<WebhookEvent> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "CLERK_WEBHOOK_SECRET not configured. Configure this in your .env file."
    );
  }

  // Get headers
  const svixId = request.headers.get("svix-id") ?? "";
  const svixTimestamp = request.headers.get("svix-timestamp") ?? "";
  const svixSignature = request.headers.get("svix-signature") ?? "";

  // Get raw body as text
  const body = await request.text();

  // Verify signature using Svix SDK
  const wh = new Webhook(secret);
  try {
    const payload = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;

    return payload;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Webhook signature verification failed: ${errorMsg}`);
  }
}
