# EXTERNAL EVIDENCE LINKS ARCHITECTURE

---

## 1. Purpose & Strategy

Jababdihi does not attempt to be a massive video re-hosting or trans-coding platform. Instead, external evidence links (YouTube, Facebook public posts, Google Drive, Google Photos, Dropbox) serve as a first-class feature:
1. **Zero Storage Drain:** Users submit URLs of existing uploaded files, bypassing heavy video uploads.
2. **Platform Embeds:** Embeddable providers are displayed via sandboxed iframes.
3. **Safe Redirections:** Non-embeddable links provide prominent "Open Original ↗" buttons with integrity warnings.

---

## 2. Supported External Providers

| Provider | Supported Formats | Embed Behavior | Fallback / Warning |
| :--- | :--- | :--- | :--- |
| **YouTube** | Standard (`watch?v=`), Short (`youtu.be/`), Shorts | Sandboxed `youtube-nocookie.com/embed/{id}` | Direct link with disclaimer |
| **Facebook** | Public posts, videos, Reels | Sandboxed post widget | "Post may be private or deleted. Open original source." |
| **Google Drive**| Public file share links | `drive.google.com/file/d/{id}/preview` | Direct link with permissions warning |
| **Google Photos**| Shared album / photo link | Card with shared album metadata | Open Original Source |
| **Dropbox** | Shared file / folder link | Sandboxed preview widget | Open Original Source |
| **Public News**| Credible news article links | OpenGraph citation card | Source credibility disclaimer |

---

## 3. Security & SSRF Safeguards

All external URLs pass through `analyzeExternalUrl()`:
1. **HTTPS Only:** Disallows `http:`, `javascript:`, `data:`, `file:`.
2. **Private IP Filtering:** Rejects `localhost`, `127.0.0.1`, RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and AWS metadata (`169.254.169.254`).
3. **Sandbox Attributes:** Embedded iframes specify `sandbox="allow-scripts allow-same-origin allow-presentation"` without `allow-top-navigation`.
