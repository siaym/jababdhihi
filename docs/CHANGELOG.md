# CHANGELOG

All notable changes to the Bangladesh Civic Reporting Platform will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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
