# PRD Addendum: Chat Refinement

**Feature:** `chat-refinement`
**Epic:** ZEST-F03
**Parent PRD:** `docs/prd.md`
**Status:** Approved
**Date:** 2026-02-22
**Priority:** P0

---

## 1. Feature Metadata

| Field | Value |
|-------|-------|
| Feature Name | Chat Refinement |
| Feature Slug | `chat-refinement` |
| Epic Code | `ZEST-F03` |
| Priority | P0 |
| Impacted Users | All users with a generated UI |
| PRD Stories | US-10, US-11 |

---

## 2. User Stories

| ID | User Story | Acceptance Criteria | Priority |
|----|------------|---------------------|----------|
| US-10 | As a user, I want to refine the UI via chat so that I can make targeted changes with natural language | **Given** I have a generated UI<br>**When** I type "Make the header background blue" and submit<br>**Then** only the header background is updated; rest of the UI is unchanged | P0 |
| US-11 | As a user, I want to see what the AI changed so that I understand the modifications | **Given** I submit a refinement request<br>**When** changes are applied<br>**Then** changed elements briefly highlight with a green pulse animation (1.5s) | P1 |

---

## 3. Functional Requirements

### 3.1 Chat Panel
- Located in the right side of the editor (replaces or tabs with the Properties panel)
- Chat messages displayed as a conversation thread (user message + AI change summary)
- Input: single-line text field, 5–1,000 char limit
- Send button + `Enter` key submits
- Disabled during active generation (loading state)

### 3.2 Refinement Request Flow
1. User types refinement message in chat panel
2. Frontend submits `POST /api/v1/generate` with:
   - `prompt`: the refinement message
   - `previous_generation_id`: current generation's ID
   - `output_format`: same as current generation
3. Go AI Service receives the request with context, uses scoped prompting to modify only the targeted element (BR-021)
4. Go AI Service returns updated `html` + `css` for the changed portion
5. Frontend applies the updated HTML/CSS to the iframe (replaces the full HTML)
6. Changed elements highlighted briefly (US-11)

### 3.3 Generation Chain
- Every refinement creates a new `Generation` record with `parent_generation_id` pointing to the previous
- This creates a linked list: `gen_1 → gen_2 → gen_3`
- The canvas always shows the latest generation in the chain

### 3.4 Change Highlighting (US-11)
- After applying refinement, compare previous HTML vs new HTML (diff)
- Elements that changed receive a `data-zest-changed` attribute
- A CSS animation (green pulse, `ease-spring`, 1.5s, one-time) is applied to those elements
- Attribute and animation removed after 1.5s

### 3.5 Rate Limits
- Same limits as generation: anonymous 3/day, free 20/month (shared quota with initial generation)

---

## 4. ERD Delta

Uses existing `Generation` entity. The `parent_generation_id` self-reference handles the refinement chain. No new entities.

---

## 5. API Contract

Chat refinement reuses `POST /api/v1/generate` with `previous_generation_id` populated. No new endpoint required.

**Request additions for refinement:**
```json
{
  "prompt": "Make the header background blue",
  "output_format": "html_css",
  "previous_generation_id": "uuid-of-current-generation"
}
```

---

## 6. Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `chat_message_sent` | User submits refinement | `message_length`, `session_id`, `generation_id` |
| `chat_refinement_applied` | Updated HTML applied to canvas | `elements_changed`, `duration_ms`, `generation_id` |

---

## 7. Open Questions

| ID | Question | Owner | Status |
|----|----------|-------|--------|
| CR-OQ-01 | Should chat history be persisted to the server (or only in session memory)? | Product | Open |
| CR-OQ-02 | Should the chat panel have a "Revert to before this change" per-message button? | Product | Open |

---

## 8. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | AI Assistant | Initial version |
