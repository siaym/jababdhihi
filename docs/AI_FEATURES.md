# ARTIFICIAL INTELLIGENCE ASSISTANT & ETHICAL BOUNDARIES

---

## 1. Ethical Red Lines for Artificial Intelligence

The Bangladesh Civic Reporting Platform enforces strict ethical constraints on all machine learning and AI capabilities:

> 🛑 **NON-NEGOTIABLE AI BOUNDARIES:**
> 1. AI must **NEVER** determine whether an accusation is factually true or false.
> 2. AI must **NEVER** automatically declare any individual, official, or institution guilty of misconduct.
> 3. AI must **NEVER** automatically approve reports for public release without human review.
> 4. AI must **NEVER** modify citizen narratives or delete evidence.

**Human review by qualified reviewers remains solely and strictly authoritative.**

---

## 2. Permitted AI Assistant Functions

AI functions strictly as an administrative assistant to reduce friction for citizens and reviewers:

### 2.1 Report Structuring & Drafting Assistant
- **Purpose:** Converts emotional, unstructured citizen narratives into clear, chronological summaries to aid investigation.
- **Workflow:** The raw narrative is preserved in `description`. The AI assists the citizen by suggesting:
  - Incident Date/Time estimation
  - Key sequence of events
  - Involved institutional roles
- The citizen must review and confirm all structured suggestions before submission.

### 2.2 Missing-Information Detection (Real-Time Feedback)
- While the citizen writes, the client runs lightweight heuristics to identify gaps that might delay review:
  - *"Did you mention the approximate time or location?"*
  - *"Are there documents, screenshots, or receipts available?"*
  - *"Were any independent witnesses present?"*

### 2.3 Bilingual Translation Assistance (বাংলা ↔ English)
- Translates public summaries and incident categories between Bengali and English to ensure equal accessibility across communities and international legal observers.
- All AI translations are marked with: `[ Translated with AI assistance — Original in Bengali ]`.

### 2.4 Duplicate & Related Case Cluster Detection
- Computes text and metadata embeddings (via OpenAI / local model) on incoming cases.
- Alerts reviewers: *"Potential duplicate or related cluster: Case BD-2026-000843 also alleges extortion at Mirpur BRTA on the same day."*
- Enables reviewers to connect separate citizen reports into a cohesive case dossier.

### 2.5 Moderation & Content Safety Flagging
- Flags potential PII leaks (e.g., exposed national ID numbers, private phone numbers, minor names) so moderators can redact them before any public release.
- Flags abusive spam, hate speech, or targeted revenge content for rapid triage.
