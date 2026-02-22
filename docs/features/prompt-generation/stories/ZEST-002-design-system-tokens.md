# ZEST-002: Design System Tokens & Base UI Setup

**Epic:** ZEST-F01 (Prompt-to-UI Generation)
**Layer:** L2-ui-foundation
**Role:** Frontend
**Estimation:** 3
**Priority:** Must

---

## Objective

Implement the Zest "Electric Growth" design system tokens as CSS custom properties and Tailwind config extensions. Set up Fontshare/Google Fonts imports, configure shadcn/ui, and establish the base `layout.tsx` with dark mode toggle support.

## Technical Specifications

- **Proposed Files:**
  - `src/app/globals.css` (CSS custom properties for all tokens from `docs/design-system.yaml`)
  - `tailwind.config.ts` (extend with brand colors, font families, radius, spacing, shadows)
  - `src/app/layout.tsx` (font imports, `<html>` with `className` for dark mode)
  - `src/components/ui/` (shadcn/ui base components: Button, Input, Badge, Card — generated via shadcn CLI)
  - `src/lib/fonts.ts` (Next.js `localFont` / `@next/font` configuration for Clash Display, Cabinet Grotesk, JetBrains Mono)
- **Functions/Classes:** N/A (tokens/config only)
- **API Endpoints:** N/A

## Acceptance Criteria (Technical)

- [ ] All color tokens from `docs/design-system.yaml` are available as CSS variables (`--color-brand-primary`, etc.)
- [ ] Dark mode toggle via `.dark` class on `<html>` switches all neutral/surface tokens
- [ ] Tailwind config extends with `colors.brand`, `fontFamily`, `borderRadius`, `boxShadow` matching design system
- [ ] `Button`, `Input`, `Card`, `Badge` shadcn components are installed and accessible from `src/components/ui/`
- [ ] Clash Display and Cabinet Grotesk fonts load from Fontshare CDN; JetBrains Mono from Google Fonts
- [ ] `npm run build` passes with no CSS errors

## Business Rules & Logic

- Direct hex values in component code are prohibited — always reference CSS variables
- Light mode is default; dark mode toggled via class strategy

## Dependencies

- Depends on: ZEST-001

## Definition of Done

- [ ] Code implemented
- [ ] Visual spot-check: green primary color, correct fonts, rounded corners visible
- [ ] Lint/Type check clear
