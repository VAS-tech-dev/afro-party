import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

/**
 * Password hashing with scrypt (node:crypto — no external dependency).
 * Stored format: `salt:hash` (both hex). Node runtime only.
 */

const KEY_LEN = 64;

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plain, salt, KEY_LEN).toString('hex');
  return `${salt}:${hash}`;
}

/** Constant-time verification of a plain password against a stored hash. */
export function verifyPassword(plain: string, stored: string | undefined): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(plain, salt, KEY_LEN);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
