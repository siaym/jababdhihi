# CHANGELOG

All notable changes to the Bangladesh Civic Reporting Platform will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0-alpha] - 2026-10-07

### Added
- Re-architected visual identity and layout to faithfully reproduce the provided **Jababdihi (জবাবদিহি)** reference design.
- Custom vector `Logo` component integrating red sun, monument architecture, and bilingual typography.
- Exact 74px white navigation bar with logo, centered nav links, search input, language dropdown, login link, and red `#C62828` "Submit Report" CTA.
- 520px high-contrast photographic hero section with authentic Bangladesh civic crowd imagery and dark vignette.
- Floating dark translucent `RecentReportsFloatingCard` on the hero with 5 distinct categorized incident previews.
- 9-item `Explore by Category` card grid with custom color-coded category icons and report counts.
- Side-by-side bottom split featuring `Reports on Map` with aggregated cluster markers (12, 34, 5, 8) and `Latest Reports` tabbed feed with thumbnail cards.
- Added `docs/EXTERNAL_LINKS.md` and `docs/ROUTES.md`.

## [0.2.0-alpha] - 2026-10-07

### Added
- Complete Next.js 14 App Router, TypeScript, and Tailwind CSS web application.
- Native bilingual i18n support (Bangla `bn` & English `en`) across all user surfaces.
- Multi-step Incident Reporting Wizard (`/report`) featuring 10 incident categories, division/district locators, direct file uploads, and external evidence links (YouTube, Facebook, Google Drive, Dropbox).
- Secure Case Tracking Portal (`/track`) using dual-key authentication (`BD-2026-XXXXXX` + random passkey), interactive progression timeline, and two-way case messaging.
- Public Incident Reports Directory (`/reports` and `/reports/[id]`) enforcing neutral allegation terminology.
- Geographic Accountability Map (`/map`) aggregating data across all 8 Bangladesh Divisions and 64 Districts without exposing sensitive coordinates.
- Public Transparency Dashboard (`/dashboard`) distinguishing reports received from verified findings.
- Institutional Directory (`/organizations`) tracking university, police, and government incident volumes with official response indicators.
- Reviewer Moderation Queue & Case Review Workspace (`/admin` and `/admin/reports/[id]`) with confidential internal staff notes.
- Support Center & Emergency Hotlines (`/resources`) listing verified national services (999, 109, 333, 106).
- Public civic guidance pages (`/how-it-works`, `/methodology`, `/safety`).
- Supabase PostgreSQL migration (`00001_initial_schema.sql`) with custom types, tables, and Row-Level Security (RLS).

## [0.1.0-alpha] - 2026-10-07

### Added
- Comprehensive Phase 0 architectural planning and master specification suite in `/docs`:
  - `README.md`: High-level executive overview and directory index.
  - `AI_CONTEXT.md`: AI agent context and persistent handoff protocol.
  - `ARCHITECTURE.md`: High-level system architecture, component topology, and data flows.
  - `PRODUCT_SPEC.md`: Product identity, functional capabilities, and category definitions.
  - `DATABASE.md`: PostgreSQL schema, table DDL, relationships, indexes, and RLS policies.
  - `SECURITY.md`: Threat modeling, anonymity protections, file upload security, and SSRF prevention.
  - `AUTHORIZATION.md`: RBAC permission matrix, user roles, and middleware route security.
  - `STORAGE.md`: Private object storage architecture, pre-signed URL lifecycle, and quotas.
  - `EVIDENCE_SYSTEM.md`: First-class external evidence link system (YouTube, Facebook, Drive) and direct upload pipeline.
  - `REPORT_WORKFLOW.md`: Centralized status state machine and immutable transition history.
  - `MODERATION.md`: Reviewer workspace interface and 4-tier evidentiary verification standard.
  - `AI_FEATURES.md`: AI assistant capabilities and strict ethical red lines.
  - `UI_SYSTEM.md`: Light-first civic visual language, bilingual typography, and wireframe layouts.
  - `DESIGN_SYSTEM.md`: Specification of 24 reusable design system components and edge UI states.
  - `API.md`: Server Actions and REST API endpoint contracts.
  - `ENVIRONMENT.md`: Environment variables schema and local developer setup guide.
  - `DEPLOYMENT.md`: Infrastructure topology, Supabase provisioning, and Vercel configuration.
  - `TESTING.md`: Quality assurance test matrix (unit, integration, RLS, and E2E).
  - `TROUBLESHOOTING.md`: Common runtime and operational fixes.
  - `CONTRIBUTING.md`: Code conventions and responsible vulnerability disclosure policy.
  - `DECISIONS.md`: Architectural Decision Records (ADR-001 through ADR-005).
  - `DEVELOPMENT_LOG.md`: Chronological development session log.
- Initialized clean Git version control repository.
