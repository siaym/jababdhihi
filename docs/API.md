# API & SERVER ACTIONS SPECIFICATION

---

## 1. API Architecture Overview

The Bangladesh Civic Reporting Platform employs a hybrid API model:
1. **Next.js Server Actions:** Primary mechanism for first-party web UI interactions (form submissions, status transitions, internal notes). Ensures CSRF protection, typesafe server-client RPC, and minimal network overhead.
2. **REST Route Handlers (`/api/v1/*`):** Provided for tracking queries, evidence upload signing, webhook listeners, and public aggregation endpoints.

---

## 2. Standard Request & Response Envelopes

All REST responses return a standardized JSON structure:

### Success Response:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The incident date cannot be in the future.",
    "details": [
      { "field": "incident_date", "issue": "Invalid date range" }
    ]
  }
}
```

---

## 3. Core API Endpoints

### 3.1 Report Submission & Tracking

#### `POST /api/v1/reports/submit` (or Server Action `submitReportAction`)
- **Access:** Public (Rate-limited: 5 submissions/hr/IP).
- **Payload:**
  ```json
  {
    "category_code": "police",
    "incident_date": "2026-09-15",
    "approximate_time": "14:30",
    "division": "Dhaka",
    "district": "Dhaka",
    "upazila_thana": "Mirpur",
    "location_privacy": "approximate",
    "institution_type": "police",
    "custom_organization_name": "Mirpur Model Thana",
    "involved_role_or_title": "Sub-Inspector",
    "description": "Alleged extortion during vehicle document check...",
    "privacy_mode": "anonymous",
    "evidence_items": [
      {
        "type": "external_link",
        "provider": "youtube",
        "url": "https://www.youtube.com/watch?v=xxxx",
        "caption": "Video recorded by bystander"
      }
    ]
  }
  ```
- **Returns:**
  ```json
  {
    "success": true,
    "data": {
      "report_number": "BD-2026-001241",
      "tracking_secret": "k9f2-8mpx-4v7q-z1yt",
      "status": "submitted",
      "created_at": "2026-10-07T12:00:00Z"
    }
  }
  ```

#### `POST /api/v1/reports/track`
- **Access:** Public (Rate-limited: 5 queries/15m/IP).
- **Payload:** `{ "report_number": "BD-2026-001241", "tracking_secret": "k9f2-8mpx-4v7q-z1yt" }`
- **Returns:** Complete tracking timeline, public status, reviewer messages, and evidence verification state.

---

### 3.2 Evidence Management

#### `POST /api/v1/evidence/upload-ticket`
- **Access:** Public (With active report draft session).
- **Payload:** `{ "file_name": "receipt.pdf", "mime_type": "application/pdf", "file_size": 204800 }`
- **Returns:** `{ "upload_url": "https://storage.supabase.co/...", "storage_path": "cases/temp/...", "expires_in": 300 }`

#### `POST /api/v1/evidence/validate-url`
- **Access:** Public.
- **Payload:** `{ "url": "https://drive.google.com/drive/folders/xxxx" }`
- **Returns:** `{ "provider": "google_drive", "is_embeddable": false, "status": "accessible" }`

---

### 3.3 Public Accountability Data

#### `GET /api/v1/public/reports`
- **Access:** Public.
- **Parameters:** `category`, `division`, `district`, `status`, `from_date`, `to_date`, `page`, `limit`.
- **Returns:** Paginated list of approved public reports with neutral allegation labels.

#### `GET /api/v1/public/map`
- **Access:** Public.
- **Returns:** Aggregated counts per Division and District. Does not return individual incident records to protect victim privacy.

#### `GET /api/v1/public/stats`
- **Access:** Public.
- **Returns:** Total reports received, verified count, referred count, resolved count, and monthly intake volumes.
