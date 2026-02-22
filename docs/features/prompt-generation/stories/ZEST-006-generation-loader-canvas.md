# ZEST-006: Generation Loader & Canvas Preview

**Epic:** ZEST-F01 (Prompt-to-UI Generation)
**Layer:** L4-feature-ui
**Role:** Frontend
**Estimation:** 3
**Priority:** Must

---

## Objective

Build the `GenerationLoader` theatrical loading component and the `GenerationCanvas` (sandboxed `<iframe>`) that renders the returned HTML. Wire up the client-side `useGeneration` hook that calls `POST /api/v1/generate` and manages loading/success/error states.

## Technical Specifications

- **Proposed Files:**
  - `src/components/generation-loader/GenerationLoader.tsx`
  - `src/components/generation-loader/GenerationLoader.types.ts`
  - `src/components/generation-canvas/GenerationCanvas.tsx`
  - `src/hooks/useGeneration.ts`
- **Functions/Classes:**
  - `GenerationLoader` component (props: `stage`, `onCancel`, `showCancel`)
  - `GenerationCanvas` component (props: `html`, `css`, `format`)
  - `useGeneration()` → `{ generate, isLoading, result, error, cancel }`
- **API Endpoints:** Calls `POST /api/v1/generate`

## Acceptance Criteria (Technical)

- [ ] `GenerationLoader` shows animated green gradient mesh background
- [ ] Status message cycles: "Thinking...", "Laying out...", "Styling...", "Adding the final touches..." every 3 seconds
- [ ] Cancel link appears after 15 seconds and calls `onCancel`
- [ ] `useGeneration` uses `AbortController` — calling `cancel()` aborts the in-flight fetch
- [ ] `GenerationCanvas` renders HTML in a sandboxed `<iframe sandbox="allow-same-origin">` (no scripts)
- [ ] CSS is injected into the iframe via a `<style>` tag alongside the HTML content
- [ ] For Tailwind format, `html` is injected directly (Tailwind classes inline); no separate CSS tag needed
- [ ] `useGeneration` exposes `error` with the `error.code` from the API error envelope

## Business Rules & Logic

- Generated HTML is ONLY rendered inside a sandboxed iframe — never injected into the DOM directly (BR-010 XSS prevention)
- iframe sandbox must not include `allow-scripts` (BR-010)

## Dependencies

- Depends on: ZEST-002 (design tokens, motion variables)
- Depends on: ZEST-004 (`POST /api/v1/generate` endpoint)

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests: `useGeneration` — loading state, success state, error state, cancel
- [ ] Visual test: loader cycles messages, iframe renders sample HTML correctly
- [ ] Lint/Type check clear
