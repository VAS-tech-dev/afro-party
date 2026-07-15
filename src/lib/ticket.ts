import { randomBytes, randomUUID } from 'crypto';

/**
 * Ticket identifiers.
 *
 * `ticketToken` is the ONLY thing encoded in the QR code. It must be
 * unpredictable (no personal data, no sequential ids) so tickets can't be
 * guessed or forged — generated from cryptographically secure randomness.
 */

/** Secret token embedded in the QR, e.g. `VAS-9F3A2B7C4D1E8056`. */
export function generateTicketToken(): string {
  return `VAS-${randomBytes(8).toString('hex').toUpperCase()}`;
}

/** Human-friendly public ticket id shown on the ticket, e.g. `TIX-3F9A2B`. */
export function generateTicketId(): string {
  // A short slice of a UUID is plenty for display; uniqueness is enforced by
  // the DB's UNIQUE constraint, which retries would handle in the caller.
  return `TIX-${randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

/** Validate a token shape before using it in a lookup (defense in depth). */
export function isValidTicketToken(token: string): boolean {
  return /^VAS-[0-9A-F]{16}$/.test(token);
}
