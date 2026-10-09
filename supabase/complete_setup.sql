-- ============================================================================
-- Jababdihi (জবাবদিহি) - Complete Supabase Database Setup & Seed
-- Run this entire script in the Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/svgjhkvjgworkscuymgz/sql/new
-- ============================================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('public_visitor', 'reporter', 'reviewer', 'senior_reviewer', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE privacy_mode_enum AS ENUM ('anonymous', 'confidential', 'identified');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE location_privacy_enum AS ENUM ('exact', 'approximate', 'confidential');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE report_status_enum AS ENUM (
        'submitted', 'received', 'under_review', 'more_info_required',
        'evidence_review', 'reviewed', 'referred', 'verified',
        'unsubstantiated', 'resolved', 'closed'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE evidence_type_enum AS ENUM ('image', 'video', 'audio', 'document', 'external_link');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE evidence_provider_enum AS ENUM (
        'direct_upload', 'youtube', 'facebook', 'google_drive',
        'google_photos', 'dropbox', 'external_web'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE evidence_visibility_enum AS ENUM ('private', 'reviewer_only', 'public');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE evidence_review_state_enum AS ENUM (
        'pending', 'accessible', 'reviewed', 'accepted', 'rejected', 'unavailable'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

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
CREATE INDEX IF NOT EXISTS idx_reports_secret_hash ON reports(tracking_secret_hash);

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

-- 12. PLATFORM DEFENSIVE SECURITY SETTINGS
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
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
ALTER TABLE platform_security_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public can view active report categories" ON report_categories;
CREATE POLICY "Public can view active report categories" ON report_categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view organization types" ON organization_types;
CREATE POLICY "Public can view organization types" ON organization_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view verified organizations" ON organizations;
CREATE POLICY "Public can view verified organizations" ON organizations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view approved public reports" ON reports;
CREATE POLICY "Public can view approved public reports" ON reports FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Anyone can submit a report" ON reports;
CREATE POLICY "Anyone can submit a report" ON reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view platform security status" ON platform_security_settings;
CREATE POLICY "Public can view platform security status" ON platform_security_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view status history of public reports" ON report_status_history;
CREATE POLICY "Public can view status history of public reports" ON report_status_history FOR SELECT
USING (EXISTS (SELECT 1 FROM reports WHERE reports.id = report_status_history.report_id AND reports.is_public = true));

DROP POLICY IF EXISTS "Public can view resources" ON resources;
CREATE POLICY "Public can view resources" ON resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view resource categories" ON resource_categories;
CREATE POLICY "Public can view resource categories" ON resource_categories FOR SELECT USING (true);

-- Strict Confidentiality: reporter contacts accessible only to Senior Reviewers & Admins
DROP POLICY IF EXISTS "Senior reviewers and admins access reporter contacts" ON reporter_contacts;
CREATE POLICY "Senior reviewers and admins access reporter contacts" ON reporter_contacts
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role IN ('senior_reviewer', 'admin')
          AND profiles.is_active = true
    )
);

-- Strict Evidence Access: Public can only view accepted/approved public evidence
DROP POLICY IF EXISTS "Public can view approved public evidence" ON evidence;
CREATE POLICY "Public can view approved public evidence" ON evidence FOR SELECT
USING (visibility = 'public' AND review_state::text IN ('accepted', 'approved'));

-- Case-bound Staff Evidence Access: Reviewers only access assigned cases
DROP POLICY IF EXISTS "Staff can access assigned case evidence" ON evidence;
CREATE POLICY "Staff can access assigned case evidence" ON evidence FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
          AND profiles.is_active = true
          AND (
            profiles.role = 'admin'
            OR (profiles.role = 'senior_reviewer')
            OR (profiles.role = 'reviewer' AND EXISTS (
                SELECT 1 FROM reports
                WHERE reports.id = evidence.report_id
                  AND reports.assigned_reviewer_id = auth.uid()
            ))
          )
    )
);

-- 14. SEED DATA
-- Categories (All 10 Platform Sectors)
INSERT INTO report_categories (id, code, name_en, name_bn, description_en, description_bn, icon, display_order)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'corruption', 'Corruption & Bribery', 'দুর্নীতি ও ঘুস', 'Bribery demands, extortion, procurement fraud, or abuse of public authority.', 'ঘুস দাবি, চাঁদাবাজি, আর্থিক অনিয়ম বা প্রশাসনিক ক্ষমতার অপব্যবহার।', 'Banknote', 1),
  ('c0000001-0000-0000-0000-000000000002', 'education', 'Education & Campus', 'শিক্ষা ও ক্যাম্পাস', 'University misconduct, dormitory ragging, unauthorized fees, academic harassment.', 'বিশ্ববিদ্যালয়ে নিপীড়ন, হল র‍্যাগিং, অবৈধ ফি আদায় বা শিক্ষক অসদাচরণ।', 'GraduationCap', 2),
  ('c0000001-0000-0000-0000-000000000003', 'police', 'Police & Law Enforcement', 'আইনশৃঙ্খলা বাহিনী', 'Police extortion, arbitrary detention, excessive force, or refusal to take GD/FIR.', 'অন্যায় আটক, অতিরিক্ত বলপ্রয়োগ, অর্থ দাবি বা জিডি/মামলা নিতে অস্বীকৃতি।', 'Shield', 3),
  ('c0000001-0000-0000-0000-000000000004', 'government', 'Public Services', 'সরকারি সেবা ও দপ্তর', 'Harassment or bribery at land offices, passport offices, BRTA, or administrative desks.', 'ভূমি, পাসপোর্ট, বিআরটিএ বা অন্যান্য সরকারি অফিসে অনিয়ম ও ভোগান্তি।', 'Building2', 4),
  ('c0000001-0000-0000-0000-000000000005', 'public_space', 'Infrastructure & Transport', 'অবকাঠামো ও পরিবহন', 'Dangerous road conditions, street extortion, illegal occupation of public pathways.', 'বিপজ্জনক সড়ক, গণপরিবহনে চাঁদাবাজি বা জনসাধারণের পথ অবৈধ দখল।', 'Route', 5),
  ('c0000001-0000-0000-0000-000000000006', 'health', 'Health & Hospitals', 'স্বাস্থ্য ও চিকিৎসা', 'Public hospital misconduct, withheld medicine, unauthorized patient admission fees.', 'সরকারি হাসপাতালে অবহেলা, ওষুধ মজুতদারি বা অবৈধ রোগী ভর্তি ফি।', 'Activity', 6),
  ('c0000001-0000-0000-0000-000000000007', 'environment', 'Environment & Rivers', 'পরিবেশ ও নদী দখল', 'Illegal river encroachment, industrial pollution, toxic dumping, deforestation.', 'নদী দখল, শিল্পকারখানার বর্জ্য দূষণ বা পরিবেশ বিধ্বংসী কর্মকাণ্ড।', 'Leaf', 7),
  ('c0000001-0000-0000-0000-000000000008', 'workplace', 'Workplace & Labor', 'কর্মক্ষেত্র ও শ্রম', 'Unsafe conditions, wage theft, employer harassment, discriminatory termination.', 'কর্মস্থলে হয়রানি, মজুরি আত্মসাৎ, অন্যায় ছাঁটাই বা ঝুঁকিপূর্ণ পরিবেশ।', 'Briefcase', 8),
  ('c0000001-0000-0000-0000-000000000010', 'abuse_harassment', 'Abuse & Harassment', 'নির্যাতন ও হয়রানি', 'Physical abuse, verbal harassment, sexual harassment, bullying, ragging, or stalking.', 'শারীরিক নির্যাতন, মৌখিক হয়রানি, যৌন হয়রানি, বুলিং, র‍্যাগিং অথবা মানসিক নিপীড়ন।', 'AlertTriangle', 9),
  ('c0000001-0000-0000-0000-000000000011', 'violence', 'Violence & Threats', 'সহিংসতা ও হুমকি', 'Physical violence, death threats, public or institutional violence.', 'শারীরিক মারধর, প্রাণনাশের হুমকি, অস্ত্র প্রদর্শন বা সংগঠিত সহিংসতা।', 'ShieldAlert', 10),
  ('c0000001-0000-0000-0000-000000000012', 'online', 'Online & Cyber Crime', 'সাইবার ও অনলাইন অপরাধ', 'Cyber harassment, blackmail, non-consensual images, or digital fraud.', 'অনলাইন হয়রানি, ব্ল্যাকমেইল, ব্যক্তিগত ছবি অপব্যবহার বা ডিজিটাল প্রতারণা।', 'Globe', 11),
  ('c0000001-0000-0000-0000-000000000009', 'other', 'Others', 'অন্যান্য জনস্বার্থ', 'Controlled classification for incidents of strong public interest.', 'জনস্বার্থে গুরুত্বপূর্ণ অন্যান্য যেকোনো অনিয়ম বা অন্যায্য ঘটনা।', 'MoreHorizontal', 99)
ON CONFLICT (code) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_bn = EXCLUDED.name_bn,
  description_en = EXCLUDED.description_en,
  description_bn = EXCLUDED.description_bn;

-- Organization Types
INSERT INTO organization_types (id, code, name_en, name_bn)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'police', 'Police Thana / Department', 'থানা ও পুলিশ বিভাগ'),
  ('a0000001-0000-0000-0000-000000000002', 'university', 'University / Higher Ed', 'বিশ্ববিদ্যালয় ও উচ্চশিক্ষা'),
  ('a0000001-0000-0000-0000-000000000003', 'government', 'Government Administrative Office', 'সরকারি প্রশাসনিক দপ্তর'),
  ('a0000001-0000-0000-0000-000000000004', 'hospital', 'Public Hospital', 'সরকারি হাসপাতাল')
ON CONFLICT (code) DO NOTHING;

-- Organizations
INSERT INTO organizations (type_id, name_en, name_bn, slug, division, district, is_verified)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Dhaka Metropolitan Police (Mirpur Thana)', 'মিরপুর মডেল থানা', 'dmp-mirpur-thana', 'Dhaka', 'Dhaka', true),
  ('a0000001-0000-0000-0000-000000000002', 'University of Chittagong', 'চট্টগ্রাম বিশ্ববিদ্যালয়', 'chittagong-university', 'Chattogram', 'Chattogram', true),
  ('a0000001-0000-0000-0000-000000000003', 'Bangladesh Road Transport Authority (BRTA)', 'বাংলাদেশ সড়ক পরিবহন কর্তৃপক্ষ (বিআরটিএ)', 'brta-headquarters', 'Dhaka', 'Dhaka', true),
  ('a0000001-0000-0000-0000-000000000004', 'Rajshahi Medical College Hospital', 'রাজশাহী মেডিকেল কলেজ হাসপাতাল', 'rajshahi-medical-hospital', 'Rajshahi', 'Rajshahi', true)
ON CONFLICT (slug) DO NOTHING;

-- Emergency Resources
INSERT INTO resource_categories (id, name_en, name_bn, slug)
VALUES
  ('e0000001-0000-0000-0000-000000000001', 'Emergency Services', 'জরুরি সেবা', 'emergency'),
  ('e0000001-0000-0000-0000-000000000002', 'Legal Aid & Human Rights', 'আইনি সহায়তা ও মানবাধিকার', 'legal-aid')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO resources (category_id, title_en, title_bn, hotline_number, website_url, is_official_emergency)
VALUES
  ('e0000001-0000-0000-0000-000000000001', 'National Emergency Service', 'জাতীয় জরুরি সেবা', '999', 'https://www.police.gov.bd', true),
  ('e0000001-0000-0000-0000-000000000001', 'Violence Against Women & Children Helpline', 'নারী ও শিশু নির্যাতন প্রতিরোধ হেল্পলাইন', '109', 'https://www.mowca.gov.bd', true),
  ('e0000001-0000-0000-0000-000000000001', 'Government Information & Citizen Hotline', 'সরকারি তথ্য ও নাগরিক সেবা', '333', 'https://a2i.gov.bd', true),
  ('e0000001-0000-0000-0000-000000000001', 'Anti-Corruption Commission (DUDOK)', 'দুদক হটলাইন', '106', 'https://acc.org.bd', true)
ON CONFLICT DO NOTHING;

-- Initial Platform Defensive Posture
INSERT INTO platform_security_settings (id, safe_mode_enabled, safe_mode_reason)
VALUES ('primary', false, 'Normal operations')
ON CONFLICT (id) DO NOTHING;

-- Initial Verified Public Seed Reports (Matches Frontend Dossiers)
INSERT INTO reports (
  id, report_number, tracking_secret_hash, category_id, privacy_mode,
  incident_date, division, district, upazila_thana, area_landmark, location_privacy,
  institution_type, custom_organization_name, involved_role_or_title,
  description, public_summary, status, priority, is_public, verified_status, created_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'BD-2026-000001',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'c0000001-0000-0000-0000-000000000003',
    'anonymous',
    '2026-03-01',
    'Dhaka',
    'Dhaka',
    'Mirpur',
    'Section 10 Roundabout',
    'approximate',
    'police',
    'Mirpur Traffic Division',
    'On-duty Sub-Inspector',
    'Citizen allegedly detained at a routine motorcycle checkpoint without grounds. Formal receipt for demanded inspection fee was refused.',
    'Arbitrary extortion during vehicle documentation checkpoint',
    'under_review',
    2,
    true,
    false,
    NOW() - INTERVAL '3 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'BD-2026-000002',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'c0000001-0000-0000-0000-000000000002',
    'confidential',
    '2026-02-28',
    'Chattogram',
    'Chattogram',
    'Hathazari',
    'University Residential Hall',
    'approximate',
    'university',
    'University of Chittagong',
    'Dormitory Student Committee Member',
    'First-year student subjected to late-night intimidation in campus dormitory guest room. Video and audio recordings submitted.',
    'Dormitory student ragging and unauthorized intimidation',
    'verified',
    3,
    true,
    true,
    NOW() - INTERVAL '7 hours'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'BD-2026-000003',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'c0000001-0000-0000-0000-000000000001',
    'anonymous',
    '2026-02-25',
    'Rajshahi',
    'Rajshahi',
    'Boalia',
    'Sub-Registry Complex',
    'approximate',
    'government',
    'Boalia Land Registry Office',
    'Senior Clerk / Peshkar',
    'Service-seeker applying for standard land deed certification informed file would not move without unrecorded speed fee.',
    'Sub-registry office mutation fee irregularity and bribery demands',
    'referred',
    2,
    true,
    false,
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (report_number) DO NOTHING;
