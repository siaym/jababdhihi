# CONTRIBUTING GUIDELINES & CODE OF CONDUCT

---

## 1. Guiding Principles

Contributors to the Bangladesh Civic Reporting Platform work under a strict civic commitment:
- **Protect citizen safety above all else.**
- **Never commit code that weakens anonymity or exposes PII.**
- **Adhere to bilingual parity:** Every user-facing UI change must include both Bengali (`bn`) and English (`en`) translation keys.
- **Never bypass Row-Level Security (RLS) or write raw SQL injections.**

---

## 2. Commit Message Standards

We follow the Conventional Commits standard:
- `feat(reports): add location privacy selector to step 2`
- `fix(evidence): sanitize EXIF data before storage write`
- `security(tracking): implement rate limiter on passkey verification`
- `i18n(bangla): add translations for police misconduct subcategories`
- `docs(adr): record decision on external video embed sandboxing`

---

## 3. Pull Request Workflow

1. Fork the repository and create a feature branch (`git checkout -b feat/evidence-uploader`).
2. Run test suites (`npm run test && npm run test:security`).
3. Verify TypeScript compiles cleanly (`npm run build`).
4. Update relevant documentation in `/docs` if architecture, database schema, or APIs are modified.
5. Record your session progress in `docs/DEVELOPMENT_LOG.md`.
6. Submit a Pull Request with a clear description and testing proof.

---

## 4. Responsible Vulnerability Disclosure

If you discover a security vulnerability (especially regarding reporter de-anonymization, SSRF, or RLS bypass), **DO NOT create a public GitHub issue**. Email the security team directly at `security@civic-bd.org` with reproduction details.
