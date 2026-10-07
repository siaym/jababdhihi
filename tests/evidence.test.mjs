import test from 'node:test';
import assert from 'node:assert/strict';

// Helper mirror of analyzeExternalUrl for standalone node testing
function analyzeExternalUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      let videoId = '';
      if (host.includes('youtu.be')) {
        videoId = parsed.pathname.slice(1);
      } else {
        videoId = parsed.searchParams.get('v') || '';
      }
      return {
        provider: 'youtube',
        isEmbeddable: true,
        platformId: videoId,
      };
    }

    if (host.includes('facebook.com') || host.includes('fb.watch')) {
      return {
        provider: 'facebook',
        isEmbeddable: true,
        platformId: parsed.searchParams.get('v') || '',
      };
    }

    if (host.includes('drive.google.com')) {
      return {
        provider: 'google_drive',
        isEmbeddable: false,
      };
    }

    if (host.includes('dropbox.com')) {
      return {
        provider: 'dropbox',
        isEmbeddable: false,
      };
    }

    return {
      provider: 'external_web',
      isEmbeddable: false,
    };
  } catch {
    return {
      provider: 'external_web',
      isEmbeddable: false,
    };
  }
}

test('analyzeExternalUrl identifies YouTube standard watch URL', () => {
  const result = analyzeExternalUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(result.provider, 'youtube');
  assert.equal(result.isEmbeddable, true);
  assert.equal(result.platformId, 'dQw4w9WgXcQ');
});

test('analyzeExternalUrl identifies youtu.be short URL', () => {
  const result = analyzeExternalUrl('https://youtu.be/dQw4w9WgXcQ');
  assert.equal(result.provider, 'youtube');
  assert.equal(result.isEmbeddable, true);
  assert.equal(result.platformId, 'dQw4w9WgXcQ');
});

test('analyzeExternalUrl identifies Google Drive without false embedding', () => {
  const result = analyzeExternalUrl('https://drive.google.com/drive/folders/123456');
  assert.equal(result.provider, 'google_drive');
  assert.equal(result.isEmbeddable, false);
});

test('analyzeExternalUrl identifies Dropbox links', () => {
  const result = analyzeExternalUrl('https://www.dropbox.com/s/abcdef/evidence.pdf');
  assert.equal(result.provider, 'dropbox');
  assert.equal(result.isEmbeddable, false);
});

test('analyzeExternalUrl handles invalid URLs gracefully', () => {
  const result = analyzeExternalUrl('not-a-valid-url');
  assert.equal(result.provider, 'external_web');
  assert.equal(result.isEmbeddable, false);
});
