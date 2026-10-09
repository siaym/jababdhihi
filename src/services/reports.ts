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
      'A commuter riding through Mirpur 10 roundabout was stopped at an evening traffic checkpoint. According to the commuter and recorded video footage, the duty officer allegedly withheld the vehicle key and demanded 5,000 taka in cash rather than issuing an official government challan slip, despite the rider presenting valid digital registration papers.\n\nThe video shows the conversation between the rider and the officer, the request for a formal receipt, and the refusal to issue one. The officer\'s identity and whether any formal record was later filed at the station have not yet been determined.',
    public_summary:
      'Commuter questions traffic police cash demand at Mirpur checkpoint',
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
    verification_context: {
      reviewed_by: 'Senior Legal & Media Review Desk',
      review_date: '2026-09-14',
      status_explanation: 'This report is currently Under Review. Video metadata and location have been authenticated, but official institutional inquiry findings remain pending.',
      authenticity_assessment: 'Video recording verified as unedited continuous footage with matching ambient evening daylight and authentic road infrastructure geometry.',
      what_is_verified: [
        'Geographic location matches Mirpur 10 roundabout commercial bank signage and road median.',
        'Timestamp and lighting correlate with sunset transition on 13 September 2026 (approx. 20:30 BST).',
        'Motorcycle registration papers visible on camera were cross-referenced and confirmed currently active in BRTA records.',
      ],
      what_remains_unverified: [
        'Identity and official badge code of the officer conducting the verbal transaction.',
        'Whether an internal DMP traffic challan docket was issued after recording concluded.',
        'Alleged private conversation prior to video recording initiation.',
      ],
      methodology_summary: 'Civic accountability standard: Public footage is reviewed to verify time, location, continuity, and safety. A report is an allegation under review, not a judicial finding.',
    },
    official_response: {
      entity_name: 'Dhaka Metropolitan Police (Mirpur Traffic Division)',
      response_date: '2026-09-15',
      status: 'investigating',
      statement: 'The concerned Traffic Division has noted public reports regarding an incident at Mirpur 10 roundabout. An Assistant Commissioner has been deputed to examine duty rosters and checkpoint records for the evening of 13 September 2026.',
      action_taken: 'Internal fact-finding inquiry opened; duty log requested for evening shift.',
      contact_department: 'Traffic Control Room / Public Relations Office',
    },
    next_steps: {
      referral_status: 'Forwarded to DMP Internal Oversight & Traffic Directorate for formal review.',
      next_milestones: [
        'Verification of officer duty rosters for 13 September shift.',
        'Filing of Right to Information (RTI) application for checkpoint operational log.',
        'Review of any closed-circuit surveillance footage from adjacent retail buildings.',
      ],
      helplines: [
        {
          title: 'DMP Traffic Control Helpline',
          number: '01713-398500',
          note: 'Direct line for reporting unlawful checkpoint demands or seeking traffic assistance.',
          authority: 'Dhaka Metropolitan Police',
        },
        {
          title: 'Anti-Corruption Commission (ACC) Hotline',
          number: '106',
          note: 'Toll-free national hotline for reporting public servant extortion or bribery demands.',
          authority: 'Anti-Corruption Commission Bangladesh',
        },
        {
          title: 'National Emergency Service',
          number: '999',
          note: 'Immediate emergency police dispatch if in immediate physical jeopardy.',
          authority: 'Ministry of Home Affairs',
        },
      ],
      how_to_corroborate: 'Commuters or eyewitnesses who were present at Mirpur 10 roundabout on 13 September between 20:15 and 20:45 may submit corroborating timestamps or receipts using the secure track reference.',
    },
    timeline_updates: [
      {
        date: '2026-09-13',
        title: 'Incident Occurred & Footage Archived',
        details: 'Citizen recorded interaction during vehicle documentation check and submitted video via encrypted portal.',
        status: 'received',
      },
      {
        date: '2026-09-14',
        title: 'Evidentiary Pre-Screening & EXIF Scrub',
        details: 'Footage validated for absence of digital tampering; civilian bystander faces masked to prevent harassment.',
        status: 'under_review',
      },
      {
        date: '2026-09-15',
        title: 'Notice Transmitted to DMP Traffic Division',
        details: 'Formal memorandum sent to regional traffic supervisory desk noting documented allegations.',
        status: 'under_review',
      },
    ],
    transcript: [
      { time: '00:15', speaker: 'Commuter', text: 'Good evening officer. Here are my valid digital registration certificate and road tax token.' },
      { time: '01:05', speaker: 'Duty Officer', text: 'Keep the phone down. The papers need further verification at the station unless settled here.' },
      { time: '01:42', speaker: 'Commuter', text: 'If there is a fine, please issue a formal slip or digital challan with the government treasury code.' },
      { time: '02:30', speaker: 'Duty Officer', text: 'There is no challan slip available now. Hand over five thousand or leave the vehicle key.' },
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
      'A first-year student at the University of Chittagong reported being summoned late at night to a dormitory guest room in Alaol Hall and subjected to intimidation and threats by senior students.\n\nPhotographs show the third-floor corridor where students were gathered, the formal complaint petition with an official Provost office date stamp, and a subsequent gathering of students calling for dormitory safety enforcement.',
    public_summary:
      'Students raise concerns about conditions and hazing in university dormitory',
    status: 'verified',
    priority: 3,
    is_public: true,
    verified_status: true,
    created_at: '2026-09-19T08:00:00Z',
    updated_at: '2026-09-22T14:30:00Z',
    evidence_count: 3,
    views_count: 8940,
    comments_count: 52,
    verification_context: {
      reviewed_by: 'Campus Rights & Institutional Fact-Check Team',
      review_date: '2026-09-22',
      status_explanation: 'This report has achieved Verified Status. Physical location, hospital outpatient records, and official Provost receipt stamps have been corroborated.',
      authenticity_assessment: 'Photographs examined with cryptographic hash consistency. Medical outpatient receipt and Proctorial stamped petition verified by university contacts.',
      what_is_verified: [
        'Corridor physical architecture matches Alaol Hall Block C 3rd Floor interior.',
        'Petition docket bears genuine inked date stamp and registration signature of the Hall Provost Office dated 19 September 2026.',
        'Victim sought outpatient care at Chittagong Medical College Hospital following intimidation; confidential triage summary reviewed.',
      ],
      what_remains_unverified: [
        'Names and academic departments of all senior students present in the guest room during the midnight assembly.',
        'Whether disciplinary warnings had been issued to the involved student committee in preceding semesters.',
      ],
      methodology_summary: 'All identifying personal data of the victim and student witnesses has been redacted. Photographic evidence confirms location and official complaint lodgment.',
    },
    official_response: {
      entity_name: 'Office of the Proctor, University of Chittagong',
      response_date: '2026-09-22',
      status: 'acknowledged',
      statement: 'The Proctorial Body has received formal notification regarding alleged ragging at Alaol Hall. A 3-member inquiry committee has been constituted under the University Disciplinary Ordinance.',
      action_taken: 'Inquiry committee formed; student petitioner provided temporary protective accommodation outside the dormitory block.',
      contact_department: 'Proctorial Office / Student Welfare Directorate',
    },
    next_steps: {
      referral_status: 'Case referred to University Disciplinary Board and National Human Rights Commission (Student Rights Cell).',
      next_milestones: [
        'Inquiry committee preliminary hearing with hall provost and resident tutors.',
        'Submission of inquiry findings to University Syndicate within 21 working days.',
        'Independent legal aid review by human rights advocacy counsel.',
      ],
      helplines: [
        {
          title: 'University Proctorial Emergency Cell',
          number: '01711-892400',
          note: 'Direct line for residential hall harassment and emergency safety intervention.',
          authority: 'University of Chittagong',
        },
        {
          title: 'Ain o Salish Kendra (ASK) Legal Aid Desk',
          number: '01729-264868',
          note: 'Free legal counseling and protection assistance for student victims of hazing and violence.',
          authority: 'Human Rights Legal Aid NGO',
        },
        {
          title: 'National Women & Children Support Hotline',
          number: '109',
          note: 'National toll-free support helpline for abuse, violence, and intimidation counseling.',
          authority: 'Ministry of Women and Children Affairs',
        },
      ],
      how_to_corroborate: 'Current residents of Alaol Hall with relevant knowledge of late-night mandatory attendance summons may submit confidential statements via report tracking.',
    },
    timeline_updates: [
      {
        date: '2026-09-18',
        title: 'Hazing Incident Occurred',
        details: 'First-year student summoned to dormitory guest room and subjected to physical intimidation.',
        status: 'received',
      },
      {
        date: '2026-09-19',
        title: 'Formal Petition Lodged with Hall Provost',
        details: 'Victim submitted stamped complaint docket; fellow students documented corridor assembly.',
        status: 'under_review',
      },
      {
        date: '2026-09-22',
        title: 'Evidentiary Corroboration & Verification',
        details: 'Medical notes and hall receipt stamps authenticated; public dossier approved with redactions.',
        status: 'verified',
      },
    ],
    image_annotations: [
      {
        frame_index: 0,
        title: 'Third-Floor Corridor Environment',
        observation: 'Shows the residential hallway outside room 314 where students were instructed to assemble after hours. Note lack of surveillance cameras.',
        verification_status: 'verified',
      },
      {
        frame_index: 1,
        title: 'Official Provost Acknowledgment Docket',
        observation: 'Physical petition signed and stamped by hall administrative staff on 19 September 2026. Student registration number blurred for safety.',
        verification_status: 'verified',
      },
      {
        frame_index: 2,
        title: 'Daytime Student Assembly Outside Administration',
        observation: 'Students gathering peacefully to demand enforcement of anti-ragging policies following disclosure of the incident.',
        verification_status: 'verified',
      },
    ],
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
      'Citizens visiting the Boalia Sub-Registry Office in Rajshahi to certify land deeds report being asked for an unrecorded 8,000 taka speed fee on top of lawful government fees before files would be processed.\n\nDocuments show official registration fees should total 2,400 taka under statutory law, while penciled amounts on the file jacket reflect the higher demanded amount.',
    public_summary:
      'Service-seekers report unrecorded speed fees at Boalia land registry office',
    status: 'referred',
    priority: 2,
    is_public: true,
    verified_status: true,
    created_at: '2026-09-26T10:00:00Z',
    updated_at: '2026-09-29T16:00:00Z',
    evidence_count: 2,
    views_count: 6180,
    comments_count: 19,
    verification_context: {
      reviewed_by: 'Public Administration & Land Governance Desk',
      review_date: '2026-09-28',
      status_explanation: 'This report has been Referred to the Anti-Corruption Commission. Documentary proof of unrecorded fee demands was verified against the statutory registration fee schedule.',
      authenticity_assessment: 'Scanned registration file jacket demonstrates manual pencil notations matching unrecorded speed fee rates commonly reported at this sub-registry office.',
      what_is_verified: [
        'Document serial corresponds to active land title transfer file at Boalia Sub-Registry.',
        'Statutory registration fee schedule published on Ministry of Law portal indicates total lawful fees are BDT 2,400, not BDT 10,400.',
      ],
      what_remains_unverified: [
        'Direct identification of the unofficial intermediary (dalal) who demanded cash payment in the corridor.',
      ],
      methodology_summary: 'Verified discrepancy between statutory government schedule and demanded payment.',
    },
    official_response: {
      entity_name: 'District Registrar Office, Rajshahi',
      response_date: '2026-09-29',
      status: 'pending',
      statement: 'The District Registrar has instructed all sub-registry offices in the district to display official fee citizen charters conspicuously in service areas.',
      action_taken: 'Notice issued; administrative inspection scheduled for Boalia office.',
      contact_department: 'District Registration Directorate',
    },
    next_steps: {
      referral_status: 'Referred to Anti-Corruption Commission (ACC) Integrated District Office Rajshahi.',
      next_milestones: [
        'ACC preliminary verification docket assignment.',
        'Citizens Advice Bureau audit of service delivery turnaround times at Boalia office.',
      ],
      helplines: [
        {
          title: 'ACC Land Sector Grievance Hotline',
          number: '106',
          note: 'Direct reporting of unreceipted fees and bribery demands in land deed registration.',
          authority: 'Anti-Corruption Commission',
        },
        {
          title: 'Government Citizen Services Grievance Redress System (GRS)',
          number: '333',
          note: 'Official portal for filing administrative complaints against government service delays.',
          authority: 'Cabinet Division & a2i',
        },
      ],
      how_to_corroborate: 'Citizens who experienced fee overcharging at the Boalia Sub-Registry during September 2026 can submit fee slips.',
    },
    timeline_updates: [
      {
        date: '2026-09-25',
        title: 'Deed Application Submitted',
        details: 'Service-seeker presented lawful deed transfer papers and was instructed to pay speed fee.',
        status: 'received',
      },
      {
        date: '2026-09-28',
        title: 'Fee Discrepancy Verified',
        details: 'Statutory fee table cross-referenced against demands.',
        status: 'verified',
      },
      {
        date: '2026-09-29',
        title: 'Dossier Referred to ACC',
        details: 'Complaint forwarded to ACC regional office for administrative audit.',
        status: 'referred',
      },
    ],
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
