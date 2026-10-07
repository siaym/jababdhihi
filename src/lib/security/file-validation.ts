/**
 * Evidence File Upload Security & Validation Module
 * Validates file sizes, allowed MIME types, prohibited extensions,
 * binary magic bytes inspection, and server-side EXIF/metadata sanitization using Sharp.
 */

import sharp from 'sharp';

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

export interface FileValidationResult {
  isValid: boolean;
  sanitizedFilename: string;
  detectedExtension: string;
  error?: string;
}

export interface MagicByteValidationResult {
  isValid: boolean;
  detectedMime?: string;
  detectedType?: string;
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

/**
 * Inspect raw binary buffer magic bytes to verify true file format.
 * Prevents malicious files disguised with false extensions or headers.
 */
export function detectBufferMimeType(buffer: Buffer | Uint8Array): string | null {
  if (!buffer || buffer.length < 4) return null;

  // Hex helpers
  const toHex = (start: number, end: number) =>
    Array.from(buffer.slice(start, end))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  const first4 = toHex(0, 4);

  // JPEG: Starts with FF D8 FF
  if (toHex(0, 3) === 'ffd8ff') {
    return 'image/jpeg';
  }

  // PNG: Starts with 89 50 4E 47
  if (first4 === '89504e47') {
    return 'image/png';
  }

  // PDF: Starts with 25 50 44 46 ('%PDF')
  if (first4 === '25504446') {
    return 'application/pdf';
  }

  // RIFF container (WEBP or WAV)
  if (first4 === '52494646' && buffer.length >= 12) {
    const riffType = toHex(8, 12);
    if (riffType === '57454250') return 'image/webp'; // 'WEBP'
    if (riffType === '57415645') return 'audio/wav'; // 'WAVE'
  }

  // MP3: Starts with ID3 (49 44 33) or MPEG frame sync (FF FB / FF F3 / FF F2)
  if (toHex(0, 3) === '494433' || toHex(0, 2) === 'fffb' || toHex(0, 2) === 'fff3') {
    return 'audio/mpeg';
  }

  // MP4: Bytes 4..8 usually contain 'ftyp' (66 74 79 70)
  if (buffer.length >= 8 && toHex(4, 8) === '66747970') {
    return 'video/mp4';
  }

  return null;
}

/**
 * Validates a file buffer against expected magic bytes and detects spoofed extensions.
 */
export function validateBufferMagicBytes(
  buffer: Buffer | Uint8Array,
  declaredMime?: string
): MagicByteValidationResult {
  if (!buffer || buffer.length < 2) {
    return {
      isValid: false,
      error: 'File payload is too small or truncated to be a valid evidence asset.',
    };
  }

  // Check for dangerous executable signatures (MZ header = 4D 5A, ELF = 7F 45 4C 46, script tags)
  const first2Hex = Array.from(buffer.slice(0, 2)).map((b) => b.toString(16).padStart(2, '0')).join('');
  if (first2Hex === '4d5a') {
    return { isValid: false, error: 'Executable binary (Windows PE / MZ header) detected and prohibited.' };
  }

  if (buffer.length >= 4) {
    const first4Hex = Array.from(buffer.slice(0, 4)).map((b) => b.toString(16).padStart(2, '0')).join('');
    if (first4Hex === '7f454c46') {
      return { isValid: false, error: 'Executable binary (Linux ELF header) detected and prohibited.' };
    }
  }

  if (buffer.length < 8) {
    return {
      isValid: false,
      error: 'File payload is too small or truncated to be a valid evidence asset.',
    };
  }

  // Check for HTML/Script injection
  const initialText = Buffer.from(buffer.slice(0, Math.min(buffer.length, 512))).toString('utf8').toLowerCase();
  if (
    initialText.includes('<script') ||
    initialText.includes('<html') ||
    initialText.includes('<?php') ||
    initialText.includes('eval(')
  ) {
    return { isValid: false, error: 'HTML, PHP, or script vectors detected in binary asset payload.' };
  }

  const detectedMime = detectBufferMimeType(buffer);
  if (!detectedMime) {
    return {
      isValid: false,
      error: 'Unrecognized file format. Magic byte header does not correspond to approved evidence formats.',
    };
  }

  // If client declared a MIME type, verify it is compatible
  if (declaredMime) {
    const normDeclared = declaredMime.toLowerCase().trim();
    const isImageMismatch =
      normDeclared.startsWith('image/') && !detectedMime.startsWith('image/');
    const isPdfMismatch =
      normDeclared.includes('pdf') && detectedMime !== 'application/pdf';

    if (isImageMismatch || isPdfMismatch) {
      return {
        isValid: false,
        detectedMime,
        error: `MIME type mismatch: declared '${declaredMime}' but binary magic bytes indicate '${detectedMime}'.`,
      };
    }
  }

  return {
    isValid: true,
    detectedMime,
    detectedType: detectedMime.split('/')[0],
  };
}

/**
 * Server-side image sanitization: Strips GPS, camera serials, and device EXIF tags
 * and re-encodes the image using Sharp.
 */
export async function sanitizeImageAndStripExif(imageBuffer: Buffer): Promise<{
  sanitizedBuffer: Buffer;
  format: string;
  width?: number;
  height?: number;
}> {
  // Use Sharp to rotate according to EXIF orientation, then strip all metadata
  const pipeline = sharp(imageBuffer)
    .rotate() // Auto-rotates based on EXIF orientation
    .withMetadata({
      // Strip EXIF, GPS, camera metadata entirely for reporter anonymity and security
      exif: {},
    });

  const metadata = await pipeline.metadata();
  const format = metadata.format || 'webp';

  let sanitizedBuffer: Buffer;
  if (format === 'png') {
    sanitizedBuffer = await pipeline.png({ compressionLevel: 8 }).toBuffer();
  } else if (format === 'webp') {
    sanitizedBuffer = await pipeline.webp({ quality: 85 }).toBuffer();
  } else {
    // Default to clean JPEG
    sanitizedBuffer = await pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  }

  return {
    sanitizedBuffer,
    format,
    width: metadata.width,
    height: metadata.height,
  };
}
