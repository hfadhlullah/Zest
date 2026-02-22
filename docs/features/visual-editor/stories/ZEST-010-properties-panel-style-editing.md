# ZEST-010: Properties Panel & Style Editing

**Epic:** ZEST-F02 (Visual Editor)
**Layer:** L4-feature-ui
**Role:** Frontend
**Estimation:** 8
**Priority:** Must

---

## Objective

Build the Properties Panel — the right-side inspector that shows and lets users edit the selected element's styles in real time. Changes are applied immediately to the iframe via the iframe bridge.

## Technical Specifications

- **Proposed Files:**
  - `src/components/editor/properties/PropertiesPanel.tsx`
  - `src/components/editor/properties/sections/TypographySection.tsx`
  - `src/components/editor/properties/sections/ColorsSection.tsx`
  - `src/components/editor/properties/sections/SpacingSection.tsx`
  - `src/components/editor/properties/sections/DimensionsSection.tsx`
  - `src/components/editor/properties/sections/BorderSection.tsx`
  - `src/components/editor/properties/sections/LayoutSection.tsx`
  - `src/components/editor/properties/controls/ColorPicker.tsx`
  - `src/components/editor/properties/controls/SpacingInput.tsx`
  - `src/hooks/usePropertyEdit.ts`
- **Functions/Classes:**
  - `PropertiesPanel` — renders sections based on selected element's `tagName`
  - `usePropertyEdit(elementId)` → `{ applyStyle, currentStyles }`
  - `ColorPicker` — hex input + hue/saturation picker (use `react-colorful`)

## Acceptance Criteria (Technical)

- [ ] Properties panel populates with selected element's current computed styles on selection
- [ ] Changing any value in any section applies the style to the iframe element in real-time (< 50ms)
- [ ] Changes debounced 300ms before being recorded as undo actions
- [ ] Typography section: font-family dropdown shows the 3 design system fonts + system fallbacks
- [ ] Color picker opens on click; hex value can be typed directly; closes on outside click
- [ ] Spacing section: linked-padding toggle links all 4 sides; unlinked allows individual values
- [ ] Layout section: visible only when selected element has `display: flex` or `display: grid`
- [ ] Panel shows "Select an element" empty state when nothing is selected

## Business Rules & Logic

- Only inline styles are applied to preserve specificity and allow easy export
- Style changes must be recorded in the undo stack (BR-018)

## Dependencies

- Depends on: ZEST-009 (iframe bridge, editor store `selectedElement`)
- Depends on: ZEST-002 (design tokens for panel styling)

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests: each section correctly maps UI input to CSS property
- [ ] Manual test: change background color → verify in iframe DOM; undo → verify reversal
- [ ] Lint/Type check clear
