# ZEST-005: PromptBar Component

**Epic:** ZEST-F01 (Prompt-to-UI Generation)
**Layer:** L4-feature-ui
**Role:** Frontend
**Estimation:** 3
**Priority:** Must

---

## Objective

Build the `PromptBar` component — Zest's signature AI input. Includes an auto-growing textarea, animated cycling placeholder suggestions, format toggle (HTML/CSS | Tailwind), character counter, and an embedded `primary` submit button with loading state.

## Technical Specifications

- **Proposed Files:**
  - `src/components/prompt-bar/PromptBar.tsx`
  - `src/components/prompt-bar/PromptBar.types.ts`
  - `src/components/prompt-bar/useSuggestionCycle.ts` (cycling placeholder hook)
  - `src/components/prompt-bar/PromptBar.test.tsx`
- **Functions/Classes:**
  - `PromptBar` component (props per `docs/design-system.md` PromptBar spec)
  - `useSuggestionCycle(suggestions: string[], intervalMs: number)` → `{ currentSuggestion: string }`
- **API Endpoints:** N/A (component only)

## Acceptance Criteria (Technical)

- [ ] Textarea auto-grows from 1 line to maximum 6 lines, then scrolls
- [ ] Placeholder suggestion cycles every 3 seconds with 400ms fade cross-transition
- [ ] Suggestions pause when textarea is focused
- [ ] Character counter appears at 80% of 2,000-char limit; turns red at 100%
- [ ] Format toggle switches between `'html_css'` and `'tailwind'`; persists in component state
- [ ] Submit button shows spinner and is disabled when `loading={true}`
- [ ] `Cmd/Ctrl + Enter` triggers `onSubmit` when textarea is focused
- [ ] Component renders correctly with no suggestions provided (static placeholder)
- [ ] Focus state shows `shadow-brand` green border glow (`ease-spring` transition)

## Business Rules & Logic

- Max prompt length: 2,000 characters (BR / validation §6.1)
- Min prompt length: 10 characters (validated on submit, not on keystroke)
- `onSubmit` is NOT called if prompt length < 10 chars; inline error shown instead

## Dependencies

- Depends on: ZEST-002 (design tokens, Button, Input shadcn components)

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests: cycling suggestion, format toggle, character counter, submit guard
- [ ] Storybook story (or equivalent visual check) showing all states: idle, focused, typing, loading
- [ ] Lint/Type check clear
