import test from 'node:test';
import assert from 'node:assert/strict';

const PROHIBITED_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'sh', 'php', 'py', 'js', 'svg', 'zip', 'rar'
];

const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'webp', 'pdf', 'mp3', 'wav', 'mp4'
];

function validateEvidenceFileMetadata(filename, fileSizeBytes) {
  if (!filename || typeof filename !== 'string') {
    return { isValid: false, error: 'Empty filename' };
  }
  if (fileSizeBytes <= 0) {
    return { isValid: false, error: 'Empty file' };
  }
  if (fileSizeBytes > 100 * 1024 * 1024) {
    return { isValid: false, error: 'Exceeds 100MB limit' };
  }

  const parts = filename.split('.');
  if (parts.length < 2) {
    return { isValid: false, error: 'No extension' };
  }

  const ext = parts[parts.length - 1].toLowerCase().trim();

  if (PROHIBITED_EXTENSIONS.includes(ext)) {
    return { isValid: false, error: `Prohibited extension: .${ext}` };
  }

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { isValid: false, error: `Unsupported extension: .${ext}` };
  }

  return { isValid: true, detectedExtension: ext };
}

test('validateEvidenceFileMetadata blocks executables, scripts, and archives', () => {
  assert.equal(validateEvidenceFileMetadata('virus.exe', 1024).isValid, false);
  assert.equal(validateEvidenceFileMetadata('malicious.bat', 2048).isValid, false);
  assert.equal(validateEvidenceFileMetadata('shell.php', 512).isValid, false);
  assert.equal(validateEvidenceFileMetadata('archive.zip', 4096).isValid, false);
});

test('validateEvidenceFileMetadata blocks user SVGs containing XSS vectors', () => {
  assert.equal(validateEvidenceFileMetadata('graphic.svg', 1024).isValid, false);
});

test('validateEvidenceFileMetadata enforces 100MB file limit', () => {
  const hugeSize = 101 * 1024 * 1024;
  assert.equal(validateEvidenceFileMetadata('huge_video.mp4', hugeSize).isValid, false);
});

test('validateEvidenceFileMetadata allows legitimate images and documents', () => {
  assert.equal(validateEvidenceFileMetadata('gd_copy.pdf', 2 * 1024 * 1024).isValid, true);
  assert.equal(validateEvidenceFileMetadata('evidence_photo.jpg', 3 * 1024 * 1024).isValid, true);
  assert.equal(validateEvidenceFileMetadata('audio_statement.mp3', 5 * 1024 * 1024).isValid, true);
});
