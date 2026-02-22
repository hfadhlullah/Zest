# ZEST-025: UpgradeWall Component & Usage Indicator

**Epic:** ZEST-F07 (Freemium Usage Limits & Upgrade)
**Layer:** L4-feature-ui
**Role:** Frontend
**Estimation:** 3
**Priority:** Must

---

## Objective

Build the `UpgradeWall` modal overlay shown when a user hits their generation limit, and the persistent `UsageIndicator` toolbar badge for free users. The `UpgradeWall` presents a clear upgrade CTA and plan comparison. The `UsageIndicator` shows remaining generations with color-coded urgency states.

## Technical Specifications

- **Proposed Files:**
  - `src/components/freemium/UpgradeWall.tsx` — full-screen modal overlay shown on `429/403` from generation API
  - `src/components/freemium/UsageIndicator.tsx` — toolbar badge for authenticated free users
  - `src/components/freemium/PlanComparisonTable.tsx` — simple free vs paid feature comparison inside UpgradeWall
  - `src/hooks/useUsage.ts` — SWR hook: `GET /api/v1/users/me/usage`; returns `{ usage, isLoading }`
  - `src/store/ui-store.ts` (update) — add `isUpgradeWallOpen: boolean`, `upgradeWallTrigger: string`
- **Functions/Classes:**
  - `UpgradeWall` — opens as modal on `isUpgradeWallOpen`; shows plan name, limit message, `PlanComparisonTable`, "Upgrade" CTA (→ `/upgrade`), "Maybe later" dismiss; fires `upgrade_prompt_shown` on open and `upgrade_clicked` on CTA
  - `UsageIndicator` — calls `useUsage()`; renders `"{count} / {limit} generations"` badge; `text-amber-500` at ≥80%, `text-red-500` at 100%; hidden for paid users and anonymous
  - Generation API error handler (in `useGeneration` hook from ZEST-004) — on `429` or `403 PLAN_LIMIT_EXCEEDED`, dispatch `openUpgradeWall(trigger)` to store
- **API Endpoints consumed:** `GET /api/v1/users/me/usage`
- **Data Models:** none

## Acceptance Criteria (Technical)

- [ ] `UpgradeWall` modal opens automatically when generation returns `429` or `403 PLAN_LIMIT_EXCEEDED`
- [ ] `UpgradeWall` shows correct messaging for anonymous (sign-up CTA) vs free user (upgrade CTA)
- [ ] "Upgrade" button navigates to `/upgrade`; fires `upgrade_clicked` analytics event
- [ ] "Maybe later" dismisses the modal; does NOT allow another generation attempt
- [ ] `UsageIndicator` shows "X / 20 generations used this month" for free users
- [ ] `UsageIndicator` turns amber at ≥80% usage (16+ of 20)
- [ ] `UsageIndicator` turns red at 100% usage (20 of 20)
- [ ] `UsageIndicator` not rendered for paid users or anonymous users
- [ ] `upgrade_prompt_shown` event fires with correct `trigger`, `plan`, `usage_count` props
- [ ] `UpgradeWall` is fully keyboard-accessible (focus trap, ESC dismisses)
- [ ] Unit tests: `UsageIndicator` color states, `UpgradeWall` renders correct variant (anonymous vs free)

## Business Rules & Logic

- Anonymous users over limit see sign-up prompt (not paid upgrade)
- Free users over limit see paid upgrade prompt
- Dismissing UpgradeWall does not allow further generation attempts in the same session

## Dependencies

- Depends on: ZEST-024 (quota API route — `GET /api/v1/users/me/usage`)
- Depends on: ZEST-006 (`useGeneration` hook — error handling extended to fire UpgradeWall)
- Depends on: ZEST-008 (editor toolbar — `UsageIndicator` placed here)
- Depends on: ZEST-018 (auth — determines anonymous vs free rendering)

## Definition of Done

- [ ] Code implemented
- [ ] Storybook stories: `UpgradeWall` (anonymous, free), `UsageIndicator` (normal, amber, red)
- [ ] Unit tests: UpgradeWall variant logic, UsageIndicator color states
- [ ] Lint/Type check clear
