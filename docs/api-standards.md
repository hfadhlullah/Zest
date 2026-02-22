# Core API Standards

**Project:** Zest — AI-powered UI Builder
**Scope:** All API endpoints (`/api/v1/*`)
**Date:** 2026-02-22
**Version:** 1.0
**Status:** Approved
**Source Documents:** `docs/fsd.md` §5, `docs/tech-stack.md`

> This document is the authoritative contract for every API endpoint in Zest. All feature API contracts (`docs/features/[feature]/api-contract.md`) must conform to these standards. In case of conflict, this document wins.

---

## 1. Base URL & Versioning

```
https://{domain}/api/v1/{resource}
```

| Rule | Detail |
|------|--------|
| **Prefix** | All endpoints are prefixed with `/api/v1/` |
| **Versioning strategy** | URL path versioning (`/api/v1/`, `/api/v2/`) |
| **Breaking change policy** | Any change that alters the shape of a request or response, removes a field, or changes behavior is a **breaking change** and requires a new version prefix |
| **Non-breaking changes** | Adding optional fields, adding new endpoints, or relaxing validation constraints are backwards-compatible and do NOT require a version bump |
| **Deprecation** | Old versions are deprecated with a minimum 90-day notice; `Deprecation` and `Sunset` headers are included in deprecated responses |

---

## 2. Authentication & Authorization

### 2.1 Protected Endpoints

All endpoints that act on user data require a valid **Clerk JWT** in the `Authorization` header:

```http
Authorization: Bearer <clerk_jwt_token>
```

The Next.js middleware validates the JWT on every request before it reaches route handlers. Invalid or expired tokens return `401 UNAUTHORIZED`.

### 2.2 Anonymous Endpoints

Endpoints that support anonymous access (e.g., `POST /api/v1/generate` for non-authenticated users) do NOT require an `Authorization` header but are subject to IP-based rate limiting enforced via Redis.

### 2.3 Admin Endpoints

Endpoints under `/api/v1/admin/*` additionally require the Clerk user metadata field `role = "admin"`. Non-admin authenticated users receive `403 FORBIDDEN`.

### 2.4 Authorization Hierarchy

```
Request arrives
    │
    ▼
[1] Is JWT present and valid?          → No  → 401 UNAUTHORIZED
    │ Yes
    ▼
[2] Does route allow anonymous access? → Yes → Proceed with anonymous limits
    │ No
    ▼
[3] Does user have required plan/role? → No  → 403 FORBIDDEN / 403 PLAN_LIMIT_EXCEEDED
    │ Yes
    ▼
[4] Has rate limit been exceeded?      → Yes → 429 RATE_LIMIT_EXCEEDED
    │ No
    ▼
[5] Process request
```

---

## 3. Request Standards

### 3.1 Content Type

All request bodies **must** use JSON:

```http
Content-Type: application/json
```

Multipart/form-data is only used for file upload endpoints (if any are added in future).

### 3.2 Character Encoding

All strings are UTF-8. The server rejects strings containing null bytes (`\0`).

### 3.3 Request Size Limits

| Context | Limit |
|---------|-------|
| Default request body | 1 MB |
| Prompt field | 2,000 characters |
| Project name | 100 characters |
| Refinement message | 1,000 characters |

### 3.4 Input Validation

All request bodies are validated against **Zod schemas** at the API route level before any business logic executes. Validation failures return `400 VALIDATION_ERROR` with field-level error details.

**Sanitization applied to all string inputs (in order):**
1. Strip null bytes (`\0`)
2. Trim leading/trailing whitespace
3. Normalize Unicode to NFC form
4. Reject strings that are empty after trimming

### 3.5 Idempotency

Mutation endpoints (`POST`, `PUT`, `DELETE`) accept an optional `Idempotency-Key` header:

```http
Idempotency-Key: <uuid-v4>
```

When provided, the server caches the response for 24 hours and returns the same result for duplicate requests with the same key. This is strongly recommended for `POST /api/v1/generate` to prevent double-charges on retry.

---

## 4. Response Standards

### 4.1 Success Response Envelope

**Single resource:**
```json
{
  "data": {
    "id": "...",
    "...": "..."
  }
}
```

**Collection / list:**
```json
{
  "data": [
    { "id": "...", "...": "..." }
  ],
  "pagination": {
    "cursor": "eyJpZCI6IjEyMyJ9",
    "has_more": true,
    "limit": 20
  }
}
```

**Action without meaningful response body (e.g., DELETE):**
```json
{
  "data": null
}
```

> All successful responses return `"data"` at the top level. There is no bare response — the envelope is always present.

### 4.2 HTTP Status Codes (Success)

| Status | Usage |
|--------|-------|
| `200 OK` | Successful GET, PUT, PATCH |
| `201 Created` | Successful POST that creates a resource |
| `204 No Content` | Successful DELETE (no body) — exception to the envelope rule |
| `202 Accepted` | Request accepted for async processing (e.g., long-running export job) |

---

## 5. Error Standards

### 5.1 Error Response Envelope

All errors follow this exact shape — no exceptions:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded your monthly generation limit.",
    "details": {
      "limit": 20,
      "used": 20,
      "reset_at": "2026-03-01T00:00:00Z"
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `error.code` | `string` | Yes | Machine-readable error code (SCREAMING_SNAKE_CASE) |
| `error.message` | `string` | Yes | Human-readable message suitable for display in UI |
| `error.details` | `object` | No | Structured context specific to the error type |

### 5.2 Standard Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| `400` | `VALIDATION_ERROR` | Request body failed schema validation; `details` contains field-level errors |
| `401` | `UNAUTHORIZED` | Missing, expired, or invalid Clerk JWT |
| `403` | `FORBIDDEN` | Authenticated but lacks the required role or permission |
| `403` | `PLAN_LIMIT_EXCEEDED` | Action requires a paid plan (`tailwind` export, etc.) |
| `404` | `NOT_FOUND` | Resource does not exist or is not accessible by this user |
| `409` | `CONFLICT` | Duplicate resource or state conflict |
| `422` | `CONTENT_MODERATED` | Prompt was blocked by content policy |
| `429` | `RATE_LIMIT_EXCEEDED` | User or IP has exceeded the configured rate limit |
| `500` | `INTERNAL_ERROR` | Unexpected server error; do not surface internal details to client |
| `503` | `AI_SERVICE_UNAVAILABLE` | All LLM providers failed after maximum retry attempts (BR-006) |
| `504` | `GENERATION_TIMEOUT` | Generation exceeded the 60-second timeout limit (BR-003) |

### 5.3 Validation Error Details Shape

When `code = "VALIDATION_ERROR"`, `details` contains a `fields` array:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": {
      "fields": [
        {
          "field": "prompt",
          "message": "Prompt must be at least 10 characters."
        },
        {
          "field": "output_format",
          "message": "Must be one of: html_css, tailwind."
        }
      ]
    }
  }
}
```

---

## 6. Pagination

### 6.1 Strategy: Cursor-Based Pagination

All list endpoints use **cursor-based pagination** (opaque cursor). Offset-based pagination is prohibited — it produces inconsistent results when items are inserted/deleted between pages.

### 6.2 Request Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `cursor` | `string` | (first page) | — | Opaque cursor from previous response |
| `limit` | `integer` | `20` | `100` | Number of items per page |

Example: `GET /api/v1/projects?limit=10&cursor=eyJpZCI6IjEyMyJ9`

### 6.3 Response Shape

```json
{
  "data": [...],
  "pagination": {
    "cursor": "eyJpZCI6IjQ1NiJ9",
    "has_more": true,
    "limit": 10
  }
}
```

| Field | Description |
|-------|-------------|
| `cursor` | Pass this value as `?cursor=` in the next request. `null` when on the last page. |
| `has_more` | `true` if there are more items after this page |
| `limit` | The limit that was applied (echoed back) |

### 6.4 Default Sort Order

All list endpoints return items sorted by `created_at DESC` (newest first) unless the endpoint explicitly documents otherwise.

---

## 7. Response Headers

### 7.1 Required Headers (All Responses)

| Header | Description |
|--------|-------------|
| `X-Request-ID` | Unique identifier for this request, e.g., `req_abc123xyz`. Used for log tracing. |
| `Content-Type` | `application/json; charset=utf-8` for all JSON responses |

### 7.2 Rate Limit Headers

Rate-limited endpoints include these headers on every response:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in the window |
| `X-RateLimit-Remaining` | Requests remaining in the current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |
| `Retry-After` | (429 only) Seconds until the client may retry |

### 7.3 CORS

| Origin | Policy |
|--------|--------|
| Same-origin | Allowed |
| Listed trusted origins | Allowed (configured in Nginx / Next.js) |
| All others | Blocked |

---

## 8. Rate Limiting

### 8.1 Tiers

| Tier | Window | Limit | Enforcement |
|------|--------|-------|-------------|
| Anonymous (IP-based) | 24 hours | 3 generations | Redis + Next.js middleware |
| Free user (account-based) | Calendar month | 20 generations | PostgreSQL counter + Next.js |
| Paid user | — | Unlimited | No limit applied |
| Global API (all tiers) | 1 minute | 60 requests | Redis sliding window |

### 8.2 Rate Limit Response

When a limit is exceeded, the server returns `429 RATE_LIMIT_EXCEEDED`:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded your monthly generation limit.",
    "details": {
      "limit": 20,
      "used": 20,
      "reset_at": "2026-03-01T00:00:00Z"
    }
  }
}
```

---

## 9. Idiomatic URL Design

### 9.1 Resource Naming

| Rule | Example |
|------|---------|
| Use plural nouns for collections | `/api/v1/projects` not `/api/v1/project` |
| Use kebab-case for multi-word resources | `/api/v1/moderation-logs` |
| Nest sub-resources under their parent | `/api/v1/projects/{id}/generations` |
| Do NOT nest more than 2 levels deep | Avoid `/api/v1/projects/{id}/generations/{gen_id}/exports/{exp_id}` — use flat `/api/v1/exports/{exp_id}` |

### 9.2 HTTP Methods

| Method | Usage |
|--------|-------|
| `GET` | Read resource or collection; never mutates state |
| `POST` | Create a new resource or trigger an action |
| `PUT` | Replace a resource entirely |
| `PATCH` | Partial update of a resource |
| `DELETE` | Remove a resource |

### 9.3 Action Endpoints

When an operation is not a simple CRUD action, use a verb sub-resource:

```
POST /api/v1/projects/{id}/duplicate
POST /api/v1/generations/{id}/export
POST /api/v1/users/me/reset-password
```

---

## 10. Webhook Standards

### 10.1 Clerk Webhooks

The Clerk webhook receiver at `POST /api/v1/webhooks/clerk`:
- Validates the Clerk signing secret via `svix` SDK before processing
- Returns `200 OK` immediately (idempotent acknowledgement)
- Processes events asynchronously to avoid webhook timeout
- Handles: `user.created`, `user.updated`, `user.deleted`

### 10.2 Webhook Replay Safety

All webhook handlers are idempotent — processing the same event twice does not cause duplicate records.

---

## 11. Internal API (Next.js → Go AI Service)

These endpoints are on an internal network only and are NOT exposed to clients via Nginx.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `{go_service_url}/generate` | Initial prompt-to-UI generation |
| `POST` | `{go_service_url}/refine` | Targeted refinement of an existing generation |
| `POST` | `{go_service_url}/moderate` | Content moderation check only |
| `GET` | `{go_service_url}/health` | Health check for container orchestration |

The internal contract schema is defined in `docs/fsd.md` §1.3.

---

## 12. Security Standards

| Requirement | Implementation |
|-------------|----------------|
| Authentication | Clerk JWT on all protected routes; validated in Next.js middleware |
| Transport security | HTTPS only; HTTP redirects to HTTPS (Nginx); HSTS header |
| Input sanitization | Zod validation + sanitization before any DB/Go call |
| SQL injection prevention | Prisma parameterized queries exclusively — no raw SQL with user input |
| XSS prevention | Generated HTML rendered in sandboxed `<iframe sandbox>` only |
| CSRF protection | SameSite=Strict cookies; Clerk handles CSRF for auth flows |
| Prompt injection | Prompt wrapping + sanitization in Go AI Service before LLM submission |
| Secrets | Environment variables only; never committed to source control |
| Error messages | Internal error details (stack traces, DB errors) NEVER exposed to client |

---

## 13. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | AI Assistant | Initial version — consolidated from FSD §5 with expansions |

---

*This document is the single source of truth for API contract conventions. Feature-specific API contracts in `docs/features/[feature]/api-contract.md` define endpoint request/response schemas and must reference this document for all shared conventions.*
