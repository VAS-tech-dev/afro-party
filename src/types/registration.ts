import type { CategoryId, Locale } from '@/config/config';

/**
 * Domain types for registrations. These mirror the Supabase schema
 * (supabase/migrations/0001_init.sql) but use camelCase; the service layer
 * maps between DB snake_case and these.
 */

/** Ticket category (same values as config CategoryId). */
export type Category = CategoryId;

export const REGISTRATION_STATUSES = [
  'PENDING',
  'MEMBER_PENDING',
  'MEMBER_APPROVED',
  'MEMBER_REJECTED',
  'CONTRIBUTOR_PENDING',
  'CONTRIBUTOR_APPROVED',
  'CONTRIBUTOR_REJECTED',
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const PAYMENT_STATUSES = ['NOT_REQUESTED', 'WAITING_PAYMENT', 'PAID'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const TICKET_STATUSES = ['NOT_GENERATED', 'GENERATED', 'USED'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

/** Data captured from the public registration form. */
export interface RegistrationInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: Locale;
  category: Category;
  /** Only meaningful for VAS_MEMBER. */
  memberNumber?: string | null;
  /** Whether the person wants to pay immediately (ignored for CONTRIBUTOR). */
  payNow: boolean;
}

/** Result returned to the client after a successful registration. */
export interface CreateRegistrationResult {
  id: string;
  registrationCode: string;
  status: RegistrationStatus;
  category: Category;
}

/** Full registration record (used by the admin dashboard in later steps). */
export interface Registration extends RegistrationInput {
  id: string;
  registrationCode: string;
  createdAt: string;
  updatedAt: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  ticketStatus: TicketStatus;
  ticketId: string | null;
  ticketToken: string | null;
  ticketSentAt: string | null;
  checkedIn: boolean;
  checkedInAt: string | null;
  adminNotes: string | null;
}
