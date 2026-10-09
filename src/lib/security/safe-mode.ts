/**
 * Emergency Defensive Safe Mode Engine
 * Backed by authoritative PostgreSQL `platform_security_settings` table
 * with short-lived (10s) in-memory cache to withstand DDoS and high-volume traffic.
 */

import { createAdminClient } from '../supabase/admin.ts';

export interface SafeModeConfig {
  isEnabled: boolean;
  reason?: string;
  activatedAt?: string;
  allowIdentifiedReportsOnly: boolean;
  requireCaptcha: boolean;
  disableFileUploads: boolean;
  tightenRateLimits: boolean;
  rateLimitMultiplier: number;
}

// 10-second TTL cache to prevent database overload during attacks
let cachedStatus: SafeModeConfig = {
  isEnabled: process.env.NEXT_PUBLIC_SAFE_MODE === 'true',
  reason: process.env.SAFE_MODE_REASON || 'Standard operating mode',
  allowIdentifiedReportsOnly: false,
  requireCaptcha: false,
  disableFileUploads: false,
  tightenRateLimits: false,
  rateLimitMultiplier: 1.0,
};

let lastCacheFetchTime = 0;
const CACHE_TTL_MS = 10 * 1000; // 10 seconds

/**
 * Authoritative asynchronous retrieval of Safe Mode settings from PostgreSQL
 */
export async function getSafeModeStatusAsync(): Promise<SafeModeConfig> {
  const now = Date.now();
  if (now - lastCacheFetchTime < CACHE_TTL_MS) {
    return { ...cachedStatus };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { ...cachedStatus };
  }

  try {
    const { data, error } = await admin
      .from('platform_security_settings')
      .select('*')
      .eq('id', 'primary')
      .single();

    if (!error && data) {
      cachedStatus = {
        isEnabled: Boolean(data.safe_mode_enabled),
        reason: data.safe_mode_reason || 'Administrative action',
        activatedAt: data.activated_at || undefined,
        allowIdentifiedReportsOnly: Boolean(data.allow_identified_only),
        requireCaptcha: Boolean(data.require_captcha),
        disableFileUploads: Boolean(data.disable_file_uploads),
        tightenRateLimits: Number(data.rate_limit_multiplier || 1.0) > 1.0,
        rateLimitMultiplier: Number(data.rate_limit_multiplier || 1.0),
      };
      lastCacheFetchTime = now;
    }
  } catch (err) {
    console.warn('Could not query platform_security_settings, using cached posture:', err);
  }

  return { ...cachedStatus };
}

/**
 * Synchronous snapshot of Safe Mode status (uses cached state)
 */
export function getSafeModeStatus(): SafeModeConfig {
  return { ...cachedStatus };
}

/**
 * Persist Safe Mode configuration to database (Admin action)
 */
export async function setSafeModeStatusAsync(
  config: Partial<SafeModeConfig>,
  actorId?: string
): Promise<SafeModeConfig> {
  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  const isEnabled = config.isEnabled !== undefined ? config.isEnabled : cachedStatus.isEnabled;

  if (admin) {
    const updatePayload: Record<string, any> = {
      safe_mode_enabled: isEnabled,
      updated_at: nowIso,
    };

    if (config.reason !== undefined) updatePayload.safe_mode_reason = config.reason;
    if (config.allowIdentifiedReportsOnly !== undefined) {
      updatePayload.allow_identified_only = config.allowIdentifiedReportsOnly;
    }
    if (config.requireCaptcha !== undefined) {
      updatePayload.require_captcha = config.requireCaptcha;
    }
    if (config.disableFileUploads !== undefined) {
      updatePayload.disable_file_uploads = config.disableFileUploads;
    }
    if (config.rateLimitMultiplier !== undefined) {
      updatePayload.rate_limit_multiplier = config.rateLimitMultiplier;
    } else if (config.tightenRateLimits !== undefined) {
      updatePayload.rate_limit_multiplier = config.tightenRateLimits ? 4.0 : 1.0;
    }
    if (isEnabled) {
      updatePayload.activated_at = nowIso;
      if (actorId) updatePayload.activated_by = actorId;
    }

    const { error } = await admin
      .from('platform_security_settings')
      .upsert({ id: 'primary', ...updatePayload });

    if (error) {
      console.error('Failed to persist platform_security_settings:', error);
    }
  }

  // Update in-memory cache immediately
  cachedStatus = {
    ...cachedStatus,
    ...config,
    isEnabled,
    activatedAt: isEnabled ? nowIso : undefined,
  };
  lastCacheFetchTime = Date.now();

  return { ...cachedStatus };
}

/**
 * Emergency check helper for report submissions
 */
export async function canAcceptSubmissionsAsync(
  privacyMode?: 'anonymous' | 'confidential' | 'identified'
): Promise<{ allowed: boolean; message?: string }> {
  const current = await getSafeModeStatusAsync();

  if (!current.isEnabled) {
    return { allowed: true };
  }

  if (current.allowIdentifiedReportsOnly && privacyMode === 'anonymous') {
    return {
      allowed: false,
      message:
        'Jababdihi is currently operating under defensive Safe Mode due to elevated network traffic. Anonymous reports are temporarily paused; confidential or verified submissions remain active.',
    };
  }

  return { allowed: true };
}

export function canAcceptSubmissions(
  privacyMode?: 'anonymous' | 'confidential' | 'identified'
): { allowed: boolean; message?: string } {
  const current = cachedStatus;
  if (!current.isEnabled) return { allowed: true };
  if (current.allowIdentifiedReportsOnly && privacyMode === 'anonymous') {
    return {
      allowed: false,
      message:
        'Jababdihi is currently operating under defensive Safe Mode due to elevated network traffic. Anonymous reports are temporarily paused; confidential or verified submissions remain active.',
    };
  }
  return { allowed: true };
}

/**
 * Emergency check helper for direct uploads (async authoritative)
 */
export async function canAcceptFileUploadsAsync(): Promise<{ allowed: boolean; message?: string }> {
  const current = await getSafeModeStatusAsync();
  if (current.isEnabled && current.disableFileUploads) {
    return {
      allowed: false,
      message:
        'Direct file uploads are temporarily paused under Safe Mode. You may still attach verified external evidence links (YouTube/Drive).',
    };
  }
  return { allowed: true };
}

/**
 * Emergency check helper for direct uploads
 */
export function canAcceptFileUploads(): { allowed: boolean; message?: string } {
  const current = cachedStatus;
  if (current.isEnabled && current.disableFileUploads) {
    return {
      allowed: false,
      message:
        'Direct file uploads are temporarily paused under Safe Mode. You may still attach verified external evidence links (YouTube/Drive).',
    };
  }
  return { allowed: true };
}
