# Product Requirements Document: Zest

> **Document Status:** Approved  
> **Last Updated:** February 22, 2026  
> **Version:** 1.0 (MVP/Beta)

---

## 1. Overview

| Field | Value |
|-------|-------|
| **Product Name** | Zest |
| **Version** | MVP / Beta |
| **Timeline** | 3-6 months to public beta |
| **Platform** | Web Application (browser-based) |
| **Team Size** | 4-8 developers |
| **Business Model** | Freemium with usage limits |
| **Authentication** | Optional (required for saving/exporting) |

---

## 2. Quick Links

| Resource | Link |
|----------|------|
| Product Brief | [docs/product-brief.md](./product-brief.md) |
| Tech Stack | [docs/tech-stack.md](./tech-stack.md) *(TBD)* |
| Design System | [docs/design-system.md](./design-system.md) *(TBD)* |
| FSD | [docs/fsd.md](./fsd.md) *(TBD)* |
| Project Board | *[TBD]* |
| Design Mockups | *[TBD]* |

---

## 3. Background

### Context

The AI-powered development tools market has exploded with products like v0.dev, Bolt.new, Lovable.dev, and Shayna AI. These tools promise to turn natural language prompts into working web interfaces. However, they all share a critical limitation: **the output is code, not an editable design.**

### Problem Statement

Existing AI UI generators produce HTML/React/Vue code that users cannot easily modify without coding skills. This creates a fundamental disconnect:

1. **Non-technical users** are attracted by the "no-code" promise but hit a wall when customization is needed
2. **Designers** receive code they can't visually iterate on without developer help
3. **Developers** get a starting point but must context-switch to code editors for refinement

The "last mile" of UI creation — the iterative refinement that turns a generated draft into a polished product — remains inaccessible to most users.

### Impact

| Stakeholder | Current Pain | With Zest |
|-------------|--------------|-----------|
| Non-technical users | Cannot customize AI output | Full visual editing without code |
| Designers | Must hand off to developers for changes | Self-service iteration |
| Developers | Context-switching between AI tool and IDE | Faster iteration, cleaner output |

---

## 4. Objectives

### Business Objectives

| # | Objective | Success Indicator |
|---|-----------|-------------------|
| BO-1 | Validate product-market fit through beta user feedback | NPS > 50, qualitative feedback positive |
| BO-2 | Establish market presence in AI-powered design tools | Press coverage, social mentions, brand recognition |
| BO-3 | Acquire initial user base at scale | 10,000+ MAU at beta |
| BO-4 | Collect usage data for AI model improvement | Dataset of prompts, edits, and outcomes |

### User Objectives

| # | Objective | How Zest Enables |
|---|-----------|------------------|
| UO-1 | Create professional web UIs without coding | Natural language prompt-to-UI generation |
| UO-2 | Visually edit AI-generated output | WYSIWYG editor with drag/drop/resize |
| UO-3 | Export clean, usable HTML/CSS code | One-click export to HTML/CSS or Tailwind |
| UO-4 | Iterate quickly on designs | Chat-based refinement for targeted changes |

---

## 5. Success Metrics

| Metric | Baseline | Target | Measurement Method | Owner |
|--------|----------|--------|-------------------|-------|
| Monthly Active Users (MAU) | 0 | 10,000+ | Analytics dashboard | Growth |
| Conversion Rate (Free → Paid) | 0% | >5% | Billing system | Product |
| User Satisfaction (NPS) | N/A | >50 | In-app quarterly survey | Product |
| Time to First UI | N/A | <5 minutes | Session tracking | Product |
| Generation Success Rate | N/A | >90% | API logs | Engineering |
| Export Completion Rate | N/A | >30% of sessions | Event tracking | Product |
| Average Edits per Session | N/A | >3 edits | Event tracking | Product |
| Prompt-to-Export Time | N/A | <15 minutes | Session tracking | Product |

---

## 6. Scope

### MVP Goals

1. Prove that visual editing of AI-generated UIs delivers superior user experience
2. Validate that non-technical users can successfully create and export UIs
3. Establish technical foundation for future feature expansion

### In Scope (MVP) ✅

| Feature | Description | Priority |
|---------|-------------|----------|
| Prompt-to-HTML Generation | User enters natural language, system generates HTML/CSS | P0 |
| Real-time Visual Editor | WYSIWYG editing of generated UI elements | P0 |
| Code Export | Download as HTML/CSS or Tailwind CSS | P0 |
| Iterative Chat Refinement | Refine specific elements via follow-up prompts | P0 |
| Optional Authentication | Sign up to save projects, anonymous for quick use | P1 |
| Project Persistence | Save and revisit projects (authenticated users) | P1 |
| Freemium Usage Limits | Free tier with monthly generation limits | P1 |
| Responsive Preview | Preview UI at different viewport sizes | P1 |
| Basic Component Library | Common UI patterns (buttons, cards, forms) | P2 |

### Out of Scope (MVP) ❌

| Feature | Reason | Future Consideration |
|---------|--------|----------------------|
| Real-time Collaboration | Complexity; not needed for initial validation | v2.0 |
| Framework-specific Export | Focus on universal HTML first | Post-MVP |
| Design Tool Integrations | Third-party dependencies add risk | Post-MVP |
| Custom Design Systems | Requires design system infrastructure | Post-MVP |
| Mobile Apps | Web-first approach | Future |
| Self-hosted Deployment | Enterprise feature, not MVP priority | Enterprise tier |
| Image Generation | Focus on layout/structure first | Post-MVP |
| Animation/Interaction Design | Complexity; keep MVP focused | Post-MVP |

---

## 7. User Flow

### Main Flow: Prompt → Generate → Edit → Export

```
┌─────────────────────────────────────────────────────────────────┐
│                         MAIN USER FLOW                          │
└─────────────────────────────────────────────────────────────────┘

[Landing Page]
      │
      ▼
┌─────────────┐    ┌─────────────────────────────────────────────┐
│ Enter Prompt │───▶│ "Create a pricing page with 3 tiers..."    │
└─────────────┘    └─────────────────────────────────────────────┘
      │
      ▼
┌─────────────┐    ┌─────────────────────────────────────────────┐
│  Generate   │───▶│ AI processes prompt, returns HTML/CSS       │
│  (Loading)  │    │ Display progress indicator (~10-30 seconds) │
└─────────────┘    └─────────────────────────────────────────────┘
      │
      ▼
┌─────────────┐    ┌─────────────────────────────────────────────┐
│   Preview   │───▶│ Show generated UI in visual editor canvas   │
│   + Edit    │    │ User can click elements to edit properties  │
└─────────────┘    └─────────────────────────────────────────────┘
      │
      ├──────────────────────────────────────┐
      │                                      │
      ▼                                      ▼
┌─────────────┐                      ┌─────────────┐
│ Visual Edit │                      │ Chat Refine │
│ (Drag/Drop) │                      │ "Make the   │
│             │                      │  header     │
│             │                      │  larger..." │
└─────────────┘                      └─────────────┘
      │                                      │
      └──────────────────┬───────────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │   Export    │
                  │ HTML/CSS or │
                  │  Tailwind   │
                  └─────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
   [Anonymous User]              [Authenticated User]
   Download ZIP                  Download ZIP + Save Project
```

### Alternative Flows

**Flow A: Returning User**
```
1. User logs in
2. User views saved projects
3. User opens existing project
4. User continues editing
5. User exports updated version
```

**Flow B: Iteration Loop**
```
1. User generates initial UI
2. User makes visual edits
3. User uses chat: "Change the color scheme to dark mode"
4. System regenerates affected components
5. User continues editing
6. Repeat steps 3-5 as needed
7. User exports final version
```

### Edge Cases

| Edge Case | System Behavior |
|-----------|-----------------|
| Invalid/unclear prompt | Show helpful error with prompt suggestions |
| Generation timeout (>60s) | Cancel request, suggest simpler prompt |
| Low-quality output | Offer "Regenerate" button with prompt tips |
| Harmful content detected | Block output, log incident, show policy message |
| API failure | Show error message with retry option |
| Browser compatibility issue | Display warning, suggest supported browser |

---

## 8. User Stories

### Core Generation

| ID | User Story | Acceptance Criteria | Priority |
|----|------------|---------------------|----------|
| US-01 | As a user, I want to describe a UI in plain English so that I can generate a starting point without coding | **Given** I am on the homepage<br>**When** I enter a prompt and click "Generate"<br>**Then** I see a loading indicator and within 30 seconds see a preview of the generated UI | P0 |
| US-02 | As a user, I want to see a preview of the generated UI so that I can evaluate if it meets my needs | **Given** generation is complete<br>**When** the UI loads<br>**Then** I see the full generated interface in an interactive canvas | P0 |
| US-03 | As a user, I want to regenerate if the output isn't right so that I can get a better result | **Given** I have a generated UI<br>**When** I click "Regenerate"<br>**Then** a new version is generated (previous version optionally saved) | P1 |

### Visual Editing

| ID | User Story | Acceptance Criteria | Priority |
|----|------------|---------------------|----------|
| US-04 | As a user, I want to select elements in the visual editor so that I can modify them | **Given** a generated UI in the editor<br>**When** I click on an element<br>**Then** it becomes selected with visible handles and a properties panel opens | P0 |
| US-05 | As a user, I want to change text content by clicking and typing so that I can customize copy | **Given** a text element is selected<br>**When** I double-click it<br>**Then** I can edit the text inline | P0 |
| US-06 | As a user, I want to change colors, fonts, and spacing so that I can match my brand | **Given** an element is selected<br>**When** I use the properties panel<br>**Then** I can modify style properties and see changes in real-time | P0 |
| US-07 | As a user, I want to drag elements to reposition them so that I can adjust the layout | **Given** an element is selected<br>**When** I drag it<br>**Then** it moves to the new position and the layout updates | P1 |
| US-08 | As a user, I want to resize elements so that I can adjust proportions | **Given** an element is selected<br>**When** I drag resize handles<br>**Then** the element resizes proportionally or freely (based on settings) | P1 |
| US-09 | As a user, I want to delete elements so that I can remove unwanted parts | **Given** an element is selected<br>**When** I press Delete or click the delete button<br>**Then** the element is removed from the canvas | P0 |

### Chat Refinement

| ID | User Story | Acceptance Criteria | Priority |
|----|------------|---------------------|----------|
| US-10 | As a user, I want to refine the UI via chat so that I can make targeted changes with natural language | **Given** I have a generated UI<br>**When** I type "Make the header background blue"<br>**Then** the system updates only the header background color | P0 |
| US-11 | As a user, I want to see what the AI changed so that I understand the modifications | **Given** I submit a refinement request<br>**When** the changes are applied<br>**Then** changed elements are briefly highlighted | P1 |

### Export

| ID | User Story | Acceptance Criteria | Priority |
|----|------------|---------------------|----------|
| US-12 | As a user, I want to export my UI as HTML/CSS so that I can use it in my projects | **Given** I have a finalized UI<br>**When** I click "Export" and select "HTML/CSS"<br>**Then** I download a ZIP containing index.html and styles.css | P0 |
| US-13 | As a user, I want to export as Tailwind CSS so that I can use it in modern projects | **Given** I have a finalized UI<br>**When** I click "Export" and select "Tailwind"<br>**Then** I download a ZIP with Tailwind utility classes | P0 |
| US-14 | As a user, I want to preview the code before exporting so that I can verify quality | **Given** I click "View Code"<br>**When** the code panel opens<br>**Then** I see syntax-highlighted HTML/CSS | P1 |

### Authentication & Projects

| ID | User Story | Acceptance Criteria | Priority |
|----|------------|---------------------|----------|
| US-15 | As a user, I want to use Zest without signing up so that I can try it quickly | **Given** I am a new visitor<br>**When** I enter a prompt<br>**Then** I can generate and edit without authentication | P0 |
| US-16 | As a user, I want to sign up so that I can save my projects | **Given** I am using Zest anonymously<br>**When** I click "Sign Up"<br>**Then** I can create an account with email or OAuth | P1 |
| US-17 | As a user, I want to save my project so that I can return to it later | **Given** I am authenticated and have a UI<br>**When** I click "Save"<br>**Then** the project is saved to my account | P1 |
| US-18 | As a user, I want to see my saved projects so that I can continue working | **Given** I am logged in<br>**When** I go to my dashboard<br>**Then** I see a list of my saved projects with thumbnails | P1 |

### Freemium Limits

| ID | User Story | Acceptance Criteria | Priority |
|----|------------|---------------------|----------|
| US-19 | As a free user, I want to know my usage limits so that I can plan accordingly | **Given** I am a free user<br>**When** I view my account or the editor<br>**Then** I see my remaining generations for the month | P1 |
| US-20 | As a free user who hits the limit, I want to upgrade so that I can continue using Zest | **Given** I have used all free generations<br>**When** I try to generate<br>**Then** I see an upgrade prompt with plan options | P1 |

---

## 9. Analytics

### Event Tracking Strategy

Comprehensive tracking to understand user behavior, optimize the product, and improve AI quality.

### Core Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `page_view` | Page load | `page_name`, `referrer`, `session_id` |
| `prompt_submitted` | User submits generation prompt | `prompt_length`, `prompt_hash`, `session_id`, `user_id` |
| `generation_started` | AI generation begins | `request_id`, `model`, `timestamp` |
| `generation_completed` | AI returns result | `request_id`, `duration_ms`, `token_count`, `success`, `error_code` |
| `generation_failed` | AI generation fails | `request_id`, `error_type`, `error_message` |

### Editor Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `element_selected` | User clicks element | `element_type`, `element_id` |
| `element_modified` | User changes element property | `element_type`, `property_name`, `old_value`, `new_value` |
| `element_moved` | User drags element | `element_type`, `delta_x`, `delta_y` |
| `element_resized` | User resizes element | `element_type`, `old_size`, `new_size` |
| `element_deleted` | User deletes element | `element_type`, `element_id` |
| `undo_action` | User undoes action | `action_type` |
| `redo_action` | User redoes action | `action_type` |

### Chat Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `chat_message_sent` | User sends refinement message | `message_length`, `session_id` |
| `chat_refinement_applied` | AI applies refinement | `elements_changed`, `duration_ms` |
| `chat_refinement_rejected` | User rejects refinement | `reason` |

### Export & Conversion Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `export_initiated` | User clicks export | `format`, `project_id`, `user_type` |
| `export_completed` | Download starts | `format`, `file_size_kb` |
| `code_preview_opened` | User views code | `format` |
| `signup_started` | User begins signup | `source`, `trigger_action` |
| `signup_completed` | User completes signup | `method`, `plan_type` |
| `upgrade_prompt_shown` | User sees upgrade CTA | `trigger`, `current_usage` |
| `upgrade_clicked` | User clicks upgrade | `plan_selected` |
| `payment_completed` | User completes payment | `plan`, `amount`, `currency` |

### Event Schema Example

```json
{
  "event": "generation_completed",
  "timestamp": "2026-02-22T14:30:00Z",
  "properties": {
    "request_id": "gen_abc123",
    "session_id": "sess_xyz789",
    "user_id": "user_456",
    "duration_ms": 12500,
    "token_count": 2340,
    "model": "gpt-4",
    "success": true,
    "prompt_hash": "sha256_abc..."
  }
}
```

---

## 10. Open Questions

| ID | Question | Owner | Status | Due Date | Resolution |
|----|----------|-------|--------|----------|------------|
| OQ-01 | Which LLM provider should be primary (OpenAI, Claude, Gemini)? | Tech Lead | Open | Sprint 1 | — |
| OQ-02 | What are the exact free tier limits (X generations/month)? | Product | Open | Sprint 1 | — |
| OQ-03 | How do we handle content moderation for generated UIs? | Product | Open | Sprint 2 | — |
| OQ-04 | Build custom visual editor or use existing library (Fabric.js, Konva)? | Tech Lead | Open | Sprint 1 | — |
| OQ-05 | Should we use n8n or similar for AI orchestration? | Tech Lead | Open | Sprint 1 | — |
| OQ-06 | What OAuth providers to support (Google, GitHub, etc.)? | Product | Open | Sprint 2 | — |
| OQ-07 | How to handle prompt injection attacks? | Security | Open | Sprint 2 | — |
| OQ-08 | What is the pricing for paid tiers? | Business | Open | Pre-launch | — |

---

## 11. Notes

### Technical Considerations

- **AI Response Time:** Target <30 seconds for initial generation; optimize prompts and consider streaming responses
- **Visual Editor Performance:** Must handle 100+ elements smoothly; consider virtualization
- **Code Quality:** Generated HTML must be semantic, accessible (WCAG 2.1 AA), and valid
- **Browser Support:** Chrome, Firefox, Safari, Edge (latest 2 versions)

### Edge Case Handling

| Edge Case | Handling Strategy |
|-----------|-------------------|
| Invalid prompts | Provide helpful error message with suggestions |
| Low-quality generation | Offer regenerate with tips; collect feedback for model improvement |
| Harmful content | Block output, log for review, show policy message |
| API failures | Graceful degradation with retry; fallback provider if available |
| Rate limiting | Queue requests; show wait time estimate |

### Business Considerations

- **GDPR Compliance:** Implement data minimization, user consent, right to deletion
- **AI Cost Management:** Monitor per-user costs; implement caching for similar prompts
- **Competitive Response:** Monitor v0, Bolt, Lovable features; differentiate on editing UX

### Assumptions

| Assumption | Risk if Wrong | Mitigation |
|------------|---------------|------------|
| Users prefer visual editing over code | Product may not resonate | Early user testing, A/B tests |
| AI quality will be sufficient | Poor output = poor reviews | Multi-model support, prompt engineering |
| Freemium converts at >5% | Revenue model fails | Adjust limits, pricing, features |

---

## 12. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| **Generation** | The process of AI creating HTML/CSS from a prompt |
| **Refinement** | Iterative improvement of generated UI via chat |
| **Visual Editor** | WYSIWYG canvas for editing generated UIs |
| **Export** | Downloading the UI as code files |
| **MAU** | Monthly Active Users |
| **NPS** | Net Promoter Score |

### B. Related Documents

- [Product Brief](./product-brief.md)
- Tech Stack *(TBD)*
- Design System *(TBD)*
- FSD *(TBD)*

### C. Competitive Analysis Summary

| Competitor | Strength | Weakness | Zest Advantage |
|------------|----------|----------|----------------|
| v0.dev | Vercel ecosystem, quality output | Code-only output | Visual editing |
| Bolt.new | Full-stack generation | Complex, dev-focused | Simpler UX for non-devs |
| Lovable.dev | Full app builder | Overwhelming for simple UIs | Focused on UI editing |
| Shayna AI | UI-focused | Limited editing | Deeper visual customization |

### D. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | AI Assistant | Initial version |

---

*This PRD serves as the source of truth for Zest MVP. All implementation decisions should align with the requirements defined here. Changes require PRD amendment and stakeholder approval.*
