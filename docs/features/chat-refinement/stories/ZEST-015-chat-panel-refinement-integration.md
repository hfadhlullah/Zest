# ZEST-015: Chat Panel UI & Refinement Integration

**Epic:** ZEST-F03 (Chat Refinement)
**Layer:** L4-feature-ui
**Role:** Frontend
**Estimation:** 5
**Priority:** Must

---

## Objective

Build the Chat Panel component in the editor and wire it up to the refinement API flow. Includes message thread display, send input, loading state, and the change-highlight animation applied to modified elements after a successful refinement.

## Technical Specifications

- **Proposed Files:**
  - `src/components/editor/chat/ChatPanel.tsx`
  - `src/components/editor/chat/ChatMessage.tsx`
  - `src/components/editor/chat/ChatInput.tsx`
  - `src/hooks/useRefinement.ts`
  - `src/lib/editor/diff-highlighter.ts` (`highlightChangedElements(prevHtml, nextHtml, iframeDoc)`)
  - Update `src/store/editor.store.ts` — add `chatMessages: ChatMessage[]`, `appendMessage`
- **Functions/Classes:**
  - `ChatPanel` component (message list + input)
  - `useRefinement()` → `{ refine(message), isRefining, messages }`
  - `highlightChangedElements(prevHtml, nextHtml, iframeDocument)` — diffs HTML, applies `data-zest-changed` attribute, triggers CSS animation

## Acceptance Criteria (Technical)

- [ ] Chat panel shows conversation thread: user messages on right, AI confirmation messages on left
- [ ] Input field max 1,000 chars; `Enter` submits; `Shift+Enter` creates newline (if multi-line)
- [ ] Submit disabled and input shows spinner during `isRefining = true`
- [ ] After successful refinement: canvas updates with new HTML/CSS; changed elements pulse green for 1.5s
- [ ] After failed refinement: error message appended to chat thread (not a toast — keeps context in chat)
- [ ] `useRefinement` calls `POST /api/v1/generate` with `previous_generation_id` from current generation
- [ ] Chat messages are stored in Zustand; survive panel tab switching

## Business Rules & Logic

- Rate limit errors (429) from refinement show upgrade prompt in chat thread (not a modal)
- Chat panel and Properties panel share the right panel space via tabs: "Properties" | "Chat"

## Dependencies

- Depends on: ZEST-008 (editor layout — right panel)
- Depends on: ZEST-009 (iframe bridge — to apply updated HTML to canvas)
- Depends on: ZEST-014 (Go service refinement mode)
- Depends on: ZEST-004 (API route — reuses `POST /api/v1/generate`)

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests: `useRefinement` loading/success/error; `highlightChangedElements` diffs correctly
- [ ] Manual E2E: submit "make the heading red" → heading turns red → green pulse animation
- [ ] Lint/Type check clear
