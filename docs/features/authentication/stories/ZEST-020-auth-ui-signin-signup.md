# ZEST-020: Auth UI — Sign In / Sign Up Pages

**Epic:** ZEST-F05 (Authentication & User Accounts)
**Layer:** L4-feature-ui
**Role:** Frontend
**Estimation:** 2
**Priority:** Must

---

## Objective

Implement the `/sign-in` and `/sign-up` pages using Clerk's `<SignIn>` and `<SignUp>` prebuilt components, styled to match the "Electric Growth" design system. Add a persistent "Sign In" CTA to the editor toolbar for anonymous users. After authentication, redirect new users to the dashboard; preserve mid-flow state (current generation) via `localStorage` for session migration.

## Technical Specifications

- **Proposed Files:**
  - `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` — renders `<SignIn>` component centered on page
  - `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` — renders `<SignUp>` component centered on page
  - `src/app/(auth)/layout.tsx` — shared auth layout: centered card, Zest logo, Electric Growth background
  - `src/components/auth/AuthButton.tsx` — toolbar button: shows "Sign In" for anonymous, `<UserButton>` for authenticated
  - `src/components/auth/SignInPrompt.tsx` — inline nudge (used in save/export gating): "Save your work — Sign in free"
- **Functions/Classes:**
  - `AuthButton` — uses `useAuth()` to determine state; renders Clerk `<UserButton>` or a styled "Sign In" link to `/sign-in?redirect_url={current_url}`
  - `SignInPrompt` — compact banner with Google and GitHub OAuth quick-sign-in buttons for mid-flow auth
- **API Endpoints:** none (Clerk handles auth round-trip)
- **Data Models:** none

## Acceptance Criteria (Technical)

- [ ] `/sign-in` page renders Clerk `<SignIn>` with appearance customization (Electric Growth tokens: `#22C55E` primary, Clash Display font)
- [ ] `/sign-up` page renders Clerk `<SignUp>` with same appearance customization
- [ ] OAuth buttons for Google and GitHub present on both pages
- [ ] After sign-in, user redirected to `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` (`/dashboard`)
- [ ] `AuthButton` in editor toolbar shows "Sign In" for anonymous; shows Clerk `<UserButton>` avatar for authenticated
- [ ] Clerk appearance `variables` and `elements` override applied (brand color, font, border-radius matching design tokens)
- [ ] `SignInPrompt` component renders correctly in export and save gating contexts
- [ ] Pages are responsive (mobile + desktop)
- [ ] Unit test: `AuthButton` renders correct variant for authenticated vs anonymous state

## Business Rules & Logic

- Anonymous users are never forced to sign in; sign-in is always optional/gated (US-15)
- `redirect_url` param on sign-in link returns user to previous page after auth

## Dependencies

- Depends on: ZEST-018 (Clerk installed and `<ClerkProvider>` in root layout)
- Depends on: ZEST-008 (editor toolbar shell where `AuthButton` is placed)
- Depends on: ZEST-002 (design tokens available for Clerk appearance override)

## Definition of Done

- [ ] Code implemented
- [ ] Storybook story: `AuthButton` (anonymous + authenticated states)
- [ ] Unit test: `AuthButton` conditional rendering
- [ ] Manual test: full sign-up → redirect → dashboard flow
- [ ] Lint/Type check clear
