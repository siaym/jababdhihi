/**
 * Application-Level Sliding Window Rate Limiter
 * Provides multi-tier rate limiting across anonymous submissions,
 * case tracking lookups, direct evidence uploads, and public APIs.
 * Supports configurable thresholds via environment variables.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 10 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    memoryStore.forEach((record, key) => {
      // Keep only timestamps within the last hour
      record.timestamps = record.timestamps.filter((ts) => now - ts < 3600 * 1000);
      if (record.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    });
  }, 10 * 60 * 1000);
}

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export const RATE_LIMIT_TIERS: Record<string, RateLimitConfig> = {
  // Anonymous / Public report submission: default 5 per hour
  'report-submit': {
    maxRequests: parseInt(process.env.RATE_LIMIT_SUBMIT_MAX || '5', 10),
    windowSeconds: parseInt(process.env.RATE_LIMIT_SUBMIT_WINDOW || '3600', 10),
  },
  // Case tracking passkey queries: default 15 per 15 minutes
  'report-track': {
    maxRequests: parseInt(process.env.RATE_LIMIT_TRACK_MAX || '15', 10),
    windowSeconds: parseInt(process.env.RATE_LIMIT_TRACK_WINDOW || '900', 10),
  },
  // Pre-signed direct evidence upload tickets: default 10 per hour
  'evidence-upload': {
    maxRequests: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX || '10', 10),
    windowSeconds: parseInt(process.env.RATE_LIMIT_UPLOAD_WINDOW || '3600', 10),
  },
  // Case messages: default 20 per hour
  'case-messages': {
    maxRequests: parseInt(process.env.RATE_LIMIT_MESSAGES_MAX || '20', 10),
    windowSeconds: parseInt(process.env.RATE_LIMIT_MESSAGES_WINDOW || '3600', 10),
  },
  // General public browsing API: default 60 per minute
  'public-api': {
    maxRequests: parseInt(process.env.RATE_LIMIT_API_MAX || '60', 10),
    windowSeconds: parseInt(process.env.RATE_LIMIT_API_WINDOW || '60', 10),
  },
};

export interface RateLimitCheckResult {
  isAllowed: boolean;
  remaining: number;
  resetSeconds: number;
  totalLimit: number;
}

/**
 * Check and record an incoming request against a specific action tier and client identifier (IP/account)
 */
export function checkRateLimit(
  actionTier: keyof typeof RATE_LIMIT_TIERS,
  identifier: string,
  customConfig?: Partial<RateLimitConfig>
): RateLimitCheckResult {
  const config = {
    ...RATE_LIMIT_TIERS[actionTier],
    ...customConfig,
  };

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const storeKey = `${actionTier}:${identifier}`;

  let record = memoryStore.get(storeKey);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(storeKey, record);
  }

  // Filter out timestamps outside current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  const currentCount = record.timestamps.length;

  if (currentCount >= config.maxRequests) {
    const oldestTimestamp = record.timestamps[0] || now;
    const resetSeconds = Math.max(
      1,
      Math.ceil((oldestTimestamp + windowMs - now) / 1000)
    );

    return {
      isAllowed: false,
      remaining: 0,
      resetSeconds,
      totalLimit: config.maxRequests,
    };
  }

  // Record this attempt
  record.timestamps.push(now);

  return {
    isAllowed: true,
    remaining: config.maxRequests - record.timestamps.length,
    resetSeconds: config.windowSeconds,
    totalLimit: config.maxRequests,
  };
}

/**
 * Extracts client IP from standard reverse proxy headers (e.g. Vercel x-forwarded-for, cf-connecting-ip)
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return '127.0.0.1';
}
