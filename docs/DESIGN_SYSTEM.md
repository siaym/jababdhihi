# DESIGN SYSTEM & REUSABLE COMPONENT SPECIFICATION

---

## 1. Component Architecture & Principles

All components in the design system adhere to the following principles:
1. **Accessibility First (a11y):** Built upon Radix UI primitives with full ARIA attributes, keyboard navigation (`Tab`, `Space`, `Enter`, arrows), and screen-reader announcements.
2. **Compound & Modular:** Clean composition allowing components to be combined without brittle prop drilling.
3. **State Resilience:** Every stateful component supports `loading`, `empty`, `error`, and `success` modes.
4. **Bilingual Label Awareness:** Sized flexibly to accommodate Bengali text expansions (Bengali text is typically 15–25% wider than English equivalents).

---

## 2. Core Primitives Specification

### 2.1 Buttons (`Button`)
- **Variants:**
  - `primary`: Solid `#0f2942` (Dark Civic Navy) with white text.
  - `secondary`: Slate `#f1f5f9` with Slate 900 text.
  - `outline`: Border `1px solid #cbd5e1` with transparent background.
  - `destructive`: Red `#e11d48` for report deletion or evidence rejection.
  - `ghost`: Transparent with hover background `#f1f5f9`.
  - `link`: Underlined inline text button.
- **Sizes:** `sm` (h-8, px-3, text-xs), `md` (h-10, px-4, text-sm), `lg` (h-12, px-6, text-base).
- **States:** `idle`, `hover`, `focus-visible`, `active`, `disabled`, `loading` (with accessible spinner and `aria-busy="true"`).

### 2.2 Form Elements
- **Input (`Input`), Textarea (`Textarea`), Select (`Select`):**
  - High-contrast borders (`border-slate-300`, focus ring `ring-2 ring-primary-navy`).
  - Clear error states with red border and adjacent error message (`aria-invalid="true"` linked via `aria-describedby`).
  - Native support for clear buttons and leading/trailing icons.
- **Checkbox (`Checkbox`) & Radio Group (`RadioGroup`):**
  - Accessible custom checkboxes with high-visibility checkmark and label association.
- **Modal (`Modal`) & Drawer (`Drawer`):**
  - Accessible focus trap, backdrop blur, `Escape` key close, and screen-reader title/description linkage.

### 2.3 Status Badges (`Badge`)
Badges convey meaning through text, icon, and color:
- `submitted`: Slate background (`bg-slate-100 text-slate-800`), Clock icon.
- `under_review`: Amber background (`bg-amber-100 text-amber-900`), Eye icon.
- `verified`: Emerald background (`bg-emerald-100 text-emerald-900`), Shield-Check icon.
- `referred`: Indigo background (`bg-indigo-100 text-indigo-900`), Arrow-Up-Right icon.
- `unsubstantiated`: Gray background (`bg-gray-100 text-gray-800`), Minus-Circle icon.

---

## 3. Civic Domain Components

### 3.1 `FileUploader`
- Drag-and-drop zone with MIME and size constraints.
- Real-time client-side file size and extension validation.
- Per-file upload progress bar (0–100%).
- Quick remove button and thumbnail generation for images.

### 3.2 `EvidenceCard`
- **Upload Mode:** Displays file icon/thumbnail, file size, MIME type, reviewer review state badge (`PENDING`, `ACCEPTED`, `REJECTED`), and secure pre-signed download trigger.
- **External Link Mode:** Detects platform (YouTube, Facebook, Google Drive, Dropbox, News Link) and displays sandboxed preview or fallback redirection card with broken link reporting.

### 3.3 `StatusTimeline`
- Vertical stepped timeline component showing progress from `SUBMITTED` to `RESOLVED`.
- Active step indicator with animated pulsing dot.
- Timestamp, actor title, and public explanation note per historical step.

### 3.4 `ReportCard`
- Standard summary card for public case catalog (`/reports`):
  - Case Number (`BD-2026-001241`)
  - Incident Category badge (e.g., `Police Misconduct`)
  - Division & District label (e.g., `Dhaka • Mirpur`)
  - Date of incident
  - Sanitized incident summary snippet
  - Number of verified evidence attachments

### 3.5 `MapPanel`
- Leaflet interactive map with custom Bangladesh Division and District GeoJSON overlays.
- Chloropleth color intensity based on aggregate report density.
- Hover tooltips showing division name and count.
- Click drill-down into district statistics.

### 3.6 `StatsCard`
- Metric display showing count, trend indicator, and explanatory context (e.g., *"1,248 Allegations Documented • 312 Referred to Legal Aid"*).

---

## 4. UI Fallback States Specification

| State Component | Trigger Condition | Visual Display & Guidance |
| :--- | :--- | :--- |
| `EmptyState` | No cases found matching search filter. | Clean illustration, message: *"No public reports match your filters."*, action button to reset filters. |
| `LoadingState` | Server data fetch or client action in flight. | Accessible skeleton loader preserving screen geometry. |
| `ErrorState` | Network failure or server exception. | Error banner, error code, friendly retry button: *"Something went wrong. Please try again."* |
| `PermissionDenied`| Public user attempting to view reviewer queue. | 403 shield illustration with button to return to homepage. |
| `LinkUnavailable` | External YouTube/Drive link removed by author. | Alert badge: *"This external source is currently unavailable or private."* |
| `OfflineBanner` | Citizen loses mobile internet during reporting. | Sticky banner: *"Internet connection lost. Your draft is saved locally."* |
