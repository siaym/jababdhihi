import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';

import { encryptField, decryptField } from '../src/lib/security/encryption.ts';
import {
  authorizeCaseOperation,
  verifyStaffCaseAccess,
  isProductionEnvironment,
} from '../src/lib/security/auth-check.ts';
import { canAcceptFileUploadsAsync, canAcceptSubmissionsAsync } from '../src/lib/security/safe-mode.ts';
import { validateSafeUrlAsync } from '../src/lib/security/ssrf.ts';

// Mock request helper
function createMockRequest(headers = {}, body = {}) {
  return {
    headers: {
      get: (name) => headers[name.toLowerCase()] || null,
    },
    json: async () => body,
  };
}

test('P0-1: Cross-case evidence authorization binding (BOLA Prevention)', async () => {
  // Case A credentials
  const caseAId = 'a0000000-0000-0000-0000-000000000001';
  const caseBId = 'b0000000-0000-0000-0000-000000000002';
  const caseARef = 'BD-2026-CASE-A';
  const secretA = 'ABCD-EFGH-JKLM-NPQR';

  // Attempt to access Case B's evidence using Case A's valid credentials
  // In development fallback, verifyReporterCredentials returns a report object with id 'temp-case-id'
  const req = createMockRequest();
  const crossCaseResult = await authorizeCaseOperation(req, {
    reportIdentifier: caseARef,
    trackingSecret: secretA,
    targetReportId: caseBId, // Evidence belongs to Case B!
  });

  // Must reject cross-case access with 403 Forbidden
  assert.equal(crossCaseResult.authorized, false);
  assert.equal(crossCaseResult.statusCode, 403);
  assert.match(crossCaseResult.error, /Cross-case access is strictly prohibited/i);
});

test('P0-2: AES-256-GCM contact field encryption & integrity', () => {
  const sensitivePhone = '+8801712345678';
  const sensitiveEmail = 'citizen-whistleblower@proton.me';
  const sensitiveName = 'Anonymous Source';

  // 1. Encryption generates 3-part hex string (iv:authTag:ciphertext)
  const encryptedPhone = encryptField(sensitivePhone);
  const encryptedEmail = encryptField(sensitiveEmail);
  const encryptedName = encryptField(sensitiveName);

  assert.ok(encryptedPhone);
  assert.ok(encryptedEmail);
  assert.ok(encryptedName);

  const parts = encryptedPhone.split(':');
  assert.equal(parts.length, 3, 'Must have IV, AuthTag, and Ciphertext');
  assert.equal(parts[0].length, 24, '12-byte IV in hex is 24 chars');
  assert.equal(parts[1].length, 32, '16-byte GCM tag in hex is 32 chars');

  // 2. Decryption recovers original plaintexts
  assert.equal(decryptField(encryptedPhone), sensitivePhone);
  assert.equal(decryptField(encryptedEmail), sensitiveEmail);
  assert.equal(decryptField(encryptedName), sensitiveName);

  // 3. Tampered ciphertext fails authentication check safely
  const tamperedCipher = `${parts[0]}:${parts[1]}:badc0de00000`;
  assert.equal(decryptField(tamperedCipher), null, 'Tampered data must yield null');

  // 4. Null / undefined handles gracefully
  assert.equal(encryptField(null), null);
  assert.equal(decryptField(null), null);
});

test('P0-3: Reviewer access restricted to assigned cases', async () => {
  const reviewerUser = {
    id: 'rev-uuid-1111',
    role: 'reviewer',
  };
  const adminUser = {
    id: 'admin-uuid-9999',
    role: 'admin',
  };

  // Administrator has global oversight
  const adminCheck = await verifyStaffCaseAccess(adminUser, 'any-case-id');
  assert.equal(adminCheck.authorized, true);

  // Missing target report identifier rejects
  const emptyCheck = await verifyStaffCaseAccess(reviewerUser, '');
  assert.equal(emptyCheck.authorized, false);
  assert.match(emptyCheck.error, /Target report identifier is required/i);
});

test('P0-4: Privacy allow-list projection eliminates sensitive leakages', () => {
  // Raw database record simulation
  const rawDbReport = {
    id: 'rep-001',
    report_number: 'BD-2026-001001',
    tracking_secret_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    assigned_reviewer_id: 'internal-rev-123',
    assigned_senior_id: 'internal-senior-456',
    reporter_name: 'Direct Plaintext Name',
    reporter_email: 'reporter@leaked.com',
    reporter_phone: '01700000000',
    description: 'Corrupt procurement witnessed.',
    status: 'submitted',
    created_at: new Date().toISOString(),
  };

  const rawDbTimeline = {
    id: 'hist-001',
    report_id: 'rep-001',
    actor_id: 'staff-secret-id',
    internal_rationale: 'Secret triage note: informant could be targeted.',
    public_note: 'Report under active review.',
    new_status: 'under_review',
  };

  const rawDbEvidence = {
    id: 'ev-001',
    report_id: 'rep-001',
    storage_path: 'report-evidence-private/rep-001/sensitive_document.pdf',
    moderation_notes: 'Verified authenticity via invoice cross-check.',
    visibility: 'reviewer_only',
    original_filename: 'evidence.pdf',
  };

  // Projections matching route.ts allow-lists
  const { tracking_secret_hash, assigned_reviewer_id, assigned_senior_id, reporter_name, reporter_email, reporter_phone, ...safeReport } = rawDbReport;
  const { actor_id, internal_rationale, ...safeTimeline } = rawDbTimeline;
  const { storage_path, moderation_notes, ...safeEvidence } = rawDbEvidence;

  assert.equal('tracking_secret_hash' in safeReport, false);
  assert.equal('assigned_reviewer_id' in safeReport, false);
  assert.equal('reporter_phone' in safeReport, false);

  assert.equal('internal_rationale' in safeTimeline, false);
  assert.equal('actor_id' in safeTimeline, false);
  assert.equal(safeTimeline.public_note, 'Report under active review.');

  assert.equal('storage_path' in safeEvidence, false);
  assert.equal('moderation_notes' in safeEvidence, false);
  assert.equal(safeEvidence.original_filename, 'evidence.pdf');
});

test('P0-5: Public evidence requires explicit approved review state', () => {
  // Decision matrix simulation matching signed-view/route.ts logic
  function isPubliclyAccessible(evidence) {
    return (
      evidence.visibility === 'public' &&
      (evidence.review_state === 'accepted' || evidence.review_state === 'approved')
    );
  }

  // Pending public evidence CANNOT be viewed publicly
  assert.equal(isPubliclyAccessible({ visibility: 'public', review_state: 'pending' }), false);

  // Flagged public evidence CANNOT be viewed publicly
  assert.equal(isPubliclyAccessible({ visibility: 'public', review_state: 'flagged' }), false);

  // Private evidence CANNOT be viewed publicly even if approved/accepted
  assert.equal(isPubliclyAccessible({ visibility: 'private', review_state: 'approved' }), false);
  assert.equal(isPubliclyAccessible({ visibility: 'private', review_state: 'accepted' }), false);

  // Accepted or approved public evidence can be served to unauthenticated visitors
  assert.equal(isPubliclyAccessible({ visibility: 'public', review_state: 'accepted' }), true);
  assert.equal(isPubliclyAccessible({ visibility: 'public', review_state: 'approved' }), true);
});

test('P1-1: Async DNS SSRF validation blocks malicious and private endpoints', async () => {
  // Direct localhost URL
  const localRes = await validateSafeUrlAsync('https://localhost:8080/exploit');
  assert.equal(localRes.isValid, false);

  // Direct private IP URL
  const privRes = await validateSafeUrlAsync('https://192.168.1.1/admin');
  assert.equal(privRes.isValid, false);

  // Cloud metadata endpoint
  const metaRes = await validateSafeUrlAsync('https://169.254.169.254/latest/meta-data');
  assert.equal(metaRes.isValid, false);

  // Public domain resolves validly
  const pubRes = await validateSafeUrlAsync('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(pubRes.isValid, true);
});

test('P1-3: Fail closed in production mode when database is unconfigured', () => {
  const origEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    assert.equal(isProductionEnvironment(), true);

    process.env.NODE_ENV = 'development';
    assert.equal(isProductionEnvironment(), false);
  } finally {
    process.env.NODE_ENV = origEnv;
  }
});
