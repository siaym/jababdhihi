import { createAdminClient } from './admin';

export const STORAGE_BUCKETS = {
  PRIVATE_EVIDENCE: 'report-evidence-private',
  PUBLIC_EVIDENCE: 'report-evidence-public',
  THUMBNAILS: 'report-thumbnails',
} as const;

export const EVIDENCE_BUCKET = STORAGE_BUCKETS.PRIVATE_EVIDENCE;

export interface UploadTicket {
  uploadUrl: string;
  storagePath: string;
  expiresIn: number;
}

/**
 * Generate a pre-signed PUT upload URL for direct streaming to private Supabase Storage.
 * The file is placed in `cases/{reportId}/{uuid}.{ext}` in the private evidence bucket.
 */
export async function createEvidenceUploadTicket(
  reportId: string,
  fileName: string,
  fileSizeBytes: number
): Promise<UploadTicket | null> {
  const admin = createAdminClient();
  if (!admin) {
    // Graceful fallback for local development without active Supabase credentials
    return {
      uploadUrl: `/api/v1/evidence/mock-upload`,
      storagePath: `cases/${reportId}/${Date.now()}-${fileName}`,
      expiresIn: 300,
    };
  }

  const sanitizedExt = fileName.split('.').pop()?.toLowerCase() || 'bin';
  const fileUuid = crypto.randomUUID();
  const storagePath = `cases/${reportId}/${fileUuid}.${sanitizedExt}`;

  // Pre-signed upload URL valid for 300 seconds (5 minutes)
  const { data, error } = await admin.storage
    .from(STORAGE_BUCKETS.PRIVATE_EVIDENCE)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    console.error('Failed to create signed upload URL:', error);
    return null;
  }

  return {
    uploadUrl: data.signedUrl,
    storagePath,
    expiresIn: 300,
  };
}

/**
 * Generate a short-lived pre-signed download/view URL for private evidence.
 * TTL: 900 seconds (15 minutes).
 */
export async function getSignedEvidenceViewUrl(
  storagePath: string,
  expiresInSeconds = 900
): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) {
    return `/storage/placeholder/${storagePath}`;
  }

  const { data, error } = await admin.storage
    .from(STORAGE_BUCKETS.PRIVATE_EVIDENCE)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data) {
    console.error('Failed to generate signed evidence URL:', error);
    return null;
  }

  return data.signedUrl;
}
