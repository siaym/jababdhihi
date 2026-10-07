# MODERATION & REVIEWER WORKSPACE SPECIFICATION

---

## 1. Moderation Principles & Neutrality Standard

Moderators and reviewers on the Bangladesh Civic Reporting Platform act as objective evidentiary curators, **not judges, law enforcement officers, or public prosecutors**.

### Core Guidelines:
1. **Presumption of Unverified Allegation:** No report is considered an established fact upon receipt.
2. **Strict Privacy Shield:** Never publish personal identifying details (home addresses, phone numbers, victim names, hostel room numbers) without explicit senior review and verified consent.
3. **Internal vs Public Segregation:** Moderator deliberations, investigative doubts, and internal reviewer notes must **NEVER** leak to the citizen tracking page or public reports catalog.
4. **Institutional Right of Reply:** Target organizations are granted an official avenue to provide formal responses, which are reviewed and attached to the public case record.

---

## 2. Reviewer Workspace Interface Layout (`/admin/reports/[id]`)

```
┌────────────────────────────────────────────────────────────────────────┐
│ CASE BD-2026-001241                                  [ Status: UNDER_REVIEW ] │
│ Priority: HIGH | Category: Police Misconduct | Division: Dhaka (Mirpur)│
├──────────────────────────────────┬─────────────────────────────────────┤
│ 📋 INCIDENT DOSSIER              │ 🛡️ MODERATION CONTROLS              │
│                                  │                                     │
│ Date: 2026-09-14                 │ Actions:                            │
│ Entity: Mirpur Model Thana       │ [ Assign Reviewer ▾ ]               │
│ Role: Sub-Inspector (Duty Desk)  │ [ Request Clarification From User ] │
│ Privacy Mode: Anonymous          │ [ Refer to Legal/NGO Agency ▾ ]     │
│                                  │ [ Approve Public Summary ]          │
│ Citizen Narrative:               │ [ Change Workflow Status ▾ ]        │
│ "On September 14 around 8 PM..." ├─────────────────────────────────────┤
│                                  │ 📝 INTERNAL REVIEWER NOTES (SECRET) │
│                                  │ • S. Ahmed (2026-09-15):           │
│                                  │   "Verified GD copy. Date matches   │
│                                  │    duty register. Need video check."│
├──────────────────────────────────┼─────────────────────────────────────┤
│ 📎 EVIDENCE DOSSIER              │ 💬 CITIZEN MESSAGING CHANNEL        │
│ • [IMG] Scan of GD/Notice (PDF)  │ Reviewer: "Could you confirm exact  │
│   Status: ACCEPTED (Private)     │            thana room or desk?"     │
│ • [YOUTUBE] Incident Clip        │ Citizen: "It was counter 3."        │
│   Status: ACCESSIBLE (Embed OK)  │ [ Send Message to Citizen ]         │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 3. The 4-Tier Evidentiary Verification Standard

To achieve `VERIFIED` status, an allegation must meet rigorous standards:

| Verification Tier | Required Evidence Level | Typical Documentation |
| :--- | :--- | :--- |
| **Tier 1: Documented Evidence** | Official records, written notices, stamped receipts, authenticated audio/video. | Stamped government receipt, FIR/GD filing copy, official letterhead termination notice. |
| **Tier 2: Corroborated Eyewitness** | Multiple independent testimonies without personal conflicts of interest. | Consistent statements from multiple students/colleagues. |
| **Tier 3: Digital Multi-Source** | Video footage with verifiable timestamps, geo-metadata, or independent news reports. | Public CCTV footage, viral verified video with matched landmarks. |
| **Tier 4: Official Acknowledgement** | Written acknowledgement or investigation launched by the target entity. | Press release from university proctor office or police media wing. |

If a case does not reach Tier 1–3, it remains in `REVIEWED` or transitions to `UNSUBSTANTIATED`.

---

## 4. Organization Right-of-Reply Pipeline

When an institution (e.g., University Proctor, Company HR, Police Division) submits an official response:
1. Institution verifies authority via official domain email or signed letter.
2. Statement is held in `organization_responses` (`is_approved_public = false`).
3. Senior Reviewer audits the text for threatening language or doxxing.
4. Once approved, the statement appears directly on the public report page under **"Official Response from [Entity]"**.
