# ZEST-001: Project Scaffold & Infrastructure Setup

**Epic:** ZEST-F01 (Prompt-to-UI Generation)
**Layer:** L1-data
**Role:** Fullstack / DevOps
**Estimation:** 5
**Priority:** Must

---

## Objective

Initialize the Zest monorepo with Next.js 14 (App Router, TypeScript), Tailwind CSS, shadcn/ui, Prisma ORM, Clerk auth, and Docker Compose for local development. Establish the foundational project structure all subsequent stories build on.

## Technical Specifications

- **Proposed Files:**
  - `package.json`, `tsconfig.json`, `next.config.ts`
  - `tailwind.config.ts`, `postcss.config.js`
  - `prisma/schema.prisma` (initial — User, Project, Generation, Export, ModerationLog)
  - `prisma/migrations/` (initial migration)
  - `docker-compose.yml` (PostgreSQL, Redis, Next.js, Go service)
  - `.env.example`
  - `src/app/layout.tsx`, `src/app/page.tsx` (skeleton only)
  - `src/lib/prisma.ts` (Prisma client singleton)
  - `src/lib/redis.ts` (Redis client singleton)
  - `src/middleware.ts` (Clerk middleware — public/protected route config)
- **Functions/Classes:** `prisma` (singleton), `redis` (singleton)
- **Data Models:** All 5 core entities per `docs/erd/core-erd.md`

## Acceptance Criteria (Technical)

- [ ] `npm run dev` starts without errors
- [ ] `npx prisma migrate dev` applies the initial migration cleanly
- [ ] `docker-compose up` brings up PostgreSQL (5432), Redis (6379), and app (3000)
- [ ] Clerk middleware correctly protects `/dashboard` routes; allows `/` unauthenticated
- [ ] `prisma/schema.prisma` matches all entities and relationships in `docs/erd/core-erd.md`
- [ ] TypeScript strict mode enabled; `npm run type-check` passes
- [ ] `.env.example` documents all required environment variables

## Business Rules & Logic

- All 5 core entities must be defined in the initial migration
- Clerk middleware must use `clerkMiddleware()` pattern (not deprecated `withClerkMiddleware`)
- Redis client must use `ioredis` with connection pooling

## Dependencies

- No upstream dependencies (this is the foundation)

## Definition of Done

- [ ] Code implemented
- [ ] `npm run dev` and `docker-compose up` verified working
- [ ] Lint/Type check clear
- [ ] `.env.example` committed (no real secrets)
