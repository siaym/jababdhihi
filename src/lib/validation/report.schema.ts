import { z } from 'zod';

export const ExternalEvidenceSchema = z.object({
  type: z.literal('external_link'),
  provider: z.enum([
    'youtube',
    'facebook',
    'google_drive',
    'google_photos',
    'dropbox',
    'external_web',
  ]),
  url: z.string().url('Invalid URL format').regex(/^https:\/\//i, 'Only secure HTTPS links are accepted'),
  caption: z.string().optional(),
});

export const DirectUploadEvidenceSchema = z.object({
  type: z.enum(['image', 'video', 'audio', 'document']),
  provider: z.literal('direct_upload'),
  storage_path: z.string().optional(),
  original_filename: z.string(),
  mime_type: z.string(),
  file_size_bytes: z.number().max(100 * 1024 * 1024, 'File exceeds maximum 100MB limit'),
  caption: z.string().optional(),
});

export const EvidenceItemSchema = z.union([
  ExternalEvidenceSchema,
  DirectUploadEvidenceSchema,
]);

export const ReportSubmissionSchema = z.object({
  category_id: z.string().min(1, 'Please select a report category'),
  incident_date: z.string().min(1, 'Incident date is required'),
  approximate_time: z.string().optional(),
  division: z.string().min(1, 'Please select a division'),
  district: z.string().min(1, 'Please select a district'),
  upazila_thana: z.string().optional(),
  area_landmark: z.string().optional(),
  location_privacy: z.enum(['exact', 'approximate', 'confidential']).default('approximate'),
  
  institution_type: z.string().optional(),
  custom_organization_name: z.string().optional(),
  involved_role_or_title: z.string().optional(),
  
  description: z
    .string()
    .min(20, 'Incident description must be at least 20 characters for review')
    .max(5000, 'Description cannot exceed 5000 characters'),
  
  privacy_mode: z.enum(['anonymous', 'confidential', 'identified']).default('anonymous'),
  
  reporter_name: z.string().optional(),
  reporter_email: z.string().email().optional().or(z.literal('')),
  reporter_phone: z.string().optional(),
  
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and accuracy statement' }),
  }),
  
  evidence_items: z.array(EvidenceItemSchema).max(10, 'Maximum 10 evidence items per report').default([]),
});

export type ReportSubmissionInput = z.infer<typeof ReportSubmissionSchema>;
