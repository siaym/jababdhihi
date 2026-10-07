-- ============================================================================
-- Migration: 00002_storage_and_security.sql
-- Description: Segregated Evidence Storage Buckets, Database Abuse Indexes,
--              and Defensive Platform Security Settings.
-- ============================================================================

-- 1. STORAGE BUCKET SEGREGATION
-- Bucket 1: report-evidence-private (Strictly private vault for citizen evidence uploads)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'report-evidence-private',
    'report-evidence-private',
    false, -- Strictly private
    104857600, -- 100MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'audio/mpeg', 'audio/wav', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket 2: report-evidence-public (Reviewer-approved, scrubbed evidence for public viewing)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'report-evidence-public',
    'report-evidence-public',
    true, -- Public read for approved items
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket 3: report-thumbnails (Optimized, lightweight image thumbnails)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'report-thumbnails',
    'report-thumbnails',
    true, -- Public read
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Reviewers can read private evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'report-evidence-private'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('reviewer', 'senior_reviewer', 'admin')
    )
);

CREATE POLICY "Reviewers can upload internal evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'report-evidence-private'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('reviewer', 'senior_reviewer', 'admin')
    )
);

CREATE POLICY "Public can read approved public evidence"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'report-evidence-public' OR bucket_id = 'report-thumbnails');

CREATE POLICY "Reviewers can publish approved evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    (bucket_id = 'report-evidence-public' OR bucket_id = 'report-thumbnails')
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('reviewer', 'senior_reviewer', 'admin')
    )
);


-- 2. QUERY PERFORMANCE & ANTI-SCRAPING INDEXES
CREATE INDEX IF NOT EXISTS idx_reports_is_public_created
ON reports (is_public, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_division_district
ON reports (division, district)
WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_reports_category_id
ON reports (category_id)
WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_reports_secret_hash
ON reports (tracking_secret_hash);

CREATE INDEX IF NOT EXISTS idx_messages_report_id_created
ON messages (report_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_evidence_report_id
ON evidence (report_id);

CREATE INDEX IF NOT EXISTS idx_report_status_history_report_id
ON report_status_history (report_id, created_at ASC);


-- 3. PLATFORM SECURITY SETTINGS TABLE (Defensive Safe Mode State)
CREATE TABLE IF NOT EXISTS platform_security_settings (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'primary',
    safe_mode_enabled BOOLEAN NOT NULL DEFAULT false,
    safe_mode_reason TEXT,
    activated_at TIMESTAMPTZ,
    activated_by UUID REFERENCES profiles(id),
    allow_identified_only BOOLEAN NOT NULL DEFAULT false,
    require_captcha BOOLEAN NOT NULL DEFAULT false,
    disable_file_uploads BOOLEAN NOT NULL DEFAULT false,
    rate_limit_multiplier NUMERIC(3,1) NOT NULL DEFAULT 1.0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE platform_security_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read security settings (e.g. to display Safe Mode notice)
CREATE POLICY "Public can view platform security status"
ON platform_security_settings FOR SELECT
TO public
USING (true);

-- Only administrators can modify platform security settings
CREATE POLICY "Only admins can modify security settings"
ON platform_security_settings FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Seed initial row
INSERT INTO platform_security_settings (id, safe_mode_enabled, safe_mode_reason)
VALUES ('primary', false, 'Normal operations')
ON CONFLICT (id) DO NOTHING;
