# ZEST-014: Go AI Service — Refinement (Scoped Prompting)

**Epic:** ZEST-F03 (Chat Refinement)
**Layer:** L3-backend
**Role:** Backend
**Estimation:** 5
**Priority:** Must

---

## Objective

Extend the Go AI Service `/generate` endpoint to handle refinement requests. When `previous_generation_id` is present and non-null, the service uses scoped prompting: it retrieves the previous HTML/CSS from the request context, constructs a targeted modification prompt, and returns only the changed output — not a full regeneration.

## Technical Specifications

- **Proposed Files:**
  - `services/ai/handlers/generate.go` (update: detect refinement context)
  - `services/ai/prompts/refinement.go` (`BuildRefinementPrompt(html, css, message) → string`)
  - `services/ai/models/types.go` (update `GenerationRequest` to include `Context` field with `previous_generation_id`, `refinement_target`)
- **Functions/Classes:**
  - `BuildRefinementPrompt(previousHTML, previousCSS, refinementMessage) → string`
  - Updated `GenerationRequest` struct (per FSD §1.3)
- **API Endpoints:** `POST /generate` (existing — refinement mode activated by `Context.PreviousGenerationID` being non-null)

## Acceptance Criteria (Technical)

- [ ] When `Context.PreviousGenerationID` is non-null, the service uses refinement prompt template
- [ ] Refinement prompt template injects the previous HTML/CSS as context alongside the user's message
- [ ] System prompt instructs LLM to only modify the targeted element/section (BR-021) and return the complete updated HTML
- [ ] Refinement requests go through the same content moderation check as initial generations (BR-004)
- [ ] Fallback chain applies identically for refinement requests (BR-005, BR-006)
- [ ] `RefinementPrompt` unit tests verify correct context injection for various inputs

## Business Rules & Logic

- BR-021: refinement modifies only the targeted element/section; full regeneration is a separate action
- BR-004: moderation before every LLM call, including refinements
- Refinement results are NOT cached (each is unique to the prior generation context)

## Dependencies

- Depends on: ZEST-003 (Go AI Service scaffold)

## Definition of Done

- [ ] Code implemented
- [ ] Unit tests for `BuildRefinementPrompt` with various HTML/message inputs
- [ ] Manual test: submit "make the button red" with a previous generation containing a button → only button color changes
- [ ] Lint (golangci-lint) passes
