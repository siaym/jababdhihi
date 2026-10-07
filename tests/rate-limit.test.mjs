import test from 'node:test';
import assert from 'node:assert/strict';

const { checkRateLimit, setRateLimitMultiplier, getClientIp } = await import(
  '../src/lib/security/rate-limit.ts'
);

test('rateLimiter: real checkRateLimit allows requests up to tier threshold', () => {
  const testId = `unit-test-${Date.now()}-1`;
  const tierConfig = { maxRequests: 3, windowSeconds: 60 };

  const r1 = checkRateLimit('public-api', testId, tierConfig);
  assert.equal(r1.isAllowed, true);
  assert.equal(r1.remaining, 2);

  const r2 = checkRateLimit('public-api', testId, tierConfig);
  assert.equal(r2.isAllowed, true);
  assert.equal(r2.remaining, 1);

  const r3 = checkRateLimit('public-api', testId, tierConfig);
  assert.equal(r3.isAllowed, true);
  assert.equal(r3.remaining, 0);

  // 4th request exceeds threshold
  const r4 = checkRateLimit('public-api', testId, tierConfig);
  assert.equal(r4.isAllowed, false);
  assert.equal(r4.remaining, 0);
  assert.ok(r4.resetSeconds > 0);
});

test('rateLimiter: dynamic rate multiplier tightens quotas', () => {
  const testId = `unit-test-${Date.now()}-multiplier`;
  setRateLimitMultiplier(2.0); // 2x stricter

  // Normal limit is 4, halved to 2
  const customTier = { maxRequests: 4, windowSeconds: 60 };
  const r1 = checkRateLimit('public-api', testId, customTier);
  assert.equal(r1.isAllowed, true);
  assert.equal(r1.totalLimit, 2);

  const r2 = checkRateLimit('public-api', testId, customTier);
  assert.equal(r2.isAllowed, true);

  const r3 = checkRateLimit('public-api', testId, customTier);
  assert.equal(r3.isAllowed, false);

  // Restore normal multiplier
  setRateLimitMultiplier(1.0);
});

test('rateLimiter: getClientIp extracts real client IP from reverse proxy headers', () => {
  const reqWithCf = new Request('https://jababdihi.org', {
    headers: { 'cf-connecting-ip': '203.0.113.195' },
  });
  assert.equal(getClientIp(reqWithCf), '203.0.113.195');

  const reqWithXff = new Request('https://jababdihi.org', {
    headers: { 'x-forwarded-for': '198.51.100.22, 10.0.0.1' },
  });
  assert.equal(getClientIp(reqWithXff), '198.51.100.22');
});
