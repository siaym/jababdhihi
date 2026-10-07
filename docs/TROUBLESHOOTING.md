# TROUBLESHOOTING & COMMON OPERATIONAL ISSUES

---

## 1. Development & Runtime Issues

### 1.1 Leaflet Map "Window is not defined" (SSR Issue)
- **Symptom:** Next.js throws `ReferenceError: window is not defined` when rendering `/map` or `MapPanel`.
- **Cause:** Leaflet accesses browser global objects during import, which fails in React Server Components.
- **Solution:** Import the map component dynamically with SSR disabled:
  ```typescript
  import dynamic from 'next/dynamic';
  const MapPanel = dynamic(() => import('@/components/maps/MapPanel'), { ssr: false });
  ```

### 1.2 Bilingual i18n Hydration Mismatches
- **Symptom:** React hydration error: `Text content did not match. Server: "..." Client: "..."`.
- **Cause:** Browser language detection overriding server locale cookie during initial paint.
- **Solution:** Ensure `[locale]` route parameter strictly dictates the active dictionary, and use the official `NextIntlClientProvider` with explicit locale messages.

### 1.3 Supabase RLS Returning Empty Arrays (`[]`) Instead of Errors
- **Symptom:** Querying reports in admin panel returns zero rows without an error message.
- **Cause:** RLS fails silently when the requesting user session does not satisfy the `USING` policy expression.
- **Solution:** Verify the user's role in the `profiles` table. Check whether `auth.uid()` matches and `is_active = true`.

---

## 2. Storage & Evidence Issues

### 2.1 File Upload CORS Error
- **Symptom:** Direct browser upload to Supabase Storage fails with `Access-Control-Allow-Origin` error.
- **Solution:** Configure Supabase bucket CORS policy to explicitly allow the application domain:
  ```json
  [
    {
      "AllowedOrigins": ["http://localhost:3000", "https://your-domain.org"],
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "MaxAgeSeconds": 3600
    }
  ]
  ```

### 2.2 External Link Blocked by SSRF Validator
- **Symptom:** Citizen enters a valid news article URL, but the server rejects it.
- **Cause:** The domain resolved to a CDN IP that collided with a blocked subnet filter, or used an unusual port.
- **Solution:** Ensure standard ports (443 only) and refine subnet exclusion rules to prevent false positives on major CDNs (Cloudflare, Akamai, Fastly).
