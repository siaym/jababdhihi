/**
 * Emergency Defensive Safe Mode Engine
 * Allows administrators or automated anomaly monitors to toggle
 * platform protections during coordinated attacks or high-volume DDoS incidents.
 */

export interface SafeModeConfig {
  isEnabled: boolean;
  reason?: string;
  activatedAt?: string;
  allowIdentifiedReportsOnly: boolean;
  requireCaptcha: boolean;
  disableFileUploads: boolean;
  tightenRateLimits: boolean;
}

// In-memory runtime state, initializable via environment variable
let runtimeSafeMode: SafeModeConfig = {
  isEnabled: process.env.NEXT_PUBLIC_SAFE_MODE === 'true',
  reason: process.env.SAFE_MODE_REASON || 'Standard operating mode',
  allowIdentifiedReportsOnly: false,
  requireCaptcha: false,
  disableFileUploads: false,
  tightenRateLimits: false,
};

/**
 * Returns current Safe Mode status
 */
export function getSafeModeStatus(): SafeModeConfig {
  return { ...runtimeSafeMode };
}

/**
 * Update Safe Mode configuration (Admin action)
 */
export function setSafeModeStatus(config: Partial<SafeModeConfig>): SafeModeConfig {
  runtimeSafeMode = {
    ...runtimeSafeMode,
    ...config,
    activatedAt: config.isEnabled ? new Date().toISOString() : undefined,
  };
  return { ...runtimeSafeMode };
}

/**
 * Emergency check helper for report submissions
 */
export function canAcceptSubmissions(privacyMode?: 'anonymous' | 'confidential' | 'identified'): {
  allowed: boolean;
  message?: string;
} {
  const current = getSafeModeStatus();

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

/**
 * Emergency check helper for direct uploads
 */
export function canAcceptFileUploads(): { allowed: boolean; message?: string } {
  const current = getSafeModeStatus();
  if (current.isEnabled && current.disableFileUploads) {
    return {
      allowed: false,
      message:
        'Direct file uploads are temporarily paused under Safe Mode. You may still attach verified external evidence links (YouTube/Drive).',
    };
  }
  return { allowed: true };
}
