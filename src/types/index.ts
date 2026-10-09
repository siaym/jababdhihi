export type UserRole =
  | 'public_visitor'
  | 'reporter'
  | 'reviewer'
  | 'senior_reviewer'
  | 'admin';

export type PrivacyMode = 'anonymous' | 'confidential' | 'identified';

export type LocationPrivacy = 'exact' | 'approximate' | 'confidential';

export type ReportStatus =
  | 'submitted'
  | 'received'
  | 'under_review'
  | 'more_info_required'
  | 'evidence_review'
  | 'reviewed'
  | 'referred'
  | 'verified'
  | 'unsubstantiated'
  | 'resolved'
  | 'closed';

export type EvidenceType = 'image' | 'video' | 'audio' | 'document' | 'external_link';

export type EvidenceProvider =
  | 'direct_upload'
  | 'youtube'
  | 'facebook'
  | 'google_drive'
  | 'google_photos'
  | 'dropbox'
  | 'external_web';

export type EvidenceVisibility = 'private' | 'reviewer_only' | 'public';

export type EvidenceReviewState =
  | 'pending'
  | 'accessible'
  | 'reviewed'
  | 'accepted'
  | 'approved'
  | 'rejected'
  | 'unavailable';

export interface ReportCategory {
  id: string;
  code: string;
  name_en: string;
  name_bn: string;
  description_en: string;
  description_bn: string;
  icon?: string;
  display_order: number;
}

export interface Report {
  id: string;
  report_number: string; // BD-2026-XXXXXX
  tracking_secret_hash?: string;
  category_id: string;
  category?: ReportCategory;
  privacy_mode: PrivacyMode;
  incident_date: string;
  approximate_time?: string;
  division: string;
  district: string;
  upazila_thana?: string;
  area_landmark?: string;
  location_privacy: LocationPrivacy;
  institution_type?: string;
  custom_organization_name?: string;
  involved_role_or_title?: string;
  description: string;
  public_summary?: string;
  status: ReportStatus;
  priority: number;
  is_public: boolean;
  verified_status: boolean;
  assigned_reviewer_id?: string;
  assigned_senior_id?: string;
  created_at: string;
  updated_at: string;
  evidence_count?: number;
  views_count?: number;
  comments_count?: number;
  comments_disabled?: boolean;
  key_timestamps?: { time: string; seconds: number; label: string }[];
  verification_context?: EvidenceVerificationContext;
  official_response?: OfficialEntityResponse;
  next_steps?: NextStepsAndResources;
  timeline_updates?: TimelineUpdate[];
  transcript?: TranscriptMoment[];
  image_annotations?: ImageAnnotationDetail[];
  what_media_shows?: string;
  what_remains_unclear?: string;
  relationship_reason?: string;
  thumbnail_url?: string;
  is_demo?: boolean;
}

export interface EvidenceVerificationContext {
  reviewed_by: string;
  review_date: string;
  status_explanation: string;
  what_is_verified: string[];
  what_remains_unverified: string[];
  methodology_summary?: string;
  authenticity_assessment?: string;
}

export interface OfficialEntityResponse {
  entity_name: string;
  response_date: string;
  status: 'pending' | 'acknowledged' | 'investigating' | 'resolved' | 'no_response';
  statement: string;
  action_taken?: string;
  document_reference?: string;
  contact_department?: string;
}

export interface OfficialHelpline {
  title: string;
  number: string;
  note: string;
  authority: string;
}

export interface NextStepsAndResources {
  referral_status?: string;
  next_milestones: string[];
  helplines: OfficialHelpline[];
  how_to_corroborate?: string;
  tracking_info?: string;
}

export interface TimelineUpdate {
  date: string;
  title: string;
  details: string;
  status: string;
  actor?: string;
}

export interface TranscriptMoment {
  time: string;
  speaker: string;
  text: string;
}

export interface ImageAnnotationDetail {
  frame_index: number;
  title: string;
  observation: string;
  verification_status: 'verified' | 'unverified' | 'pending';
}

export interface PublicComment {
  id: string;
  report_id: string;
  author_name: string;
  is_verified_citizen?: boolean;
  comment_text: string;
  status: 'approved' | 'pending' | 'flagged';
  upvotes: number;
  created_at: string;
  parent_id?: string | null;
  replies?: PublicComment[];
}

export interface EvidenceItem {
  id: string;
  report_id: string;
  evidence_type: EvidenceType;
  provider: EvidenceProvider;
  storage_path?: string;
  original_filename?: string;
  mime_type?: string;
  file_size_bytes?: number;
  external_url?: string;
  external_platform_id?: string;
  is_embeddable?: boolean;
  visibility: EvidenceVisibility;
  review_state: EvidenceReviewState;
  caption?: string;
  moderator_notes?: string;
  warning_notice?: string;
  created_at: string;
}

export interface ReportStatusHistoryItem {
  id: string;
  report_id: string;
  previous_status?: ReportStatus;
  new_status: ReportStatus;
  actor_id?: string;
  actor_name?: string;
  actor_role?: string;
  public_note?: string;
  internal_rationale?: string;
  created_at: string;
}

export interface CaseMessage {
  id: string;
  report_id: string;
  sender_type: 'reporter' | 'reviewer';
  sender_id?: string;
  sender_name?: string;
  message_text: string;
  is_read: boolean;
  created_at: string;
}

export interface CivicResource {
  id: string;
  category_id: string;
  category_name_en: string;
  category_name_bn: string;
  title_en: string;
  title_bn: string;
  description_en: string;
  description_bn: string;
  hotline_number?: string;
  website_url?: string;
  address?: string;
  is_official_emergency: boolean;
}
