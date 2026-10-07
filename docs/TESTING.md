# TESTING PROTOCOL & QUALITY ASSURANCE SPECIFICATION

---

## 1. Quality Assurance Strategy

Given the legal, security, and human rights impact of the platform, testing focuses heavily on **data isolation, anonymity verification, and access boundaries**.

| Testing Level | Scope | Tools |
| :--- | :--- | :--- |
| **Unit Testing** | Form validation schemas, cryptographic token generators, SSRF filters, i18n dictionaries. | Vitest |
| **Integration Testing**| Report submission Server Actions, status transitions, tracking code authentication. | Vitest + Supabase Local Emulator |
| **Security Testing** | RLS policy enforcement, anonymous mode IP stripping, unauthorized reviewer route access. | Custom SQL / Jest RLS suite |
| **End-to-End (E2E)** | Citizen reporting wizard flow, tracking portal review, reviewer moderation actions. | Playwright |

---

## 2. Core Test Suites

### 2.1 Anonymity & Privacy Verification
- **Test Case SEC-01:** When a report is submitted in `anonymous` mode, assert that:
  - `reporter_name`, `encrypted_phone`, and `encrypted_email` in the database are strictly `NULL`.
  - No client IP is written to `reports` or `audit_logs`.
  - EXIF tags (GPS, camera model) are stripped from uploaded sample images.

### 2.2 Tracking Credential Security
- **Test Case TRK-01:** Assert that tracking tokens cannot be retrieved via raw database queries (stored only as Argon2/Bcrypt hash).
- **Test Case TRK-02:** Assert that entering an invalid tracking code 5 consecutive times triggers an HTTP 429 rate limit response.

### 2.3 Row-Level Security (RLS) Policies
- **Test Case RLS-01:** An unauthenticated visitor querying `reports` receives only rows where `is_public = true`.
- **Test Case RLS-02:** A reviewer assigned to Case A cannot view private files belonging to Case B if restricted.
- **Test Case RLS-03:** Direct HTTP requests attempting to `UPDATE` or `DELETE` rows in `audit_logs` fail with a PostgreSQL permission error.

### 2.4 Evidence & External Links
- **Test Case EVD-01:** Submitting an executable file disguised as `.png` fails MIME magic byte inspection.
- **Test Case EVD-02:** Submitting an internal IP (`https://169.254.169.254/latest/meta-data`) as an external link fails with SSRF validation error.
- **Test Case EVD-03:** Valid YouTube URLs correctly parse the video ID and render sandboxed embed code.
- **Test Case EVD-04:** Invalid or private links display the non-embeddable fallback warning.

---

## 3. Running Test Commands

```bash
# Run unit & integration tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run RLS security test suite
npm run test:security

# Run Playwright E2E tests
npm run test:e2e
```
