import { EvidenceProvider } from '@/types';

export interface ExternalUrlAnalysis {
  isValid: boolean;
  provider: EvidenceProvider;
  platformId?: string;
  embedUrl?: string;
  isEmbeddable: boolean;
  warningNotice?: string;
  error?: string;
}

/**
 * Validates and analyzes external evidence links.
 * Detects providers, parses embeddable video/file IDs, and enforces SSRF security rules.
 */
export function analyzeExternalUrl(urlStr: string): ExternalUrlAnalysis {
  try {
    const trimmed = urlStr.trim();
    if (!trimmed.startsWith('https://')) {
      return {
        isValid: false,
        provider: 'external_web',
        isEmbeddable: false,
        error: 'Only secure HTTPS URLs are permitted.',
      };
    }

    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();

    // Check for SSRF / private IP / localhost targets
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('169.254.')
    ) {
      return {
        isValid: false,
        provider: 'external_web',
        isEmbeddable: false,
        error: 'Invalid or restricted host address.',
      };
    }

    // 1. YouTube
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      let videoId = '';
      if (hostname.includes('youtu.be')) {
        videoId = parsed.pathname.slice(1).split('?')[0];
      } else {
        videoId = parsed.searchParams.get('v') || '';
      }

      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return {
          isValid: true,
          provider: 'youtube',
          platformId: videoId,
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
          isEmbeddable: true,
          warningNotice: 'External video hosted on YouTube. Content may be removed or set to private by author.',
        };
      }
    }

    // 2. Facebook Public Post / Video
    if (hostname.includes('facebook.com') || hostname.includes('fb.watch')) {
      return {
        isValid: true,
        provider: 'facebook',
        isEmbeddable: false, // Standard Facebook embeds require client SDK or direct login
        warningNotice: 'Facebook posts may require viewer login or be restricted by author privacy settings.',
      };
    }

    // 3. Google Drive
    if (hostname.includes('drive.google.com')) {
      // Check for file/d/ID/view or id=ID
      let fileId = '';
      const match = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        fileId = match[1];
      } else {
        fileId = parsed.searchParams.get('id') || '';
      }

      if (fileId) {
        return {
          isValid: true,
          provider: 'google_drive',
          platformId: fileId,
          embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
          isEmbeddable: true,
          warningNotice: 'Google Drive file must be set to "Anyone with the link can view".',
        };
      }

      return {
        isValid: true,
        provider: 'google_drive',
        isEmbeddable: false,
        warningNotice: 'Google Drive folder link. Open original source to inspect files.',
      };
    }

    // 4. Google Photos
    if (hostname.includes('photos.google.com') || hostname.includes('photos.app.goo.gl')) {
      return {
        isValid: true,
        provider: 'google_photos',
        isEmbeddable: false,
        warningNotice: 'External Google Photos shared album. Open original source to view contents.',
      };
    }

    // 5. Dropbox
    if (hostname.includes('dropbox.com')) {
      return {
        isValid: true,
        provider: 'dropbox',
        isEmbeddable: false,
        warningNotice: 'External Dropbox file/folder. Content depends on author access settings.',
      };
    }

    // 6. General Public Web / News Link
    return {
      isValid: true,
      provider: 'external_web',
      isEmbeddable: false,
      warningNotice: 'Third-party web link. Content cannot be embedded directly.',
    };
  } catch {
    return {
      isValid: false,
      provider: 'external_web',
      isEmbeddable: false,
      error: 'Malformed URL provided.',
    };
  }
}
