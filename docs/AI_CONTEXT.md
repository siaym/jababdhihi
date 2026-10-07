CURRENT PROJECT STATUS: SUPABASE BACKEND ARCHITECTURE & EXACT UI COMPLETED  
VERSION: 0.3.1-alpha  
LAST UPDATED: 2026-10-07  
CURRENT PHASE: SUPABASE BACKEND INTEGRATION & EXACT UI FIDELITY  
LAST COMPLETED TASK: Implemented custom Jababdihi logo, 74px navbar, photographic hero with dark vignette, floating Recent Reports panel, 9-item category grid, side-by-side map & latest reports split matching reference image, and full Supabase client/server/admin/storage integration layer  
CURRENT TASK: Finalized ADR-006 and Supabase storage bucket policies  
NEXT RECOMMENDED TASK: Phase 6 Communication & Live Database Synchronization (running supabase db push on remote Supabase instance)

---
> ⚠️ **MANDATORY BACKEND DIRECTIVE:**  
> **Backend requirement: Use Supabase as the primary backend platform. Use Supabase PostgreSQL for the database, Supabase Auth for authentication, Supabase Storage for uploaded evidence, and Supabase Row Level Security for authorization/data protection. Do not introduce another backend service unless there is a documented technical reason and the decision is recorded in `docs/DECISIONS.md`.**
---

## 1. What the Project Is
The **Jababdihi (জবাবদিহি)** platform is a bilingual (Bangla & English), secure, privacy-preserving incident reporting and public accountability web application for Bangladesh. It enables citizens across Bangladesh to document public-interest incidents—such as harassment, extortion, corruption, police misconduct, university abuse, workplace violations, and public safety issues.

It enforces the civic doctrine:
> **REPORT → PROTECT → REVIEW → VERIFY → REFER → TRACK → ANALYZE**

Crucially, **it is NOT a social media network or a naming-and-shaming board**. Submissions are strictly classified as **allegations** until reviewed and verified by qualified moderators.

## 2. Current Technology Stack
- **Framework:** Next.js (App Router, Server Actions, React Server Components)
- **Language:** TypeScript 5.x (Strict mode)
- **Styling & Components:** Tailwind CSS, Radix UI Primitives, Lucide React icons
- **Database:** PostgreSQL (with Row-Level Security via Supabase)
- **Data Access:** Supabase Client / Server-side PostgreSQL Client with Zod-validated payloads
- **Internationalization (i18n):** Bilingual Next-intl (English `en` & Bengali `bn`)
- **Mapping & Geo-aggregation:** Leaflet / React-Leaflet with Bangladesh Divisions & Districts GeoJSON
- **Analytics & Charts:** Recharts
- **Storage:** Private Object Storage (S3 / Supabase Storage) with pre-signed tokenized URLs

## 3. Current Architecture
Modular Next.js App Router structure:
```
src/
├── app/                  # Route handlers and bilingual page groups ([locale])
├── components/           # Reusable UI primitives, forms, maps, evidence viewers
│   ├── ui/               # Base design system components
│   ├── forms/            # Multi-step report wizard and search inputs
│   ├── evidence/         # Upload manager, external embed cards (YouTube/FB/Drive)
│   ├── maps/             # Division/District choropleth map
│   └── admin/            # Moderation queues, case review, audit viewer
├── lib/                  # Core domain logic
│   ├── auth/             # Session, RBAC checks, session tokens
│   ├── db/               # Supabase database client and query helpers
│   ├── security/         # URL validators, EXIF cleaner, rate limiter
│   ├── storage/          # Bucket adapters, signed URL generator
│   └── validation/       # Zod schemas for all models and inputs
├── services/             # Business logic layer
│   ├── reports/          # Report submission, tracking code hashing
│   ├── evidence/         # File processing, external link metadata checks
│   ├── moderation/       # Status transitions, internal notes, referrals
│   └── notifications/   # In-app and secure notification dispatchers
├── types/                # Canonical TypeScript interfaces and Enums
└── config/               # System constants, categories, status transitions
```

## 4. Database Architecture
PostgreSQL with explicit relational constraints:
- `reports`: Core case entity storing anonymized or identified submissions, category, location, and tracking hashes.
- `report_categories`: Normalized taxonomy of incident classifications.
- `report_statuses`: Enumerated status workflow values.
- `report_status_history`: Immutable log of every status transition with actor and rationale.
- `evidence`: File uploads and external links with review states (`PENDING`, `ACCESSIBLE`, `REVIEWED`, `ACCEPTED`, `REJECTED`, `UNAVAILABLE`) and visibility scopes (`PRIVATE`, `REVIEWER_ONLY`, `PUBLIC`).
- `organizations`: Educational, governmental, law enforcement, and corporate entities.
- `organization_responses`: Official responses reviewed prior to public display.
- `messages`: Cryptographically partitioned communications between reporter and reviewers.
- `audit_logs`: Immutable, append-only security logs for every administrative/reviewer action.

## 5. Authentication Architecture
- Public reporters can submit **anonymously** without creating any account.
- Reviewers, Senior Reviewers, and Admins authenticate via secure email/password or magic links with mandatory MFA for administrative privileges.
- Anonymous tracking is authenticated via a combination of the public report reference (`BD-2026-XXXXXX`) and a high-entropy secret tracking code (hashed using Argon2/Bcrypt in the database).

## 6. Authorization Model (RBAC)
- **Public Visitor:** Read-only access to published public reports, aggregated statistics, hotlines, and methodology.
- **Reporter:** Read/write access only to their specific report instance via tracking credentials.
- **Reviewer:** Can view assigned reports, review evidence, request additional information, append internal notes, and propose status changes.
- **Senior Reviewer:** Can approve public disclosure, confirm verified findings, resolve escalations, and handle high-sensitivity cases.
- **Administrator:** Full platform operations, user/role management, taxonomy configuration, and audit review.

## 7. Storage Architecture
- Uploaded files are stored in **Private Storage Buckets** (never public buckets).
- Direct access URLs are never exposed. All file views are served via short-lived, signed URLs (TTL: 15–30 minutes) authorized strictly per user role.
- Automatic metadata and EXIF stripping are executed upon upload.
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`, `audio/mpeg`, `audio/wav`, `video/mp4`.

## 8. Evidence System
- **Uploaded Files:** Configurable size ceilings (Images: 10MB, Documents: 20MB, Audio: 30MB, Video: 100MB; max 10 files per report).
- **External Links (Core Feature):** First-class support for YouTube, Facebook public posts, Google Drive, Google Photos, Dropbox, and verified news links.
- URLs are validated against SSRF and malicious protocol schemes (`javascript:`, `data:` disallowed).
- Non-embeddable links display fallback guidance directing reviewers or visitors to open the original source safely with sandbox warnings.

## 9. Report Workflow
Centralized, immutable state machine:
```
SUBMITTED → RECEIVED → UNDER_REVIEW → MORE_INFO_REQUIRED / EVIDENCE_REVIEW → REVIEWED → REFERRED / VERIFIED / UNSUBSTANTIATED → RESOLVED / CLOSED
```

## 10. Current Completed Features
- Initialized clean project repository.
- Master project planning and architectural documentation suite initiated in `/docs`.
- AI handoff documentation created.

## 11. Features Currently Being Developed
- Phase 0: Full architectural specification documents (`ARCHITECTURE.md`, `PRODUCT_SPEC.md`, `DATABASE.md`, `SECURITY.md`, etc.).
- Next: Phase 1 Foundation scaffolding (Next.js, Tailwind, Supabase schema).

## 12. Known Bugs
None (clean repository state).

## 13. Known Technical Debt
None.

## 14. Important Environment Variables
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
TRACKING_CODE_SALT="your-cryptographic-salt"
ENCRYPTION_KEY="32-byte-hex-encryption-key"
NODE_ENV="development"
```

## 15. Important Files
- `docs/AI_CONTEXT.md`: This file.
- `docs/ARCHITECTURE.md`: Technical architectural layout.
- `docs/DATABASE.md`: PostgreSQL schema and DDL definitions.
- `docs/SECURITY.md`: Security controls, threat modeling, and input protection.
- `docs/REPORT_WORKFLOW.md`: Workflow transition logic.
- `docs/EVIDENCE_SYSTEM.md`: Evidence handlers and external URL sandbox.

## 16. Important Database Migrations
- Will reside in `supabase/migrations/` sequentially numbered (`00001_initial_schema.sql`, etc.).

## 17. Important Security Decisions
- Server-side validation of all tracking lookups with strict rate limiting (max 5 failed attempts per IP per 15 minutes).
- Zero IP storage in report records when `privacy_mode = 'anonymous'`.
- SSRF filtering on external URL previews (denying private IP ranges 127.0.0.1, 10.0.0.0/8, 192.168.0.0/16, etc.).
- Row-Level Security (RLS) enabled on all tables by default.

## 18. Design System Rules
- Calm, serious civic tech aesthetic. No flashy gradients, no dark hacker vibes.
- Light-first theme with high accessibility (WCAG AA compliant contrast).
- Clear, distinct status badges with non-color cues (icons + text).
- Responsive mobile-first design for 320px+ viewports.

## 19. API Conventions
- Server Actions for form submissions and mutations.
- REST Route Handlers (`/api/v1/...`) for external integrations, status lookups, and webhook handlers.
- Standardized response envelopes: `{ success: boolean, data?: T, error?: { code: string, message: string } }`.

## 20. Deployment Instructions
- Target runtime: Node.js 20+ / Edge runtime for light endpoints.
- Database: Supabase PostgreSQL instance with connection pooling (PgBouncer).
- Storage: Supabase Storage or S3-compatible private bucket with CORS restricted to domain.

## 21. Testing Instructions
- Unit & Integration: Vitest + React Testing Library.
- Security & Schema: Database test suite validating RLS policies.
- E2E: Playwright testing the anonymous reporting wizard and tracking workflow.

## 22. What NOT to Change
- **Do not bypass the allegation naming standard.** All public listings must use neutral language ("Allegation", "Reported Incident", "Under Review").
- **Do not make uploads public by default.** Uploaded evidence must default to `PRIVATE` or `REVIEWER_ONLY`.
- **Do not invent mock data or fake metrics.** When empty, display clean empty states.
- **Do not hardcode bilingual strings.** Always use translation keys (`i18n`).

## 23. Current TODO List
- [x] Phase 0: Initialize documentation repository and AI context.
- [ ] Phase 0: Complete full architecture specifications in `docs/`.
- [ ] Phase 1: Scaffold Next.js application, TypeScript, Tailwind, i18n, and Supabase migrations.
- [ ] Phase 2: Implement public pages (Homepage, How It Works, Resources, Methodology, Safety).
- [ ] Phase 3: Implement multi-step incident reporting wizard with evidence upload and external link embeds.
- [ ] Phase 4: Implement reviewer and admin moderation portals with audit logs.
- [ ] Phase 5: Implement public reports directory, map, and analytics dashboard.
- [ ] Phase 6: Implement secure two-way messaging and organization responses.
- [ ] Phase 7: Add AI-assisted structuring and translation tools.

## 24. Last Completed Task
Created `docs/README.md` and initial `docs/AI_CONTEXT.md`.

## 25. Recommended Next Task
Write complete specifications for `ARCHITECTURE.md`, `PRODUCT_SPEC.md`, `DATABASE.md`, `SECURITY.md`, `EVIDENCE_SYSTEM.md`, `REPORT_WORKFLOW.md`, `UI_SYSTEM.md`, `DECISIONS.md`, and `DEVELOPMENT_LOG.md`.
