# PRD Addendum: Project Persistence & Dashboard

**Feature:** `project-management`
**Epic:** ZEST-F06
**Parent PRD:** `docs/prd.md`
**Status:** Approved
**Date:** 2026-02-22
**Priority:** P1

---

## 1. Feature Metadata

| Field | Value |
|-------|-------|
| Feature Name | Project Persistence & Dashboard |
| Feature Slug | `project-management` |
| Epic Code | `ZEST-F06` |
| Priority | P1 |
| Impacted Users | Authenticated users (free + paid) |
| PRD Stories | US-17, US-18 |

---

## 2. User Stories

| ID | User Story | Acceptance Criteria | Priority |
|----|------------|---------------------|----------|
| US-17 | As a user, I want to save my project so that I can return to it later | **Given** I am authenticated and have a UI<br>**When** I click "Save"<br>**Then** the project is saved and a confirmation toast is shown | P1 |
| US-18 | As a user, I want to see my saved projects so that I can continue working | **Given** I am logged in<br>**When** I go to my dashboard<br>**Then** I see a list of saved projects with thumbnails and last-edited timestamps | P1 |

---

## 3. Functional Requirements

### 3.1 Project CRUD API

- `POST /api/v1/projects` — create a new project linked to a generation; requires auth
- `GET /api/v1/projects` — list authenticated user's projects; cursor-based pagination; sorted by `updated_at DESC`
- `GET /api/v1/projects/:id` — get a single project with its latest generation
- `PATCH /api/v1/projects/:id` — update `name` or `latest_generation_id`; ownership enforced
- `DELETE /api/v1/projects/:id` — soft delete; `deleted_at = now()`; ownership enforced

### 3.2 Auto-Save

- For authenticated users in the editor, state is auto-saved to the server every 60 seconds (BR-020)
- Auto-save calls `PATCH /api/v1/projects/:id` with updated `latest_generation_id`
- Auto-save also stores latest editor HTML/CSS snapshot in the associated `Generation` record
- Visual indicator in toolbar: "Saved" / "Saving…" / "Unsaved changes"

### 3.3 Dashboard Page

- Route: `/dashboard`
- Requires authentication (protected by middleware)
- Displays project cards in a responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- Each card shows: thumbnail (or placeholder), project name, last-edited time (relative), "Open" button
- Empty state: "No projects yet" with a CTA "Create your first UI"
- "New Project" button in top-right → navigates to `/` (homepage prompt)
- Pagination: infinite scroll or "Load more" button using cursor

### 3.4 Thumbnail Generation

- Thumbnails auto-generated on save using an `html2canvas` screenshot of the editor canvas
- Uploaded to object storage (or stored as data URL for MVP) and persisted in `Project.thumbnail_url`

### 3.5 Project Naming

- Default name: first 40 characters of the generation prompt (stripped of special chars) or "Untitled Project"
- User can rename inline in the dashboard card or via an editor toolbar field

---

## 4. ERD Delta

Uses existing `Project` and `Generation` entities. No new entities.

---

## 5. API Contract

### POST /api/v1/projects

**Auth:** Required

**Request:**
```json
{
  "name": "string (optional, max 100 chars)",
  "generation_id": "uuid"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "latest_generation_id": "uuid",
    "thumbnail_url": null,
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
}
```

### GET /api/v1/projects

**Auth:** Required

**Query:** `?cursor=...&limit=20`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "thumbnail_url": "string | null",
      "updated_at": "ISO8601"
    }
  ],
  "pagination": { "cursor": "string", "has_more": true }
}
```

### PATCH /api/v1/projects/:id

**Auth:** Required (owner only)

**Request:**
```json
{
  "name": "string (optional)",
  "latest_generation_id": "uuid (optional)"
}
```

**Response 200:** Updated project object

**Error Codes:**
| HTTP | Code | Condition |
|------|------|-----------|
| 401 | `UNAUTHORIZED` | Not authenticated |
| 403 | `FORBIDDEN` | Not the project owner |
| 404 | `NOT_FOUND` | Project not found or deleted |

---

## 6. Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `project_created` | Project saved for first time | `project_id`, `generation_id` |
| `project_opened` | User opens project from dashboard | `project_id`, `age_days` |
| `project_renamed` | User renames project | `project_id` |
| `project_deleted` | User deletes project | `project_id` |
| `auto_save_triggered` | 60s auto-save fires | `project_id`, `success` |

---

## 7. Open Questions

| ID | Question | Owner | Status |
|----|----------|-------|--------|
| PM-OQ-01 | Should thumbnail generation use `html2canvas` (client-side) or headless Chrome screenshot (server-side)? | Tech | Open |
| PM-OQ-02 | Should projects list show all generations (version history) or only latest? | Product | Open |

---

## 8. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | AI Assistant | Initial version |
