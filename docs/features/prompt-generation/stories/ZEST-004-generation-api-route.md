# ZEST-004: Generation API Route (Next.js)

**Epic:** ZEST-F01 (Prompt-to-UI Generation)
**Layer:** L3-backend
**Role:** Backend
**Estimation:** 5
**Priority:** Must

---

## Objective

Implement `POST /api/v1/generate` in Next.js. This route validates the request, checks auth and rate limits, proxies to the Go AI Service, saves the `Generation` record in PostgreSQL, and returns the generation result to the client.

## Technical Specifications

- **Proposed Files:**
  - `src/app/api/v1/generate/route.ts`
  - `src/lib/rate-limit.ts` (`checkRateLimit(userId | ip, type): Promise<RateLimitResult>`)
  - `src/lib/generation-service.ts` (`createGeneration(data): Promise<Generation>`)
  - `src/schemas/generate.schema.ts` (Zod schema for request body)
  - `src/types/api.ts` (shared API response types)
- **Functions/Classes:**
  - `POST handler` in `route.ts`
  - `checkRateLimit(identifier, type)` → `{ allowed: boolean, remaining: number, resetAt: Date }`
  - `createGeneration(data)` → Prisma `Generation` record
- **API Endpoints:** `POST /api/v1/generate`
- **Data Models:** `Generation` (Prisma)

## Acceptance Criteria (Technical)

- [ ] `POST /api/v1/generate` with valid body returns `201` with `{ data: { generation_id, html, css, provider_used, duration_ms, cached } }`
- [ ] Request body validated against Zod schema; invalid body returns `400 VALIDATION_ERROR` with `details.fields`
- [ ] Anonymous request without JWT: allowed, rate-limited by IP (3/day via Redis)
- [ ] Authenticated free user over 20/month quota: returns `429 RATE_LIMIT_EXCEEDED` with `details.reset_at`
- [ ] `Generation` record created in PostgreSQL after successful Go service response
- [ ] `X-Request-ID` header present on all responses
- [ ] Proxy timeout to Go service: 65 seconds (5s buffer over BR-003's 60s)
- [ ] `503 AI_SERVICE_UNAVAILABLE` returned when Go service returns all-providers-failed error
- [ ] `504 GENERATION_TIMEOUT` returned when Go service times out

## Business Rules & Logic

- BR-001: Anonymous 3/day (Redis key: `rate:anon:{ip_hash}`, TTL 24h)
- BR-002: Free user 20/month (PostgreSQL `User.generation_count`; incremented on success)
- BR-004 through BR-008: Enforced in Go AI Service; this route passes through errors
- Prompt is NOT stored in plain text — only `prompt_hash` (SHA-256) saved to `Generation` record (BR-014)

## Dependencies

- Depends on: ZEST-001 (Prisma, Redis setup)
- Depends on: ZEST-003 (Go AI Service running)

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests for Zod validation, rate limit logic, and error mapping
- [ ] Integration test: full round-trip with mocked Go service returns 201
- [ ] Lint/Type check clear
