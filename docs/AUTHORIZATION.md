# AUTHORIZATION & ROLE-BASED ACCESS CONTROL (RBAC)

---

## 1. Role Taxonomy

The platform enforces five distinct roles with progressive privileges:

```
[public_visitor]
       │
       ▼
  [reporter] ─── (Scoped to single report instance via tracking secret)
       │
       ▼
  [reviewer] ─── (Access to assigned cases, evidence evaluation, internal notes)
       │
       ▼
[senior_reviewer] ─ (Escalated cases, verify findings, approve publication)
       │
       ▼
   [admin] ───── (Full platform administration, user management, audit logs)
```

---

## 2. Granular Permissions Matrix

| Permission Code | Description | Public | Reporter | Reviewer | Sr. Reviewer | Admin |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `reports:public_view` | Read approved public case summaries | ✅ | ✅ | ✅ | ✅ | ✅ |
| `reports:submit` | Submit a new incident report | ✅ | ✅ | ✅ | ✅ | ✅ |
| `reports:track_own` | Query and track submitted case via secret key | ❌ | ✅ | ❌ | ❌ | ❌ |
| `reports:view_all` | Browse all incoming allegations | ❌ | ❌ | ✅ | ✅ | ✅ |
| `reports:assign` | Assign reports to specific reviewers | ❌ | ❌ | ❌ | ✅ | ✅ |
| `reports:update_status`| Move case status across workflow states | ❌ | ❌ | Limited | ✅ | ✅ |
| `reports:publish` | Approve case for public map and catalog | ❌ | ❌ | ❌ | ✅ | ✅ |
| `reports:verify` | Mark case allegation as verified | ❌ | ❌ | ❌ | ✅ | ✅ |
| `evidence:view_private`| Inspect unvetted raw uploaded evidence | ❌ | ❌ | ✅ | ✅ | ✅ |
| `evidence:review` | Mark evidence as reviewed/accepted/rejected | ❌ | ❌ | ✅ | ✅ | ✅ |
| `notes:manage` | Read and append internal moderator notes | ❌ | ❌ | ✅ | ✅ | ✅ |
| `messages:case_chat` | Communicate via two-way secure case thread | ❌ | ✅ | ✅ | ✅ | ✅ |
| `referrals:create` | Refer case to external NGO/human rights agency | ❌ | ❌ | ✅ | ✅ | ✅ |
| `org_response:review` | Review and publish official institution reply | ❌ | ❌ | ❌ | ✅ | ✅ |
| `audit:read` | Inspect system-wide immutable audit trail | ❌ | ❌ | ❌ | ❌ | ✅ |
| `users:manage` | Invite, activate, or revoke staff reviewer accounts | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. Next.js Route Guard Architecture

Middleware (`src/middleware.ts`) protects sensitive paths using role-verified session tokens:

```typescript
// Architectural Rule: Path protection matrix
export const ROUTE_PERMISSIONS = {
  '/admin/audit': ['admin'],
  '/admin/users': ['admin'],
  '/admin/settings': ['admin'],
  '/admin/escalations': ['senior_reviewer', 'admin'],
  '/admin/verify': ['senior_reviewer', 'admin'],
  '/admin/reports': ['reviewer', 'senior_reviewer', 'admin'],
  '/admin': ['reviewer', 'senior_reviewer', 'admin'],
};
```

---

## 4. PostgreSQL Row-Level Security Implementation

All Supabase tables have RLS enabled by default:
```sql
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporter_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### Reporter Contacts Protection:
Reporter contact details are restricted strictly to Senior Reviewers and Admins:
```sql
CREATE POLICY "Senior staff can view confidential reporter contact"
ON reporter_contacts FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('senior_reviewer', 'admin')
        AND profiles.is_active = true
    )
);
```

### Audit Log Append-Only Protection:
No user—not even an Administrator—can update or delete records from `audit_logs`:
```sql
CREATE POLICY "Audit logs insert only"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Disallow UPDATE and DELETE on audit_logs completely
REVOKE UPDATE, DELETE ON audit_logs FROM authenticated, anon, public;
```
