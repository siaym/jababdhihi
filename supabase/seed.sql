-- ============================================================================
-- Supabase Database Seed File: seed.sql
-- Platform: Jababdihi (জবাবদিহি)
-- ============================================================================

-- 1. SEED REPORT CATEGORIES
INSERT INTO report_categories (id, code, name_en, name_bn, description_en, description_bn, icon, display_order)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'corruption', 'Corruption', 'দুর্নীতি ও ঘুস', 'Bribery demands, extortion, procurement fraud, or abuse of public authority.', 'ঘুস দাবি, চাঁদাবাজি, আর্থিক অনিয়ম বা প্রশাসনিক ক্ষমতার অপব্যবহার।', 'Banknote', 1),
  ('c0000001-0000-0000-0000-000000000002', 'education', 'Education', 'শিক্ষা ও ক্যাম্পাস', 'University misconduct, dormitory ragging, unauthorized fees, academic harassment.', 'বিশ্ববিদ্যালয়ে নিপীড়ন, হল র‍্যাগিং, অবৈধ ফি আদায় বা শিক্ষক অসদাচরণ।', 'GraduationCap', 2),
  ('c0000001-0000-0000-0000-000000000003', 'police', 'Law Enforcement', 'আইনশৃঙ্খলা বাহিনী', 'Police extortion, arbitrary detention, excessive force, or refusal to take GD/FIR.', 'অন্যায় আটক, অতিরিক্ত বলপ্রয়োগ, অর্থ দাবি বা জিডি/মামলা নিতে অস্বীকৃতি।', 'Shield', 3),
  ('c0000001-0000-0000-0000-000000000004', 'government', 'Public Services', 'সরকারি সেবা ও দপ্তর', 'Harassment or bribery at land offices, passport offices, BRTA, or administrative desks.', 'ভূমি, পাসপোর্ট, বিআরটিএ বা অন্যান্য সরকারি অফিসে অনিয়ম ও ভোগান্তি।', 'Building2', 4),
  ('c0000001-0000-0000-0000-000000000005', 'public_space', 'Infrastructure', 'অবকাঠামো ও পরিবহন', 'Dangerous road conditions, street extortion, illegal occupation of public pathways.', 'বিপজ্জনক সড়ক, গণপরিবহনে চাঁদাবাজি বা জনসাধারণের পথ অবৈধ দখল।', 'Route', 5),
  ('c0000001-0000-0000-0000-000000000006', 'health', 'Health', 'স্বাস্থ্য ও চিকিৎসা', 'Public hospital misconduct, withheld medicine, unauthorized patient admission fees.', 'সরকারি হাসপাতালে অবহেলা, ওষুধ মজুতদারি বা অবৈধ রোগী ভর্তি ফি।', 'Cross', 6),
  ('c0000001-0000-0000-0000-000000000007', 'environment', 'Environment', 'পরিবেশ ও নদী দখল', 'Illegal river encroachment, industrial pollution, toxic dumping, deforestation.', 'নদী দখল, শিল্পকারখানার বর্জ্য দূষণ বা পরিবেশ বিধ্বংসী কর্মকাণ্ড।', 'Leaf', 7),
  ('c0000001-0000-0000-0000-000000000008', 'workplace', 'Workplace', 'কর্মক্ষেত্র ও শ্রম', 'Unsafe conditions, wage theft, employer harassment, discriminatory termination.', 'কর্মস্থলে হয়রানি, মজুরি আত্মসাৎ, অন্যায় ছাঁটাই বা ঝুঁকিপূর্ণ পরিবেশ।', 'Briefcase', 8),
  ('c0000001-0000-0000-0000-000000000010', 'abuse_harassment', 'Abuse & Harassment', 'নির্যাতন ও হয়রানি', 'Physical abuse, verbal harassment, sexual harassment, bullying, ragging, or stalking.', 'শারীরিক নির্যাতন, মৌখিক হয়রানি, যৌন হয়রানি, বুলিং, র‍্যাগিং অথবা মানসিক নিপীড়ন।', 'AlertTriangle', 10),
  ('c0000001-0000-0000-0000-000000000011', 'violence', 'Violence & Threats', 'সহিংসতা ও হুমকি', 'Physical violence, death threats, public or institutional violence.', 'শারীরিক মারধর, প্রাণনাশের হুমকি, অস্ত্র প্রদর্শন বা সংগঠিত সহিংসতা।', 'ShieldAlert', 11),
  ('c0000001-0000-0000-0000-000000000012', 'online', 'Online & Cyber Crime', 'সাইবার ও অনলাইন অপরাধ', 'Cyber harassment, blackmail, non-consensual images, or digital fraud.', 'অনলাইন হয়রানি, ব্ল্যাকমেইল, ব্যক্তিগত ছবি অপব্যবহার বা ডিজিটাল প্রতারণা।', 'Globe', 12),
  ('c0000001-0000-0000-0000-000000000009', 'other', 'Others', 'অন্যান্য জনস্বার্থ', 'Controlled classification for incidents of strong public interest.', 'জনস্বার্থে গুরুত্বপূর্ণ অন্যান্য যেকোনো অনিয়ম বা অন্যায্য ঘটনা।', 'MoreHorizontal', 99)
ON CONFLICT (code) DO NOTHING;

-- 2. SEED ORGANIZATION TYPES
INSERT INTO organization_types (id, code, name_en, name_bn)
VALUES
  ('o0000001-0000-0000-0000-000000000001', 'police', 'Police Thana / Department', 'থানা ও পুলিশ বিভাগ'),
  ('o0000001-0000-0000-0000-000000000002', 'university', 'University / Higher Ed', 'বিশ্ববিদ্যালয় ও উচ্চশিক্ষা'),
  ('o0000001-0000-0000-0000-000000000003', 'government', 'Government Administrative Office', 'সরকারি প্রশাসনিক দপ্তর'),
  ('o0000001-0000-0000-0000-000000000004', 'hospital', 'Public Hospital', 'সরকারি হাসপাতাল')
ON CONFLICT (code) DO NOTHING;

-- 3. SEED INITIAL ORGANIZATIONS
INSERT INTO organizations (type_id, name_en, name_bn, slug, division, district, is_verified)
VALUES
  ('o0000001-0000-0000-0000-000000000001', 'Dhaka Metropolitan Police (Mirpur Thana)', 'মিরপুর মডেল থানা', 'dmp-mirpur-thana', 'Dhaka', 'Dhaka', true),
  ('o0000001-0000-0000-0000-000000000002', 'University of Chittagong', 'চট্টগ্রাম বিশ্ববিদ্যালয়', 'chittagong-university', 'Chattogram', 'Chattogram', true),
  ('o0000001-0000-0000-0000-000000000003', 'Bangladesh Road Transport Authority (BRTA)', 'বাংলাদেশ সড়ক পরিবহন কর্তৃপক্ষ (বিআরটিএ)', 'brta-headquarters', 'Dhaka', 'Dhaka', true),
  ('o0000001-0000-0000-0000-000000000004', 'Rajshahi Medical College Hospital', 'রাজশাহী মেডিকেল কলেজ হাসপাতাল', 'rajshahi-medical-hospital', 'Rajshahi', 'Rajshahi', true)
ON CONFLICT (slug) DO NOTHING;

-- 4. SEED EMERGENCY CIVIC RESOURCES
INSERT INTO resource_categories (id, name_en, name_bn, slug)
VALUES
  ('r0000001-0000-0000-0000-000000000001', 'Emergency Services', 'জরুরি সেবা', 'emergency'),
  ('r0000001-0000-0000-0000-000000000002', 'Legal Aid & Human Rights', 'আইনি সহায়তা ও মানবাধিকার', 'legal-aid')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO resources (category_id, title_en, title_bn, hotline_number, website_url, is_official_emergency)
VALUES
  ('r0000001-0000-0000-0000-000000000001', 'National Emergency Service', 'জাতীয় জরুরি সেবা', '999', 'https://www.police.gov.bd', true),
  ('r0000001-0000-0000-0000-000000000001', 'Violence Against Women & Children Helpline', 'নারী ও শিশু নির্যাতন প্রতিরোধ হেল্পলাইন', '109', 'https://www.mowca.gov.bd', true),
  ('r0000001-0000-0000-0000-000000000001', 'Government Information & Citizen Hotline', 'সরকারি তথ্য ও নাগরিক সেবা', '333', 'https://a2i.gov.bd', true),
  ('r0000001-0000-0000-0000-000000000001', 'Anti-Corruption Commission (DUDOK)', 'দুদক হটলাইন', '106', 'https://acc.org.bd', true);
