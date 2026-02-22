# ZEST-007: Homepage & Generation Flow Integration

**Epic:** ZEST-F01 (Prompt-to-UI Generation)
**Layer:** L5-integration
**Role:** Fullstack
**Estimation:** 3
**Priority:** Must

---

## Objective

Wire together the homepage experience: the empty state (prompt-first landing), the full generation flow from `PromptBar` submit → `GenerationLoader` → `GenerationCanvas`, error states, and the "Regenerate" button. This is the complete US-01, US-02, US-03 end-to-end flow.

## Technical Specifications

- **Proposed Files:**
  - `src/app/page.tsx` (homepage — empty state + generation flow)
  - `src/components/empty-state/EmptyState.tsx` (per `EmptyState` pattern in design system)
  - `src/components/error-state/ErrorState.tsx` (per `ErrorState` pattern)
  - `src/app/editor/page.tsx` (editor shell — PromptBar + Canvas, pre-visual-editor stories)
  - `src/store/generation.store.ts` (Zustand slice for generation state)
- **Functions/Classes:**
  - `generationStore` (Zustand): `{ prompt, result, format, isLoading, error, setPrompt, generate, regenerate, cancel }`
- **API Endpoints:** Integrates `POST /api/v1/generate` via `useGeneration`

## Acceptance Criteria (Technical)

- [ ] Homepage shows `EmptyState` with `PromptBar` centered; template suggestion cards below
- [ ] Submit from homepage navigates to `/editor` and triggers generation immediately
- [ ] `GenerationLoader` shown during loading; replaced by `GenerationCanvas` on success
- [ ] `ErrorState` shown on API error with correct message per `error.code` (see `ErrorState` pattern variants)
- [ ] `RateLimit` error (`429`) shows `UpgradeWall` component (stub — full impl in `freemium-limits` feature)
- [ ] "Regenerate" button appears in editor toolbar after successful generation
- [ ] Regenerate submits fresh request (same prompt, `no_cache: true`) and replaces canvas
- [ ] Generation state persisted in Zustand store; survives route navigation within the app
- [ ] `X-Request-ID` from API response logged to console for debugging

## Business Rules & Logic

- Empty state → PromptBar is the primary conversion funnel (no sign-up gate for first generation)
- Error messages must match the `ErrorState` variant table in `docs/design-system.md`

## Dependencies

- Depends on: ZEST-005 (PromptBar)
- Depends on: ZEST-006 (GenerationLoader, GenerationCanvas, useGeneration)
- Depends on: ZEST-004 (API route)

## Definition of Done

- [ ] Code implemented
- [ ] Manual E2E test: homepage → prompt → generate → canvas shows HTML → regenerate → updated canvas
- [ ] Error states tested with mocked API failures
- [ ] Lint/Type check clear
