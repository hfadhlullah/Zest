# ZEST-024: Usage Tracking & Quota Enforcement

**Epic:** ZEST-F07 (Freemium Usage Limits & Upgrade)
**Layer:** L3-backend
**Role:** Backend
**Estimation:** 3
**Priority:** Must

---

## Objective

Implement server-side quota enforcement for generation limits. Add `checkGenerationQuota()` middleware helper called before every generation attempt. Implement `GET /api/v1/users/me/usage` for the quota display UI. Track anonymous usage in Redis and authenticated usage in PostgreSQL (`User.generation_count`), with monthly reset logic.

## Technical Specifications

- **Proposed Files:**
  - `src/lib/quota-service.ts` — `checkGenerationQuota()`, `incrementGenerationCount()`, `getUserUsage()`, `resetIfMonthRollover()`
  - `src/app/api/v1/users/me/usage/route.ts` — `GET` handler
  - `src/app/api/v1/generate/route.ts` (update) — call `checkGenerationQuota()` before proxying to Go service
- **Functions/Classes:**
  - `checkGenerationQuota(userId | null, ipHash)` → `{ allowed: boolean, remaining: number, reset_at: string }`:
    - Anonymous: `GET rate_limit:{ipHash}` from Redis; limit 3 per 24h (TTL = next midnight UTC)
    - Free user: read `User.generation_count` + `generation_reset_at`; call `resetIfMonthRollover()` first
    - Paid user / admin: always returns `{ allowed: true, remaining: Infinity }`
  - `incrementGenerationCount(userId | null, ipHash)` — increments counter after successful generation:
    - Anonymous: `INCR rate_limit:{ipHash}` with TTL set on first write
    - Authenticated: Prisma `update` with `generation_count: { increment: 1 }`
  - `resetIfMonthRollover(user)` — if `now() > user.generation_reset_at`: reset `generation_count = 0`, set `generation_reset_at` to first day of next month
  - `getUserUsage(userId)` → usage object for API response
- **API Endpoints:** `GET /api/v1/users/me/usage`
- **Data Models:** `User` (Prisma); Redis keys: `rate_limit:{ipHash}`

## Acceptance Criteria (Technical)

- [ ] `checkGenerationQuota()` returns `allowed: false` for anonymous user at 3+ generations in 24h
- [ ] `checkGenerationQuota()` returns `allowed: false` for free user at 20+ generations this month
- [ ] `checkGenerationQuota()` always returns `allowed: true` for paid/admin users
- [ ] `POST /api/v1/generate` returns `429 RATE_LIMIT_EXCEEDED` when quota check fails (anonymous) or `403 PLAN_LIMIT_EXCEEDED` (free user)
- [ ] Monthly counter resets automatically when `generation_reset_at` is in the past
- [ ] `GET /api/v1/users/me/usage` returns correct `generation_count`, `remaining`, `reset_at`
- [ ] `incrementGenerationCount()` is called only after a successful generation (not on error)
- [ ] Unit tests for: anonymous limit at 3, free limit at 20, paid unlimited, month rollover

## Business Rules & Logic

- BR-001: Anonymous limit = 3 per 24h (Redis TTL expires at midnight UTC)
- BR-002: Free limit = 20 per calendar month (PostgreSQL counter with reset)
- Paid/admin: unlimited (no counter check)
- Quota check uses error code `RATE_LIMIT_EXCEEDED` (429) for anonymous, `PLAN_LIMIT_EXCEEDED` (403) for free users (FSD §5.4)

## Dependencies

- Depends on: ZEST-001 (Prisma + Redis setup)
- Depends on: ZEST-004 (`POST /api/v1/generate` route — quota check inserted here)
- Depends on: ZEST-018 (auth — determine user role/plan)
- Depends on: ZEST-019 (User record created on sign-up with `generation_reset_at`)

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests: quota boundary conditions (anonymous at 3, free at 20, paid, month rollover)
- [ ] Integration test: full generation attempt blocked at limit → correct HTTP error code
- [ ] Lint/Type check clear
