# ZEST-022: Dashboard Page & Project Cards

**Epic:** ZEST-F06 (Project Persistence & Dashboard)
**Layer:** L4-feature-ui
**Role:** Frontend
**Estimation:** 5
**Priority:** Must

---

## Objective

Build the `/dashboard` page that displays the authenticated user's saved projects as a responsive grid of cards. Each card shows a thumbnail, project name (inline-editable), and last-edited time. Implements infinite scroll pagination, empty state, and "New Project" navigation. Uses `GET /api/v1/projects` with cursor-based pagination.

## Technical Specifications

- **Proposed Files:**
  - `src/app/(protected)/dashboard/page.tsx` — dashboard route (server component shell)
  - `src/components/dashboard/ProjectGrid.tsx` — responsive grid container
  - `src/components/dashboard/ProjectCard.tsx` — individual project card (thumbnail, name, date, open/delete actions)
  - `src/components/dashboard/ProjectCardSkeleton.tsx` — loading skeleton
  - `src/components/dashboard/EmptyDashboard.tsx` — empty state with CTA
  - `src/hooks/useProjects.ts` — SWR/React Query hook: fetches `/api/v1/projects`, handles cursor pagination and refetch on mutation
  - `src/hooks/useRenameProject.ts` — `PATCH /api/v1/projects/:id` mutation for inline rename
  - `src/hooks/useDeleteProject.ts` — `DELETE /api/v1/projects/:id` with optimistic removal
- **Functions/Classes:**
  - `ProjectCard` — renders thumbnail (`<img>` with fallback gradient placeholder), editable name (`<input>` on click), relative time (`date-fns`), "Open" button → `/editor?project={id}`, kebab menu with "Rename" and "Delete"
  - `ProjectGrid` — CSS Grid, 3→2→1 column breakpoints; loads more on scroll via `IntersectionObserver`
  - `useProjects()` — cursor pagination: returns `{ projects, isLoading, loadMore, hasMore }`
- **API Endpoints consumed:** `GET /api/v1/projects`, `PATCH /api/v1/projects/:id`, `DELETE /api/v1/projects/:id`
- **Data Models:** none (reads from API)

## Acceptance Criteria (Technical)

- [ ] `/dashboard` route is protected (middleware redirects unauthenticated users to `/sign-in`)
- [ ] Projects rendered in a responsive 3-column grid (tablet: 2, mobile: 1)
- [ ] Each card displays: thumbnail or gradient placeholder, project name, relative last-edited time
- [ ] Clicking "Open" navigates to `/editor?project={id}` and loads the project
- [ ] Project name is inline-editable; blur or Enter confirms rename (calls `PATCH`)
- [ ] "Delete" in kebab menu shows a confirmation dialog; on confirm calls `DELETE` and removes card optimistically
- [ ] Empty state shows "No projects yet" message and "Create your first UI" button → `/`
- [ ] Skeleton cards shown during initial load
- [ ] "Load more" or infinite scroll loads next cursor page
- [ ] "New Project" button in page header navigates to `/`
- [ ] `analytics.track('project_opened')` fired on card open

## Business Rules & Logic

- Dashboard only accessible to authenticated users (`free_user`, `paid_user`, `admin`)
- Deleted projects do NOT appear in the list (soft-delete excluded server-side)

## Dependencies

- Depends on: ZEST-018 (auth middleware — route protection)
- Depends on: ZEST-021 (project CRUD API routes)
- Depends on: ZEST-002 (design tokens — card styling)

## Definition of Done

- [ ] Code implemented
- [ ] Storybook stories: `ProjectCard` (with thumbnail, without thumbnail, loading state), `EmptyDashboard`
- [ ] Unit tests: `useProjects` cursor pagination, optimistic delete in `useDeleteProject`
- [ ] Lint/Type check clear
