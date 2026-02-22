# ZEST-026: Viewport Toggle & Canvas Resize

**Epic:** ZEST-F08 (Responsive Preview)
**Layer:** L4-feature-ui
**Role:** Frontend
**Estimation:** 3
**Priority:** Should

---

## Objective

Add responsive preview controls to the editor toolbar: three preset viewport buttons (Mobile 375px / Tablet 768px / Desktop full-width) and a custom-width numeric input. Changing the viewport smoothly resizes the sandboxed canvas iframe using a spring animation. The visual editor's selection handles and properties panel remain fully functional at all widths.

## Technical Specifications

- **Proposed Files:**
  - `src/components/editor/ViewportToggle.tsx` — toolbar section: preset buttons + custom width input
  - `src/store/editor-store.ts` (update) — add `viewportWidth: number` (default `null` = full desktop), `setViewportWidth(width: number | null)`
  - `src/components/editor/EditorCanvas.tsx` (update) — consume `viewportWidth` from store; apply inline `width` style to iframe wrapper with CSS transition
- **Functions/Classes:**
  - `ViewportToggle` — renders three `<button>` preset chips (Mobile/Tablet/Desktop) + `<input type="number" min="320" max="1920">`; active preset highlighted with design system accent color
  - `setViewportWidth(width)` — Zustand action; `null` means desktop (full container width)
  - Canvas iframe wrapper — `style={{ width: viewportWidth ?? '100%', transition: 'width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}` (spring-like ease)
  - On preset click: sets `viewportWidth` to preset px value; syncs input field
  - On input blur/Enter: sets `viewportWidth` to clamped value (min 320, max 1920); clears active preset if not matching a preset value
- **API Endpoints:** none
- **Data Models:** none

## Acceptance Criteria (Technical)

- [ ] Mobile (375px), Tablet (768px), Desktop (null/full-width) preset buttons render in editor toolbar
- [ ] Clicking a preset button updates canvas width with a smooth spring animation (~350ms)
- [ ] Active preset button is visually highlighted (design system accent ring)
- [ ] Custom width input updates canvas on blur or Enter; clamped to 320–1920
- [ ] Typing a non-preset value deselects all preset buttons
- [ ] Selecting a preset syncs the input field to the preset value
- [ ] Visual editor element selection and properties panel work correctly at all viewport widths
- [ ] `viewportWidth` is stored in Zustand editor-store; survives hot reloads within session
- [ ] `analytics.track('viewport_changed')` fires on every viewport change with `viewport` and `width_px`
- [ ] Viewport preference resets to Desktop on project change or page reload (not persisted)
- [ ] Unit tests: `ViewportToggle` preset selection, custom input clamp behavior, store sync

## Business Rules & Logic

- Viewport resize is CSS-only — no re-generation is triggered (RP-OQ-01 MVP assumption)
- Desktop preset sets canvas width to `100%` of the available editor panel space (not a fixed px value)

## Dependencies

- Depends on: ZEST-008 (editor toolbar — ViewportToggle placed in toolbar)
- Depends on: ZEST-009 (EditorCanvas iframe — width prop consumed here)

## Definition of Done

- [ ] Code implemented
- [ ] Storybook story: `ViewportToggle` (all three presets + custom input interaction)
- [ ] Unit tests: preset selection, custom input, store updates
- [ ] Manual test: switch to mobile → verify canvas narrows and elements remain selectable
- [ ] Lint/Type check clear
