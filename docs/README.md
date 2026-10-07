# Bangladesh Civic Reporting Platform (বাংলাদেশ নাগরিক প্রতিবেদন প্ল্যাটফর্ম)

A secure, bilingual, evidence-driven civic reporting and incident documentation platform for Bangladesh.

> **Core Philosophy:**
> REPORT → PROTECT → REVIEW → VERIFY → REFER → TRACK → ANALYZE

---

## 1. Executive Overview

The **Bangladesh Civic Reporting Platform** empowers citizens to safely, confidentially, or anonymously report public-interest violations, including abuse, harassment, corruption, police misconduct, university misconduct, workplace abuse, and public safety issues.

This platform is **NOT** a social media network, gossip board, or naming-and-shaming website. Every submission is treated strictly as an **allegation/report** until it undergoes rigorous human review, evidence verification, and appropriate institutional referral.

---

## 2. Key Capabilities

- **Bilingual Experience:** Native Bengali (বাংলা) and English (EN) support across all user interfaces, notifications, and communications.
- **Privacy-First Reporting Modes:**
  - **Anonymous:** Zero identity captured, EXIF/metadata scrubbed, no IP tracking stored.
  - **Confidential:** Identity verified by the platform team but strictly concealed from the public.
  - **Identified:** Explicit citizen consent for public or institutional attribution.
- **First-Class Evidence System:**
  - **Direct Uploads:** Images (JPEG, PNG, WebP), Documents (PDF), Audio, Video with client and server-side magic byte validation and configurable size limits.
  - **External Evidence Integrations:** Native embed support and URL archiving for YouTube, Facebook public posts, Google Drive, Google Photos, Dropbox, and verified news links without excessive server storage bloat.
- **Case Tracking & Cryptographic Codes:** Secure anonymous case tracking via `BD-2026-XXXXXX` identifier and a high-entropy secret tracking code.
- **Role-Based Access Control (RBAC):** Strict separation between Public Visitors, Reporters, Reviewers, Senior Reviewers, and System Administrators.
- **Public Accountability Data:** Aggregated, privacy-preserving maps and analytics down to Division/District levels without revealing sensitive victim or location coordinates.
- **Resource & Support Directory:** Curated, verified hotline directory for legal aid, emergency assistance, psychological counseling, and human rights bodies.

---

## 3. Documentation Structure

All architectural and engineering specifications are located within the `/docs` directory:

| Document | Purpose |
| :--- | :--- |
| [`AI_CONTEXT.md`](./AI_CONTEXT.md) | Master AI agent context, handoff status, tech stack, rules, and task queues |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | High-level system architecture, component topology, data flows, and tech choices |
| [`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md) | Comprehensive functional and non-functional product specifications |
| [`DATABASE.md`](./DATABASE.md) | Complete PostgreSQL schema, DDL, relations, indexes, triggers, and migrations |
| [`SECURITY.md`](./SECURITY.md) | Threat models, input validation, SSRF prevention, EXIF sanitization, rate limits |
| [`AUTHORIZATION.md`](./AUTHORIZATION.md) | RBAC model, permissions matrix, Row-Level Security (RLS) policies |
| [`STORAGE.md`](./STORAGE.md) | Private object storage, bucket policies, quota management, and pre-signed URLs |
| [`EVIDENCE_SYSTEM.md`](./EVIDENCE_SYSTEM.md) | Architecture for uploads and external embed providers (YouTube, Facebook, Drive) |
| [`REPORT_WORKFLOW.md`](./REPORT_WORKFLOW.md) | State machine transitions, status history, notifications, and referral pipelines |
| [`MODERATION.md`](./MODERATION.md) | Reviewer queue, internal notes, verification criteria, and appeal mechanisms |
| [`AI_FEATURES.md`](./AI_FEATURES.md) | Ethical guidelines for AI assistance (structuring, translation, missing info) |
| [`UI_SYSTEM.md`](./UI_SYSTEM.md) | Visual design tokens, screen layouts, bilingual typography, accessible UX |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Component library specifications, states, forms, banners, and modals |
| [`API.md`](./API.md) | REST & Server Action specifications, tracking APIs, webhook definitions |
| [`ENVIRONMENT.md`](./ENVIRONMENT.md) | Environment variables, configuration schema, and local setup guide |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Production infrastructure, Supabase provisioning, Vercel/Docker deployment |
| [`TESTING.md`](./TESTING.md) | Unit, integration, security, and end-to-end testing protocols |
| [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) | Common errors, storage sync bugs, i18n hydration fixes, and recovery steps |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Coding guidelines, Git workflow, PR conventions, and security reporting |
| [`DECISIONS.md`](./DECISIONS.md) | Architecture Decision Records (ADRs) |
| [`DEVELOPMENT_LOG.md`](./DEVELOPMENT_LOG.md) | Chronological session development log |
| [`CHANGELOG.md`](./CHANGELOG.md) | Release and milestone version history |

---

## 4. Technology Stack

- **Framework:** Next.js (App Router, React Server Components)
- **Language:** TypeScript (Strict mode enabled)
- **Styling:** Tailwind CSS + Radix UI primitives + Lucide Icons
- **Database & Auth:** PostgreSQL (Supabase / Prisma / Supabase Auth with RLS)
- **State & Forms:** React Hook Form + Zod validation
- **Internationalization:** Next-intl / React i18n with bilingual message bundles (bn/en)
- **Mapping:** Leaflet / React-Leaflet with Bangladesh GeoJSON boundaries
- **Charts & Metrics:** Recharts (accessible, theme-aware)

---

## 5. Security & Civic Responsibility Disclaimer

Every report submitted to this platform represents an unverified citizen allegation until it has progressed through the platform's standardized verification methodology. The platform does not pass judgment or declare individuals guilty of crimes. All personal identifiers are protected in accordance with strict privacy protocols.
