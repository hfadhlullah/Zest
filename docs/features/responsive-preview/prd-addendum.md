# PRD Addendum: Responsive Preview

**Feature:** `responsive-preview`
**Epic:** ZEST-F08
**Parent PRD:** `docs/prd.md`
**Status:** Approved
**Date:** 2026-02-22
**Priority:** P1

---

## 1. Feature Metadata

| Field | Value |
|-------|-------|
| Feature Name | Responsive Preview |
| Feature Slug | `responsive-preview` |
| Epic Code | `ZEST-F08` |
| Priority | P1 |
| Impacted Users | All users |
| PRD Stories | No explicit US; derived from MVP P1 scope item "Responsive Preview" |

---

## 2. User Stories

| ID | User Story | Acceptance Criteria | Priority |
|----|------------|---------------------|----------|
| US-RP-01 | As a user, I want to preview my UI at different screen sizes so that I can ensure it looks good on mobile and desktop | **Given** I am in the editor<br>**When** I click a viewport preset (Mobile / Tablet / Desktop)<br>**Then** the canvas resizes to that viewport width and the UI renders at that breakpoint | P1 |
| US-RP-02 | As a user, I want to enter a custom viewport width so that I can test at a specific breakpoint | **Given** I am in the responsive preview toolbar<br>**When** I type a custom width (e.g. 480)<br>**Then** the canvas updates to that width | P2 |

---

## 3. Functional Requirements

### 3.1 Viewport Presets

- Three preset buttons in the editor toolbar: **Mobile** (375px), **Tablet** (768px), **Desktop** (full canvas width)
- Desktop is the default state
- Selecting a preset smoothly animates the canvas to the new width (spring animation per design system)
- Preset button for active viewport is visually highlighted

### 3.2 Canvas Resize Behavior

- The canvas (sandboxed iframe) width changes; the iframe's `width` CSS property is updated
- The canvas height remains at 100% of the editor panel height (scrollable within)
- The surrounding editor panel shows a centered frame with a device-frame visual guide at non-desktop breakpoints
- The visual editor (selection handles, properties panel) remains functional at all viewport widths

### 3.3 Custom Width Input

- A width input field (numeric, 320–1920) next to the preset buttons
- Accepts manual entry; updates canvas in real-time on blur or Enter
- Input value and preset are synced: selecting a preset updates the input; typing a non-preset value deselects presets

### 3.4 State Persistence

- Selected viewport is stored in `editor-store` (Zustand); survives editor re-render
- Viewport preference NOT persisted to server (session-only)

---

## 4. ERD Delta

No new entities or database changes required.

---

## 5. API Contract

No new API endpoints required. This is a purely frontend feature.

---

## 6. Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `viewport_changed` | User switches viewport preset | `viewport` (mobile/tablet/desktop/custom), `width_px` |

---

## 7. Open Questions

| ID | Question | Owner | Status |
|----|----------|-------|--------|
| RP-OQ-01 | Should viewport change trigger a re-generation or just CSS resize? (CSS resize assumed for MVP) | Tech | Open |
| RP-OQ-02 | Should a device frame (phone bezel) be shown at mobile preset, or just canvas resize? | Design | Open |

---

## 8. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | AI Assistant | Initial version |
