/**
 * AES-256-GCM Field-Level Encryption Module for Jababdihi
 * 
 * Provides authenticated encryption for confidential reporter identities,
 * phone numbers, and email addresses.
 * Uses 256-bit AES keys with 96-bit (12-byte) initialization vectors (IV)
 * and 128-bit authentication tags to prevent tampering.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Derives or retrieves a 32-byte (256-bit) encryption key from environment.
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.CONTACT_ENCRYPTION_KEY;
  if (!envKey) {
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_APP_ENV === 'production') {
      throw new Error('FATAL: CONTACT_ENCRYPTION_KEY is required in production environment.');
    }
    // Deterministic fallback for local development and non-production testing
    return crypto.createHash('sha256').update('jababdihi-dev-default-encryption-salt').digest();
  }

  // If provided as 64 hex characters (32 bytes)
  if (/^[0-9a-fA-F]{64}$/.test(envKey.trim())) {
    return Buffer.from(envKey.trim(), 'hex');
  }

  // Derive 32-byte key via SHA-256 of passphrase
  return crypto.createHash('sha256').update(envKey).digest();
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Output format: `iv:authTag:ciphertext` (hex-encoded)
 */
export function encryptField(plaintext: string | null | undefined): string | null {
  if (plaintext === null || plaintext === undefined || plaintext === '') {
    return null;
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

    const encrypted = Buffer.concat([
      cipher.update(String(plaintext), 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (err: any) {
    console.error('Field encryption failure:', err.message);
    throw new Error('Cryptographic failure during field encryption');
  }
}

/**
 * Decrypt a ciphertext string using AES-256-GCM.
 * Input format: `iv:authTag:ciphertext` (hex-encoded)
 */
export function decryptField(encryptedString: string | null | undefined): string | null {
  if (!encryptedString || typeof encryptedString !== 'string') {
    return null;
  }

  try {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid ciphertext format. Expected iv:authTag:ciphertext');
    }

    const [ivHex, authTagHex, cipherHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const ciphertext = Buffer.from(cipherHex, 'hex');

    if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error('Malformed IV or authentication tag length');
    }

    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (err: any) {
    console.error('Field decryption failed or authentication tag mismatch:', err.message);
    return null;
  }
}
