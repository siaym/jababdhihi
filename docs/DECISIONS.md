# ARCHITECTURE DECISION RECORDS (ADR)

---

## ADR-001 — External Evidence Links as a Core Architectural Feature

### Context
Civic reporting platforms in developing countries frequently fail or face massive hosting bills when trying to store, transcode, and stream hours of incident video uploaded directly by citizens. Concurrently, citizens often already share video evidence on social platforms (YouTube, Facebook) or private drives (Google Drive, Dropbox).

### Decision
Treat external evidence links (YouTube, Facebook public posts, Google Drive, Google Photos, Dropbox) as a first-class feature from day one. Do not automatically download or re-host external video files. Store the validated URL, detect provider, extract platform ID, and embed sandboxed players or provide safe external redirects.

### Consequences & Trade-offs
- **Positives:** Drastically lowers server storage costs, reduces bandwidth strain, removes liability for hosting copyrighted/pirated media, scales effortlessly.
- **Trade-offs:** External links may be deleted or made private by third parties. Mitigated by labeling links with review states (`ACCESSIBLE`, `UNAVAILABLE`) and providing a broken link reporting mechanism.

### Date
2026-10-07

---

## ADR-002 — Dual-Key Anonymous Report Tracking Architecture

### Context
Citizens reporting sensitive misconduct need to track case progress and communicate with reviewers without creating an account or providing identifiable contact information.

### Decision
Generate two distinct identifiers upon submission:
1. `report_number`: Public reference code formatted as `BD-YYYY-NNNNNN` (e.g., `BD-2026-001241`).
2. `tracking_secret`: A high-entropy 16-character alphanumeric key (e.g., `k9f2-8mpx-4v7q-z1yt`).
Only the salted cryptographic hash (`Argon2id` / `Bcrypt`) of the tracking secret is stored in the database.

### Consequences & Trade-offs
- **Positives:** Complete cryptographic protection. If the database is compromised, attackers cannot determine tracking secrets to access confidential reports.
- **Trade-offs:** If the citizen loses their secret key, recovery is impossible. The UI must clearly warn the user to save/print their tracking credentials upon submission.

### Date
2026-10-07

---

## ADR-003 — Strict "Allegation-First" Language & Legal Shield

### Context
Publicly accusing individuals or institutions in Bangladesh without formal judicial proceedings poses severe legal liability (defamation suits, Digital Security Act / Cyber Security Act risks) and moral risks of false accusations.

### Decision
The platform enforces neutral, objective civic language across the entire codebase, UI, database, and public catalog:
- "Report" or "Allegation", never "Proven crime" or "Guilty entity".
- Verification states denote that an allegation has met the platform's published evidentiary standard, not a judicial conviction.
- Target institutions are given an official right of reply.

### Consequences & Trade-offs
- **Positives:** Protects the platform legally and ethically; establishes credibility with human rights organizations and public observers.
- **Trade-offs:** Requires thorough moderator education and careful UI phrasing.

### Date
2026-10-07

---

## ADR-004 — Bilingual Parity via Route-Level Internationalization

### Context
Citizens across Bangladesh speak Bengali natively, while international observers, NGOs, and legal agencies require English documentation.

### Decision
Implement bilingual internationalization (`next-intl`) with explicit locale prefixes (`/[locale]/...`). Store all database taxonomy (categories, status descriptions, emergency resources) with both `_bn` and `_en` localized fields.

### Consequences & Trade-offs
- **Positives:** Zero discrimination between languages, clean SEO hreflang tags, seamless switching.
- **Trade-offs:** Requires maintaining dual message bundles for all user interfaces.

### Date
2026-10-07

---

## ADR-005 — PostgreSQL Row-Level Security (RLS) for RBAC Enforcement

### Context
Authorization rules for civic platforms must never rely solely on client-side or application-layer route checks, which can be bypassed via direct API manipulation.

### Decision
Enforce PostgreSQL Row-Level Security (RLS) policies directly in the database. All queries for public users, reporters, reviewers, and admins pass through declarative SQL policies.

### Consequences & Trade-offs
- **Positives:** Robust zero-trust security; impossible for client leaks or code bugs to expose private evidence to unauthenticated users.
- **Trade-offs:** Requires careful policy authoring and query optimization to prevent performance bottlenecks.

### Date
2026-10-07

---

## ADR-006 — Supabase as the Exclusive Primary Backend Platform

### Context
Civic engineering projects require clear, cohesive backend architecture to prevent tech stack fragmentation (e.g., arbitrarily mixing Firebase, MongoDB, custom Node/Express monoliths, or conflicting authentication providers halfway through development).

### Decision
Use **Supabase** as the exclusive primary backend platform for Jababdihi:
1. **Supabase PostgreSQL:** Primary relational database for all structured entities (`reports`, `categories`, `organizations`, `report_status_history`, `evidence`, `messages`, `audit_logs`).
2. **Supabase Auth:** User accounts, Reviewer accounts, Senior Reviewer accounts, Admin sessions, and RBAC.
3. **Supabase Storage:** Private object storage bucket (`evidence-vault`) for uploaded images, short videos, PDFs, and audio, using pre-signed upload tickets and time-limited pre-signed view URLs.
4. **Supabase Row-Level Security (RLS):** Authorization and access boundary enforcement directly in the database.
5. **Realtime:** Subscriptions for live reviewer queue updates and secure case communication.
6. **External Evidence Exception:** External media links (YouTube, Facebook, Google Drive, Dropbox) are stored purely as metadata and URLs in PostgreSQL and embedded directly in the frontend without consuming Supabase Storage bandwidth.

**Rule:** Do not introduce another backend service unless there is a documented technical reason and the decision is formally recorded in `docs/DECISIONS.md`.

### Consequences & Trade-offs
- **Positives:** Unified developer experience, robust database-level security via RLS, built-in connection pooling via PgBouncer, eliminates fragmented microservice maintenance.
- **Trade-offs:** Requires thorough RLS policy authoring and proper service-role key isolation.

### Date
2026-10-07

---

## ADR-007 — Defense-in-Depth Against Coordinated Attacks, Mobile Web Vitals & Safe Mode Architecture

### Context
Jababdihi is a public-interest reporting platform handling sensitive allegations in Bangladesh. Hostile actors (perpetrators, trolls, botnets, or state surveillance) may attempt DDoS floods, automated spam submissions, scraper extraction of the report catalog, malicious file uploads (executables/malware/SVG XSS), or credential takeovers. Simultaneously, the platform serves citizens predominantly on budget Android devices and variable 4G/3G connectivity across Bangladesh.

### Decision
1. **Target Mobile Performance & Core Web Vitals:**
   - Enforce Mobile Lighthouse ≥90, Desktop ≥95.
   - Core Web Vitals: FCP < 1.5s, LCP < 2.5s, INP < 200ms, CLS < 0.1.
   - Lazy load heavy client elements (`HomeMapPanel`, `LatestReportsFeed`) with Next.js dynamic imports and lightweight skeletons.
   - Implement Click-to-Play video facades for YouTube/Drive embeds in `EvidenceCard` (thumbnail poster + play icon; only load iframe upon click).
   - Responsive Next.js Image optimization with responsive `sizes` and modern WebP/AVIF formats.
2. **Defensive Layering (Vercel + Next.js + Supabase):**
   - Vercel Edge / CDN: DDoS filtering, edge rate-limiting, and Bot WAF rules.
   - Next.js Application: Sliding window multi-tier rate limiting (`src/lib/security/rate-limit.ts`), SSRF URL allowlisting (`src/lib/security/ssrf.ts`), file extension & magic-byte validation (`src/lib/security/file-validation.ts`), bounded public queries (`limit <= 50`), and edge caching headers.
   - Supabase: Segregated storage buckets (`report-evidence-private`, `report-evidence-public`, `report-thumbnails`), PostgreSQL RLS, and MFA enforcement on privileged reviewer/admin roles.
3. **Emergency Defensive Safe Mode (`src/lib/security/safe-mode.ts`):**
   - Provide an admin-toggled defensive state that can temporarily pause anonymous submissions, disable direct file uploads, enforce CAPTCHA, and tighten rate limits 4x while keeping public report browsing and case tracking 100% online.
4. **Resilient Local Draft Storage & Offline Handling:**
   - Implement client-side `localStorage` draft auto-save and offline detection in the 5-step reporting wizard, allowing citizens to preserve written testimony during spotty cellular coverage and resume seamlessly.

### Consequences & Trade-offs
- **Positives:** Immune to single points of failure under coordinated traffic attacks; ensures sub-2.5s LCP on budget smartphones across Bangladesh; eliminates accidental SSRF or malicious script uploads.
- **Trade-offs:** Requires careful maintenance of rate limit tier windows and bucket storage policies.

### Date
2026-10-07

