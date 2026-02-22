# ZEST-008: Editor Layout Shell

**Epic:** ZEST-F02 (Visual Editor)
**Layer:** L2-ui-foundation
**Role:** Frontend
**Estimation:** 3
**Priority:** Must

---

## Objective

Build the three-panel editor layout shell: left sidebar (layers + project name), center canvas area, right properties panel. Includes the editor toolbar. Panels should be responsive: properties panel collapses to slide-over on tablet (768–1279px).

## Technical Specifications

- **Proposed Files:**
  - `src/app/editor/layout.tsx` (editor root layout — three-panel flex/grid)
  - `src/components/editor/EditorShell.tsx`
  - `src/components/editor/EditorSidebar.tsx` (240px left panel)
  - `src/components/editor/EditorCanvas.tsx` (center flex-grow, contains iframe slot)
  - `src/components/editor/EditorPropertiesPanel.tsx` (280px right panel, slide-over on tablet)
  - `src/components/editor/EditorToolbar.tsx` (top of canvas: Regenerate | Viewport | Export | Save | Undo | Redo)
- **Functions/Classes:**
  - `EditorShell` (accepts children for each panel)
- **API Endpoints:** N/A

## Acceptance Criteria (Technical)

- [ ] Three-panel layout renders at 1280px+: sidebar 240px | canvas flex-grow | properties 280px
- [ ] At 768–1279px: properties panel renders as slide-over drawer (shadcn `Sheet`)
- [ ] Below 768px: "Open on desktop" banner shown; editor panels hidden
- [ ] Toolbar contains placeholder buttons: Regenerate, Viewport toggle, Export, Save, Undo (disabled), Redo (disabled)
- [ ] Sidebar shows "Layers" heading and empty placeholder tree
- [ ] All panels use design system tokens (neutral backgrounds, correct borders)

## Business Rules & Logic

- Editor is desktop-only for full functionality; mobile shows a redirect CTA

## Dependencies

- Depends on: ZEST-002 (design tokens)
- Depends on: ZEST-007 (editor page exists at `/editor`)

## Definition of Done

- [ ] Code implemented
- [ ] Responsive visual check at 1280px, 1024px, 768px, 375px
- [ ] Lint/Type check clear
