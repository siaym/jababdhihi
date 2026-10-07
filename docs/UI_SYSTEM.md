# UI SYSTEM & VISUAL LANGUAGE SPECIFICATION

---

## 1. Visual Philosophy & Civic Identity

The Bangladesh Civic Reporting Platform presents the visual authority and calm reassurance of an independent constitutional or civic ombudsman service.

### Design Non-Negotiables:
- **No Social Media Aesthetic:** No like counts, shares, follow buttons, or trending flame icons.
- **No Dark Hacker / Whistleblower Clichés:** No neon greens, glitch art, matrix effects, or shadowy mask iconography.
- **No Sensationalist News Portal Tropes:** No flashing breaking-news banners or alarmist red tickers.
- **Calm, High-Legibility Light-First Surfaces:** Clear borders, ample whitespace, high-contrast typography, and restrained, intentional badges.

---

## 2. Color System & Accessibility Tokens

The color palette complies with **WCAG 2.1 AA** contrast standards across both light and dark modes:

| Token Name | Hex Code (Light) | Usage / Semantics |
| :--- | :--- | :--- |
| `primary-navy` | `#0f2942` | Primary brand headers, hero text, primary action buttons |
| `civic-slate-900`| `#0f172a` | Main body typography, high-priority labels |
| `civic-slate-600`| `#475569` | Secondary descriptive text, metadata dates |
| `civic-slate-100`| `#f1f5f9` | Card surfaces, secondary button backgrounds |
| `surface-bg` | `#f8fafc` | Main application background |
| `verified-green` | `#059669` | Verified badge, resolution indicators, security confirmation |
| `review-amber` | `#d97706` | "Under Review", "Clarification Requested", warning banners |
| `alert-rose` | `#e11d48` | Danger alerts, emergency hotline badges, error states |
| `accent-teal` | `#0d9488` | Interactive accents, category focus borders |

---

## 3. Bilingual Typography System

Bengali typography requires greater vertical line height (`leading-relaxed`) and distinct kerning compared to Latin typefaces:

```css
/* Typography Configuration */
:root {
  --font-en: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-bn: 'Noto Sans Bengali', 'Hind Siliguri', 'Kalpurush', sans-serif;
}

/* Base styles for Bengali content */
[lang='bn'] {
  font-family: var(--font-bn);
  line-height: 1.7; /* Bengali glyph ascenders and descenders require 1.6-1.8x line height */
}
```

---

## 4. Key Page Wireframes & Layout Architecture

### 4.1 Homepage Layout (`/`)
1. **Top Header:** Bilingual logo (`বাংলাদেশ নাগরিক প্ল্যাটফর্ম / Bangladesh Civic Platform`), Reports, Map, Dashboard, Directory, Resources, Language Switcher (বাংলা / EN), Persistent CTA `[ Report an Incident ]`.
2. **Hero Section:**
   - Heading: *"Speak up. Document what happened. Help build a more accountable Bangladesh."*
   - Subheading: *"A secure, citizen-led platform for documenting abuse, misconduct, and corruption. Every report is protected, reviewed, and tracked."*
   - Actions: `[ Report an Incident ]` (Primary Green/Navy), `[ Explore Public Reports ]` (Secondary Outline).
3. **Verified Counter & Civic Metrics:**
   - Three key metric boxes: Total Allegations Documented, Under Verification, Resolved / Referred Cases.
4. **Interactive Bangladesh Map Teaser:** Division-level report counts.
5. **How It Works 4-Step Diagram:** (Report → Protect → Review → Action).
6. **Emergency Hotlines Bar:** Quick access to National Emergency 999, Women & Child Abuse 109, Government Services 333, Dudok 106.
7. **Methodology & Safety Callout:** Link to evidentiary standards.

### 4.2 Multi-Step Reporting Wizard Layout (`/report`)
- Top progress tracker: `1. Category → 2. Details → 3. Entity → 4. Evidence → 5. Privacy`.
- Step 1: 10 large visual category cards with bilingual titles and icons.
- Step 2: Division/District select dropdowns with Location Privacy toggle (`Exact` vs `Approximate` vs `Confidential`).
- Step 3: Institution lookup and role selector with privacy warning banner.
- Step 4: Split interface: File Dropzone (Images/PDFs) + External Link Adder (YouTube, FB, Google Drive).
- Step 5: Privacy Mode selector (`Anonymous`, `Confidential`, `Identified`) and Consent checkbox.
- Submission Complete: Prominent Display of `BD-2026-XXXXXX` and Copyable Secret Passkey with download/print button.

### 4.3 Report Tracking Portal Layout (`/track`)
- Dual-input authentication form: Case Number (`BD-2026-XXXXXX`) and Tracking Passkey (`xxxx-xxxx-xxxx-xxxx`).
- Vertical timeline of status history with dates and public reviewer remarks.
- Two-way encrypted case messaging feed with reviewer replies.
- Additional evidence upload dropzone if reviewer flagged `more_info_required`.

### 4.4 Moderation & Case Review Layout (`/admin/reports/[id]`)
- Split-screen workspace: Left panel displays complete case narrative, location, and evidence dossiers; right panel provides reviewer controls (status updater, reviewer assigner, internal notes, referral transmitter).
