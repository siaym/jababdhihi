import test from 'node:test';
import assert from 'node:assert/strict';

// Mirror of SSRF validation logic for isolated unit testing
const PRIVATE_IP_REGEXES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^localhost$/i,
  /^\[?::1\]?$/,
];

function validateSafeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'Empty URL' };
  }
  if (!/^https:\/\//i.test(rawUrl.trim())) {
    return { isValid: false, error: 'Non-HTTPS protocol' };
  }
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'https:') {
      return { isValid: false, error: 'Non-HTTPS protocol' };
    }
    const host = parsed.hostname.toLowerCase();
    for (const rx of PRIVATE_IP_REGEXES) {
      if (rx.test(host)) {
        return { isValid: false, error: 'Targeting private or local IP' };
      }
    }
    if (parsed.username || parsed.password) {
      return { isValid: false, error: 'Embedded credentials' };
    }
    return { isValid: true, domain: host };
  } catch {
    return { isValid: false, error: 'Malformed URL' };
  }
}

test('validateSafeUrl blocks plain HTTP, javascript, and data schemes', () => {
  assert.equal(validateSafeUrl('http://example.com').isValid, false);
  assert.equal(validateSafeUrl('javascript:alert(1)').isValid, false);
  assert.equal(validateSafeUrl('data:text/html;base64,PHNjcmlwdD4=').isValid, false);
});

test('validateSafeUrl blocks localhost and loopback IPv4/IPv6', () => {
  assert.equal(validateSafeUrl('https://localhost:8080/internal').isValid, false);
  assert.equal(validateSafeUrl('https://127.0.0.1/admin').isValid, false);
  assert.equal(validateSafeUrl('https://[::1]/secret').isValid, false);
});

test('validateSafeUrl blocks AWS/Cloud metadata and private network IPs', () => {
  assert.equal(validateSafeUrl('https://169.254.169.254/latest/meta-data').isValid, false);
  assert.equal(validateSafeUrl('https://10.0.0.5/api/status').isValid, false);
  assert.equal(validateSafeUrl('https://192.168.1.1/router').isValid, false);
});

test('validateSafeUrl allows valid public HTTPS domains', () => {
  assert.equal(validateSafeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ').isValid, true);
  assert.equal(validateSafeUrl('https://drive.google.com/drive/folders/abcdef').isValid, true);
});
