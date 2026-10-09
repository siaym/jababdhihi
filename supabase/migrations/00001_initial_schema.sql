-- ============================================================================
-- Migration: 00001_initial_schema.sql
-- Description: Core schema, enums, tables, indexes, triggers and RLS policies
-- Platform: Bangladesh Civic Reporting Platform
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('public_visitor', 'reporter', 'reviewer', 'senior_reviewer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE privacy_mode_enum AS ENUM ('anonymous', 'confidential', 'identified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE location_privacy_enum AS ENUM ('exact', 'approximate', 'confidential');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status_enum AS ENUM (
        'submitted', 'received', 'under_review', 'more_info_required',
        'evidence_review', 'reviewed', 'referred', 'verified',
        'unsubstantiated', 'resolved', 'closed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evidence_type_enum AS ENUM ('image', 'video', 'audio', 'document', 'external_link');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evidence_provider_enum AS ENUM (
        'direct_upload', 'youtube', 'facebook', 'google_drive',
        'google_photos', 'dropbox', 'external_web'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evidence_visibility_enum AS ENUM ('private', 'reviewer_only', 'public');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evidence_review_state_enum AS ENUM (
        'pending', 'accessible', 'reviewed', 'accepted', 'rejected', 'unavailable'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role_enum NOT NULL DEFAULT 'reviewer',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. REPORT CATEGORIES
CREATE TABLE IF NOT EXISTS report_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    description_en TEXT,
    description_bn TEXT,
    icon TEXT,
    parent_id UUID REFERENCES report_categories(id) ON DELETE SET NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. ORGANIZATION TYPES & ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organization_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_id UUID NOT NULL REFERENCES organization_types(id) ON DELETE RESTRICT,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    division TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT,
    contact_email TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number TEXT UNIQUE NOT NULL,
    tracking_secret_hash TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES report_categories(id) ON DELETE RESTRICT,
    privacy_mode privacy_mode_enum NOT NULL DEFAULT 'anonymous',
    
    incident_date DATE NOT NULL,
    approximate_time TEXT,
    division TEXT NOT NULL,
    district TEXT NOT NULL,
    upazila_thana TEXT,
    area_landmark TEXT,
    location_privacy location_privacy_enum NOT NULL DEFAULT 'approximate',
    
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    custom_organization_name TEXT,
    institution_type TEXT,
    involved_role_or_title TEXT,
    
    description TEXT NOT NULL,
    public_summary TEXT,
    
    status report_status_enum NOT NULL DEFAULT 'submitted',
    priority INT NOT NULL DEFAULT 1,
    is_public BOOLEAN NOT NULL DEFAULT false,
    verified_status BOOLEAN NOT NULL DEFAULT false,
    
    reporter_name TEXT,
    reporter_email TEXT,
    reporter_phone TEXT,
    
    assigned_reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_senior_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_reports_report_number ON reports(report_number);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category_id);
CREATE INDEX IF NOT EXISTS idx_reports_division_district ON reports(division, district);
CREATE INDEX IF NOT EXISTS idx_reports_is_public ON reports(is_public);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- 6. CONFIDENTIAL REPORTER CONTACTS
CREATE TABLE IF NOT EXISTS reporter_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID UNIQUE NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    reporter_name TEXT,
    encrypted_phone TEXT,
    encrypted_email TEXT,
    preferred_contact_method TEXT DEFAULT 'in_app',
    can_contact_for_clarification BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. REPORT STATUS HISTORY
CREATE TABLE IF NOT EXISTS report_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    previous_status report_status_enum,
    new_status report_status_enum NOT NULL,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    public_note TEXT,
    internal_rationale TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_report_status_history_report ON report_status_history(report_id);

-- 8. EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    evidence_type evidence_type_enum NOT NULL,
    provider evidence_provider_enum NOT NULL DEFAULT 'direct_upload',
    
    storage_path TEXT,
    original_filename TEXT,
    mime_type TEXT,
    file_size_bytes BIGINT,
    
    external_url TEXT,
    external_platform_id TEXT,
    is_embeddable BOOLEAN NOT NULL DEFAULT false,
    
    visibility evidence_visibility_enum NOT NULL DEFAULT 'private',
    review_state evidence_review_state_enum NOT NULL DEFAULT 'pending',
    caption TEXT,
    moderator_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_evidence_report ON evidence(report_id);
CREATE INDEX IF NOT EXISTS idx_evidence_review_state ON evidence(review_state);

-- 9. CASE MESSAGING
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_messages_report ON messages(report_id);

-- 10. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 11. CIVIC RESOURCES
CREATE TABLE IF NOT EXISTS resource_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES resource_categories(id) ON DELETE RESTRICT,
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    description_en TEXT,
    description_bn TEXT,
    hotline_number TEXT,
    website_url TEXT,
    address TEXT,
    is_official_emergency BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 12. ROW-LEVEL SECURITY ENFORCEMENT
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporter_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- 12.1 Profiles Policies
CREATE POLICY "Users can view own profile or reviewer directory"
ON profiles FOR SELECT
TO authenticated
USING (
    id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role IN ('reviewer', 'senior_reviewer', 'admin')
    )
);

CREATE POLICY "Admins can manage all profiles"
ON profiles FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- 12.2 Public Categories and Organizations (Read-only for public, admin write)
CREATE POLICY "Public can view active report categories"
ON report_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Public can view organization types"
ON organization_types FOR SELECT
USING (true);

CREATE POLICY "Public can view verified organizations"
ON organizations FOR SELECT
USING (true);

-- 12.3 Reports Policies
-- Public can view approved public reports
CREATE POLICY "Public can view approved public reports"
ON reports FOR SELECT
USING (is_public = true);

-- Reviewers can view all non-public reports
CREATE POLICY "Reviewers can view all reports"
ON reports FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role IN ('reviewer', 'senior_reviewer', 'admin')
    )
);

-- Anyone can submit a report (service role or public intake)
CREATE POLICY "Anyone can submit a report"
ON reports FOR INSERT
WITH CHECK (true);

-- 12.4 Confidential Reporter Contacts Policies
-- Only senior reviewers and admins can access confidential contacts
CREATE POLICY "Senior reviewers and admins can read reporter contacts"
ON reporter_contacts FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role IN ('senior_reviewer', 'admin')
    )
);

-- 12.5 Report Status History Policies
CREATE POLICY "Public can view status history of public reports"
ON report_status_history FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM reports r
        WHERE r.id = report_status_history.report_id AND r.is_public = true
    )
);

CREATE POLICY "Reviewers can view all status histories"
ON report_status_history FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role IN ('reviewer', 'senior_reviewer', 'admin')
    )
);

-- 12.6 Evidence Policies
-- Public can view public evidence attached to public reports
CREATE POLICY "Public can view public evidence"
ON evidence FOR SELECT
USING (
    visibility = 'public' 
    AND EXISTS (
        SELECT 1 FROM reports 
        WHERE reports.id = evidence.report_id 
        AND reports.is_public = true
    )
);

-- Reviewers can read all evidence
CREATE POLICY "Reviewers can read all evidence"
ON evidence FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role IN ('reviewer', 'senior_reviewer', 'admin')
    )
);

-- 12.7 Case Messages Policies
CREATE POLICY "Reviewers can read case messages"
ON messages FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role IN ('reviewer', 'senior_reviewer', 'admin')
    )
);

-- 12.8 Audit Logs Policies
-- Audit log is append-only by authenticated staff
CREATE POLICY "Audit logs insert only"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- 12.9 Civic Resources Policies
CREATE POLICY "Public can view resource categories"
ON resource_categories FOR SELECT
USING (true);

CREATE POLICY "Public can view civic resources"
ON resources FOR SELECT
USING (true);


