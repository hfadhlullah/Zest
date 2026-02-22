# Product Brief: Zest

> **Document Status:** Approved  
> **Last Updated:** February 22, 2026  
> **Version:** 1.0

---

## 1. Executive Summary

| Field | Value |
|-------|-------|
| **Product Name** | Zest |
| **Tagline** | "Turn prompts into editable web interfaces" |
| **Category** | AI-Powered UI Builder |
| **Deployment** | Cloud SaaS |

**One-liner:** Zest is an AI-powered UI builder that transforms natural language prompts into fully editable web interfaces with real-time visual editing and instant HTML/CSS output.

---

## 2. Vision Statement

**Democratize web development** by enabling anyone — non-technical users, designers, and developers alike — to create professional web interfaces through natural language.

We envision a world where the coding barrier that has traditionally excluded non-developers from building their own digital experiences no longer exists. With Zest, if you can describe it, you can build it.

---

## 3. Problem Statement

### Primary Problem
Existing AI code generators produce output that users **cannot easily modify visually** — the "last mile" of editing remains inaccessible to most users.

### Pain Points

| Pain Point | Impact |
|------------|--------|
| AI-generated UIs require manual code editing to refine | Excludes non-developers from iteration |
| Non-developers can't iterate on AI output without developer help | Creates bottlenecks and dependencies |
| The promise of "prompt-to-UI" breaks down when customization is needed | User frustration, abandoned projects |
| Existing tools output code, not editable designs | Forces users into developer workflows |

### The Gap
Current AI UI tools (v0, Bolt, Lovable) stop at code generation. Users receive HTML/React output but must switch to code editors to make changes. This defeats the purpose for non-technical users who wanted to avoid coding in the first place.

---

## 4. Target Audience

| Segment | Description | Priority | Key Needs |
|---------|-------------|----------|-----------|
| **Non-technical users** | Business users, marketers, entrepreneurs with no coding skills | Primary | Simple interface, no code exposure, quick results |
| **Designers** | UI/UX designers who want to prototype or export production code | Primary | Visual control, design fidelity, clean export |
| **Developers** | Frontend/fullstack developers seeking productivity gains | Primary | Fast iteration, quality output, customization |

### User Personas

**Persona 1: Maya the Marketer**
- Needs landing pages for campaigns
- No coding skills, limited budget for developers
- Wants to go from idea to live page in hours, not weeks

**Persona 2: Alex the Designer**
- Creates UI mockups in Figma
- Wants to quickly prototype interactive versions
- Needs clean HTML/CSS for developer handoff

**Persona 3: Sam the Startup Developer**
- Building MVPs quickly
- Needs to scaffold UIs fast and iterate
- Values clean, maintainable output

---

## 5. Core Value Proposition

### Key Differentiator: Real-Time Visual Editing

Unlike v0, Bolt, Lovable, or Shayna AI which output code that must be manually edited, **Zest provides a true WYSIWYG editor** where users can:

1. **Generate** — Describe your UI in natural language
2. **Edit** — Visually modify the AI-generated interface (drag, resize, restyle)
3. **Refine** — Use chat to iterate on specific elements
4. **Export** — Download clean HTML/CSS or Tailwind code

### Why This Matters
The visual editor bridges the gap between "AI-generated" and "production-ready." Users stay in a familiar design environment rather than being forced into code.

---

## 6. Key Features (High-Level)

| Feature | Description |
|---------|-------------|
| **Prompt-to-UI Generation** | Natural language input produces working interfaces |
| **Real-time Visual Editor** | WYSIWYG editing of AI-generated output |
| **Instant HTML Export** | Clean HTML/CSS and Tailwind CSS output |
| **Iterative Refinement** | Chat-based iteration on specific elements |
| **Component Library** | Pre-built, customizable UI components |
| **Responsive Preview** | See how designs look on different devices |

---

## 7. Output Formats

| Format | Description | Use Case |
|--------|-------------|----------|
| **Plain HTML5/CSS3** | Semantic, accessible HTML with external or inline CSS | Universal compatibility, static sites |
| **Tailwind CSS** | HTML with Tailwind utility classes | Modern development workflows |

### Output Quality Standards
- Semantic HTML structure
- Accessible (WCAG 2.1 AA compliance target)
- Responsive by default
- Clean, readable code (not minified)
- No framework lock-in

---

## 8. Success Metrics

| Metric | Target | Measurement Method | Rationale |
|--------|--------|-------------------|-----------|
| **Monthly Active Users (MAU)** | 10,000+ at beta | Analytics dashboard | User adoption indicator |
| **Conversion Rate** | >5% free to paid | Billing system | Business viability |
| **User Satisfaction (NPS)** | >50 | In-app surveys | Product-market fit |
| **Time-to-First-UI** | <5 minutes | User session tracking | Onboarding success |
| **Export Rate** | >30% of sessions | Feature analytics | Value delivery |

---

## 9. Deployment Model

| Aspect | Decision |
|--------|----------|
| **Hosting** | Cloud SaaS only |
| **Pricing** | Subscription-based (freemium model likely) |
| **Self-hosted** | Not planned for initial release |

---

## 10. Timeline & Team

| Milestone | Target Date | Description |
|-----------|-------------|-------------|
| **Alpha** | Month 2 | Internal testing, core prompt-to-UI flow |
| **Beta** | Month 3-6 | Public beta with visual editor, export |
| **GA** | Month 6-9 | Production release with monetization |

**Team Size:** 4-8 developers (medium)

---

## 11. Constraints & Assumptions

### Technical Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| **AI API Dependency** | Reliability depends on external LLM providers | Multi-provider support, fallbacks |
| **Output Quality Standards** | Generated HTML must be semantic, accessible, performant | Validation layer, post-processing |
| **Browser Compatibility** | Must support Chrome, Safari, Firefox, Edge | Cross-browser testing, progressive enhancement |

### Business Constraints

| Constraint | Impact | Mitigation |
|------------|--------|------------|
| **GDPR/Privacy Compliance** | User data handling must comply with regulations | Privacy-by-design, data minimization |
| **AI Cost Management** | LLM API costs scale with usage | Caching, prompt optimization, tiered pricing |

### Assumptions
- Users prefer visual editing over code editing
- AI models will continue to improve in quality
- Market for AI-powered design tools is growing

---

## 12. Competitive Landscape

| Competitor | What They Do | Zest Differentiator |
|------------|--------------|---------------------|
| **Lovable.dev** | AI web app builder (formerly GPT Engineer) | Zest offers true WYSIWYG visual editing, not just code output |
| **Shayna AI** | AI UI generator | Zest provides deeper customization without leaving the visual editor |
| **v0.dev** | Vercel's AI UI generator | Zest focuses on visual editing, not code-first workflow |
| **Bolt.new** | AI full-stack builder | Zest specializes in UI with better visual editing UX |
| **Framer** | Visual web builder with AI | Zest is prompt-first with stronger AI generation |
| **Webflow** | No-code website builder | Zest adds AI generation to reduce manual design work |

---

## 13. Open Architectural Considerations

The following decisions are deferred to the **Tech Stack Definition** phase:

| Decision | Options Under Consideration |
|----------|---------------------------|
| **AI Orchestration** | n8n workflow automation, LiteLLM, Portkey, direct API calls |
| **Primary LLM Provider** | OpenAI GPT-4, Anthropic Claude, Google Gemini |
| **Frontend Framework** | React, Vue, Svelte, vanilla JS |
| **Visual Editor Approach** | Custom canvas, existing library (Fabric.js, Konva), iframe-based |

---

## 14. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | AI Assistant | Initial version |

---

*This Product Brief serves as the foundational "why" document for Zest. All subsequent specifications (PRD, FSD, Tech Stack) should align with the vision and constraints defined here.*
