# DEPLOYMENT & INFRASTRUCTURE SPECIFICATION

---

## 1. Production Architecture Overview

The production deployment consists of:
1. **Edge & Compute Tier:** Vercel or Containerized Node.js cluster (behind Cloudflare WAF).
2. **Database Tier:** Managed PostgreSQL (Supabase) with PgBouncer connection pooling.
3. **Storage Tier:** Supabase Storage / AWS S3 private buckets with pre-signed URL generation.
4. **Security Proxy:** Cloudflare with Strict SSL, DDoS mitigation, and WAF rules blocking known botnets.

---

## 2. Supabase Provisioning Checklist

1. **Create Project:** Provision a new Supabase project in the nearest region (e.g., Singapore `ap-southeast-1` or India `ap-south-1` for optimal latency from Bangladesh).
2. **Apply Migrations:**
   ```bash
   npx supabase db push
   ```
3. **Configure Storage Buckets:**
   - Create bucket `evidence-vault` (Private, size limit 100MB).
   - Set up bucket policies allowing authenticated service-role writes and pre-signed read access.
4. **Enable Database Extension:**
   - `pgcrypto` (for UUID and cryptographic hash generation).

---

## 3. Vercel Deployment Checklist

1. Connect Git repository to Vercel.
2. Configure build command: `npm run build`.
3. Set all environment variables defined in [`ENVIRONMENT.md`](./ENVIRONMENT.md).
4. Configure Custom Domain:
   - Ensure DNS is proxied through Cloudflare with TLS 1.3 Strict Mode.
   - Set up CAA records and DNSSEC.

---

## 4. Production Health Checks & Monitoring

- **Health Check Endpoint:** `GET /api/health` returns `{ "status": "ok", "db": "healthy", "storage": "healthy" }`.
- **Error Tracking:** Sentry integration for real-time unhandled exception alerts with strict PII scrubbing.
