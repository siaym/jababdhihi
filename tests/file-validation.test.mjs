import test from 'node:test';
import assert from 'node:assert/strict';

const {
  validateEvidenceFileMetadata,
  validateBufferMagicBytes,
  detectBufferMimeType,
  sanitizeImageAndStripExif,
} = await import('../src/lib/security/file-validation.ts');

test('validateEvidenceFileMetadata blocks executables, scripts, and archives', () => {
  assert.equal(validateEvidenceFileMetadata('virus.exe', 'application/x-msdownload', 1024).isValid, false);
  assert.equal(validateEvidenceFileMetadata('malicious.bat', 'text/plain', 2048).isValid, false);
  assert.equal(validateEvidenceFileMetadata('shell.php', 'application/x-php', 512).isValid, false);
  assert.equal(validateEvidenceFileMetadata('archive.zip', 'application/zip', 4096).isValid, false);
});

test('validateEvidenceFileMetadata blocks user SVGs containing XSS vectors', () => {
  assert.equal(validateEvidenceFileMetadata('graphic.svg', 'image/svg+xml', 1024).isValid, false);
});

test('validateEvidenceFileMetadata enforces 100MB file limit', () => {
  const hugeSize = 101 * 1024 * 1024;
  assert.equal(validateEvidenceFileMetadata('huge_video.mp4', 'video/mp4', hugeSize).isValid, false);
});

test('validateEvidenceFileMetadata allows legitimate images and documents', () => {
  assert.equal(validateEvidenceFileMetadata('gd_copy.pdf', 'application/pdf', 2 * 1024 * 1024).isValid, true);
  assert.equal(validateEvidenceFileMetadata('evidence_photo.jpg', 'image/jpeg', 3 * 1024 * 1024).isValid, true);
  assert.equal(validateEvidenceFileMetadata('audio_statement.mp3', 'audio/mpeg', 5 * 1024 * 1024).isValid, true);
});

test('validateBufferMagicBytes detects genuine JPEG, PNG, and PDF headers', () => {
  const jpegBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  assert.equal(validateBufferMagicBytes(jpegBuf, 'image/jpeg').isValid, true);

  const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(validateBufferMagicBytes(pngBuf, 'image/png').isValid, true);

  const pdfBuf = Buffer.from('%PDF-1.7\n1 0 obj');
  assert.equal(validateBufferMagicBytes(pdfBuf, 'application/pdf').isValid, true);
});

test('validateBufferMagicBytes blocks disguised PE/ELF executables and script vectors', () => {
  // Disguised Windows PE/MZ executable
  const peBuf = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00]);
  const peRes = validateBufferMagicBytes(peBuf, 'image/jpeg');
  assert.equal(peRes.isValid, false);
  assert.match(peRes.error, /Executable binary/i);

  // Script injection
  const scriptBuf = Buffer.from('<script>evil()</script>');
  assert.equal(validateBufferMagicBytes(scriptBuf, 'image/png').isValid, false);
});

test('sanitizeImageAndStripExif: Sharp strips metadata and yields clean re-encoded buffer', async () => {
  const sharp = (await import('sharp')).default;
  const rawPng = await sharp({
    create: {
      width: 8,
      height: 8,
      channels: 4,
      background: { r: 198, g: 40, b: 40, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  const sanitized = await sanitizeImageAndStripExif(rawPng);
  assert.ok(sanitized.sanitizedBuffer.length > 0);
  assert.equal(sanitized.width, 8);
  assert.equal(sanitized.height, 8);
});
