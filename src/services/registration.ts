import { getCategory, type Locale } from '@/config/config';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import type {
  Category,
  CreateRegistrationResult,
  PaymentStatus,
  Registration,
  RegistrationInput,
  RegistrationStatus,
  TicketStatus,
} from '@/types/registration';

/** All columns of the registrations table, for select(). */
export const REGISTRATION_COLUMNS =
  'id, registration_code, created_at, updated_at, first_name, last_name, email, phone, ' +
  'language, category, member_number, pay_now, status, payment_status, ticket_status, ' +
  'ticket_id, ticket_token, ticket_sent_at, checked_in, checked_in_at, admin_notes';

/** Public lookup of a registration by its ticket token (for the ticket page). */
export async function getRegistrationByToken(token: string): Promise<Registration | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('registrations')
    .select(REGISTRATION_COLUMNS)
    .eq('ticket_token', token)
    .maybeSingle();

  if (error || !data) return null;
  return mapRowToRegistration(data as unknown as Record<string, unknown>);
}

/** Map a raw DB row (snake_case) to the camelCase domain type. */
export function mapRowToRegistration(row: Record<string, unknown>): Registration {
  return {
    id: row.id as string,
    registrationCode: row.registration_code as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    email: row.email as string,
    phone: row.phone as string,
    language: row.language as Locale,
    category: row.category as Category,
    memberNumber: (row.member_number as string | null) ?? null,
    payNow: Boolean(row.pay_now),
    status: row.status as RegistrationStatus,
    paymentStatus: row.payment_status as PaymentStatus,
    ticketStatus: row.ticket_status as TicketStatus,
    ticketId: (row.ticket_id as string | null) ?? null,
    ticketToken: (row.ticket_token as string | null) ?? null,
    ticketSentAt: (row.ticket_sent_at as string | null) ?? null,
    checkedIn: Boolean(row.checked_in),
    checkedInAt: (row.checked_in_at as string | null) ?? null,
    adminNotes: (row.admin_notes as string | null) ?? null,
  };
}

/** Raised when the database rejects an insert. */
export class RegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistrationError';
  }
}

/**
 * Initial `status` for a fresh registration, per the event workflow:
 *  - VAS_MEMBER  → MEMBER_PENDING       (needs admin membership check)
 *  - CONTRIBUTOR → CONTRIBUTOR_PENDING  (needs admin approval)
 *  - STUDENT / NON_STUDENT → PENDING    (no approval required)
 */
const INITIAL_STATUS: Record<Category, RegistrationStatus> = {
  VAS_MEMBER: 'MEMBER_PENDING',
  CONTRIBUTOR: 'CONTRIBUTOR_PENDING',
  STUDENT: 'PENDING',
  NON_STUDENT: 'PENDING',
};

/**
 * Initial `payment_status`.
 * Students/non-students who opt to pay now go straight to WAITING_PAYMENT.
 * Members always start NOT_REQUESTED — a payment link is only issued after an
 * admin approves their membership (handled in the dashboard step).
 */
function initialPaymentStatus(category: Category, payNow: boolean): PaymentStatus {
  if ((category === 'STUDENT' || category === 'NON_STUDENT') && payNow) {
    return 'WAITING_PAYMENT';
  }
  return 'NOT_REQUESTED';
}

/**
 * Persists a new registration and returns its generated code.
 *
 * Business rules applied here (not trusted from the client):
 *  - CONTRIBUTOR can never "pay now".
 *  - member_number is only kept for VAS_MEMBER.
 *  - status / payment_status are derived server-side.
 *
 * NOTE: the confirmation email is dispatched in Étape 3; this function only
 * writes the record. The caller (API route) will trigger email once wired.
 */
export async function createRegistration(
  input: RegistrationInput,
): Promise<CreateRegistrationResult> {
  const supabase = getSupabaseAdmin();

  const category = input.category;
  const meta = getCategory(category);
  const payNow = meta.canPayNow ? Boolean(input.payNow) : false;
  const memberNumber = meta.requiresMemberNumber
    ? input.memberNumber?.trim() || null
    : null;

  const { data, error } = await supabase
    .from('registrations')
    .insert({
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      language: input.language,
      category,
      member_number: memberNumber,
      pay_now: payNow,
      status: INITIAL_STATUS[category],
      payment_status: initialPaymentStatus(category, payNow),
    })
    .select('id, registration_code, status, category')
    .single();

  if (error || !data) {
    throw new RegistrationError(error?.message ?? 'Failed to create registration.');
  }

  return {
    id: data.id as string,
    registrationCode: data.registration_code as string,
    status: data.status as RegistrationStatus,
    category: data.category as Category,
  };
}
