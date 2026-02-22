# PRD Addendum: Freemium Usage Limits & Upgrade

**Feature:** `freemium-limits`
**Epic:** ZEST-F07
**Parent PRD:** `docs/prd.md`
**Status:** Approved
**Date:** 2026-02-22
**Priority:** P1

---

## 1. Feature Metadata

| Field | Value |
|-------|-------|
| Feature Name | Freemium Usage Limits & Upgrade |
| Feature Slug | `freemium-limits` |
| Epic Code | `ZEST-F07` |
| Priority | P1 |
| Impacted Users | Anonymous users, free users approaching/hitting limits |
| PRD Stories | US-19, US-20 |

---

## 2. User Stories

| ID | User Story | Acceptance Criteria | Priority |
|----|------------|---------------------|----------|
| US-19 | As a free user, I want to know my usage limits so that I can plan accordingly | **Given** I am a free user<br>**When** I view the editor or account page<br>**Then** I see my remaining generations for the month | P1 |
| US-20 | As a free user who hits the limit, I want to upgrade so that I can continue using Zest | **Given** I have used all free generations<br>**When** I try to generate<br>**Then** I see an upgrade prompt with plan options | P1 |

---

## 3. Functional Requirements

### 3.1 Usage Tracking

- Anonymous: tracked by IP + browser fingerprint in Redis; limit 3 generations per 24-hour period (BR-001)
- Free users: tracked by `User.generation_count` in PostgreSQL; limit 20 per calendar month (BR-002)
- `generation_count` incremented atomically on each successful generation (in the generation API route)
- `generation_reset_at` checked server-side; if past, counter reset to 0 before checking

### 3.2 Usage Quota API

- `GET /api/v1/users/me/usage` — returns current usage and quota for the authenticated user
- Rate-limit check middleware helper `checkGenerationQuota(userId | anonymousId)` — called before every generation; returns `{ allowed: boolean, remaining: number, reset_at: ISO8601 }`

### 3.3 Upgrade Wall (UpgradeWall Component)

- Shown as a full-screen modal overlay when a user hits their generation limit
- For anonymous users: CTA = "Sign up free — 20 generations/month"
- For free users: CTA = "Upgrade to Pro — unlimited generations"
- Shows current plan, limit reached message, and plan comparison (free vs paid)
- "Maybe later" dismisses to homepage (anonymous) or editor with no generation allowed

### 3.4 Usage Indicator in Editor

- Persistent quota badge in editor toolbar (authenticated free users only)
- Shows "X / 20 generations used this month"
- Turns amber at 80% usage, red at 100%
- Anonymous users see "3 free generations/day" static label; no counter visible (privacy)

### 3.5 Upgrade Flow (MVP stub)

- Clicking "Upgrade" in `UpgradeWall` navigates to `/upgrade` page
- `/upgrade` page: pricing table placeholder; links to contact/waitlist (full billing integration is post-MVP)
- `analytics.track('upgrade_prompt_shown')` and `analytics.track('upgrade_clicked')` events

---

## 4. ERD Delta

No new entities. Uses existing `User.generation_count` and `User.generation_reset_at`. Redis keys `rate_limit:{ip_hash}` (anonymous) already defined in FSD §1.

---

## 5. API Contract

### GET /api/v1/users/me/usage

**Auth:** Required

**Response 200:**
```json
{
  "data": {
    "plan": "free",
    "generation_count": 15,
    "generation_limit": 20,
    "remaining": 5,
    "reset_at": "2026-03-01T00:00:00Z"
  }
}
```

**Error Codes:**
| HTTP | Code | Condition |
|------|------|-----------|
| 401 | `UNAUTHORIZED` | Not authenticated |

---

## 6. Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `upgrade_prompt_shown` | UpgradeWall displayed | `trigger` (limit_reached/export_gating), `plan`, `usage_count` |
| `upgrade_clicked` | User clicks upgrade CTA | `plan_selected`, `source` |
| `limit_reached` | User hits generation limit | `plan`, `count`, `user_type` |

---

## 7. Open Questions

| ID | Question | Owner | Status |
|----|----------|-------|--------|
| FL-OQ-01 | What is the exact paid plan price? (Billing integration is post-MVP) | Business | Open |
| FL-OQ-02 | Should anonymous users see a real-time counter or keep it hidden? | Product | Open |

---

## 8. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | AI Assistant | Initial version |
