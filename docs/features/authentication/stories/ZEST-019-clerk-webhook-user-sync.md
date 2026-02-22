# ZEST-019: Clerk Webhook Handler — User Sync

**Epic:** ZEST-F05 (Authentication & User Accounts)
**Layer:** L3-backend
**Role:** Backend
**Estimation:** 2
**Priority:** Must

---

## Objective

Implement `POST /api/v1/webhooks/clerk` to handle Clerk lifecycle events. On `user.created`, insert a new `User` row in PostgreSQL. On `user.updated`, sync the email field. On `user.deleted`, set `deleted_at` and enqueue a data-deletion job (30-day purge). Webhook authenticity is verified using the Svix signature.

## Technical Specifications

- **Proposed Files:**
  - `src/app/api/v1/webhooks/clerk/route.ts` — POST handler
  - `src/lib/webhook-verifier.ts` — `verifyClerkWebhook(request): WebhookEvent` using `svix`
  - `src/lib/user-service.ts` — `createUser(clerkId, email)`, `updateUserEmail(clerkId, email)`, `softDeleteUser(clerkId)`
- **Functions/Classes:**
  - `verifyClerkWebhook(request)` — reads `svix-id`, `svix-timestamp`, `svix-signature` headers; verifies against `CLERK_WEBHOOK_SECRET`; throws `401` on failure
  - `createUser(clerkId, email)` — Prisma `upsert` on `clerk_id`; sets `plan = "free"`, `generation_count = 0`, `generation_reset_at = first day of next month`
  - `updateUserEmail(clerkId, email)` — Prisma `update` by `clerk_id`
  - `softDeleteUser(clerkId)` — sets `deleted_at = now()`; schedules purge job (stub for MVP: log only)
- **API Endpoints:** `POST /api/v1/webhooks/clerk`
- **Data Models:** `User` (Prisma)
- **Dependencies added:** `svix`

## Acceptance Criteria (Technical)

- [ ] `POST /api/v1/webhooks/clerk` verifies Svix signature; returns `401` for invalid signatures
- [ ] `user.created` event → `User` row created with `plan = "free"`, correct `generation_reset_at`
- [ ] `user.updated` event → email updated on existing `User` record
- [ ] `user.deleted` event → `deleted_at` set; user data NOT immediately deleted
- [ ] Unknown event types return `200 { "received": true }` without error
- [ ] Unit tests for `verifyClerkWebhook` (valid/invalid signature), `createUser`, `softDeleteUser`
- [ ] Integration test: simulate `user.created` payload → verify DB row exists

## Business Rules & Logic

- BR-016: User data purged within 30 days of deletion (purge job stub acceptable for MVP)
- BR-014: No raw prompts stored; only prompt hashes (enforced at generation layer, not here)
- `clerk_id` is the primary external key for all user lookups

## Dependencies

- Depends on: ZEST-001 (Prisma + PostgreSQL setup)
- Depends on: ZEST-018 (Clerk installed; `CLERK_WEBHOOK_SECRET` env var available)

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests: signature verification, each event type handler
- [ ] Integration test: webhook payload → DB state
- [ ] Lint/Type check clear
