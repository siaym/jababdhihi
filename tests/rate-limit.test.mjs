import test from 'node:test';
import assert from 'node:assert/strict';

// Mirror of rate limiting logic for isolated unit testing
function createRateLimiter(maxRequests, windowSeconds) {
  const timestamps = [];

  return function check(now = Date.now()) {
    const windowMs = windowSeconds * 1000;
    while (timestamps.length > 0 && now - timestamps[0] >= windowMs) {
      timestamps.shift();
    }

    if (timestamps.length >= maxRequests) {
      const resetSeconds = Math.ceil((timestamps[0] + windowMs - now) / 1000);
      return {
        isAllowed: false,
        remaining: 0,
        resetSeconds,
      };
    }

    timestamps.push(now);
    return {
      isAllowed: true,
      remaining: maxRequests - timestamps.length,
      resetSeconds: windowSeconds,
    };
  };
}

test('rateLimiter allows requests up to max threshold', () => {
  const limiter = createRateLimiter(3, 60);
  const now = 100000;

  const r1 = limiter(now);
  assert.equal(r1.isAllowed, true);
  assert.equal(r1.remaining, 2);

  const r2 = limiter(now + 1000);
  assert.equal(r2.isAllowed, true);
  assert.equal(r2.remaining, 1);

  const r3 = limiter(now + 2000);
  assert.equal(r3.isAllowed, true);
  assert.equal(r3.remaining, 0);

  // 4th request exceeds limit
  const r4 = limiter(now + 3000);
  assert.equal(r4.isAllowed, false);
  assert.equal(r4.remaining, 0);
  assert.ok(r4.resetSeconds > 0);
});

test('rateLimiter resets quota after sliding window expires', () => {
  const limiter = createRateLimiter(2, 10);
  const start = 100000;

  assert.equal(limiter(start).isAllowed, true);
  assert.equal(limiter(start + 1000).isAllowed, true);
  assert.equal(limiter(start + 2000).isAllowed, false);

  // Advance clock beyond 10-second window
  const afterWindow = start + 11000;
  const resetAttempt = limiter(afterWindow);
  assert.equal(resetAttempt.isAllowed, true);
  assert.equal(resetAttempt.remaining, 1);
});
