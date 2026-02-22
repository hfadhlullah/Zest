# ZEST-017: Export Modal & Code Preview UI

**Epic:** ZEST-F04 (Code Export)
**Layer:** L4-feature-ui
**Role:** Frontend
**Estimation:** 3
**Priority:** Must

---

## Objective

Implement the Export Modal and Code Preview slide-over panel in the editor. The modal lets users select an export format (HTML/CSS or Tailwind) and trigger the download via `POST /api/v1/exports`. The code preview panel shows syntax-highlighted HTML/CSS with per-tab copy buttons before exporting.

## Technical Specifications

- **Proposed Files:**
  - `src/components/export/ExportModal.tsx` — format selector modal, confirms and calls export API
  - `src/components/export/CodePreviewPanel.tsx` — slide-over with tabbed HTML/CSS syntax-highlighted view
  - `src/components/export/FormatCard.tsx` — selectable card for HTML/CSS vs Tailwind format options
  - `src/hooks/useExport.ts` — encapsulates `POST /api/v1/exports` call, download trigger, loading/error state
  - `src/store/export-store.ts` — Zustand slice: `isExportModalOpen`, `isPreviewOpen`, `selectedFormat`
- **Functions/Classes:**
  - `ExportModal` — renders two `FormatCard`s, "Export" CTA, "Preview Code" secondary link
  - `CodePreviewPanel` — slide-over panel with "HTML" / "CSS" tabs, `highlight.js` highlighting, "Copy" button per tab, "Export" CTA at bottom
  - `FormatCard` — shows format name, description, lock icon + tooltip when `disabled` (anonymous + Tailwind)
  - `useExport(generationId, format)` → `{ trigger, isLoading, error }` — calls API, creates `<a>` with `href=downloadUrl` and programmatically clicks to download
- **API Endpoints:** `POST /api/v1/exports` (consumed)
- **Data Models:** none (reads `Generation` HTML/CSS from Zustand `editor-store`)

## Acceptance Criteria (Technical)

- [ ] "Export" button in editor toolbar opens `ExportModal`
- [ ] `ExportModal` shows two format cards: "HTML/CSS" and "Tailwind CSS"; Tailwind card shows lock icon with "Sign in required" tooltip for anonymous users
- [ ] Default selected format matches the generation's `output_format`
- [ ] Confirming export calls `POST /api/v1/exports`, receives `download_url`, and triggers browser file download
- [ ] Download triggers without a separate page (programmatic `<a>` click)
- [ ] "Preview Code" secondary button opens `CodePreviewPanel` as slide-over
- [ ] `CodePreviewPanel` shows "HTML" and "CSS" tabs (single "HTML" tab for Tailwind output)
- [ ] Code is syntax-highlighted using `highlight.js`
- [ ] "Copy" button in each tab copies tab content to clipboard; shows brief "Copied!" feedback
- [ ] "Export" CTA at bottom of preview panel triggers the same export flow
- [ ] Loading spinner shown on Export CTA during API call
- [ ] Error toast shown if `POST /api/v1/exports` returns an error
- [ ] `403 PLAN_LIMIT_EXCEEDED` response triggers sign-in prompt instead of error toast
- [ ] `analytics.track('export_initiated')`, `analytics.track('export_completed')`, `analytics.track('code_preview_opened')`, `analytics.track('code_copied')` fired at appropriate points
- [ ] Fully keyboard-accessible (modal trap focus, ESC closes, tab navigation through format cards)

## Business Rules & Logic

- Anonymous users may select HTML/CSS only; Tailwind card is visually disabled, not hidden (BR: permission matrix §2.2)
- Export CTA is disabled while API call is in-flight (prevent double-submit)
- `code_copied` event includes `tab` property (`html` or `css`)

## Dependencies

- Depends on: ZEST-008 (editor toolbar shell where Export button lives)
- Depends on: ZEST-016 (`POST /api/v1/exports` API route must exist)

## Definition of Done

- [ ] Code implemented
- [ ] Storybook stories for `ExportModal`, `CodePreviewPanel`, `FormatCard` (authenticated and anonymous states)
- [ ] Unit tests: `useExport` hook (success, 403, network error), `FormatCard` disabled state
- [ ] Lint/Type check clear
