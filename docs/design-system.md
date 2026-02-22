# Design System: Zest — "Electric Growth"

> **Document Status:** Approved  
> **Last Updated:** February 22, 2026  
> **Version:** 1.0  
> **Framework:** React + TypeScript + Tailwind CSS + shadcn/ui  
> **Accessibility Target:** WCAG 2.1 AA

---

## Design Direction

**Theme:** Electric Growth  
**Personality:** Bold, alive, creative-tool confidence  
**Vibe:** An AI that grows your ideas — lush electric green, expressive editorial type, theatrical transitions that feel generative and alive.

| Dimension | Decision |
|-----------|----------|
| Color | Electric green primary on warm white; deep ink for text |
| Typography | Clash Display (headings) + Cabinet Grotesk (body) + JetBrains Mono (code) |
| Shape | Highly rounded (10–20px) — approachable, modern |
| Motion | Theatrical: spring-based, staggered reveals, orchestrated page transitions |
| Surfaces | Layered whites with green-tinted subtle gradients; no flat defaults |
| Dark Mode | Light-first; dark toggle preserves all tokens via CSS variables |

---

# Design Tokens

## Colors

### Brand

| Token | Value | Usage |
|-------|-------|-------|
| `color-brand-primary` | `#22C55E` | Primary actions, CTAs, active states |
| `color-brand-primary-hover` | `#16A34A` | Hover state for primary elements |
| `color-brand-primary-light` | `#DCFCE7` | Tinted backgrounds, selected states |
| `color-brand-primary-glow` | `rgba(34,197,94,0.25)` | Glow on focus rings, primary shadows |
| `color-brand-secondary` | `#14532D` | Deep green for dark accents, headings |
| `color-brand-accent` | `#86EFAC` | Subtle highlights, chip backgrounds |

### Neutral

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `color-neutral-0` | `#FFFFFF` | `#0A0A0A` | Pure white / pure black |
| `color-neutral-50` | `#F9FAFB` | `#111111` | Page background |
| `color-neutral-100` | `#F3F4F6` | `#1A1A1A` | Card / section background |
| `color-neutral-200` | `#E5E7EB` | `#2A2A2A` | Subtle borders, dividers |
| `color-neutral-300` | `#D1D5DB` | `#3A3A3A` | Disabled elements |
| `color-neutral-400` | `#9CA3AF` | `#6B7280` | Placeholder text |
| `color-neutral-500` | `#6B7280` | `#9CA3AF` | Secondary text |
| `color-neutral-600` | `#4B5563` | `#D1D5DB` | Body text |
| `color-neutral-700` | `#374151` | `#E5E7EB` | Strong body text |
| `color-neutral-800` | `#1F2937` | `#F3F4F6` | Headings |
| `color-neutral-900` | `#111827` | `#F9FAFB` | Primary text (darkest) |

### Semantic / Status

| Token | Value | Usage |
|-------|-------|-------|
| `color-success` | `#22C55E` | Success states, confirmations (shared with brand) |
| `color-success-light` | `#DCFCE7` | Success backgrounds |
| `color-warning` | `#F59E0B` | Warning states, caution |
| `color-warning-light` | `#FEF3C7` | Warning backgrounds |
| `color-error` | `#EF4444` | Error states, destructive actions |
| `color-error-light` | `#FEE2E2` | Error backgrounds |
| `color-info` | `#3B82F6` | Informational states |
| `color-info-light` | `#DBEAFE` | Info backgrounds |

### Surface & Background

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `color-bg-primary` | `#FFFFFF` | `#0A0A0A` | Main page background |
| `color-bg-secondary` | `#F9FAFB` | `#111111` | Card, panel backgrounds |
| `color-bg-tertiary` | `#F3F4F6` | `#1A1A1A` | Nested section backgrounds |
| `color-bg-overlay` | `rgba(0,0,0,0.4)` | `rgba(0,0,0,0.6)` | Modal / dialog backdrops |
| `color-bg-brand-subtle` | `#F0FDF4` | `#052E16` | Brand-tinted section backgrounds |

---

## Typography

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `font-family-heading` | `'Clash Display', 'Cabinet Grotesk', sans-serif` | All headings (h1–h4) |
| `font-family-body` | `'Cabinet Grotesk', 'DM Sans', sans-serif` | Body text, UI labels, paragraphs |
| `font-family-mono` | `'JetBrains Mono', 'Fira Code', monospace` | Code blocks, prompt output, exported code |

**CDN Import (Google Fonts / Fontshare):**
```css
/* Fontshare */
@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=cabinet-grotesk@400,500,700&display=swap');
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
```

### Font Sizes

| Token | px | rem | Usage |
|-------|-----|-----|-------|
| `font-size-xs` | 12px | 0.75rem | Captions, fine print, timestamps |
| `font-size-sm` | 14px | 0.875rem | Secondary text, labels, helper text |
| `font-size-base` | 16px | 1rem | Body text, default UI |
| `font-size-lg` | 18px | 1.125rem | Large body, subheadings |
| `font-size-xl` | 20px | 1.25rem | Section headings |
| `font-size-2xl` | 24px | 1.5rem | Page headings |
| `font-size-3xl` | 32px | 2rem | Hero subheadings |
| `font-size-4xl` | 40px | 2.5rem | Hero headings |
| `font-size-5xl` | 56px | 3.5rem | Display / landing hero |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `font-weight-regular` | 400 | Body text, secondary content |
| `font-weight-medium` | 500 | Labels, emphasis, UI controls |
| `font-weight-semibold` | 600 | Subheadings, strong labels |
| `font-weight-bold` | 700 | Headings, CTAs, brand moments |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `line-height-none` | 1 | Single-line display text |
| `line-height-tight` | 1.2 | Headings, display text |
| `line-height-snug` | 1.375 | Subheadings |
| `line-height-normal` | 1.5 | Body text |
| `line-height-relaxed` | 1.625 | Long-form content |
| `line-height-loose` | 2 | Spacious UI labels |

### Letter Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `tracking-tight` | `-0.025em` | Large display headings |
| `tracking-normal` | `0` | Body text |
| `tracking-wide` | `0.05em` | Uppercase labels, badges |
| `tracking-widest` | `0.15em` | All-caps UI elements |

---

## Spacing

| Token | px | rem | Usage |
|-------|----|-----|-------|
| `spacing-0` | 0 | 0 | — |
| `spacing-1` | 4px | 0.25rem | Micro gaps, icon spacing |
| `spacing-2` | 8px | 0.5rem | Tight element gaps |
| `spacing-3` | 12px | 0.75rem | Compact padding |
| `spacing-4` | 16px | 1rem | Default padding/gap |
| `spacing-5` | 20px | 1.25rem | Medium padding |
| `spacing-6` | 24px | 1.5rem | Section internal padding |
| `spacing-8` | 32px | 2rem | Large section gaps |
| `spacing-10` | 40px | 2.5rem | Page-level spacing |
| `spacing-12` | 48px | 3rem | Hero / banner padding |
| `spacing-16` | 64px | 4rem | Major section dividers |
| `spacing-20` | 80px | 5rem | Page section padding |
| `spacing-24` | 96px | 6rem | Hero vertical rhythm |

---

## Borders

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-none` | 0 | No rounding (rarely used) |
| `radius-sm` | 6px | Small inputs, chips |
| `radius-md` | 10px | Buttons, inputs, form elements |
| `radius-lg` | 16px | Cards, panels |
| `radius-xl` | 20px | Modals, large cards |
| `radius-2xl` | 28px | Feature highlight sections |
| `radius-full` | 9999px | Pills, avatars, toggle knobs |

### Border Widths

| Token | Value | Usage |
|-------|-------|-------|
| `border-width-thin` | 1px | Default borders, dividers |
| `border-width-medium` | 2px | Focus rings, emphasis |
| `border-width-thick` | 3px | Active tab indicators |

### Border Colors

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `border-color-default` | `#E5E7EB` | `#2A2A2A` | Default borders |
| `border-color-strong` | `#D1D5DB` | `#3A3A3A` | Emphasized borders |
| `border-color-focus` | `#22C55E` | `#22C55E` | Focus ring (always green) |
| `border-color-error` | `#EF4444` | `#EF4444` | Error state |
| `border-color-brand` | `#86EFAC` | `#16A34A` | Brand highlight borders |

---

## Shadows / Elevation

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift — small buttons |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)` | Inputs, default cards |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` | Elevated cards, dropdowns |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.05)` | Modals, drawers |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.10), 0 10px 10px rgba(0,0,0,0.04)` | Floating panels |
| `shadow-brand` | `0 0 0 3px rgba(34,197,94,0.25)` | Focus ring / primary CTA glow |
| `shadow-brand-lg` | `0 8px 24px rgba(34,197,94,0.30)` | Primary button hover glow |

---

## Motion

### Duration

| Token | Value | Usage |
|-------|-------|-------|
| `duration-instant` | 50ms | Immediate feedback (toggle, checkbox) |
| `duration-fast` | 100ms | Micro-interactions, hover states |
| `duration-normal` | 200ms | Standard transitions |
| `duration-moderate` | 300ms | Panel slides, drawer open |
| `duration-slow` | 500ms | Page transitions, modal enter |
| `duration-theatrical` | 700ms | Hero reveals, onboarding sequences |

### Easing

| Token | Value | Usage |
|-------|-------|-------|
| `ease-linear` | `linear` | Progress bars |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements exiting screen |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering screen |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | State changes |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy, alive feel — signature Zest motion |
| `ease-theatrical` | `cubic-bezier(0.16, 1, 0.3, 1)` | Page transitions, hero reveals |

### Stagger

Use CSS custom property `--stagger-delay` on child elements:

```css
/* Parent sets the context */
.stagger-children > * {
  animation-delay: calc(var(--index, 0) * 60ms);
}
```

---

## Breakpoints

| Token | Value | Usage |
|-------|-------|-------|
| `breakpoint-sm` | 640px | Mobile landscape |
| `breakpoint-md` | 768px | Tablets |
| `breakpoint-lg` | 1024px | Small desktops |
| `breakpoint-xl` | 1280px | Standard desktops |
| `breakpoint-2xl` | 1536px | Large screens |

---

## Z-Index

| Token | Value | Usage |
|-------|-------|-------|
| `z-base` | 0 | Default stacking |
| `z-raised` | 10 | Hover-elevated cards |
| `z-dropdown` | 100 | Dropdowns, select menus |
| `z-sticky` | 200 | Sticky headers, toolbars |
| `z-overlay` | 300 | Backdrop overlays |
| `z-modal` | 400 | Modals, dialogs, drawers |
| `z-toast` | 500 | Toast notifications |
| `z-tooltip` | 600 | Tooltips (always on top) |

---

# Components

---

## Button

### Overview
The primary interactive element for triggering actions. The `primary` variant with its electric green glow is Zest's signature CTA.

### When to Use
- Triggering generation, export, or saving actions
- Confirming dialog choices
- Navigation CTAs in hero sections

### When Not to Use
- Navigation between pages (use links or nav elements)
- Inline text actions (use `TextButton` / link variant)

### Anatomy
| Part | Description | Required |
|------|-------------|----------|
| Container | Rounded pill/rect with background and border | Yes |
| Label | Button text, `font-family-body`, `font-weight-semibold` | Yes |
| Leading Icon | Optional icon before label | No |
| Trailing Icon | Optional icon after label | No |
| Loader | Spinner replacing label during loading state | No |

### Variants
| Variant | Use Case | Visual |
|---------|----------|--------|
| `primary` | Main CTA — Generate, Export, Save | Green fill, white text, brand glow on hover |
| `secondary` | Supporting actions | White fill, green border, green text |
| `ghost` | Tertiary actions, toolbar buttons | Transparent, neutral text, subtle hover bg |
| `danger` | Destructive actions — Delete | Red fill, white text |
| `link` | Inline text actions | No border/bg, underline on hover |

### Props / API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger' \| 'link'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size scale |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Shows spinner, disables interaction |
| `leadingIcon` | `ReactNode` | `undefined` | Icon before label |
| `trailingIcon` | `ReactNode` | `undefined` | Icon after label |
| `fullWidth` | `boolean` | `false` | 100% container width |
| `onClick` | `() => void` | — | Click handler |

### Design Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `color-brand-primary` | `#22C55E` | Primary button background |
| `color-brand-primary-hover` | `#16A34A` | Primary hover background |
| `shadow-brand-lg` | `0 8px 24px rgba(34,197,94,0.30)` | Primary hover glow |
| `radius-md` | `10px` | Button corner radius |
| `font-weight-semibold` | `600` | Button label weight |

### States
- **Default:** Green fill, white text
- **Hover:** Darker green fill + brand glow shadow (spring transition 200ms)
- **Active:** Scale down `0.97`, immediate (50ms)
- **Focus:** `shadow-brand` (2px offset green ring)
- **Disabled:** 40% opacity, no hover effects, `cursor-not-allowed`
- **Loading:** Label hidden, spinner visible, interaction disabled

### Accessibility
- **ARIA:** `aria-disabled="true"` when disabled; `aria-busy="true"` when loading
- **Keyboard:** `Enter` and `Space` trigger click
- **Screen Reader:** Loading state announces "Loading..." via `aria-live="polite"`

### Code Examples

```tsx
// Primary CTA
<Button variant="primary" onClick={handleGenerate}>
  Generate UI
</Button>

// With loading state
<Button variant="primary" loading={isGenerating}>
  Generate UI
</Button>

// Secondary with icon
<Button variant="secondary" leadingIcon={<DownloadIcon />}>
  Export HTML
</Button>

// Danger
<Button variant="danger" onClick={handleDelete}>
  Delete Project
</Button>
```

### Do's and Don'ts
| ✅ Do | ❌ Don't |
|-------|---------|
| Use `primary` for the single most important action on screen | Use multiple `primary` buttons on the same screen |
| Use loading state for async actions | Leave user wondering if click registered |
| Pair `danger` with a confirmation dialog | Use `danger` for non-destructive actions |
| Keep button labels short (1–3 words) | Write essays in button labels |

### Related Components
- `IconButton` — Icon-only button for toolbars
- `PromptBar` — The main generation input with embedded submit button

---

## Input

### Overview
Text input field with animated floating label. The signature detail: the label slides up and turns brand green on focus, reinforcing the "alive" brand feel.

### When to Use
- Form fields (name, email, project title)
- Inline edit scenarios

### When Not to Use
- Multi-line content (use `Textarea`)
- The main prompt field (use `PromptBar`)

### Anatomy
| Part | Description | Required |
|------|-------------|----------|
| Container | Rounded border container | Yes |
| Floating Label | Animates up on focus/fill | Yes |
| Input Element | Native `<input>` | Yes |
| Helper Text | Hint or error message below | No |
| Leading Icon | Decorative context icon | No |
| Clear Button | Appears when field has value | No |

### Variants
| Variant | Use Case |
|---------|----------|
| `default` | Standard form input |
| `error` | Validation failed — red border + error message |
| `success` | Validated — green border + checkmark |
| `disabled` | Read-only or unavailable |

### Props / API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Floating label text |
| `placeholder` | `string` | `''` | Hint inside field |
| `value` | `string` | — | Controlled value |
| `onChange` | `(val: string) => void` | — | Change handler |
| `error` | `string` | `undefined` | Error message |
| `helper` | `string` | `undefined` | Helper text |
| `disabled` | `boolean` | `false` | Disabled state |
| `leadingIcon` | `ReactNode` | `undefined` | Icon before input |
| `type` | `string` | `'text'` | HTML input type |

### Design Tokens
| Token | Usage |
|-------|-------|
| `border-color-default` | Default border |
| `border-color-focus` / `color-brand-primary` | Focus border + label color |
| `border-color-error` / `color-error` | Error state |
| `radius-md` | Input corner radius |
| `duration-normal` | Label float animation |
| `ease-spring` | Label animation easing |

### Accessibility
- **ARIA:** `aria-invalid="true"` on error; `aria-describedby` links to error/helper text
- **Keyboard:** Standard tab navigation; `Escape` clears focused input if clearable
- **Screen Reader:** Error messages announced via `aria-live="assertive"`

### Code Examples

```tsx
// Standard input
<Input
  label="Project Name"
  value={name}
  onChange={setName}
  helper="Used as the project title in your dashboard"
/>

// Error state
<Input
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  error="Please enter a valid email address"
/>
```

### Do's and Don'ts
| ✅ Do | ❌ Don't |
|-------|---------|
| Always provide a label (even if visually hidden) | Use placeholder as the only label |
| Show inline error messages immediately | Wait until form submit to show validation |

### Related Components
- `Textarea` — Multi-line text input
- `PromptBar` — The main AI generation input

---

## Card

### Overview
Contained surface for grouping related content. Cards use the layered background system to create visual hierarchy.

### Variants
| Variant | Use Case | Visual |
|---------|----------|--------|
| `default` | Standard content grouping | White bg, `shadow-sm`, `radius-lg` |
| `elevated` | Featured or important content | White bg, `shadow-md`, lifts on hover |
| `outlined` | Secondary grouping, lists | Border only, no shadow |
| `brand` | Highlight / call-to-action surfaces | `color-bg-brand-subtle` bg, green border |

### Props / API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'elevated' \| 'outlined' \| 'brand'` | `'default'` | Visual style |
| `hoverable` | `boolean` | `false` | Adds hover lift effect |
| `onClick` | `() => void` | `undefined` | Makes card interactive |
| `padding` | `'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding scale |

### States
- **Default:** Static surface
- **Hover (hoverable):** `translateY(-2px)` + `shadow-md` (spring 200ms)
- **Active (clickable):** `translateY(0)` + `shadow-sm`

### Accessibility
- **ARIA:** `role="button"` and `tabIndex={0}` when `onClick` is provided
- **Keyboard:** `Enter` triggers `onClick` when card is interactive

### Code Examples

```tsx
// Project card in dashboard
<Card variant="elevated" hoverable onClick={() => openProject(id)}>
  <img src={thumbnail} alt={name} />
  <h3>{name}</h3>
  <p>{lastEdited}</p>
</Card>

// Brand highlight
<Card variant="brand" padding="lg">
  <h2>Upgrade to Pro</h2>
  <p>Unlimited generations, priority access.</p>
  <Button>Upgrade Now</Button>
</Card>
```

### Do's and Don'ts
| ✅ Do | ❌ Don't |
|-------|---------|
| Group logically related content | Nest cards more than 2 levels deep |
| Use `elevated` sparingly for emphasis | Make every card `elevated` |

### Related Components
- `Button` — Primary action inside cards
- `Badge` — Status labels on card headers

---

## Badge

### Overview
Small inline label for status, category, or count indicators.

### Variants
| Variant | Color | Use Case |
|---------|-------|----------|
| `success` | Green | Active, complete, online |
| `warning` | Amber | Pending, caution |
| `error` | Red | Failed, critical |
| `info` | Blue | Informational |
| `neutral` | Gray | Inactive, archived |
| `brand` | Green (light) | Feature tags, "New" labels |

### Props / API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'success' \| 'warning' \| 'error' \| 'info' \| 'neutral' \| 'brand'` | `'neutral'` | Color variant |
| `size` | `'sm' \| 'md'` | `'md'` | Size scale |
| `dot` | `boolean` | `false` | Show colored dot before label |

### Code Examples

```tsx
<Badge variant="success" dot>Active</Badge>
<Badge variant="brand">New</Badge>
<Badge variant="warning">Beta</Badge>
```

---

## Modal

### Overview
Theatrical overlay dialog for focused tasks, confirmations, and upgrade prompts. Uses backdrop blur and a spring slide-up entry to feel alive.

### Anatomy
| Part | Description | Required |
|------|-------------|----------|
| Backdrop | Blurred dark overlay, closes on click | Yes |
| Container | Rounded white panel, centered | Yes |
| Header | Title + close button | Yes |
| Body | Scrollable content area | Yes |
| Footer | Action buttons | No |

### Motion Spec
- **Enter:** Backdrop fades in (200ms `ease-out`); panel slides up from `translateY(20px)` + fades in (350ms `ease-spring`)
- **Exit:** Backdrop fades out; panel fades + slides down (200ms `ease-in`)

### Props / API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controls visibility |
| `onClose` | `() => void` | — | Close handler |
| `title` | `string` | — | Modal heading |
| `size` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Width preset |
| `closeOnBackdrop` | `boolean` | `true` | Dismiss on backdrop click |

### Accessibility
- **ARIA:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title
- **Keyboard:** `Escape` closes; focus trapped inside modal while open
- **Screen Reader:** Focus moves to modal on open; returns to trigger on close

### Code Examples

```tsx
<Modal open={isOpen} onClose={() => setIsOpen(false)} title="Export Project">
  <p>Choose your export format:</p>
  <div className="flex gap-3">
    <Button variant="secondary" onClick={() => exportAs('html_css')}>HTML / CSS</Button>
    <Button variant="primary" onClick={() => exportAs('tailwind')}>Tailwind CSS</Button>
  </div>
</Modal>
```

---

## PromptBar

### Overview
Zest's signature input component — the primary way users communicate with the AI. Expressive, inviting, and the first thing users interact with. Features an animated placeholder that cycles through prompt suggestions.

### Anatomy
| Part | Description | Required |
|------|-------------|----------|
| Container | Full-width, rounded, elevated surface | Yes |
| Textarea | Auto-grows with content, multi-line | Yes |
| Animated Placeholder | Cycling suggestions (fade in/out) | Yes |
| Submit Button | `primary` Button embedded at right | Yes |
| Format Toggle | HTML/CSS vs Tailwind selector | Yes |
| Character Counter | Shows at 80% of limit | No |

### Props / API
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Controlled prompt value |
| `onChange` | `(val: string) => void` | — | Change handler |
| `onSubmit` | `(val: string) => void` | — | Submit handler |
| `loading` | `boolean` | `false` | Disables input, shows progress |
| `disabled` | `boolean` | `false` | Fully disabled |
| `format` | `'html_css' \| 'tailwind'` | `'html_css'` | Output format selection |
| `onFormatChange` | `(f: string) => void` | — | Format change handler |
| `suggestions` | `string[]` | `[]` | Cycling placeholder suggestions |

### States
- **Idle:** Suggestions cycle every 3s (fade cross-transition, 400ms)
- **Focused:** Green border glow appears (`shadow-brand`), suggestions pause
- **Typing:** Character counter appears at 80% limit
- **Loading:** Progress bar under container, input disabled, submit shows spinner

### Code Examples

```tsx
<PromptBar
  value={prompt}
  onChange={setPrompt}
  onSubmit={handleGenerate}
  loading={isGenerating}
  format={outputFormat}
  onFormatChange={setOutputFormat}
  suggestions={[
    "A pricing page with 3 tiers...",
    "A hero section for a SaaS product...",
    "A login form with email and Google OAuth...",
    "A dashboard with a sidebar and data table...",
  ]}
/>
```

### Do's and Don'ts
| ✅ Do | ❌ Don't |
|-------|---------|
| Keep suggestions realistic and inspiring | Use generic placeholders like "Enter prompt here" |
| Show clear loading feedback | Leave users uncertain if request was received |

---

## GenerationLoader

### Overview
Zest-specific theatrical loading state shown while the AI generates a UI. Transforms waiting into an expressive brand moment.

### Anatomy
| Part | Description |
|------|-------------|
| Background | Subtle animated green gradient mesh |
| Status Text | Cycling messages: "Thinking...", "Laying out...", "Styling..." |
| Progress Ring | Indeterminate green circle ring |
| Cancel Link | "Taking too long? Cancel" appears after 15s |

### Motion Spec
- Background gradient mesh animates slowly (8s loop, `ease-in-out`)
- Status messages cycle every 3s with theatrical fade transition
- Progress ring rotates continuously

### Code Examples

```tsx
<GenerationLoader
  stage="styling"
  onCancel={handleCancel}
  showCancel={elapsedSeconds > 15}
/>
```

---

# Patterns

---

## Editor Layout Pattern

### Overview
Three-panel layout for the visual editor: left sidebar (project/layers), center canvas (generated UI preview), right panel (properties inspector).

### Structure
```
┌────────────┬──────────────────────────────┬───────────────┐
│  SIDEBAR   │         CANVAS               │  PROPERTIES   │
│  (240px)   │      (flex-grow: 1)          │    (280px)    │
│            │                              │               │
│  Layers    │  ┌─────────────────────┐     │  Element      │
│  Tree      │  │   Generated UI      │     │  Styles       │
│            │  │   (iframe/preview)  │     │               │
│  ──────    │  └─────────────────────┘     │  Typography   │
│  Project   │                              │  Colors       │
│  Settings  │  Toolbar (top of canvas)     │  Spacing      │
└────────────┴──────────────────────────────┴───────────────┘
```

### Responsive Considerations
- **Desktop (1280px+):** Full 3-panel layout
- **Tablet (768–1279px):** Properties panel becomes a slide-over drawer
- **Mobile:** Editor not available; prompt and export only (mobile-first CTA to open on desktop)

---

## Empty State Pattern

### Overview
Prompt-first empty state for new users and empty dashboards. Converts emptiness into an invitation to create.

### Structure
For new editor sessions:
```
         [Zest Logo Mark — animated subtle pulse]

     "What will you build today?"
     [PromptBar — full width, prominent]

     ── or start from a template ──

     [Template Card] [Template Card] [Template Card]
```

For empty dashboard (no projects):
```
     [Illustrated empty state — small green sprout icon]
     "No projects yet"
     "Generate your first UI in seconds"
     [Button: "Start Creating →"]
```

---

## Error State Pattern

### Overview
Graceful failure presentation that maintains trust and offers a clear path forward.

### Structure
```
     [Error Icon — amber warning or red X]
     "Generation failed"
     "We couldn't reach the AI service. This is usually temporary."
     [Button: "Try Again"] [Button (ghost): "Report Issue"]
```

### Variants
| Scenario | Icon | Message | Primary Action |
|----------|------|---------|----------------|
| API failure | Warning | "Generation failed" | Try Again |
| Rate limit hit | Lock | "Limit reached" | Upgrade |
| Invalid prompt | Info | "Prompt too short" | Edit Prompt |
| Content blocked | Shield | "Prompt not allowed" | Edit Prompt |
| Timeout | Clock | "Taking longer than expected" | Cancel / Retry |

---

## Upgrade Wall Pattern

### Overview
Shown when free users hit their generation limit. Converts constraint into conversion opportunity — never punishing, always inviting.

### Structure
```
  ┌─────────────────────────────────────────────────────────┐
  │  [Brand Card variant]                                   │
  │                                                         │
  │  ✦  You've used all 20 free generations this month     │
  │                                                         │
  │  Upgrade to Pro for unlimited generations,             │
  │  priority AI access, and Tailwind export.              │
  │                                                         │
  │  [Button: "Upgrade to Pro →"]                          │
  │  [Link: "Learn more about plans"]                      │
  │                                                         │
  │  Resets in 12 days                                     │
  └─────────────────────────────────────────────────────────┘
```

---

## CSS Variables Reference

All tokens are implemented as CSS custom properties for dark mode support:

```css
:root {
  /* Brand */
  --color-brand-primary: #22C55E;
  --color-brand-primary-hover: #16A34A;
  --color-brand-primary-light: #DCFCE7;
  --color-brand-glow: rgba(34, 197, 94, 0.25);

  /* Neutrals (light mode) */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F9FAFB;
  --color-bg-tertiary: #F3F4F6;
  --color-text-primary: #111827;
  --color-text-secondary: #4B5563;
  --color-text-muted: #9CA3AF;
  --color-border-default: #E5E7EB;
  --color-border-focus: #22C55E;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* Motion */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-theatrical: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 500ms;
}

.dark {
  --color-bg-primary: #0A0A0A;
  --color-bg-secondary: #111111;
  --color-bg-tertiary: #1A1A1A;
  --color-text-primary: #F9FAFB;
  --color-text-secondary: #D1D5DB;
  --color-text-muted: #6B7280;
  --color-border-default: #2A2A2A;
}
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-22 | AI Assistant | Initial version |

---

*This design system is the visual source of truth for Zest. All UI implementation must use these tokens. Direct color values in component code are prohibited — always reference CSS variables.*
