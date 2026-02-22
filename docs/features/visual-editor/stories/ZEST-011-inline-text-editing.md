# ZEST-011: Inline Text Editing

**Epic:** ZEST-F02 (Visual Editor)
**Layer:** L4-feature-ui
**Role:** Frontend
**Estimation:** 3
**Priority:** Must

---

## Objective

Enable double-click inline text editing on any text-containing element in the canvas. When the user exits edit mode, the updated text is captured and recorded as an undo action.

## Technical Specifications

- **Proposed Files:**
  - `src/lib/editor/inline-text-editor.ts` (`enableTextEdit(elementId)`, `disableTextEdit(elementId)`, `getText(elementId)`)
  - Update `src/components/editor/canvas/CanvasOverlay.tsx` to detect double-click → enter text edit mode
  - Update `src/store/editor.store.ts` — add `isTextEditing: boolean`
- **Functions/Classes:**
  - `InlineTextEditor.enable(elementId)` — sets `contenteditable=true` on element in iframe
  - `InlineTextEditor.disable(elementId)` → `{ newText: string, oldText: string }`

## Acceptance Criteria (Technical)

- [ ] Double-clicking a text element enters edit mode: `contenteditable=true` applied; cursor positioned
- [ ] Canvas overlay pointer events are disabled during text edit mode (so clicks go through to the iframe)
- [ ] Pressing `Escape` or clicking outside text exits edit mode and records text change as undo action
- [ ] Selection box hidden during text edit mode
- [ ] Empty text (all whitespace deleted) resets to previous text value (cannot create empty text nodes)
- [ ] Non-text elements (img, div with no text children) do not enter text edit mode on double-click

## Business Rules & Logic

- Text changes recorded in undo stack (BR-018) as `{ type: 'text-edit', elementId, oldText, newText }`

## Dependencies

- Depends on: ZEST-009 (iframe bridge, canvas overlay)

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests: enable/disable text edit, empty text guard
- [ ] Manual test: double-click heading → edit → exit → verify undo restores original text
- [ ] Lint/Type check clear
