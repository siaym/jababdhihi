# EVIDENCE SUBSYSTEM SPECIFICATION

---

## 1. Core Philosophy: Uploads vs. External Evidence

A major vulnerability of civic reporting platforms is becoming bloated, cost-prohibitive video hosting services or facing server downtime due to massive media ingestion. 

To solve this, the Bangladesh Civic Reporting Platform establishes **External Evidence Links as a first-class citizen alongside direct file uploads**:
1. **Direct Uploads:** Reserved for original documents (PDF, notices, medical reports, receipts), original photographs, and short direct recordings.
2. **External Evidence Links:** Primary channel for video footage and heavy media already hosted on YouTube, Facebook public posts, Google Drive, Google Photos, Dropbox, or reported in credible news outlets.

---

## 2. Supported Evidence Providers & Embed Capabilities

| Provider | Embed Type | Sandboxing & Security | Fallback Behavior |
| :--- | :--- | :--- | :--- |
| **YouTube** | Sandboxed `iframe` (`youtube-nocookie.com`) | `allow-scripts allow-same-origin` (no popups) | Direct link with warning button `[ Open Original ↗ ]` |
| **Facebook** | Sandboxed Post/Video Plugin | Sandboxed client render with referrer privacy | "Facebook post requires login or may be private. [ Open Original ↗ ]" |
| **Google Drive** | Sandboxed Google Docs Viewer / Preview | Restricted iframe or preview card | "Google Drive access requires permission. [ Open Original ↗ ]" |
| **Google Photos**| Shared album / photo card | Read-only image card or direct link | Link with safety notice |
| **Dropbox** | Dropbox embed widget / shared link | Restrained iframe / file preview | Link to external Dropbox folder |
| **Verified News URL**| OpenGraph card (Title, publisher, date) | No raw iframes; safe parsed metadata | Card with source credibility disclaimer |
| **General Public URL**| Non-embeddable resource link | Sanitized URL link card | "This source cannot be embedded. Open original source." |

---

## 3. Evidence Lifecycle States

Every evidence item—whether direct upload or external link—is tracked through two state dimensions:

### 3.1 Review States (`review_state`)
- `PENDING`: Newly submitted; awaiting reviewer inspection.
- `ACCESSIBLE`: Reviewer confirmed link is live or file is readable.
- `REVIEWED`: Reviewer analyzed the contents and took notes.
- `ACCEPTED`: Authenticated as relevant and credible evidence for the case.
- `REJECTED`: Found to be irrelevant, fabricated, spam, or infringing privacy.
- `UNAVAILABLE`: External link was deleted, made private, or direct file corrupted.

### 3.2 Visibility States (`visibility`)
- `PRIVATE`: Visible strictly to the assigned reviewers and system administrators.
- `REVIEWER_ONLY`: Available across reviewer staff for case deliberation; never public.
- `PUBLIC`: Explicitly approved for display on the public case profile (`/reports/[id]`).

---

## 4. External Evidence Card UI Specifications

### 4.1 Embeddable Provider (e.g., YouTube)
```
┌─────────────────────────────────────────────────────────────┐
│ 🎬 VIDEO EVIDENCE                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │              [ Embedded YouTube Player ]                │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Source: YouTube | Status: Verified Accessible               │
│ Caption: Incident footage from outside faculty building     │
│                                                             │
│ [ Open Original Source ↗ ]  [ Report Broken Link ⚠ ]        │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Non-Embeddable / External Source Notice
```
┌─────────────────────────────────────────────────────────────┐
│ 🔗 EXTERNAL DOCUMENT / LINK EVIDENCE                        │
│ Provider: Google Drive Shared Folder                        │
│ Description: Supplementary medical admission receipt        │
│                                                             │
│ ℹ️ This external source cannot be embedded directly.        │
│ External content can disappear, become private, or change.  │
│                                                             │
│ [ Open Original Source Safely ↗ ]                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Security & SSRF Prevention for External Links

1. **Protocol Restriction:** Only `https://` URLs are accepted. `http://`, `ftp://`, `file://`, `javascript:`, and `data:` schemes are rejected instantly.
2. **DNS & IP Filtering:** Before fetching metadata (e.g., title or OpenGraph image), the server resolves the target hostname and rejects loopback (`127.0.0.1`), link-local (`169.254.x.x`), and private RFC 1918 subnets.
3. **No Automatic Mirroring:** The platform does **NOT** download third-party videos onto local servers to prevent copyright infringement and storage abuse.
4. **Link Freshness Verification:** Reviewers have a 1-click **"Check Availability"** button in their moderation panel to ping headers (`HEAD` request) and flag dead links as `UNAVAILABLE`.
