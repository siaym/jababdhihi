/**
 * SSRF (Server-Side Request Forgery) and URL Validation Module
 * Enforces strict protocol allowlisting, blocks internal IP ranges,
 * and restricts media embeds to approved civic evidence hosts.
 */

// Private & reserved IP range patterns (IPv4 & IPv6)
const PRIVATE_IP_REGEXES = [
  /^127\./, // Loopback
  /^10\./, // Class A private
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Class B private
  /^192\.168\./, // Class C private
  /^169\.254\./, // Link-local
  /^0\./, // Broadcast
  /^localhost$/i,
  /^\[?::1\]?$/, // IPv6 loopback
  /^\[?fe80:/i, // IPv6 link-local
  /^\[?fc00:/i, // IPv6 unique local
];

// Approved external media domains for Jababdihi evidence
export const ALLOWED_MEDIA_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'fb.watch',
  'drive.google.com',
  'docs.google.com',
  'photos.google.com',
  'dropbox.com',
  'www.dropbox.com',
];

export interface UrlValidationResult {
  isValid: boolean;
  isAllowedMedia: boolean;
  normalizedUrl?: string;
  domain?: string;
  error?: string;
}

/**
 * Validates a user-submitted URL against SSRF vulnerabilities and protocol abuse.
 */
export function validateSafeUrl(rawUrl: string): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, isAllowedMedia: false, error: 'URL must be a non-empty string.' };
  }

  const trimmed = rawUrl.trim();

  // 1. Strict Protocol Enforcement: Must start with https://
  if (!/^https:\/\//i.test(trimmed)) {
    return {
      isValid: false,
      isAllowedMedia: false,
      error: 'Only secure HTTPS links (https://) are accepted. Plain HTTP and custom protocols are prohibited.',
    };
  }

  try {
    const parsed = new URL(trimmed);

    // Protocol must strictly be 'https:'
    if (parsed.protocol !== 'https:') {
      return {
        isValid: false,
        isAllowedMedia: false,
        error: 'Invalid protocol. Only HTTPS is allowed.',
      };
    }

    const hostname = parsed.hostname.toLowerCase();

    // 2. Reject IP addresses directly or private loopbacks
    for (const regex of PRIVATE_IP_REGEXES) {
      if (regex.test(hostname)) {
        return {
          isValid: false,
          isAllowedMedia: false,
          error: 'Links targeting local network or private infrastructure are strictly forbidden.',
        };
      }
    }

    // 3. Reject credentials embedded in URL (e.g. https://user:pass@evil.com)
    if (parsed.username || parsed.password) {
      return {
        isValid: false,
        isAllowedMedia: false,
        error: 'Embedded credentials in URLs are not permitted.',
      };
    }

    // 4. Check if the domain belongs to allowed media providers
    const isAllowedMedia = ALLOWED_MEDIA_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );

    return {
      isValid: true,
      isAllowedMedia,
      normalizedUrl: parsed.toString(),
      domain: hostname,
    };
  } catch {
    return {
      isValid: false,
      isAllowedMedia: false,
      error: 'Malformed URL syntax.',
    };
  }
}
