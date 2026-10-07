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
 * Generate a random 16-character alphanumeric tracking passkey: xxxx-xxxx-xxxx-xxxx
 */
export function generateTrackingSecret(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'; // Avoid confusing chars like 0, O, 1, l
  const parts: string[] = [];
  for (let p = 0; p < 4; p++) {
    let segment = '';
    for (let i = 0; i < 4; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parts.push(segment);
  }
  return parts.join('-');
}

/**
 * Generate public case identifier BD-YYYY-NNNNNN
 */
export function generateReportNumber(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const seqStr = String(sequenceNumber).padStart(6, '0');
  return `BD-${year}-${seqStr}`;
}
