import test from 'node:test';
import assert from 'node:assert/strict';

// Import real production SSRF module directly
const { validateSafeUrl, validateSafeUrlAsync, isPrivateOrReservedIp } = await import(
  '../src/lib/security/ssrf.ts'
);

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

test('isPrivateOrReservedIp catches carrier-grade NAT, private subnets, and metadata', () => {
  assert.equal(isPrivateOrReservedIp('127.0.0.1'), true);
  assert.equal(isPrivateOrReservedIp('10.0.0.1'), true);
  assert.equal(isPrivateOrReservedIp('172.16.0.1'), true);
  assert.equal(isPrivateOrReservedIp('192.168.1.1'), true);
  assert.equal(isPrivateOrReservedIp('169.254.169.254'), true);
  assert.equal(isPrivateOrReservedIp('100.64.0.1'), true);
  assert.equal(isPrivateOrReservedIp('::1'), true);
  assert.equal(isPrivateOrReservedIp('fe80::1'), true);
  assert.equal(isPrivateOrReservedIp('8.8.8.8'), false);
  assert.equal(isPrivateOrReservedIp('1.1.1.1'), false);
});

test('validateSafeUrlAsync resolves real hostnames and verifies non-private IPs', async () => {
  const result = await validateSafeUrlAsync('https://www.google.com');
  assert.equal(result.isValid, true);
  assert.ok(result.resolvedIps && result.resolvedIps.length > 0);
  for (const ip of result.resolvedIps) {
    assert.equal(isPrivateOrReservedIp(ip), false);
  }
});
