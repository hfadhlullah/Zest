# PRD Addendum: Visual Editor

**Feature:** `visual-editor`
**Epic:** ZEST-F02
**Parent PRD:** `docs/prd.md`
**Status:** Approved
**Date:** 2026-02-22
**Priority:** P0

---

## 1. Feature Metadata

| Field | Value |
|-------|-------|
| Feature Name | Visual Editor |
| Feature Slug | `visual-editor` |
| Epic Code | `ZEST-F02` |
| Priority | P0 — Must have for launch |
| Impacted Users | All who reach the editor |
| PRD Stories | US-04, US-05, US-06, US-07, US-08, US-09 |

---

## 2. User Stories

| ID | User Story | Acceptance Criteria | Priority |
|----|------------|---------------------|----------|
| US-04 | As a user, I want to select elements so that I can modify them | **Given** a generated UI is in the canvas<br>**When** I click on an element<br>**Then** it gets a selection highlight with handles, and the Properties panel opens | P0 |
| US-05 | As a user, I want to change text by clicking and typing so that I can customize copy | **Given** a text element is selected<br>**When** I double-click it<br>**Then** I can edit the text inline with a cursor | P0 |
| US-06 | As a user, I want to change colors, fonts, and spacing so that I can match my brand | **Given** an element is selected<br>**When** I modify a property in the Properties panel<br>**Then** the change is immediately reflected in the canvas | P0 |
| US-07 | As a user, I want to drag elements to reposition them | **Given** an element is selected<br>**When** I drag it to a new position<br>**Then** it moves and the layout updates | P1 |
| US-08 | As a user, I want to resize elements | **Given** an element is selected<br>**When** I drag its resize handles<br>**Then** the element resizes | P1 |
| US-09 | As a user, I want to delete elements | **Given** an element is selected<br>**When** I press `Delete` or click the delete icon<br>**Then** the element is removed from the canvas | P0 |

---

## 3. Functional Requirements

### 3.1 Editor Layout
Three-panel layout per `docs/design-system.md` Editor Layout Pattern:
- **Left sidebar (240px):** Layers tree (element hierarchy) + project name
- **Center canvas (flex-grow):** Rendered UI in iframe overlay with selection/drag system
- **Right panel (280px):** Properties inspector (styles, text, dimensions)
- Toolbar at top of canvas: Regenerate | Responsive toggle | Export | Save | Undo/Redo

### 3.2 Element Selection (US-04)
- Click on any element in the canvas overlay selects it
- Selection indicator: 2px green border ring with corner handles
- Properties panel animates open (spring, 300ms) with selected element's current styles pre-populated
- Clicking outside any element deselects
- Layers panel highlights the selected element's tree node

### 3.3 Inline Text Editing (US-05)
- Double-click on any text-containing element enters edit mode
- Edit mode: `contenteditable="true"` set on the element in the iframe DOM
- Exiting edit mode (click outside or `Escape`): captures updated text → diffs against previous → records undo action

### 3.4 Properties Panel (US-06)
The properties panel exposes the following controls, grouped by section:

| Section | Controls |
|---------|----------|
| Typography | Font family (dropdown), font size (slider+input), font weight, line height, letter spacing, text color |
| Colors | Background color (color picker), border color |
| Spacing | Padding top/right/bottom/left (linked or individual), margin |
| Dimensions | Width, height, min/max width/height |
| Border | Border radius (individual corners), border width, border style |
| Layout | Display (block/flex/grid), flex direction, gap, align-items, justify-content |

All changes are applied via `postMessage` to the iframe, which applies them as inline styles on the selected element. Changes trigger a debounced (300ms) state update in Zustand.

### 3.5 Drag & Drop (US-07)
- Uses `@dnd-kit/core` with a custom overlay over the iframe
- Drag handle: appears on selected element hover
- On drop: element position updated via `top`/`left`/`transform` CSS (relative to parent container)
- Auto-scroll canvas when dragging near edges

### 3.6 Resize (US-08)
- 8-handle resize system (4 corners + 4 midpoints)
- Holding `Shift` constrains to aspect ratio
- `min-width: 20px`, `min-height: 20px` constraints
- Resize updates recorded as undo action on mouse-up

### 3.7 Delete (US-09)
- `Delete`/`Backspace` key when element selected (and not in text edit mode) removes element
- Delete button in properties panel
- Undo restores deleted element with full styles

### 3.8 Undo/Redo (BR-018)
- Minimum 50-action history stack
- `Cmd/Ctrl + Z` = undo; `Cmd/Ctrl + Shift + Z` = redo
- Toolbar undo/redo buttons with disabled state when stack is empty
- Actions tracked: text edit, style change, drag, resize, delete

### 3.9 Auto-Save (BR-019, BR-020)
- **Anonymous:** Zustand state serialized to `localStorage` key `zest_editor_{generation_id}` every 30 seconds
- **Authenticated:** `PUT /api/v1/projects/{id}` with current generation HTML/CSS every 60 seconds

---

## 4. ERD Delta

No new entities. The visual editor modifies the `html` and `css` fields on the existing `Generation` record (via project auto-save).

---

## 5. API Contract

No new dedicated API endpoints for the visual editor itself. Editor changes are persisted via the existing project save API (`PUT /api/v1/projects/{id}`) — defined in Feature 6 (`project-management`).

---

## 6. Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `element_selected` | User clicks element | `element_type`, `element_id`, `session_id` |
| `element_modified` | Style property changed | `element_type`, `property_name`, `old_value`, `new_value` |
| `element_text_edited` | Text edit mode exited with change | `element_type`, `char_delta` |
| `element_moved` | Drag ended | `element_type`, `delta_x`, `delta_y` |
| `element_resized` | Resize ended | `element_type`, `old_dimensions`, `new_dimensions` |
| `element_deleted` | Element removed | `element_type` |
| `undo_action` | Undo triggered | `action_type` |
| `redo_action` | Redo triggered | `action_type` |

---

## 7. Open Questions

| ID | Question | Owner | Status |
|----|----------|-------|--------|
| VE-OQ-01 | Iframe DOM access for element selection: `postMessage` bridge vs same-origin direct access? (FQ-03 in FSD) | Tech | Open |
| VE-OQ-02 | How are Tailwind utility classes edited in the properties panel? (JIT in iframe?) (FQ-04 in FSD) | Tech | Open |
| VE-OQ-03 | Should Layers tree support reordering via drag? | Product | Open |

---

## 8. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | AI Assistant | Initial version |
