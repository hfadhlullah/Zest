# ZEST-003: Go AI Service Scaffold

**Epic:** ZEST-F01 (Prompt-to-UI Generation)
**Layer:** L1-data
**Role:** Backend
**Estimation:** 5
**Priority:** Must

---

## Objective

Create the Go AI Service as a standalone HTTP server with four endpoints: `/generate`, `/refine`, `/moderate`, `/health`. Implement the provider router, content moderator, and response normalizer skeletons. Wire up environment-based LLM client configuration (GLM, Gemini, GitHub Copilot).

## Technical Specifications

- **Proposed Files:**
  - `services/ai/main.go`
  - `services/ai/handlers/generate.go`
  - `services/ai/handlers/refine.go`
  - `services/ai/handlers/moderate.go`
  - `services/ai/providers/glm.go`
  - `services/ai/providers/gemini.go`
  - `services/ai/providers/copilot.go`
  - `services/ai/providers/router.go` (provider selection + fallback chain)
  - `services/ai/moderator/moderator.go` (content moderation logic)
  - `services/ai/normalizer/normalizer.go` (parse HTML/CSS blocks from LLM responses)
  - `services/ai/models/types.go` (`GenerationRequest`, `GenerationResult` structs per FSD §1.3)
  - `services/ai/Dockerfile`
- **Functions/Classes:**
  - `Router.Route(req) → provider`
  - `Moderator.Check(prompt) → (allowed bool, reason string)`
  - `Normalizer.Parse(rawText, format) → GenerationResult`
  - `GenerationResult` struct (per FSD §7.2)
- **API Endpoints:**
  - `POST /generate`
  - `POST /refine`
  - `POST /moderate`
  - `GET /health`

## Acceptance Criteria (Technical)

- [ ] `GET /health` returns `200 {"status":"ok"}`
- [ ] `POST /generate` with a valid prompt returns `GenerationResult` with non-empty `HTML` field
- [ ] Provider fallback: if GLM is disabled (no API key), Gemini is used; if Gemini disabled, Copilot used
- [ ] `Moderator.Check` blocks prompts containing test bad-word list; allows clean prompts
- [ ] `Normalizer.Parse` correctly extracts `<html>...</html>` and `<style>...</style>` blocks from LLM mock response
- [ ] Service respects 60-second context deadline (BR-003)
- [ ] `Dockerfile` builds and runs; `docker-compose up` includes Go service at port 8080

## Business Rules & Logic

- Provider order: GLM → Gemini → GitHub Copilot (BR-005)
- Maximum 3 fallback attempts (BR-006)
- 60-second total timeout (BR-003)
- Content moderation MUST run before first LLM call (BR-004)
- `RawResponse` field in `GenerationResult` is for debug only — never persisted

## Dependencies

- Depends on: ZEST-001 (docker-compose)

## Definition of Done

- [ ] Code implemented
- [ ] `GET /health` returns 200 in local docker-compose
- [ ] At least one provider integration returns real HTML for a test prompt
- [ ] Lint (golangci-lint) passes
