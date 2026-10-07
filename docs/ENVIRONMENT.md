# ENVIRONMENT CONFIGURATION SPECIFICATION

---

## 1. Environment Variables Schema

All required environment variables must be populated in `.env.local` for local development and in the hosting dashboard for production deployment.

```bash
# ==============================================================================
# APPLICATION & HOSTING CONFIGURATION
# ==============================================================================
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_DEFAULT_LOCALE="bn"

# ==============================================================================
# SUPABASE & DATABASE CONFIGURATION
# ==============================================================================
# Public client URL and anonymous API key (safe for browser)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Server-only elevated key (NEVER expose to browser / client bundles)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Direct PostgreSQL connection string for Prisma / Drizzle / migrations
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres?sslmode=require"

# ==============================================================================
# SECURITY & CRYPTOGRAPHY
# ==============================================================================
# 32-character secret salt used when hashing report tracking passkeys
TRACKING_CODE_SALT="b9c7482f56194e82b79316d20f92d471"

# 256-bit encryption key (64 hex characters) for AES-256-GCM contact encryption
CONTACT_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# ==============================================================================
# OBJECT STORAGE LIMITS (CONFIGURABLE CEILINGS)
# ==============================================================================
NEXT_PUBLIC_MAX_FILES_PER_REPORT=10
STORAGE_MAX_IMAGE_MB=10
STORAGE_MAX_DOC_MB=20
STORAGE_MAX_AUDIO_MB=30
STORAGE_MAX_VIDEO_MB=100

# ==============================================================================
# EXTERNAL EMBEDS & SSRF ALLOWLIST
# ==============================================================================
ALLOWED_EMBED_DOMAINS="youtube.com,youtu.be,facebook.com,fb.watch,drive.google.com,photos.google.com,dropbox.com"

# ==============================================================================
# RATE LIMITING & SECURITY THRESHOLDS
# ==============================================================================
RATE_LIMIT_SUBMIT_PER_HOUR=5
RATE_LIMIT_TRACK_PER_15MIN=5
```

---

## 2. Local Development Setup Protocol

```bash
# 1. Clone repository & install dependencies
git clone <repo-url>
cd "abuse in bd"
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Initialize Supabase local or connect remote instance
npx supabase start
# or apply migrations to remote
npx supabase db push

# 4. Start local development server
npm run dev

# 5. Open in browser
# http://localhost:3000
```
