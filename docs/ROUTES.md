# APPLICATION ROUTE DIRECTORY

---

## 1. Public Routes

| Route | Name / Component | Purpose | Access |
| :--- | :--- | :--- | :--- |
| `/` | Homepage | Visual hero, recent reports floating card, 9 categories, map overview, latest reports | Public |
| `/reports` | Reports Catalog | Search and multi-facet filtering of public allegations | Public |
| `/reports/[id]` | Public Report Detail | Verified dossier, public evidence, institution response | Public |
| `/report` | Incident Wizard | 5-step incident documentation wizard | Public |
| `/track` | Case Tracking Portal | Dual-key tracking, progression timeline, 2-way reviewer messaging | Public (Secret Key) |
| `/map` | Geographic Map | Aggregated division and district report clusters | Public |
| `/dashboard` | Transparency Dashboard | Real-time accountability analytics and resolution rates | Public |
| `/organizations`| Institution Directory | Tracking allegations across universities, police, government | Public |
| `/resources` | Support Directory | Emergency hotlines (999, 109, 333, 106) and legal aid NGOs | Public |
| `/how-it-works` | Process Guide | 6-step reporting and verification pipeline explanation | Public |
| `/methodology` | Evidentiary Standards | Published verification criteria and legal neutrality notice | Public |
| `/safety` | Safety Center | Personal protection directives and evidence preservation | Public |

---

## 2. Reviewer & Administrative Routes

| Route | Name / Component | Purpose | Access |
| :--- | :--- | :--- | :--- |
| `/admin` | Reviewer Queue | Triage queue across all case statuses with priority filters | Reviewer / Admin |
| `/admin/reports/[id]` | Case Review Dossier | Moderation workspace, evidence inspection, secret internal notes | Reviewer / Admin |
| `/api/v1/reports` | Report Ingestion API | REST endpoint for report submissions | Public (Rate Limited) |
| `/api/v1/evidence`| Evidence Ticket API | Pre-signed URL ticket generator for storage uploads | Authenticated / Draft |
