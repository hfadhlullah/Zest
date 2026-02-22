# PRD Addendum: Authentication & User Accounts

**Feature:** `authentication`
**Epic:** ZEST-F05
**Parent PRD:** `docs/prd.md`
**Status:** Approved
**Date:** 2026-02-22
**Priority:** P1

---

## 1. Feature Metadata

| Field | Value |
|-------|-------|
| Feature Name | Authentication & User Accounts |
| Feature Slug | `authentication` |
| Epic Code | `ZEST-F05` |
| Priority | P1 |
| Impacted Users | Anonymous users upgrading to accounts; all returning users |
| PRD Stories | US-15, US-16 |

---

## 2. User Stories

| ID | User Story | Acceptance Criteria | Priority |
|----|------------|---------------------|----------|
| US-15 | As a user, I want to use Zest without signing up so that I can try it quickly | **Given** I am a new visitor<br>**When** I enter a prompt<br>**Then** I can generate and edit without authentication | P0 |
| US-16 | As a user, I want to sign up so that I can save my projects | **Given** I am using Zest anonymously<br>**When** I click "Sign Up"<br>**Then** I can create an account with email or OAuth (Google, GitHub) | P1 |

---

## 3. Functional Requirements

### 3.1 Authentication Provider
- Clerk is the sole auth provider; Zest stores no passwords
- Supported sign-in methods: email/password, Google OAuth, GitHub OAuth
- On first sign-in, Clerk fires `user.created` webhook → system creates a `User` record with `plan = "free"`
- Subsequent sign-ins: Clerk JWT attached to every API call in `Authorization: Bearer {token}` header

### 3.2 Middleware
- Next.js middleware (`src/middleware.ts`) inspects Clerk session on every request
- Protected routes: `/dashboard/*`, `/api/v1/projects/*`, `/api/v1/users/*`
- Unprotected (but rate-limited): `/api/v1/generate`, `/api/v1/exports` (HTML/CSS only for anonymous)
- Middleware attaches `userId` and `plan` to request context for downstream API routes

### 3.3 Clerk Webhook Handler
- Endpoint: `POST /api/v1/webhooks/clerk`
- Verifies webhook signature using Clerk signing secret (`CLERK_WEBHOOK_SECRET`)
- Handles: `user.created` → insert `User`; `user.updated` → sync email; `user.deleted` → set `deleted_at`, queue purge job

### 3.4 Sign In / Sign Up Pages
- Routes: `/sign-in` and `/sign-up` (Clerk hosted components or custom UI with Clerk elements)
- "Continue with Google" and "Continue with GitHub" OAuth buttons
- After successful auth, redirect to `/dashboard` (returning user) or editor (new user mid-flow)
- "Sign In" CTA appears in top-right of editor toolbar for anonymous users
- Anonymous → authenticated: preserve current generation in session/localStorage and associate with new account on first save

### 3.5 Session Management
- Clerk sessions are JWT-based; no custom session logic required
- `useAuth()` and `useUser()` Clerk React hooks used throughout the app
- Server-side: `auth()` from `@clerk/nextjs/server` in API routes

---

## 4. ERD Delta

Uses existing `User` entity. No new entities.

---

## 5. API Contract

### POST /api/v1/webhooks/clerk

**Auth:** Clerk webhook signature verification (SVIX header `svix-id`, `svix-timestamp`, `svix-signature`)

**Request body:** Clerk webhook event payload (varies by event type)

**Response 200:** `{ "received": true }`

**Error Codes:**
| HTTP | Code | Condition |
|------|------|-----------|
| 400 | `VALIDATION_ERROR` | Missing or invalid webhook headers |
| 401 | `UNAUTHORIZED` | Signature verification failed |

---

## 6. Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `signup_started` | User begins signup flow | `source` (toolbar/upgrade-wall), `trigger_action` |
| `signup_completed` | User completes signup | `method` (email/google/github), `plan_type` |
| `signin_completed` | User signs in | `method`, `returning_user` |

---

## 7. Open Questions

| ID | Question | Owner | Status |
|----|----------|-------|--------|
| AUTH-OQ-01 | Should anonymous → authenticated session migration (preserving generation) be in-scope for MVP? | Product | Open |
| AUTH-OQ-02 | Should GitHub OAuth be supported at launch or deferred? | Product | Open |

---

## 8. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | AI Assistant | Initial version |
