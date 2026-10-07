import {
  Report,
  ReportStatus,
  ReportStatusHistoryItem,
  CaseMessage,
  EvidenceItem,
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
    location_privacy: 'approximate',
    institution_type: 'police',
    custom_organization_name: 'Mirpur Model Thana',
    involved_role_or_title: 'Duty Sub-Inspector',
    description:
      'Citizen was allegedly detained at a routine motorcycle checkpoint without grounds. The officer allegedly demanded BDT 5,000 to return vehicle documents despite all registrations being valid. Formal receipt was denied.',
    public_summary:
      'Report alleging arbitrary extortion during vehicle documentation checkpoint near Mirpur.',
    status: 'under_review',
    priority: 2,
    is_public: true,
    verified_status: false,
    created_at: '2026-09-13T09:15:00Z',
    updated_at: '2026-09-14T11:20:00Z',
    evidence_count: 2,
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
    location_privacy: 'approximate',
    institution_type: 'university',
    custom_organization_name: 'University of Chittagong',
    involved_role_or_title: 'Dormitory Senior Students',
    description:
      'First-year student subjected to late-night physical intimidation and forced mental harassment in the dormitory guest room. Victim was threatened with academic harm if reported to authorities.',
    public_summary:
      'Report alleging severe dormitory ragging and intimidation of a first-year student.',
    status: 'verified',
    priority: 3,
    is_public: true,
    verified_status: true,
    created_at: '2026-09-19T08:00:00Z',
    updated_at: '2026-09-22T14:30:00Z',
    evidence_count: 3,
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
    location_privacy: 'approximate',
    institution_type: 'government',
    custom_organization_name: 'Sub-Registry Office',
    involved_role_or_title: 'Record Clerk & Intermediary (Dalal)',
    description:
      'Service-seeker applying for land deed certification was informed the file would not proceed without paying an unrecorded "speed fee" of BDT 8,000. Audio recording submitted.',
    public_summary:
      'Report alleging unauthorized bribery demands for standard land registry services.',
    status: 'referred',
    priority: 2,
    is_public: true,
    verified_status: true,
    created_at: '2026-09-26T10:00:00Z',
    updated_at: '2026-09-29T16:00:00Z',
    evidence_count: 1,
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
      caption: 'Video snippet recorded during the checkpoint stop',
      created_at: '2026-09-13T09:16:00Z',
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
      caption: 'Valid motorcycle registration and tax token copy',
      created_at: '2026-09-13T09:16:00Z',
    },
  ],
  'rep-002': [
    {
      id: 'ev-3',
      report_id: 'rep-002',
      evidence_type: 'document',
      provider: 'direct_upload',
      original_filename: 'hospital_treatment_record.pdf',
      mime_type: 'application/pdf',
      file_size_bytes: 840000,
      visibility: 'reviewer_only',
      review_state: 'accepted',
      caption: 'Medical examination certificate from University Medical Center',
      created_at: '2026-09-19T08:05:00Z',
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

/**
 * Get single report by public report number
 */
export async function getPublicReportByNumber(reportNumber: string): Promise<{
  report: Report;
  evidence: EvidenceItem[];
} | null> {
  const report = inMemoryReports.find(
    (r) => r.report_number === reportNumber && r.is_public
  );
  if (!report) return null;

  // Only return public evidence
  const allEv = inMemoryEvidence[report.id] || [];
  const publicEv = allEv.filter((e) => e.visibility === 'public');

  return {
    report,
    evidence: publicEv,
  };
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
