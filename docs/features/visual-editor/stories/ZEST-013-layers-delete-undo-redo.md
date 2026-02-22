# ZEST-013: Layers Panel, Delete & Undo/Redo

**Epic:** ZEST-F02 (Visual Editor)
**Layer:** L4-feature-ui
**Role:** Frontend
**Estimation:** 5
**Priority:** Must

---

## Objective

Build the Layers panel (element hierarchy tree in left sidebar), implement element delete, and wire up the complete undo/redo system with keyboard shortcuts and toolbar buttons.

## Technical Specifications

- **Proposed Files:**
  - `src/components/editor/sidebar/LayersPanel.tsx`
  - `src/components/editor/sidebar/LayerNode.tsx` (recursive tree node)
  - `src/lib/editor/dom-tree.ts` (`buildDomTree(iframeDocument)` → `LayerNode[]`)
  - `src/lib/editor/undo-manager.ts` (`push(action)`, `undo()`, `redo()`, `canUndo`, `canRedo`)
  - Update `src/store/editor.store.ts` — integrate `undoManager`
- **Functions/Classes:**
  - `LayersPanel` component
  - `buildDomTree(doc)` → recursive `LayerNode[]` structure
  - `UndoManager` class with 50-action ring buffer (BR-018)
  - Action types: `'style-change'`, `'text-edit'`, `'drag'`, `'resize'`, `'delete'`, `'restore'`
- **API Endpoints:** N/A

## Acceptance Criteria (Technical)

- [ ] Layers panel renders the iframe DOM as a collapsible tree: element tag + first 20 chars of text content
- [ ] Clicking a layer node selects that element in the canvas (syncs with `editorStore.selectedElement`)
- [ ] Selected element's node is highlighted in the layers panel
- [ ] `Delete`/`Backspace` key (when not in text edit mode) removes the selected element
- [ ] Delete button in properties panel header also removes element
- [ ] Undo restores deleted element at exact original DOM position
- [ ] `Cmd/Ctrl + Z` triggers undo; `Cmd/Ctrl + Shift + Z` triggers redo
- [ ] Toolbar undo button disabled when `canUndo = false`; redo button disabled when `canRedo = false`
- [ ] Undo/redo stack capped at 50 actions; oldest actions drop when cap is reached (BR-018)

## Business Rules & Logic

- BR-018: minimum 50-action undo/redo history
- Delete must NOT be triggered when focus is in the PromptBar or text inputs

## Dependencies

- Depends on: ZEST-009 (iframe bridge, editor store, canvas overlay)
- Depends on: ZEST-010 (style-change undo actions)
- Depends on: ZEST-011 (text-edit undo actions)
- Depends on: ZEST-012 (drag/resize undo actions)

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests: `UndoManager` push/undo/redo/cap behavior
- [ ] Unit tests: `buildDomTree` correctly structures a sample HTML document
- [ ] Manual test: full undo chain (style → text → drag → delete → undo × 4 restores each)
- [ ] Lint/Type check clear
