# Functional Specification Document: Zest

> **Document Status:** Approved  
> **Last Updated:** February 22, 2026  
> **Version:** 1.0  
> **Mode:** Global FSD (System-wide)

---

## 1. System Architecture

### 1.1 Component Overview

Zest is composed of three runtime layers communicating over HTTP:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                             │
│                                                                     │
│   Next.js React App (TypeScript)                                    │
│   ┌──────────────┬───────────────┬──────────────┬────────────────┐  │
│   │  Prompt UI   │ Visual Editor │  Chat Panel  │  Export/Code   │  │
│   │              │  (Zustand)    │              │   Preview      │  │
│   └──────────────┴───────────────┴──────────────┴────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS / Clerk JWT
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   NEXT.JS SERVER (API Layer)                        │
│                                                                     │
│   /api/v1/generate    → Proxy to Go AI Service                     │
│   /api/v1/projects    → CRUD via Prisma → PostgreSQL               │
│   /api/v1/exports     → Generate ZIP, return download URL          │
│   /api/v1/users       → Clerk webhook receiver                     │
│                                                                     │
│   Middleware: Clerk auth, rate limiting (Redis), input validation   │
└──────────────┬─────────────────────────────┬───────────────────────┘
               │                             │
               ▼                             ▼
┌──────────────────────────┐   ┌─────────────────────────────────────┐
│   PostgreSQL             │   │   GO AI SERVICE                     │
│                          │   │                                     │
│   users                  │   │   POST /generate                    │
│   projects               │   │   POST /refine                      │
│   generations            │   │   POST /moderate                    │
│   exports                │   │                                     │
│   sessions               │   │   ┌─────────────────────────────┐   │
└──────────────────────────┘   │   │  Prompt Engine              │   │
                               │   │  Content Moderator          │   │
┌──────────────────────────┐   │   │  Provider Router            │   │
│   Redis                  │   │   │  Response Normalizer        │   │
│                          │   │   └──────────────┬──────────────┘   │
│   rate_limit:{user_id}   │   │                  │                  │
│   session:{session_id}   │   │   ┌──────────────▼──────────────┐   │
│   gen_cache:{hash}       │   │   │  LLM Clients                │   │
└──────────────────────────┘   │   │  GLM | Gemini | GH Copilot  │   │
                               │   └─────────────────────────────┘   │
                               └─────────────────────────────────────┘
```

### 1.2 Data Flow: Prompt-to-UI Generation

```
User                Next.js              Go AI Service         LLM Provider
 │                     │                      │                     │
 │  POST /generate      │                      │                     │
 │─────────────────────►│                      │                     │
 │                      │ Validate + Auth      │                     │
 │                      │ Check rate limit     │                     │
 │                      │ POST /generate       │                     │
 │                      │─────────────────────►│                     │
 │                      │                      │ Select provider     │
 │                      │                      │ Build prompt        │
 │                      │                      │ Moderate input      │
 │                      │                      │ POST (API call)     │
 │                      │                      │────────────────────►│
 │                      │                      │                     │
 │                      │                      │◄────────────────────│
 │                      │                      │ Parse response      │
 │                      │                      │ Normalize HTML/CSS  │
 │                      │                      │ Validate output     │
 │                      │◄─────────────────────│                     │
 │                      │ Save generation log  │                     │
 │◄─────────────────────│                      │                     │
 │  { html, css, id }   │                      │                     │
```

### 1.3 Inter-Service Contract

The Next.js API layer communicates with the Go AI Service over internal HTTP.

**Request (Next.js → Go):**
```json
{
  "request_id": "uuid-v4",
  "user_id": "user_clerk_id | anonymous",
  "prompt": "string (sanitized)",
  "context": {
    "previous_generation_id": "uuid | null",
    "refinement_target": "element_id | null"
  },
  "preferences": {
    "output_format": "html_css | tailwind",
    "style_hints": "string | null"
  }
}
```

**Response (Go → Next.js):**
```json
{
  "generation_id": "uuid-v4",
  "status": "success | error",
  "html": "string",
  "css": "string",
  "provider_used": "glm | gemini | github_copilot",
  "duration_ms": 12500,
  "token_count": 2340,
  "error": null
}
```

---

## 2. Roles & Permissions

### 2.1 Role Definitions

| Role | Description | Source |
|------|-------------|--------|
| `anonymous` | Unauthenticated visitor | No Clerk session |
| `free_user` | Authenticated, free plan | Clerk metadata: `plan = "free"` |
| `paid_user` | Authenticated, paid plan | Clerk metadata: `plan = "paid"` |
| `admin` | Internal team member | Clerk metadata: `role = "admin"` |

### 2.2 Permission Matrix

| Action | anonymous | free_user | paid_user | admin |
|--------|-----------|-----------|-----------|-------|
| Generate UI (prompt) | ✅ (3/day) | ✅ (20/mo) | ✅ (unlimited) | ✅ |
| View generated UI | ✅ | ✅ | ✅ | ✅ |
| Edit in visual editor | ✅ | ✅ | ✅ | ✅ |
| Chat refinement | ✅ (3/day) | ✅ (20/mo) | ✅ (unlimited) | ✅ |
| Export HTML/CSS | ✅ (watermarked) | ✅ | ✅ | ✅ |
| Export Tailwind | ❌ | ✅ | ✅ | ✅ |
| Save project | ❌ | ✅ | ✅ | ✅ |
| View saved projects | ❌ | ✅ | ✅ | ✅ |
| Delete project | ❌ | ✅ (own) | ✅ (own) | ✅ (all) |
| View moderation queue | ❌ | ❌ | ❌ | ✅ |
| Access admin dashboard | ❌ | ❌ | ❌ | ✅ |

> **Note:** Anonymous export includes a `<!-- Generated by Zest -->` comment watermark. This is removed for authenticated users.

---

## 3. Global Business Rules

### 3.1 Generation Rules

| ID | Rule | Enforcement Layer |
|----|------|-------------------|
| BR-001 | Anonymous users are limited to 3 generations per 24-hour period (tracked by IP + fingerprint) | Next.js middleware + Redis |
| BR-002 | Free users are limited to 20 generations per calendar month | Next.js API + PostgreSQL counter |
| BR-003 | Generation timeout is 60 seconds; the system SHALL cancel and return an error beyond this | Go AI Service |
| BR-004 | The system SHALL NOT submit a prompt to an LLM without first passing it through the content moderation check | Go AI Service |
| BR-005 | If the primary LLM provider fails, the system SHALL automatically retry with the next provider in order: GLM → Gemini → GitHub Copilot | Go AI Service |
| BR-006 | A maximum of 3 provider fallback attempts SHALL be made per request before returning a failure response | Go AI Service |
| BR-007 | Generation results SHALL be cached for 1 hour using a hash of the normalized prompt as the key | Redis |
| BR-008 | Cached results SHALL NOT be served to users if the cached entry is from a different output format (html_css vs tailwind) | Go AI Service |

### 3.2 Content & Output Rules

| ID | Rule | Enforcement Layer |
|----|------|-------------------|
| BR-009 | All generated HTML SHALL be valid, well-formed HTML5 | Go AI Service (post-processing) |
| BR-010 | Generated output SHALL NOT contain `<script>` tags or inline JavaScript | Go AI Service (sanitization) |
| BR-011 | Generated output SHALL NOT contain external resource links (CDNs, external images) unless explicitly requested | Go AI Service (sanitization) |
| BR-012 | Exported HTML SHALL include a `<meta charset="UTF-8">` and `<meta name="viewport">` tag | Export service |
| BR-013 | Exported code SHALL be human-readable (not minified) | Export service |

### 3.3 Data & Privacy Rules

| ID | Rule | Enforcement Layer |
|----|------|-------------------|
| BR-014 | User prompts SHALL NOT be stored in plain text in the database; store prompt hash only for deduplication | PostgreSQL |
| BR-015 | User-generated content (HTML/CSS) SHALL NOT be used to train LLMs without explicit opt-in consent | Policy + technical controls |
| BR-016 | User accounts and all associated data SHALL be permanently deleted within 30 days of account deletion request | Backend + scheduled job |
| BR-017 | Anonymous session data (IP, fingerprint, generation count) SHALL be purged after 48 hours | Redis TTL |

### 3.4 Editor Rules

| ID | Rule | Enforcement Layer |
|----|------|-------------------|
| BR-018 | The visual editor SHALL maintain an undo/redo history of at least 50 actions | Frontend (Zustand) |
| BR-019 | The system SHALL auto-save editor state to localStorage every 30 seconds for anonymous users | Frontend |
| BR-020 | The system SHALL auto-save project state to the server every 60 seconds for authenticated users | Frontend + API |
| BR-021 | Chat refinements SHALL only modify the specific element or section described; full regeneration is a separate action | Go AI Service (scoped prompting) |

---

## 4. Data Dictionary

### 4.1 Core Entities

#### `User`
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PK | Internal user ID |
| `clerk_id` | `varchar(255)` | UNIQUE, NOT NULL | Clerk external ID |
| `email` | `varchar(255)` | UNIQUE, NOT NULL | User email |
| `plan` | `enum('free','paid')` | NOT NULL, DEFAULT 'free' | Subscription plan |
| `generation_count` | `integer` | NOT NULL, DEFAULT 0 | Current month generation count |
| `generation_reset_at` | `timestamp` | NOT NULL | When monthly counter resets |
| `created_at` | `timestamp` | NOT NULL | Account creation time |
| `updated_at` | `timestamp` | NOT NULL | Last update time |
| `deleted_at` | `timestamp` | NULLABLE | Soft delete timestamp |

#### `Project`
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PK | Project ID |
| `user_id` | `uuid` | FK → User.id, NOT NULL | Owning user |
| `name` | `varchar(100)` | NOT NULL | Project display name |
| `thumbnail_url` | `varchar(500)` | NULLABLE | Preview image URL |
| `latest_generation_id` | `uuid` | FK → Generation.id, NULLABLE | Current active generation |
| `created_at` | `timestamp` | NOT NULL | — |
| `updated_at` | `timestamp` | NOT NULL | — |
| `deleted_at` | `timestamp` | NULLABLE | Soft delete |

#### `Generation`
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PK | Generation ID |
| `project_id` | `uuid` | FK → Project.id, NULLABLE | Associated project (null for anonymous) |
| `user_id` | `uuid` | FK → User.id, NULLABLE | Null for anonymous |
| `prompt_hash` | `varchar(64)` | NOT NULL | SHA-256 hash of prompt |
| `output_format` | `enum('html_css','tailwind')` | NOT NULL | Requested output format |
| `html` | `text` | NOT NULL | Generated HTML |
| `css` | `text` | NULLABLE | Generated CSS (null for Tailwind) |
| `provider_used` | `enum('glm','gemini','github_copilot')` | NOT NULL | Which LLM served the request |
| `duration_ms` | `integer` | NOT NULL | Time to generate |
| `token_count` | `integer` | NULLABLE | LLM tokens consumed |
| `status` | `enum('success','failed','moderated')` | NOT NULL | Generation outcome |
| `parent_generation_id` | `uuid` | FK → Generation.id, NULLABLE | For refinement chains |
| `created_at` | `timestamp` | NOT NULL | — |

#### `Export`
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PK | Export ID |
| `generation_id` | `uuid` | FK → Generation.id, NOT NULL | Source generation |
| `user_id` | `uuid` | FK → User.id, NULLABLE | Null for anonymous |
| `format` | `enum('html_css','tailwind')` | NOT NULL | Exported format |
| `file_size_bytes` | `integer` | NOT NULL | ZIP file size |
| `created_at` | `timestamp` | NOT NULL | — |

#### `ModerationLog`
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `uuid` | PK | Log ID |
| `prompt_hash` | `varchar(64)` | NOT NULL | Hashed prompt |
| `reason` | `varchar(255)` | NOT NULL | Why it was flagged |
| `action` | `enum('blocked','allowed','reviewed')` | NOT NULL | Outcome |
| `user_id` | `uuid` | FK → User.id, NULLABLE | — |
| `ip_hash` | `varchar(64)` | NULLABLE | Hashed IP for rate analysis |
| `created_at` | `timestamp` | NOT NULL | — |

### 4.2 Entity Relationships

```
User ──────────────────────────────────────────────────────────┐
 │                                                             │
 │ 1                                                          │ 1
 ▼ *                                                          ▼ *
Project ──────────────────────────────────► Generation ───────► Export
 │              latest_generation_id FK       │ parent_id FK
 │                                            │
 └────────────────────────────────────────────┘
             project_id FK
```

---

## 5. API Standards

### 5.1 Base URL & Versioning

```
https://{domain}/api/v1/{resource}
```

All API endpoints are prefixed with `/api/v1/`. Breaking changes require a new version prefix (`/api/v2/`).

### 5.2 Authentication

All protected endpoints require a valid Clerk JWT in the `Authorization` header:

```
Authorization: Bearer {clerk_jwt_token}
```

Unauthenticated endpoints (e.g., anonymous generation) do not require this header but are rate-limited by IP.

### 5.3 Standard Error Format

All errors SHALL return this structure:

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

### 5.4 Standard Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `VALIDATION_ERROR` | Request body failed validation |
| 401 | `UNAUTHORIZED` | Missing or invalid auth token |
| 403 | `FORBIDDEN` | Authenticated but lacks permission |
| 403 | `PLAN_LIMIT_EXCEEDED` | Action requires paid plan |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 422 | `CONTENT_MODERATED` | Prompt blocked by content policy |
| 503 | `AI_SERVICE_UNAVAILABLE` | All LLM providers failed |
| 504 | `GENERATION_TIMEOUT` | Generation exceeded 60s limit |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

### 5.5 Pagination

All list endpoints use **cursor-based pagination**:

```json
{
  "data": [...],
  "pagination": {
    "cursor": "eyJpZCI6IjEyMyJ9",
    "has_more": true,
    "limit": 20
  }
}
```

Request parameters: `?cursor={cursor}&limit={1-100, default 20}`

### 5.6 Request ID Tracing

Every response SHALL include a `X-Request-ID` header for tracing:

```
X-Request-ID: req_abc123xyz
```

---

## 6. System-wide Validation Rules

### 6.1 Input Validation

| Field | Type | Min | Max | Rules |
|-------|------|-----|-----|-------|
| `prompt` | string | 10 chars | 2000 chars | No null bytes; stripped of leading/trailing whitespace |
| `project.name` | string | 1 char | 100 chars | Alphanumeric, spaces, hyphens, underscores only |
| `output_format` | enum | — | — | Must be one of: `html_css`, `tailwind` |
| `refinement_message` | string | 5 chars | 1000 chars | No null bytes |
| `export.format` | enum | — | — | Must be one of: `html_css`, `tailwind` |

### 6.2 Sanitization Rules

All user-provided string inputs SHALL be sanitized before processing:

1. Strip null bytes (`\0`)
2. Trim leading/trailing whitespace
3. Normalize Unicode to NFC form
4. Reject strings containing only whitespace
5. Prompts are additionally screened by the Go AI Service content moderator before LLM submission

---

## 7. Integration Specifications

### 7.1 Clerk Webhook Events

The system SHALL handle the following Clerk webhook events at `POST /api/v1/webhooks/clerk`:

| Event | System Action |
|-------|--------------|
| `user.created` | Create `User` record in PostgreSQL with `plan = "free"` |
| `user.updated` | Sync email changes to `User` record |
| `user.deleted` | Mark `User.deleted_at`; queue data deletion job (30 days) |
| `session.created` | No action required (Clerk manages sessions) |

All webhooks SHALL be verified using the Clerk webhook signing secret before processing.

### 7.2 LLM Provider Response Normalization

The Go AI Service SHALL normalize responses from all providers into a unified internal format:

```go
type GenerationResult struct {
    HTML        string
    CSS         string
    TokensUsed  int
    Provider    string
    DurationMs  int64
    RawResponse string // for debugging only, not persisted
}
```

Provider-specific parsing:
- **GLM:** Extract from `choices[0].message.content`, parse HTML/CSS blocks
- **Gemini:** Extract from `candidates[0].content.parts[0].text`, parse blocks
- **GitHub Copilot:** Extract from `choices[0].message.content`, parse blocks

### 7.3 Go AI Service Internal API

The Next.js layer SHALL communicate with the Go service via these internal endpoints (not exposed to clients):

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/generate` | Initial prompt-to-UI generation |
| `POST` | `/refine` | Targeted refinement of existing generation |
| `POST` | `/moderate` | Content moderation check only |
| `GET` | `/health` | Health check for load balancer |

---

## 8. Non-Functional Requirements

### 8.1 Performance

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| UI generation P50 latency | < 15 seconds | Server-side timing |
| UI generation P95 latency | < 30 seconds | Server-side timing |
| Chat refinement P95 latency | < 20 seconds | Server-side timing |
| API response (non-AI) P99 latency | < 200ms | Server-side timing |
| Visual editor frame rate | ≥ 60fps | Browser performance profiling |
| Page load (LCP) | < 2.5 seconds | Web Vitals |

### 8.2 Availability & Reliability

| Requirement | Target |
|-------------|--------|
| Overall system uptime | 99.5% monthly |
| AI generation availability | 99% (multi-provider fallback) |
| Database availability | 99.9% |
| Planned maintenance window | Sundays 02:00–04:00 UTC |

### 8.3 Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | Clerk JWT on all protected routes |
| Input validation | Zod schemas on Next.js; Go input sanitization |
| SQL injection prevention | Prisma parameterized queries only |
| XSS prevention | Generated HTML rendered in sandboxed iframe |
| CSRF protection | SameSite cookies; Clerk CSRF tokens |
| Prompt injection prevention | Prompt wrapping and sanitization in Go service |
| Secrets management | Environment variables; never in source code |
| HTTPS enforcement | Nginx with TLS; HSTS header |

### 8.4 GDPR Compliance

| Requirement | Implementation |
|-------------|----------------|
| Data minimization | Store prompt hashes only, not raw prompts |
| Right to deletion | Account deletion queues 30-day purge job |
| Data portability | Users can export their projects as ZIP |
| Consent | Cookie consent banner; LLM training opt-in |
| Privacy policy | Required before first generation for anonymous users |
| Data residency | Self-hosted; operator controls data location |

### 8.5 Accessibility

| Requirement | Standard |
|-------------|----------|
| Generated HTML accessibility | WCAG 2.1 AA (target) |
| Zest application accessibility | WCAG 2.1 AA |
| Keyboard navigation | Full keyboard support in editor |
| Screen reader support | ARIA labels on all interactive elements |

---

## 9. Traceability Matrix

| PRD Story | Functional Requirements | Business Rules |
|-----------|------------------------|----------------|
| US-01 (Prompt generation) | FR: POST /api/v1/generate; prompt validation; loading state | BR-001, BR-002, BR-003, BR-004, BR-005 |
| US-02 (Preview generated UI) | FR: Sandboxed iframe render; generation result storage | BR-009, BR-010, BR-011 |
| US-03 (Regenerate) | FR: New generation with same project_id; parent_id chain | BR-007 |
| US-04 (Select elements) | FR: DOM element selection; properties panel display | BR-018 |
| US-05 (Edit text inline) | FR: Contenteditable on text nodes; state sync | BR-018, BR-020 |
| US-06 (Change styles) | FR: CSS property updates; real-time preview | BR-018, BR-020 |
| US-07 (Drag elements) | FR: @dnd-kit drag handlers; layout recalculation | BR-018 |
| US-08 (Resize elements) | FR: Resize handles; dimension constraints | BR-018 |
| US-09 (Delete elements) | FR: Element removal; undo stack update | BR-018 |
| US-10 (Chat refinement) | FR: POST /api/v1/generate with context; scoped update | BR-021, BR-004, BR-005 |
| US-12 (Export HTML/CSS) | FR: POST /api/v1/exports; ZIP generation; download URL | BR-012, BR-013 |
| US-13 (Export Tailwind) | FR: Tailwind conversion in Go service; ZIP export | BR-012, BR-013 |
| US-15 (Anonymous use) | FR: Session-based rate limit; no auth required | BR-001, BR-017, BR-019 |
| US-16 (Sign up) | FR: Clerk signup flow; User record creation | BR-014 |
| US-17 (Save project) | FR: POST /api/v1/projects; auto-save timer | BR-020 |
| US-19 (Usage limits display) | FR: GET /api/v1/users/me/usage; quota UI component | BR-002 |
| US-20 (Upgrade prompt) | FR: Intercept at limit; display upgrade modal | BR-002 |

---

## 10. Open Questions & Assumptions

| ID | Item | Type | Status |
|----|------|------|--------|
| FQ-01 | Exact anonymous generation limit (3/day is assumption) | Open Question | Pending product decision |
| FQ-02 | Exact free tier monthly limit (20/mo is assumption) | Open Question | Pending product decision |
| FQ-03 | Sandboxed iframe vs shadow DOM for UI preview rendering | Open Question | Pending tech decision |
| FQ-04 | How are Tailwind classes applied during visual editing? (Tailwind JIT in iframe?) | Open Question | Pending tech decision |
| FQ-05 | Prompt injection attack surface in refinement mode | Open Question | Security review required |
| A-01 | Anonymous users tracked by IP + browser fingerprint (not cookie) | Assumption | Confirm with legal for GDPR |
| A-02 | Generated HTML rendered in sandboxed iframe to prevent XSS | Assumption | — |
| A-03 | Project thumbnails auto-generated via canvas screenshot | Assumption | — |

---

## 11. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | AI Assistant | Initial version |

---

*This FSD is the authoritative source for system behavior. Feature FSDs (`docs/features/[feature]/fsd.md`) extend this document with feature-specific logic. All implementation must conform to the Business Rules and API Standards defined here.*
