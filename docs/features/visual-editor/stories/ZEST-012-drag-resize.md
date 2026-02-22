# ZEST-012: Drag-to-Reposition & Resize

**Epic:** ZEST-F02 (Visual Editor)
**Layer:** L4-feature-ui
**Role:** Frontend
**Estimation:** 8
**Priority:** Should

---

## Objective

Implement drag-to-reposition using `@dnd-kit/core` and resize via 8 custom handles. Both interactions update the selected element's position/dimensions in the iframe DOM and record undo actions.

## Technical Specifications

- **Proposed Files:**
  - `src/components/editor/canvas/DragHandle.tsx` (drag trigger attached to selection box)
  - `src/components/editor/canvas/ResizeHandle.tsx` (8 handles on selection box)
  - `src/lib/editor/drag-manager.ts` (`onDragEnd(elementId, delta)`)
  - `src/lib/editor/resize-manager.ts` (`onResizeEnd(elementId, direction, delta)`)
- **Functions/Classes:**
  - `DragManager.onDragEnd(elementId, { dx, dy })` — applies `transform: translate(dx, dy)` via iframe bridge
  - `ResizeManager.onResizeEnd(elementId, direction, delta)` — applies new width/height via iframe bridge
  - `@dnd-kit/core`: `useDraggable` on drag handle; custom pointer events on resize handles
- **API Endpoints:** N/A

## Acceptance Criteria (Technical)

- [ ] Dragging an element via its drag handle repositions it visually; final position applied on mouse-up
- [ ] Selection box tracks element position in real-time during drag
- [ ] Resize handles (all 8) correctly expand/contract element in the correct direction
- [ ] `Shift` key during resize constrains to aspect ratio
- [ ] `min-width: 20px` / `min-height: 20px` constraints enforced
- [ ] Canvas auto-scrolls vertically when dragging element near top/bottom edges
- [ ] Both drag and resize record undo actions on completion (not during continuous drag)
- [ ] Performance: drag/resize at ≥ 60fps (no layout thrash; RAF for updates)

## Business Rules & Logic

- BR-018: each drag/resize = one undo action (recorded on mouse-up, not on every mousemove)

## Dependencies

- Depends on: ZEST-009 (iframe bridge, selection box, editor store)
- External: `@dnd-kit/core`, `@dnd-kit/utilities` (add to package.json)

## Definition of Done

- [ ] Code implemented
- [ ] Manual test: drag element → new position preserved; undo → element returns to original position
- [ ] Manual test: resize from each of 8 handles works correctly
- [ ] Performance spot-check: drag of large div is smooth
- [ ] Lint/Type check clear
