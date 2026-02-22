# Tech Stack & Architecture Decisions: Zest

> **Document Status:** Approved  
> **Last Updated:** February 22, 2026  
> **Version:** 1.0

---

## 1. Overview

| Field | Value |
|-------|-------|
| **Project** | Zest — AI-powered UI Builder |
| **Application Type** | Web Application (SaaS) |
| **Deployment** | Self-hosted, container-based |
| **Team Expertise** | JavaScript/TypeScript, Go |
| **Key Constraints** | Self-hosted infra, GDPR compliance, multi-LLM support |

### Technology Selection Drivers

| Driver | Impact on Decisions |
|--------|-------------------|
| Team expertise (JS/TS + Go) | Next.js frontend, Go for AI processing |
| Self-hosted containers | Docker-first architecture, no vendor-locked services |
| Multi-LLM strategy | Provider-agnostic abstraction layer in Go |
| Fast time-to-beta | Managed auth (Clerk), pre-built UI components (shadcn/ui) |
| GDPR compliance | Self-hosted DB and services, data minimization |

---

## 2. Architecture Style

### Pattern: Modular Monolith with a Go AI Service

**Chosen:** Modular Monolith (Next.js) + Dedicated Go AI Microservice

**Justification:**

| Factor | Decision |
|--------|----------|
| Team size (4-8) | Too small for full microservices; modular monolith reduces operational overhead |
| AI workload | Go service isolates CPU-intensive AI orchestration from the web layer |
| Startup speed | Next.js API routes remove need for a separate REST layer initially |
| Scalability path | Go service can be scaled independently as AI usage grows |

The Go AI service is the one justified microservice boundary at MVP — everything else lives in Next.js.

---

## 3. Technology Decisions

### 3.1 Frontend

| Layer | Choice | Alternatives Considered | Why This Choice |
|-------|--------|------------------------|-----------------|
| Framework | **Next.js 14+ (App Router)** | Remix, SvelteKit, Vite+React | Team expertise, SSR for SEO, API routes reduce infra, largest ecosystem |
| Language | **TypeScript** | JavaScript | Type safety critical for visual editor complexity |
| Styling | **Tailwind CSS** | CSS Modules, Styled Components, Emotion | Utility-first fits dynamic/generative UI patterns; pairs well with shadcn/ui |
| Component Library | **shadcn/ui** | Material UI, Chakra UI, Radix UI | Accessible, unstyled by default, copy-paste model avoids dependency lock-in |
| State Management | **Zustand** | Redux, Jotai, React Context | Lightweight, simple API, excellent for editor state complexity |
| Visual Editor | **Custom React-based** | Craft.js, Fabric.js, Konva.js | Full control over UX; no canvas abstraction needed for DOM-based editing |

### 3.2 Backend

| Layer | Choice | Alternatives Considered | Why This Choice |
|-------|--------|------------------------|-----------------|
| Web Layer | **Next.js API Routes** | Express, Fastify, Hono | Colocation with frontend, eliminates separate Node service for CRUD/auth |
| AI Engine | **Go (net/http or Fiber)** | Node.js, Python FastAPI | Go's concurrency handles parallel LLM calls efficiently; team has expertise |
| ORM | **Prisma** | Drizzle, TypeORM, raw SQL | Best-in-class DX with TypeScript, migrations, type-safe queries |
| Validation | **Zod** | Joi, Yup | TypeScript-native schema validation, pairs with Prisma and Next.js |

### 3.3 Database

| Layer | Choice | Alternatives Considered | Why This Choice |
|-------|--------|------------------------|-----------------|
| Primary Database | **PostgreSQL** | MySQL, MongoDB, SQLite | Relational model fits users/projects/generations; ACID compliance; self-hostable |
| Cache / Sessions | **Redis** | Memcached, Upstash | Rate limiting, session caching, generation queue management |
| Search (future) | Defer | Elasticsearch, pgvector | Not needed for MVP; pgvector available in Postgres when needed |

### 3.4 Authentication

| Layer | Choice | Alternatives Considered | Why This Choice |
|-------|--------|------------------------|-----------------|
| Auth Provider | **Clerk** | Supabase Auth, Lucia, Auth0, Custom | Excellent Next.js/App Router integration; free tier sufficient for beta; minimal setup |
| Strategy | **JWT + Sessions** | Managed by Clerk | Clerk handles token issuance; Next.js middleware verifies on edge |
| OAuth Providers | **Google + GitHub** | Email-only | Cover 90%+ of target users (developers, designers, tech-savvy non-devs) |

### 3.5 AI / LLM Integration

| Layer | Choice | Alternatives Considered | Why This Choice |
|-------|--------|------------------------|-----------------|
| Orchestration | **Direct API calls (Go service)** | n8n, LiteLLM, LangChain, Portkey | Lowest latency; full control; team-owned abstraction layer |
| Primary Provider | **Multi-provider strategy** | Single provider | Risk mitigation, cost optimization, feature diversity |
| Provider 1 | **GLM API** (Zhipu AI) | — | Cost-effective, strong code generation |
| Provider 2 | **Google Gemini** | — | Strong vision + code capabilities, competitive pricing |
| Provider 3 | **GitHub Copilot API** | — | Team familiarity, code-specific strengths |
| Prompt Management | **Versioned prompt templates in Go** | External service | Keep prompts close to code; version with codebase |
| Fallback Strategy | **Round-robin with error fallback** | — | If primary provider fails, auto-route to next available |

### 3.6 Hosting & Infrastructure

| Layer | Choice | Alternatives Considered | Why This Choice |
|-------|--------|------------------------|-----------------|
| Containerization | **Docker + Docker Compose** | Kubernetes, bare metal | Team self-hosted infra; Compose sufficient for MVP scale |
| Deployment | **Self-hosted (own server/cloud)** | Vercel, Railway, Render | Cost control, GDPR data sovereignty, team preference |
| Reverse Proxy | **Nginx** | Caddy, Traefik | Reliable, well-documented, team familiarity |
| TLS/HTTPS | **Let's Encrypt (Certbot)** | Paid certs | Free, automated renewal |
| Storage | **Local filesystem → S3-compatible** | Cloudinary, Supabase Storage | Start local, migrate to MinIO or Cloudflare R2 when needed |
| CDN | **Defer** | Cloudflare, Fastly | Not needed at MVP scale; add when traffic warrants |

### 3.7 DevOps & Observability

| Layer | Choice | Alternatives Considered | Why This Choice |
|-------|--------|------------------------|-----------------|
| CI/CD | **Manual for MVP → GitHub Actions** | GitLab CI, Jenkins | Simple shell scripts for MVP; automate in beta phase |
| Logging | **Structured JSON logs (stdout)** | Datadog, Sentry (defer) | Portable; can pipe to any aggregator later |
| Error Tracking | **Defer (add in beta)** | Sentry, Rollbar | Not critical for MVP; add before public launch |
| Monitoring | **Defer (add in beta)** | Prometheus + Grafana, Datadog | Add when traffic requires it |
| Package Manager | **pnpm** | npm, yarn, bun | Faster installs, better monorepo support |

---

## 4. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           BROWSER                                   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     NEXT.JS APP                             │   │
│  │                                                             │   │
│  │  ┌───────────────┐  ┌─────────────┐  ┌──────────────────┐  │   │
│  │  │  React Pages  │  │  Visual     │  │  Chat / Prompt   │  │   │
│  │  │  & Layouts    │  │  Editor     │  │  Interface       │  │   │
│  │  └───────────────┘  └─────────────┘  └──────────────────┘  │   │
│  │           ↑ Zustand State Management ↑                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         NGINX (Reverse Proxy)                       │
└───────────┬─────────────────────────────────────┬───────────────────┘
            │                                     │
            ▼                                     ▼
┌───────────────────────┐             ┌───────────────────────────────┐
│   NEXT.JS SERVER      │             │      GO AI SERVICE            │
│                       │             │                               │
│  ┌─────────────────┐  │             │  ┌─────────────────────────┐  │
│  │  API Routes     │  │   HTTP RPC  │  │  Prompt Engine          │  │
│  │  /api/auth      │◄─┼─────────────┼─►│  Model Router           │  │
│  │  /api/projects  │  │             │  │  Response Parser        │  │
│  │  /api/export    │  │             │  │  Rate Limiter           │  │
│  └────────┬────────┘  │             │  └────────────┬────────────┘  │
│           │           │             │               │               │
│      Clerk Auth       │             │  ┌────────────▼────────────┐  │
│           │           │             │  │   Multi-LLM Clients    │  │
└───────────┼───────────┘             │  │                         │  │
            │                         │  │  GLM │ Gemini │ Copilot │  │
            │                         │  └─────────────────────────┘  │
            │                         └───────────────────────────────┘
            │
   ┌────────┴────────┐
   │                 │
   ▼                 ▼
┌──────────┐    ┌──────────┐
│PostgreSQL│    │  Redis   │
│          │    │          │
│ users    │    │ sessions │
│ projects │    │ rate lim │
│ exports  │    │ gen cache│
└──────────┘    └──────────┘
```

---

## 5. Key Architecture Decision Records (ADRs)

### ADR-01: Go for AI Engine Instead of Node.js

**Decision:** Use a Go microservice for all LLM API communication and AI orchestration.

**Context:** The team has both JS/TS and Go expertise. The AI engine needs to handle concurrent requests to multiple LLM providers efficiently.

**Consequences:**
- ✅ Goroutines provide efficient concurrency for parallel LLM calls
- ✅ Low memory footprint; good for long-running server processes
- ✅ Isolates AI logic from web layer — can scale independently
- ❌ Adds one additional service to deploy and maintain
- ❌ Requires HTTP interface between Next.js and Go

---

### ADR-02: Direct API Calls Instead of n8n or LangChain

**Decision:** Build a lightweight multi-provider abstraction directly in Go instead of using an external orchestration tool.

**Context:** n8n is a powerful workflow automation tool. However, for Zest's primary use case (low-latency prompt-to-UI), the overhead of routing through an external workflow engine adds latency and operational complexity.

**Consequences:**
- ✅ Lowest possible latency for generation requests
- ✅ Full control over fallback logic and provider routing
- ✅ No additional infrastructure service to self-host
- ❌ Team must implement retry/fallback logic manually
- ❌ Less visual debugging than n8n provides
- 📝 **Revisit at scale:** n8n may be valuable for async workflows (batch generation, notifications) post-MVP

---

### ADR-03: Custom Visual Editor Over Craft.js/Fabric.js

**Decision:** Build a custom React-based visual editor rather than adopting Craft.js or Fabric.js.

**Context:** The visual editor is Zest's core differentiator. Adopting a third-party editor framework introduces abstraction layers that may limit UX control.

**Consequences:**
- ✅ Full control over editing UX and performance
- ✅ No dependency on a library's release cycle or limitations
- ✅ Can be purpose-built for HTML/CSS editing (not generic canvas)
- ❌ Higher initial development effort
- ❌ Must build undo/redo, selection, drag-and-drop from scratch
- 📝 Use `@dnd-kit` for drag-and-drop primitives; build selection and properties panel custom

---

### ADR-04: Clerk for Authentication

**Decision:** Use Clerk instead of building custom auth or using Supabase Auth.

**Context:** Auth is not a differentiator for Zest. Time-to-beta is constrained (3-6 months).

**Consequences:**
- ✅ Zero auth infrastructure to manage
- ✅ Excellent Next.js App Router integration (middleware, server components)
- ✅ Built-in OAuth, MFA, user management UI
- ❌ Vendor dependency for auth (mitigated: data stays in Postgres)
- ❌ Cost scales with users (free tier: 10K MAU — sufficient for beta)

---

### ADR-05: Multi-Provider LLM Strategy

**Decision:** Support GLM, Gemini, and GitHub Copilot as LLM backends with round-robin + error fallback.

**Context:** Relying on a single LLM provider creates risk (outages, pricing changes, rate limits). Team has access to GLM, Gemini, and GitHub Copilot.

**Consequences:**
- ✅ No single provider outage can take down Zest
- ✅ Cost optimization through provider selection per task type
- ✅ Can A/B test output quality across providers
- ❌ Need to maintain prompt compatibility across providers
- ❌ Response format normalization required in Go service

---

## 6. Development Environment

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20 LTS+ | Next.js runtime |
| pnpm | 8+ | Package manager |
| Go | 1.22+ | AI service |
| Docker | 24+ | Local services (Postgres, Redis) |
| Docker Compose | 2.x | Local environment orchestration |

### Local Environment Setup (Overview)

```bash
# 1. Clone repository
git clone <repo-url> && cd zest

# 2. Install frontend dependencies
pnpm install

# 3. Start local services
docker compose up -d  # Starts Postgres + Redis

# 4. Set up database
pnpm prisma migrate dev

# 5. Start Go AI service
cd services/ai && go run main.go

# 6. Start Next.js
pnpm dev
```

### Environment Variables (Outline)

```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/zest

# Redis
REDIS_URL=redis://localhost:6379

# AI Service (internal)
AI_SERVICE_URL=http://localhost:8080

# LLM Providers (in Go service)
GLM_API_KEY=
GEMINI_API_KEY=
GITHUB_COPILOT_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 7. Deferred Decisions

| Decision | Deferred Until | Options |
|----------|---------------|---------|
| Production hosting target | Pre-beta | Own VPS, Hetzner, DigitalOcean |
| CDN provider | When traffic warrants | Cloudflare, Bunny.net |
| Error tracking | Pre-public launch | Sentry, self-hosted GlitchTip |
| Monitoring stack | Pre-public launch | Prometheus + Grafana, Signoz |
| CI/CD automation | Beta phase | GitHub Actions |
| Storage (exports, assets) | When local fills | MinIO, Cloudflare R2 |

---

## 8. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | AI Assistant | Initial version |

---

*All downstream documents (FSD, ERD, API Contracts, Stories) should reference this Tech Stack when making implementation decisions.*
