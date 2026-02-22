# ZEST-021: Project CRUD API Routes

**Epic:** ZEST-F06 (Project Persistence & Dashboard)
**Layer:** L3-backend
**Role:** Backend
**Estimation:** 5
**Priority:** Must

---

## Objective

Implement all `Project` resource API routes: create, list, get, update (rename / update generation), and soft-delete. All routes require authentication. Ownership is enforced on mutating operations. Supports cursor-based pagination for list.

## Technical Specifications

- **Proposed Files:**
  - `src/app/api/v1/projects/route.ts` — `POST` (create) + `GET` (list)
  - `src/app/api/v1/projects/[id]/route.ts` — `GET` (single) + `PATCH` (update) + `DELETE` (soft delete)
  - `src/lib/project-service.ts` — `createProject()`, `listProjects()`, `getProject()`, `updateProject()`, `deleteProject()`
  - `src/schemas/project.schema.ts` — Zod schemas for create and update payloads
- **Functions/Classes:**
  - `createProject(userId, generationId, name?)` — inserts `Project`; derives name from prompt if not provided; returns project
  - `listProjects(userId, cursor?, limit?)` — cursor-based query ordered by `updated_at DESC`; excludes soft-deleted
  - `getProject(id, userId)` — fetches project + latest generation; returns `403` if not owner
  - `updateProject(id, userId, patch)` — partial update of `name` and/or `latest_generation_id`
  - `deleteProject(id, userId)` — sets `deleted_at`; returns `204`
- **API Endpoints:**
  - `POST /api/v1/projects`
  - `GET /api/v1/projects`
  - `GET /api/v1/projects/:id`
  - `PATCH /api/v1/projects/:id`
  - `DELETE /api/v1/projects/:id`
- **Data Models:** `Project`, `Generation` (Prisma)

## Acceptance Criteria (Technical)

- [ ] `POST /api/v1/projects` creates project and returns `201` with project object
- [ ] `GET /api/v1/projects` returns paginated list (default limit 20) in `updated_at DESC` order; excludes deleted
- [ ] `GET /api/v1/projects/:id` returns project with `latest_generation_id` resolved; returns `404` if not found or deleted
- [ ] `PATCH /api/v1/projects/:id` updates name or `latest_generation_id`; returns `403` if not owner
- [ ] `DELETE /api/v1/projects/:id` sets `deleted_at`; returns `204`; returns `403` if not owner
- [ ] All routes return `401` when called without a valid Clerk JWT
- [ ] Cursor pagination works correctly: second page uses cursor from first response
- [ ] Project name auto-derived from generation prompt hash when not provided (first 40 chars of prompt text is unavailable; use "Untitled Project" as default MVP fallback)
- [ ] Unit tests for each service function; integration tests for CRUD happy paths

## Business Rules & Logic

- Permission matrix: only `free_user`, `paid_user`, and `admin` can save/view/delete projects (FSD §2.2)
- `admin` can delete any project; others can only delete their own
- Soft-delete only; no hard deletes via API (data retention for BR-016)

## Dependencies

- Depends on: ZEST-001 (Prisma + PostgreSQL)
- Depends on: ZEST-018 (Clerk middleware; `getCurrentUser()` helper)
- Depends on: ZEST-004 (`Generation` records exist to associate with)

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests: service functions (create, list, get, update, delete)
- [ ] Integration tests: CRUD happy path + auth enforcement
- [ ] Lint/Type check clear
