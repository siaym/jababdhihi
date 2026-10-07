/**
 * Multi-Tier Distributed Rate Limiting Architecture
 * Supports Upstash Redis REST for serverless distributed synchronization across Vercel nodes,
 * with an in-memory sliding-window fallback.
 * Dynamic multiplier integration with Emergency Safe Mode.
 */

let runtimeRateMultiplier = 1.0;

export function setRateLimitMultiplier(multiplier: number) {
  runtimeRateMultiplier = Math.max(0.1, multiplier);
}

export function getRateLimitMultiplier(): number {
  return runtimeRateMultiplier;
}

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 10 minutes to prevent memory leaks in long-running processes
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    memoryStore.forEach((record, key) => {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 3600 * 1000);
      if (record.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    });
  }, 10 * 60 * 1000);
  if (cleanupTimer.unref) cleanupTimer.unref();
}

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export const RATE_LIMIT_TIERS: Record<string, RateLimitConfig> = {
  // Anonymous report submission: default 5 per hour
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
 * Check rate limit using in-memory sliding window or distributed counter.
 * Dynamically tightens limits when Safe Mode is active.
 */
export function checkRateLimit(
  actionTier: keyof typeof RATE_LIMIT_TIERS,
  identifier: string,
  customConfig?: Partial<RateLimitConfig>
): RateLimitCheckResult {
  const baseConfig = {
    ...RATE_LIMIT_TIERS[actionTier],
    ...customConfig,
  };

  // Dynamic rate limit multiplier: when under high alert/attack, thresholds tighten
  const multiplier = runtimeRateMultiplier;
  const maxRequests = Math.max(1, Math.floor(baseConfig.maxRequests / multiplier));
  const windowSeconds = baseConfig.windowSeconds;

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const storeKey = `${actionTier}:${identifier}`;

  let record = memoryStore.get(storeKey);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(storeKey, record);
  }

  // Filter out timestamps outside current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  const currentCount = record.timestamps.length;

  if (currentCount >= maxRequests) {
    const oldestTimestamp = record.timestamps[0] || now;
    const resetSeconds = Math.max(
      1,
      Math.ceil((oldestTimestamp + windowMs - now) / 1000)
    );

    return {
      isAllowed: false,
      remaining: 0,
      resetSeconds,
      totalLimit: maxRequests,
    };
  }

  // Record this request
  record.timestamps.push(now);

  const remaining = Math.max(0, maxRequests - record.timestamps.length);
  const resetSeconds = Math.ceil(windowSeconds);

  return {
    isAllowed: true,
    remaining,
    resetSeconds,
    totalLimit: maxRequests,
  };
}

/**
 * Asynchronous distributed rate limiter check (compatible with Upstash Redis REST).
 * If UPSTASH_REDIS_REST_URL is configured, utilizes atomic Redis INCR & EXPIRE.
 * Falls back transparently to local sliding window.
 */
export async function checkRateLimitAsync(
  actionTier: keyof typeof RATE_LIMIT_TIERS,
  identifier: string,
  customConfig?: Partial<RateLimitConfig>
): Promise<RateLimitCheckResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    // Fall back to memory limiter
    return checkRateLimit(actionTier, identifier, customConfig);
  }

  try {
    const baseConfig = {
      ...RATE_LIMIT_TIERS[actionTier],
      ...customConfig,
    };
    const multiplier = runtimeRateMultiplier;
    const maxRequests = Math.max(1, Math.floor(baseConfig.maxRequests / multiplier));
    const windowSeconds = baseConfig.windowSeconds;

    const key = `rl:${actionTier}:${identifier}`;

    // Execute atomic INCR via Upstash Redis REST pipeline
    const pipelineRes = await fetch(`${redisUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redisToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, windowSeconds, 'NX'],
        ['TTL', key],
      ]),
    });

    if (pipelineRes.ok) {
      const results = await pipelineRes.json();
      const currentCount = Number(results[0]?.result || 1);
      const ttl = Number(results[2]?.result || windowSeconds);

      if (currentCount > maxRequests) {
        return {
          isAllowed: false,
          remaining: 0,
          resetSeconds: Math.max(1, ttl),
          totalLimit: maxRequests,
        };
      }

      return {
        isAllowed: true,
        remaining: Math.max(0, maxRequests - currentCount),
        resetSeconds: Math.max(1, ttl),
        totalLimit: maxRequests,
      };
    }
  } catch (err) {
    console.warn('Distributed rate limit call failed, falling back to local memory store:', err);
  }

  return checkRateLimit(actionTier, identifier, customConfig);
}

/**
 * Safely extract client IP address from standard reverse proxy headers.
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();

  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const first = xForwardedFor.split(',')[0];
    if (first) return first.trim();
  }

  return '127.0.0.1';
}
