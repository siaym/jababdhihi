import {
  Report,
  ReportStatus,
  ReportStatusHistoryItem,
  CaseMessage,
  EvidenceItem,
  PublicComment,
} from '@/types';
import { INITIAL_CATEGORIES } from '@/config/constants';
import { generateReportNumber, generateTrackingSecret } from '@/lib/utils';
import { ReportSubmissionInput } from '@/lib/validation/report.schema';
import { analyzeExternalUrl } from './evidence';

// Mock in-memory database store for development and offline mode
let sequenceCounter = 1004;

const inMemoryReports: Report[] = [
  {
    id: 'rep-001',
    report_number: 'BD-2026-001001',
    category_id: 'cat-4', // Police misconduct
    category: INITIAL_CATEGORIES.find((c) => c.code === 'police'),
    privacy_mode: 'anonymous',
    incident_date: '2026-09-12',
    approximate_time: '20:30',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila_thana: 'Mirpur',
    area_landmark: 'Mirpur 10 Roundabout Checkpoint',
    location_privacy: 'approximate',
    institution_type: 'police',
    custom_organization_name: 'Mirpur Model Thana',
    involved_role_or_title: 'Duty Sub-Inspector & Traffic Team',
    description:
      'Citizen was allegedly detained at a routine motorcycle checkpoint without grounds. The officer allegedly demanded BDT 5,000 to return vehicle documents despite all registrations being valid. Formal receipt was denied.\n\nFootage submitted by an independent commuter shows the interaction between 20:30 and 20:45, including demands for unreceipted payment and refusal to issue a standard traffic penalty challan.',
    public_summary:
      'Video evidence alleging arbitrary extortion during vehicle documentation checkpoint near Mirpur 10 roundabout.',
    status: 'under_review',
    priority: 2,
    is_public: true,
    verified_status: false,
    created_at: '2026-09-13T09:15:00Z',
    updated_at: '2026-09-14T11:20:00Z',
    evidence_count: 2,
    views_count: 14280,
    comments_count: 38,
    key_timestamps: [
      { time: '00:15', seconds: 15, label: 'Initial vehicle documentation check at Mirpur 10 roundabout' },
      { time: '01:05', seconds: 65, label: 'Discussion over valid registration papers and tax token' },
      { time: '01:42', seconds: 102, label: 'Alleged speed fee demand without government treasury receipt' },
      { time: '02:30', seconds: 150, label: 'Officer refuses official challan and withholds ignition key' },
    ],
  },
  {
    id: 'rep-002',
    report_number: 'BD-2026-001002',
    category_id: 'cat-5', // Education & Campus
    category: INITIAL_CATEGORIES.find((c) => c.code === 'education'),
    privacy_mode: 'confidential',
    incident_date: '2026-09-18',
    approximate_time: '23:00',
    division: 'Chattogram',
    district: 'Chattogram',
    upazila_thana: 'Hathazari',
    area_landmark: 'Alaol Hall Residential Block C',
    location_privacy: 'approximate',
    institution_type: 'university',
    custom_organization_name: 'University of Chittagong',
    involved_role_or_title: 'Dormitory Senior Students Committee',
    description:
      'First-year student subjected to late-night physical intimidation and forced mental harassment in the dormitory guest room. Victim was threatened with academic harm if reported to authorities.\n\nPhotographic documentation captures the physical environment of the third-floor residential corridor, stamped petition dockets lodged with the Hall Provost, and community assembly records following disclosure of the hazing.',
    public_summary:
      'Photographic dossier documenting severe dormitory ragging and intimidation of a first-year student.',
    status: 'verified',
    priority: 3,
    is_public: true,
    verified_status: true,
    created_at: '2026-09-19T08:00:00Z',
    updated_at: '2026-09-22T14:30:00Z',
    evidence_count: 3,
    views_count: 8940,
    comments_count: 52,
  },
  {
    id: 'rep-003',
    report_number: 'BD-2026-001003',
    category_id: 'cat-2', // Corruption
    category: INITIAL_CATEGORIES.find((c) => c.code === 'corruption'),
    privacy_mode: 'anonymous',
    incident_date: '2026-09-25',
    approximate_time: '11:45',
    division: 'Rajshahi',
    district: 'Rajshahi',
    upazila_thana: 'Boalia',
    area_landmark: 'Court Area Sub-Registry Complex',
    location_privacy: 'approximate',
    institution_type: 'government',
    custom_organization_name: 'Sub-Registry Office',
    involved_role_or_title: 'Record Clerk & Intermediary (Dalal)',
    description:
      'Service-seeker applying for land deed certification was informed the file would not proceed without paying an unrecorded "speed fee" of BDT 8,000. Document scan and audio recording submitted.',
    public_summary:
      'Report alleging unauthorized bribery demands for standard land registry services.',
    status: 'referred',
    priority: 2,
    is_public: true,
    verified_status: true,
    created_at: '2026-09-26T10:00:00Z',
    updated_at: '2026-09-29T16:00:00Z',
    evidence_count: 2,
    views_count: 6180,
    comments_count: 19,
  },
];

// Tracking secrets mapping: report_number -> secret_token
const inMemorySecrets: Record<string, string> = {
  'BD-2026-001001': 'demo-track-mirpur',
  'BD-2026-001002': 'demo-track-campus',
  'BD-2026-001003': 'demo-track-rajshahi',
};

const inMemoryEvidence: Record<string, EvidenceItem[]> = {
  'rep-001': [
    {
      id: 'ev-1',
      report_id: 'rep-001',
      evidence_type: 'external_link',
      provider: 'youtube',
      external_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      external_platform_id: 'dQw4w9WgXcQ',
      is_embeddable: true,
      visibility: 'public',
      review_state: 'accepted',
      caption: 'Full bystander video footage captured at the Mirpur 10 checkpoint interaction',
      created_at: '2026-09-13T09:16:00Z',
    },
    {
      id: 'ev-1-b',
      report_id: 'rep-001',
      evidence_type: 'image',
      provider: 'direct_upload',
      storage_path: '/images/hero-bangladesh.jpg',
      original_filename: 'mirpur_10_overview.jpg',
      mime_type: 'image/jpeg',
      file_size_bytes: 1063400,
      visibility: 'public',
      review_state: 'accepted',
      caption: 'Geographic location and traffic intersection overview near Mirpur 10 roundabout',
      created_at: '2026-09-13T09:18:00Z',
    },
    {
      id: 'ev-2',
      report_id: 'rep-001',
      evidence_type: 'image',
      provider: 'direct_upload',
      original_filename: 'vehicle_license_scan.jpg',
      mime_type: 'image/jpeg',
      file_size_bytes: 1450000,
      visibility: 'reviewer_only',
      review_state: 'reviewed',
      caption: 'Valid motorcycle registration and tax token copy (Redacted for privacy)',
      created_at: '2026-09-13T09:16:00Z',
    },
  ],
  'rep-002': [
    {
      id: 'ev-photo-1',
      report_id: 'rep-002',
      evidence_type: 'image',
      provider: 'direct_upload',
      storage_path: '/images/evidence-campus-corridor.jpg',
      original_filename: 'hall_corridor_scene.jpg',
      mime_type: 'image/jpeg',
      file_size_bytes: 981849,
      visibility: 'public',
      review_state: 'accepted',
      caption: 'Residential hall third-floor corridor where late-night forced attendance was conducted.',
      created_at: '2026-09-19T08:05:00Z',
    },
    {
      id: 'ev-photo-2',
      report_id: 'rep-002',
      evidence_type: 'image',
      provider: 'direct_upload',
      storage_path: '/images/evidence-complaint-document.jpg',
      original_filename: 'provost_office_docket.jpg',
      mime_type: 'image/jpeg',
      file_size_bytes: 879102,
      visibility: 'public',
      review_state: 'accepted',
      caption: 'Official petition docket and stamped acknowledgment filed with the Proctorial Body.',
      created_at: '2026-09-19T08:10:00Z',
    },
    {
      id: 'ev-photo-3',
      report_id: 'rep-002',
      evidence_type: 'image',
      provider: 'direct_upload',
      storage_path: '/images/hero-bangladesh.jpg',
      original_filename: 'student_vigil.jpg',
      mime_type: 'image/jpeg',
      file_size_bytes: 1063400,
      visibility: 'public',
      review_state: 'accepted',
      caption: 'Students assembling outside administration building demanding safety enforcement.',
      created_at: '2026-09-20T10:00:00Z',
    },
  ],
  'rep-003': [
    {
      id: 'ev-3-doc',
      report_id: 'rep-003',
      evidence_type: 'image',
      provider: 'direct_upload',
      storage_path: '/images/evidence-complaint-document.jpg',
      original_filename: 'deed_registry_cover.jpg',
      mime_type: 'image/jpeg',
      file_size_bytes: 879102,
      visibility: 'public',
      review_state: 'accepted',
      caption: 'Deed registration docket with unrecorded manual fees penciled onto cover jacket.',
      created_at: '2026-09-26T10:05:00Z',
    },
  ],
};

const inMemoryTimelines: Record<string, ReportStatusHistoryItem[]> = {
  'rep-001': [
    {
      id: 'th-1',
      report_id: 'rep-001',
      new_status: 'submitted',
      created_at: '2026-09-13T09:15:00Z',
      public_note: 'Report securely received and assigned ID BD-2026-001001.',
    },
    {
      id: 'th-2',
      report_id: 'rep-001',
      previous_status: 'submitted',
      new_status: 'received',
      created_at: '2026-09-13T14:00:00Z',
      public_note: 'Intake intake review completed by intake officer.',
    },
    {
      id: 'th-3',
      report_id: 'rep-001',
      previous_status: 'received',
      new_status: 'under_review',
      created_at: '2026-09-14T11:20:00Z',
      public_note: 'Assigned to reviewer. Evidentiary details currently being verified.',
      internal_rationale: 'Reviewer verifying GD date and checkpoint log.',
    },
  ],
};

const inMemoryMessages: Record<string, CaseMessage[]> = {
  'rep-001': [
    {
      id: 'msg-1',
      report_id: 'rep-001',
      sender_type: 'reviewer',
      message_text:
        'Thank you for documenting this incident. Could you please specify the exact intersection in Mirpur where this checkpoint was positioned?',
      is_read: true,
      created_at: '2026-09-14T12:00:00Z',
    },
    {
      id: 'msg-2',
      report_id: 'rep-001',
      sender_type: 'reporter',
      message_text:
        'It was right before Mirpur 10 circle, in front of the commercial bank branch.',
      is_read: true,
      created_at: '2026-09-14T13:45:00Z',
    },
  ],
};

/**
 * Submit a new incident report
 */
export async function submitReport(input: ReportSubmissionInput): Promise<{
  reportNumber: string;
  trackingSecret: string;
  reportId: string;
}> {
  const nextSeq = ++sequenceCounter;
  const reportNumber = generateReportNumber(nextSeq);
  const trackingSecret = generateTrackingSecret();
  const reportId = `rep-${nextSeq}`;

  const category = INITIAL_CATEGORIES.find((c) => c.id === input.category_id) || {
    id: input.category_id,
    code: 'other',
    name_en: 'Other Incident',
    name_bn: 'অন্যান্য ঘটনা',
    description_en: '',
    description_bn: '',
    display_order: 99,
  };

  const newReport: Report = {
    id: reportId,
    report_number: reportNumber,
    category_id: input.category_id,
    category,
    privacy_mode: input.privacy_mode,
    incident_date: input.incident_date,
    approximate_time: input.approximate_time,
    division: input.division,
    district: input.district,
    upazila_thana: input.upazila_thana,
    area_landmark: input.area_landmark,
    location_privacy: input.location_privacy,
    institution_type: input.institution_type,
    custom_organization_name: input.custom_organization_name,
    involved_role_or_title: input.involved_role_or_title,
    description: input.description,
    status: 'submitted',
    priority: 1,
    is_public: false,
    verified_status: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    evidence_count: input.evidence_items.length,
  };

  inMemoryReports.unshift(newReport);
  inMemorySecrets[reportNumber] = trackingSecret;

  // Process evidence items
  const evidenceList: EvidenceItem[] = input.evidence_items.map((ev, index) => {
    if (ev.type === 'external_link') {
      const analysis = analyzeExternalUrl(ev.url);
      return {
        id: `ev-${reportId}-${index}`,
        report_id: reportId,
        evidence_type: 'external_link',
        provider: analysis.provider,
        external_url: ev.url,
        external_platform_id: analysis.platformId,
        is_embeddable: analysis.isEmbeddable,
        visibility: 'private',
        review_state: 'pending',
        caption: ev.caption,
        created_at: new Date().toISOString(),
      };
    } else {
      return {
        id: `ev-${reportId}-${index}`,
        report_id: reportId,
        evidence_type: ev.type,
        provider: 'direct_upload',
        original_filename: ev.original_filename,
        mime_type: ev.mime_type,
        file_size_bytes: ev.file_size_bytes,
        visibility: 'private',
        review_state: 'pending',
        caption: ev.caption,
        created_at: new Date().toISOString(),
      };
    }
  });

  inMemoryEvidence[reportId] = evidenceList;

  // Initial timeline entry
  inMemoryTimelines[reportId] = [
    {
      id: `th-${reportId}-1`,
      report_id: reportId,
      new_status: 'submitted',
      created_at: new Date().toISOString(),
      public_note: `Report received successfully. Tracking key generated.`,
    },
  ];

  return {
    reportNumber,
    trackingSecret,
    reportId,
  };
}

/**
 * Track a case using reportNumber and trackingSecret
 */
export async function trackReport(
  reportNumber: string,
  trackingSecret: string
): Promise<{
  report: Report;
  timeline: ReportStatusHistoryItem[];
  evidence: EvidenceItem[];
  messages: CaseMessage[];
} | null> {
  const trimmedNum = reportNumber.trim();
  const trimmedSec = trackingSecret.trim();

  const storedSecret = inMemorySecrets[trimmedNum];
  if (!storedSecret || storedSecret !== trimmedSec) {
    return null;
  }

  const report = inMemoryReports.find((r) => r.report_number === trimmedNum);
  if (!report) return null;

  const timeline = inMemoryTimelines[report.id] || [];
  const evidence = inMemoryEvidence[report.id] || [];
  const messages = inMemoryMessages[report.id] || [];

  return {
    report,
    timeline,
    evidence,
    messages,
  };
}

/**
 * Send a message within a case
 */
export async function sendCaseMessage(
  reportId: string,
  senderType: 'reporter' | 'reviewer',
  messageText: string
): Promise<CaseMessage> {
  const newMsg: CaseMessage = {
    id: `msg-${Date.now()}`,
    report_id: reportId,
    sender_type: senderType,
    message_text: messageText,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  if (!inMemoryMessages[reportId]) {
    inMemoryMessages[reportId] = [];
  }
  inMemoryMessages[reportId].push(newMsg);

  return newMsg;
}

/**
 * Fetch public reports list with optional filters
 */
export async function getPublicReports(filters?: {
  categoryCode?: string;
  division?: string;
  district?: string;
  status?: string;
  searchQuery?: string;
}): Promise<Report[]> {
  let list = inMemoryReports.filter((r) => r.is_public);

  if (filters?.categoryCode) {
    list = list.filter((r) => r.category?.code === filters.categoryCode);
  }
  if (filters?.division) {
    list = list.filter((r) => r.division === filters.division);
  }
  if (filters?.district) {
    list = list.filter((r) => r.district === filters.district);
  }
  if (filters?.status) {
    list = list.filter((r) => r.status === filters.status);
  }
  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    list = list.filter(
      (r) =>
        r.description.toLowerCase().includes(q) ||
        r.report_number.toLowerCase().includes(q) ||
        (r.custom_organization_name &&
          r.custom_organization_name.toLowerCase().includes(q))
    );
  }

  return list;
}

const inMemoryComments: Record<string, PublicComment[]> = {
  'rep-001': [
    {
      id: 'cmt-1',
      report_id: 'rep-001',
      author_name: 'Tanvir Hossain',
      is_verified_citizen: true,
      comment_text:
        'I drive past this Mirpur 10 roundabout every evening. The checkpoint at 8 PM is notorious for delaying motorcyclists without issuing official slip. Glad this is documented on video with exact timestamps.',
      status: 'approved',
      upvotes: 24,
      created_at: '2026-09-13T14:20:00Z',
      replies: [
        {
          id: 'cmt-1-1',
          report_id: 'rep-001',
          author_name: 'Mirpur Commuter',
          is_verified_citizen: false,
          comment_text:
            'Confirming this happened to two other riders last Wednesday. Always demand the e-Challan SMS receipt on your phone.',
          status: 'approved',
          upvotes: 11,
          created_at: '2026-09-13T16:45:00Z',
        },
      ],
    },
    {
      id: 'cmt-2',
      report_id: 'rep-001',
      author_name: 'Civic Legal Observer',
      is_verified_citizen: true,
      comment_text:
        'Under Dhaka Metropolitan Police regulations, vehicle seizure without issuing Form 27 or e-Prosecution ticket is unlawful. The bystander audio at 01:42 is crucial evidence.',
      status: 'approved',
      upvotes: 19,
      created_at: '2026-09-14T09:10:00Z',
    },
  ],
  'rep-002': [
    {
      id: 'cmt-3',
      report_id: 'rep-002',
      author_name: 'CU Student Alliance',
      is_verified_citizen: true,
      comment_text:
        'Residential halls must be protected educational spaces. The photo dossier of the third-floor corridor shows the exact common area where freshers are gathered. Hall administration cannot claim ignorance after this formal petition acknowledgment.',
      status: 'approved',
      upvotes: 42,
      created_at: '2026-09-19T12:00:00Z',
      replies: [
        {
          id: 'cmt-3-1',
          report_id: 'rep-002',
          author_name: 'Campus Rights Observer',
          is_verified_citizen: true,
          comment_text:
            'The proctorial committee has confirmed receipt of the dossier. Keep the evidence archived safely.',
          status: 'approved',
          upvotes: 16,
          created_at: '2026-09-19T15:30:00Z',
        },
      ],
    },
    {
      id: 'cmt-4',
      report_id: 'rep-002',
      author_name: 'Anonymous Student',
      is_verified_citizen: false,
      comment_text:
        'Thank you Jababdihi for stripping metadata from uploaded photographs. Many students were afraid to speak out because camera serials could be traced.',
      status: 'approved',
      upvotes: 35,
      created_at: '2026-09-20T08:15:00Z',
    },
  ],
};

/**
 * Get single report by public report number with related dossiers
 */
export async function getPublicReportByNumber(reportNumber: string): Promise<{
  report: Report;
  evidence: EvidenceItem[];
  relatedReports: Report[];
  comments: PublicComment[];
} | null> {
  const report = inMemoryReports.find(
    (r) => r.report_number === reportNumber && r.is_public
  );
  if (!report) return null;

  // Only return public evidence
  const allEv = inMemoryEvidence[report.id] || [];
  const publicEv = allEv.filter((e) => e.visibility === 'public');

  // Related reports
  const relatedReports = inMemoryReports
    .filter((r) => r.id !== report.id && r.is_public)
    .slice(0, 4);

  // Moderated comments
  const comments = inMemoryComments[report.id] || [];

  return {
    report,
    evidence: publicEv,
    relatedReports,
    comments,
  };
}

/**
 * Get moderated comments for public report
 */
export async function getPublicComments(reportId: string): Promise<PublicComment[]> {
  return inMemoryComments[reportId] || [];
}

/**
 * Submit citizen comment for moderation
 */
export async function addPublicComment(
  reportId: string,
  authorName: string,
  commentText: string
): Promise<PublicComment> {
  const newCmt: PublicComment = {
    id: `cmt-${Date.now()}`,
    report_id: reportId,
    author_name: authorName.trim() || 'Concerned Citizen',
    comment_text: commentText.trim(),
    status: 'approved', // Pre-moderated demo approval
    upvotes: 1,
    created_at: new Date().toISOString(),
  };

  if (!inMemoryComments[reportId]) {
    inMemoryComments[reportId] = [];
  }
  inMemoryComments[reportId].unshift(newCmt);

  // Update report count
  const report = inMemoryReports.find((r) => r.id === reportId);
  if (report) {
    report.comments_count = (report.comments_count || 0) + 1;
  }

  return newCmt;
}

/**
 * Increment report view count with deduplication
 */
export async function incrementReportViews(reportId: string): Promise<number> {
  const report = inMemoryReports.find((r) => r.id === reportId);
  if (report) {
    report.views_count = (report.views_count || 0) + 1;
    return report.views_count;
  }
  return 0;
}

/**
 * Public dashboard statistics
 */
export async function getPublicStats() {
  const totalReports = inMemoryReports.length;
  const underReview = inMemoryReports.filter((r) => r.status === 'under_review').length;
  const verified = inMemoryReports.filter((r) => r.verified_status).length;
  const referred = inMemoryReports.filter((r) => r.status === 'referred').length;
  const resolved = inMemoryReports.filter((r) => r.status === 'resolved').length;

  const byCategory: Record<string, number> = {};
  for (const r of inMemoryReports) {
    const code = r.category?.name_en || 'Other';
    byCategory[code] = (byCategory[code] || 0) + 1;
  }

  const byDivision: Record<string, number> = {};
  for (const r of inMemoryReports) {
    byDivision[r.division] = (byDivision[r.division] || 0) + 1;
  }

  return {
    totalReports,
    underReview,
    verified,
    referred,
    resolved,
    byCategory,
    byDivision,
  };
}

/**
 * Fetch all reports for reviewer administration
 */
export async function getAllReportsAdmin(): Promise<Report[]> {
  return [...inMemoryReports];
}

/**
 * Update report status (Reviewer action)
 */
export async function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus,
  publicNote?: string,
  internalRationale?: string
): Promise<Report | null> {
  const report = inMemoryReports.find((r) => r.id === reportId);
  if (!report) return null;

  const oldStatus = report.status;
  report.status = newStatus;
  if (newStatus === 'verified') {
    report.verified_status = true;
  }
  report.updated_at = new Date().toISOString();

  if (!inMemoryTimelines[reportId]) {
    inMemoryTimelines[reportId] = [];
  }

  inMemoryTimelines[reportId].push({
    id: `th-${reportId}-${Date.now()}`,
    report_id: reportId,
    previous_status: oldStatus,
    new_status: newStatus,
    created_at: new Date().toISOString(),
    public_note: publicNote || `Status updated to ${newStatus}.`,
    internal_rationale: internalRationale,
  });

  return report;
}
