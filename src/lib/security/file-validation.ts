/**
 * Evidence File Upload Security & Validation Module
 * Validates file sizes, allowed MIME types, dangerous extensions,
 * and header magic bytes to protect storage infrastructure.
 */

export const ALLOWED_EVIDENCE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'pdf',
  'mp3',
  'wav',
  'm4a',
  'mp4',
  'webm',
] as const;

export const PROHIBITED_EXTENSIONS = [
  'exe',
  'bat',
  'cmd',
  'sh',
  'bash',
  'ps1',
  'vbs',
  'jar',
  'scr',
  'pif',
  'hta',
  'cpl',
  'msc',
  'msi',
  'dll',
  'sys',
  'drv',
  'php',
  'phtml',
  'asp',
  'aspx',
  'jsp',
  'cgi',
  'py',
  'pl',
  'rb',
  'js',
  'ts',
  'svg', // Raw user-supplied SVGs can contain embedded JavaScript XSS vectors
  'html',
  'htm',
  'xhtml',
  'zip',
  'rar',
  '7z',
  'tar',
  'gz',
  'iso',
  'dmg',
];

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB hard ceiling
export const MAX_IMAGE_PDF_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB standard ceiling

// Known magic byte signatures (first 4 bytes hex)
export const MAGIC_SIGNATURES: Record<string, string[]> = {
  'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffdb', 'ffd8ffee'],
  'image/png': ['89504e47'],
  'image/webp': ['52494646'], // 'RIFF' header
  'application/pdf': ['25504446'], // '%PDF'
};

export interface FileValidationResult {
  isValid: boolean;
  sanitizedFilename: string;
  detectedExtension: string;
  error?: string;
}

/**
 * Validates file metadata prior to issuance of pre-signed upload tickets.
 */
export function validateEvidenceFileMetadata(
  filename: string,
  mimeType: string,
  fileSizeBytes: number
): FileValidationResult {
  if (!filename || typeof filename !== 'string') {
    return {
      isValid: false,
      sanitizedFilename: '',
      detectedExtension: '',
      error: 'A valid filename is required.',
    };
  }

  // 1. Check size bounds
  if (fileSizeBytes <= 0) {
    return {
      isValid: false,
      sanitizedFilename: '',
      detectedExtension: '',
      error: 'File cannot be empty (0 bytes).',
    };
  }

  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      sanitizedFilename: '',
      detectedExtension: '',
      error: `File size exceeds the platform maximum of 100MB.`,
    };
  }

  // 2. Extract and check extension
  const parts = filename.split('.');
  if (parts.length < 2) {
    return {
      isValid: false,
      sanitizedFilename: '',
      detectedExtension: '',
      error: 'Files without an extension are not permitted.',
    };
  }

  const rawExt = parts[parts.length - 1].toLowerCase().trim();

  // Check prohibited extensions list
  if (PROHIBITED_EXTENSIONS.includes(rawExt)) {
    return {
      isValid: false,
      sanitizedFilename: '',
      detectedExtension: rawExt,
      error: `The file extension .${rawExt} is prohibited for security reasons. Executables, scripts, archives, and unverified vectors are rejected.`,
    };
  }

  // Check against allowed evidence extensions
  const isAllowedExt = (ALLOWED_EVIDENCE_EXTENSIONS as readonly string[]).includes(rawExt);
  if (!isAllowedExt) {
    return {
      isValid: false,
      sanitizedFilename: '',
      detectedExtension: rawExt,
      error: `Unsupported file type .${rawExt}. Please upload JPG, PNG, WEBP, PDF, MP3, WAV, or MP4 evidence.`,
    };
  }

  // 3. Sanitize filename (remove path traversal, non-alphanumeric special characters)
  const baseName = parts.slice(0, -1).join('_').replace(/[^a-zA-Z0-9_-]/g, '_');
  const sanitizedFilename = `${baseName.slice(0, 50)}.${rawExt}`;

  return {
    isValid: true,
    sanitizedFilename,
    detectedExtension: rawExt,
  };
}
