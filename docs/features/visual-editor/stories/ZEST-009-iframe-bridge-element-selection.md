# ZEST-009: Iframe Bridge & Element Selection

**Epic:** ZEST-F02 (Visual Editor)
**Layer:** L3-backend
**Role:** Frontend
**Estimation:** 8
**Priority:** Must

---

## Objective

Implement the selection system: a transparent overlay on the iframe canvas that intercepts mouse events, identifies the clicked DOM element, highlights it with a green selection ring + handles, and updates the Zustand editor store. This is the foundational interaction layer all other editor capabilities build on.

## Technical Specifications

- **Proposed Files:**
  - `src/components/editor/canvas/CanvasOverlay.tsx` (transparent div layered over iframe)
  - `src/components/editor/canvas/SelectionBox.tsx` (rendered selection ring + 8 handles)
  - `src/lib/editor/iframe-bridge.ts` (`postMessage` communication with iframe contents)
  - `src/lib/editor/element-resolver.ts` (maps click coordinates to DOM element in iframe)
  - `src/store/editor.store.ts` (Zustand: `selectedElement`, `setSelectedElement`, `editorHtml`, `editorCss`, `undoStack`, `redoStack`)
- **Functions/Classes:**
  - `CanvasOverlay` component (captures pointer events)
  - `IframeBridge.getElementAt(x, y)` → `ElementDescriptor`
  - `IframeBridge.applyStyle(elementId, styles)` → void
  - `IframeBridge.getText(elementId)` → string
  - `ElementDescriptor` type: `{ id, tagName, rect, currentStyles, textContent }`
- **API Endpoints:** N/A

## Acceptance Criteria (Technical)

- [ ] Clicking on an element in the canvas overlay correctly identifies the target DOM element in the iframe
- [ ] `SelectionBox` renders at the correct position and size, tracking the selected element's bounding rect
- [ ] Selection ring uses `color-brand-primary` (`#22C55E`) 2px border, 8 handles at corners and midpoints
- [ ] Clicking outside any selectable element deselects (clears `selectedElement` in store)
- [ ] `editorStore.selectedElement` contains correct `tagName`, `rect`, `currentStyles`, `textContent`
- [ ] Iframe bridge `applyStyle` changes reflect in the iframe DOM immediately
- [ ] `SelectionBox` position updates if the iframe resizes (ResizeObserver)

## Business Rules & Logic

- Same-origin iframe assumed for MVP (FQ-03); if cross-origin is later needed, a `postMessage` protocol will be required

## Dependencies

- Depends on: ZEST-008 (editor layout with canvas area)
- Depends on: ZEST-006 (GenerationCanvas — iframe is already rendering HTML)

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests: `element-resolver` correctly maps coordinates to elements in mock DOM
- [ ] Manual test: clicking each element type (h1, p, div, button, img) in a generated UI selects it
- [ ] Lint/Type check clear
