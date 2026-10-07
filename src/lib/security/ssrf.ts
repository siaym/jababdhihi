/**
 * Comprehensive DNS-Aware SSRF (Server-Side Request Forgery) Protection Module
 * Resolves hostnames via DNS and verifies all IPv4 and IPv6 addresses against
 * private, link-local, carrier-grade NAT, and cloud metadata ranges.
 * Protects against DNS rebinding, internal network scanning, and protocol abuse.
 */

import dns from 'dns';

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
  resolvedIps?: string[];
  error?: string;
}

/**
 * Check whether an IPv4 or IPv6 address belongs to private, loopback, link-local,
 * carrier-grade NAT, or cloud metadata subnets.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  if (!ip) return false;
  const cleanIp = ip.trim().toLowerCase().replace(/^\[|\]$/g, '');

  // IPv6 checks
  if (cleanIp === '::1' || cleanIp === '::') return true;
  if (
    cleanIp.startsWith('fe80:') ||
    cleanIp.startsWith('fe8') ||
    cleanIp.startsWith('fe9') ||
    cleanIp.startsWith('fea') ||
    cleanIp.startsWith('feb')
  ) {
    return true; // IPv6 link-local (fe80::/10)
  }
  if (cleanIp.startsWith('fc00:') || cleanIp.startsWith('fd')) {
    return true; // IPv6 unique local (fc00::/7)
  }
  if (cleanIp.startsWith('ff')) {
    return true; // IPv6 multicast
  }

  // IPv4 check: must match 4 octets
  const ipv4Match = cleanIp.match(/^(?:(?:::ffff:)?)(?:(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3}))$/);
  if (!ipv4Match) {
    // Not an IP address literal
    return false;
  }

  const [, aStr, bStr, cStr, dStr] = ipv4Match;
  const a = parseInt(aStr, 10);
  const b = parseInt(bStr, 10);
  const c = parseInt(cStr, 10);
  const d = parseInt(dStr, 10);

  if ([a, b, c, d].some((octet) => isNaN(octet) || octet < 0 || octet > 255)) {
    return true;
  }

  // Loopback (127.0.0.0/8)
  if (a === 127) return true;

  // Broadcast / this-network (0.0.0.0/8)
  if (a === 0) return true;

  // Private RFC 1918 Class A (10.0.0.0/8)
  if (a === 10) return true;

  // Carrier Grade NAT RFC 6598 (100.64.0.0/10)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // Private RFC 1918 Class B (172.16.0.0/12)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // Link-Local / Cloud Metadata (169.254.0.0/16) - blocks AWS/GCP/Azure 169.254.169.254
  if (a === 169 && b === 254) return true;

  // Private RFC 1918 Class C (192.168.0.0/16)
  if (a === 192 && b === 168) return true;

  // Multicast (224.0.0.0/4)
  if (a >= 224 && a <= 239) return true;

  // Reserved / Future Use (240.0.0.0/4)
  if (a >= 240) return true;

  return false;
}

/**
 * Fast synchronous URL schema and protocol verification
 */
export function validateSafeUrl(rawUrl: string): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, isAllowedMedia: false, error: 'URL must be a non-empty string.' };
  }

  const trimmed = rawUrl.trim();

  // Strict Protocol Enforcement: Must start with https://
  if (!/^https:\/\//i.test(trimmed)) {
    return {
      isValid: false,
      isAllowedMedia: false,
      error: 'Only secure HTTPS links (https://) are accepted. Plain HTTP and custom schemes are prohibited.',
    };
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'https:') {
      return {
        isValid: false,
        isAllowedMedia: false,
        error: 'Invalid protocol. Only HTTPS is allowed.',
      };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Reject direct IP addresses or obvious localhost
    if (isPrivateOrReservedIp(hostname) || hostname === 'localhost') {
      return {
        isValid: false,
        isAllowedMedia: false,
        error: 'Links targeting local network or private infrastructure are strictly forbidden.',
      };
    }

    // Reject embedded credentials
    if (parsed.username || parsed.password) {
      return {
        isValid: false,
        isAllowedMedia: false,
        error: 'Embedded credentials in URLs are not permitted.',
      };
    }

    const isAllowedMedia = ALLOWED_MEDIA_DOMAINS.some(
      (dom) => hostname === dom || hostname.endsWith(`.${dom}`)
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
      error: 'Malformed or unparseable URL.',
    };
  }
}

/**
 * Comprehensive DNS-aware asynchronous SSRF validation.
 * Performs real DNS resolution using Node.js dns.promises.lookup and verifies
 * all returned IPv4 and IPv6 addresses against private/internal ranges.
 */
export async function validateSafeUrlAsync(rawUrl: string): Promise<UrlValidationResult> {
  const syncResult = validateSafeUrl(rawUrl);
  if (!syncResult.isValid || !syncResult.domain) {
    return syncResult;
  }

  const hostname = syncResult.domain;

  try {
    // Resolve all IPv4 and IPv6 addresses
    const addresses = await dns.promises.lookup(hostname, { all: true });

    if (!addresses || addresses.length === 0) {
      return {
        isValid: false,
        isAllowedMedia: syncResult.isAllowedMedia,
        domain: hostname,
        error: 'Hostname could not be resolved via DNS.',
      };
    }

    const resolvedIps = addresses.map((entry) => entry.address);

    // Verify EVERY resolved IP address
    for (const ip of resolvedIps) {
      if (isPrivateOrReservedIp(ip)) {
        return {
          isValid: false,
          isAllowedMedia: false,
          domain: hostname,
          resolvedIps,
          error: `DNS resolution returned restricted IP address (${ip}). Access to private or link-local infrastructure is prohibited.`,
        };
      }
    }

    return {
      ...syncResult,
      resolvedIps,
    };
  } catch (err: any) {
    return {
      isValid: false,
      isAllowedMedia: syncResult.isAllowedMedia,
      domain: hostname,
      error: `DNS resolution failed for ${hostname}: ${err.message || 'Lookup error'}`,
    };
  }
}
