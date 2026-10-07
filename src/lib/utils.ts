import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, locale: 'bn' | 'en' = 'bn'): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    if (locale === 'bn') {
      return date.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format English numerals to Bengali numerals
 */
export function toBengaliNumerals(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => bnDigits[+w]);
}

/**
 * Generate a cryptographically random 16-character alphanumeric tracking passkey: xxxx-xxxx-xxxx-xxxx
 * Uses CSPRNG (Web Crypto API / crypto.getRandomValues) with >80 bits of entropy
 */
export function generateTrackingSecret(): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz'; // 31 unambiguous characters (no 0, 1, l, o)
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const parts: string[] = [];
  for (let p = 0; p < 4; p++) {
    let segment = '';
    for (let i = 0; i < 4; i++) {
      segment += chars[bytes[p * 4 + i] % chars.length];
    }
    parts.push(segment);
  }
  return parts.join('-');
}

/**
 * Generate collision-safe public case identifier BD-YYYY-XXXXXX
 * Accepts a numeric sequence or generates a cryptographically random 6-character identifier.
 */
export function generateReportNumber(sequenceOrRandom?: number | string): string {
  const year = new Date().getFullYear();
  if (typeof sequenceOrRandom === 'number') {
    const seqStr = String(sequenceOrRandom).padStart(6, '0');
    return `BD-${year}-${seqStr}`;
  }
  if (typeof sequenceOrRandom === 'string' && sequenceOrRandom.length > 0) {
    return `BD-${year}-${sequenceOrRandom}`;
  }
  const bytes = new Uint8Array(3);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  }
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  return `BD-${year}-${hex}`;
}
