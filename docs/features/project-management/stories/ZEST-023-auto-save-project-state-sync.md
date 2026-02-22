# ZEST-023: Auto-Save & Project State Sync

**Epic:** ZEST-F06 (Project Persistence & Dashboard)
**Layer:** L5-integration
**Role:** Fullstack
**Estimation:** 3
**Priority:** Must

---

## Objective

Implement editor auto-save for authenticated users: every 60 seconds, serialize the current editor state (HTML/CSS snapshot) to a new `Generation` record and call `PATCH /api/v1/projects/:id` to update `latest_generation_id`. Show a persistent save-status indicator in the editor toolbar ("Saved", "Saving…", "Unsaved changes"). For anonymous users, continue using existing `localStorage` 30-second auto-save (BR-019).

## Technical Specifications

- **Proposed Files:**
  - `src/hooks/useAutoSave.ts` — manages the 60-second save timer for authenticated users; calls snapshot + API
  - `src/lib/snapshot.ts` — `captureEditorSnapshot(editorState): { html, css }` — serializes Zustand editor state to HTML/CSS strings
  - `src/components/editor/SaveStatusIndicator.tsx` — toolbar badge: "Saved ✓" / "Saving…" / "Unsaved changes"
  - `src/store/editor-store.ts` (update) — add `saveStatus: 'saved' | 'saving' | 'unsaved'` field
- **Functions/Classes:**
  - `useAutoSave(projectId)` — sets up `setInterval(60_000)` when `projectId` is defined and user is authenticated; on fire: sets status to `saving`, calls `captureEditorSnapshot`, calls `POST /api/v1/generations` (new generation from current HTML/CSS), then `PATCH /api/v1/projects/:id`; sets status to `saved` on success, `unsaved` on error
  - `captureEditorSnapshot(state)` — reads `editorStore.html` and `editorStore.css`; returns plain strings
  - `SaveStatusIndicator` — subscribes to `saveStatus` from store; renders appropriate label + icon
- **API Endpoints consumed:** `PATCH /api/v1/projects/:id`, `POST /api/v1/generations` (or direct DB write via existing route)
- **Data Models:** `Project`, `Generation`

## Acceptance Criteria (Technical)

- [ ] Auto-save fires every 60 seconds for authenticated users with an open project
- [ ] Auto-save does NOT fire for anonymous users (localStorage path unchanged)
- [ ] `SaveStatusIndicator` shows "Saving…" during API call, "Saved" on success, "Unsaved changes" on error or after edits since last save
- [ ] Status resets to "Unsaved changes" on any editor mutation (element moved, style changed, etc.)
- [ ] On page unload with unsaved changes, `beforeunload` event warns user
- [ ] Auto-save stops (clears interval) when component unmounts or project changes
- [ ] Unit tests: `useAutoSave` timer fires, snapshot captured, status transitions

## Business Rules & Logic

- BR-020: Authenticated users auto-saved every 60 seconds
- BR-019: Anonymous users auto-saved to `localStorage` every 30 seconds (unchanged from existing implementation)
- Auto-save does NOT create infinite generation history; generation records created per save are tagged as `auto_save = true` (add boolean field to `Generation` or handle with metadata)

## Dependencies

- Depends on: ZEST-009 (editor state in Zustand — HTML/CSS readable)
- Depends on: ZEST-018 (auth — `useAuth()` to determine if authenticated)
- Depends on: ZEST-021 (project CRUD API — `PATCH /api/v1/projects/:id` exists)

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests: `useAutoSave` (authenticated fires, anonymous skips, error handling)
- [ ] Unit test: `SaveStatusIndicator` renders correct state for each `saveStatus` value
- [ ] Manual test: open project → make edits → wait 60s → verify DB updated
- [ ] Lint/Type check clear
