# ZEST-018: Clerk Auth Setup & Middleware

**Epic:** ZEST-F05 (Authentication & User Accounts)
**Layer:** L1-data
**Role:** Fullstack
**Estimation:** 3
**Priority:** Must

---

## Objective

Install and configure Clerk for Next.js. Set up the authentication middleware that protects routes, injects auth context into API routes, and exposes `userId` + `plan` for all downstream handlers. Configure environment variables and verify the auth flow end-to-end.

## Technical Specifications

- **Proposed Files:**
  - `src/middleware.ts` — Clerk middleware using `clerkMiddleware()` with public/protected route config
  - `src/lib/auth.ts` — server-side helper: `getCurrentUser(): { userId, plan } | null` wrapping Clerk's `auth()`
  - `.env.local` (additions) — `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`
  - `src/app/layout.tsx` — wrap with `<ClerkProvider>`
- **Functions/Classes:**
  - `clerkMiddleware()` — configured with `createRouteMatcher` for protected patterns (`/dashboard(.*)`, `/api/v1/projects(.*)`, `/api/v1/users(.*)`)
  - `getCurrentUser()` — reads Clerk auth; fetches `User` record from DB by `clerk_id`; returns `{ userId, plan }` or null for anonymous
- **Dependencies added:** `@clerk/nextjs`

## Acceptance Criteria (Technical)

- [ ] `npm install @clerk/nextjs` added to `package.json`
- [ ] `<ClerkProvider>` wraps the root layout
- [ ] `src/middleware.ts` uses `clerkMiddleware()` and blocks unauthenticated access to `/dashboard` and `/api/v1/projects/*` with `401`
- [ ] `/api/v1/generate` and `/api/v1/exports` remain accessible without auth (rate-limited separately)
- [ ] `getCurrentUser()` returns `null` for anonymous requests (no error thrown)
- [ ] `getCurrentUser()` returns `{ userId, plan }` for authenticated requests
- [ ] Unit test: middleware allows public routes; blocks protected routes without session
- [ ] `.env.local.example` updated with Clerk variable names (values empty)

## Business Rules & Logic

- All protected route access without a valid Clerk JWT returns `401 UNAUTHORIZED` (FSD §5.4)
- Anonymous generation endpoints remain open but are rate-limited by IP (BR-001)

## Dependencies

- Depends on: ZEST-001 (Next.js project scaffold)
- Depends on: ZEST-004 (API route structure established)

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests: middleware route matching (public vs protected)
- [ ] Manual test: sign-in redirects; protected route blocks unauthenticated request
- [ ] Lint/Type check clear
