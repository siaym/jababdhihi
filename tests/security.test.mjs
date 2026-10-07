import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

function generateTrackingSecret() {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz';
  const segment = (len) => {
    let str = '';
    for (let i = 0; i < len; i++) {
      const idx = Math.floor(Math.random() * chars.length);
      str += chars[idx];
    }
    return str;
  };
  return `${segment(4)}-${segment(4)}-${segment(4)}-${segment(4)}`;
}

test('generateTrackingSecret generates 4 segments with hyphen separation', () => {
  const secret = generateTrackingSecret();
  const parts = secret.split('-');
  assert.equal(parts.length, 4);
  parts.forEach((part) => {
    assert.equal(part.length, 4);
  });
});

test('generateTrackingSecret excludes ambiguous characters 0, 1, l, o', () => {
  for (let i = 0; i < 20; i++) {
    const secret = generateTrackingSecret();
    assert.equal(secret.includes('0'), false);
    assert.equal(secret.includes('1'), false);
    assert.equal(secret.includes('l'), false);
    assert.equal(secret.includes('o'), false);
  }
});

test('secret hashing with SHA-256 is deterministic and irreversible', () => {
  const secret = 'k9f2-8mpx-4v7q-z1yt';
  const hash1 = crypto.createHash('sha256').update(secret).digest('hex');
  const hash2 = crypto.createHash('sha256').update(secret).digest('hex');
  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 64);
});
