import { getSupabaseAdmin } from '@/lib/supabase/server';
import { generateTicketId, generateTicketToken, isValidTicketToken } from '@/lib/ticket';
import { REGISTRATION_COLUMNS, mapRowToRegistration } from './registration';
import {
  sendContributorRejectedEmail,
  sendMemberApprovedEmail,
  sendPaymentEmail,
  sendTicketEmail,
} from './email';
import type { Registration } from '@/types/registration';
import type { AdminStats, ScanOutcome, ScanRegistrationInfo } from '@/types/admin';

/** Raised on invalid admin transitions or DB failures. */
export class AdminActionError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'AdminActionError';
  }
}

const recipientOf = (r: Registration) => ({
  email: r.email,
  firstName: r.firstName,
  lastName: r.lastName,
  language: r.language,
});

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

export async function listRegistrations(): Promise<Registration[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('registrations')
    .select(REGISTRATION_COLUMNS)
    .order('created_at', { ascending: false });

  if (error) throw new AdminActionError('DB_ERROR', error.message);
  return (data ?? []).map((row) => mapRowToRegistration(row as unknown as Record<string, unknown>));
}

export async function getRegistrationById(id: string): Promise<Registration | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('registrations')
    .select(REGISTRATION_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new AdminActionError('DB_ERROR', error.message);
  return data ? mapRowToRegistration(data as unknown as Record<string, unknown>) : null;
}

/** Compute dashboard stats from the full list (cheap at event scale). */
export function computeStats(regs: Registration[]): AdminStats {
  const s: AdminStats = {
    total: regs.length,
    vasMembers: 0,
    students: 0,
    nonStudents: 0,
    contributors: 0,
    pendingMembers: 0,
    pendingContributors: 0,
    waitingPayment: 0,
    paid: 0,
    ticketsGenerated: 0,
    checkedIn: 0,
  };
  for (const r of regs) {
    if (r.category === 'VAS_MEMBER') s.vasMembers++;
    else if (r.category === 'STUDENT') s.students++;
    else if (r.category === 'NON_STUDENT') s.nonStudents++;
    else if (r.category === 'CONTRIBUTOR') s.contributors++;

    if (r.status === 'MEMBER_PENDING') s.pendingMembers++;
    if (r.status === 'CONTRIBUTOR_PENDING') s.pendingContributors++;
    if (r.paymentStatus === 'WAITING_PAYMENT') s.waitingPayment++;
    if (r.paymentStatus === 'PAID') s.paid++;
    if (r.ticketStatus === 'GENERATED' || r.ticketStatus === 'USED') s.ticketsGenerated++;
    if (r.checkedIn) s.checkedIn++;
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* Internal helpers                                                    */
/* ------------------------------------------------------------------ */

async function fetchOrThrow(id: string): Promise<Registration> {
  const reg = await getRegistrationById(id);
  if (!reg) throw new AdminActionError('NOT_FOUND');
  return reg;
}

/** Apply a partial update and return the refreshed registration. */
async function patch(id: string, values: Record<string, unknown>): Promise<Registration> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('registrations')
    .update(values)
    .eq('id', id)
    .select(REGISTRATION_COLUMNS)
    .single();

  if (error || !data) throw new AdminActionError('DB_ERROR', error?.message);
  return mapRowToRegistration(data as unknown as Record<string, unknown>);
}

/**
 * Ensure the registration has a ticket (token + id), generating one if needed.
 * Idempotent: an existing ticket is reused, so a person never gets two tickets.
 */
async function ensureTicket(reg: Registration): Promise<Registration> {
  if (reg.ticketToken && reg.ticketId) return reg;

  const supabase = getSupabaseAdmin();
  for (let attempt = 0; attempt < 3; attempt++) {
    const ticketToken = generateTicketToken();
    const ticketId = generateTicketId();
    const { data, error } = await supabase
      .from('registrations')
      .update({ ticket_token: ticketToken, ticket_id: ticketId, ticket_status: 'GENERATED' })
      .eq('id', reg.id)
      .select(REGISTRATION_COLUMNS)
      .single();

    if (!error && data) return mapRowToRegistration(data as unknown as Record<string, unknown>);
    // 23505 = unique_violation → collision, retry with a new token.
    if (error && error.code !== '23505') throw new AdminActionError('DB_ERROR', error.message);
  }
  throw new AdminActionError('TICKET_GEN_FAILED');
}

/** Generate (if needed) + email the ticket, stamping ticket_sent_at. */
async function issueTicket(reg: Registration): Promise<Registration> {
  const withTicket = await ensureTicket(reg);
  await sendTicketEmail({
    recipient: recipientOf(withTicket),
    category: withTicket.category,
    ticketId: withTicket.ticketId!,
    ticketToken: withTicket.ticketToken!,
  });
  return patch(withTicket.id, { ticket_sent_at: new Date().toISOString() });
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

/** Approve a pending VAS member. Sends a payment link if they chose to pay. */
export async function approveMember(id: string): Promise<Registration> {
  const reg = await fetchOrThrow(id);
  if (reg.status !== 'MEMBER_PENDING') throw new AdminActionError('INVALID_STATE');

  if (reg.payNow) {
    const updated = await patch(id, { status: 'MEMBER_APPROVED', payment_status: 'WAITING_PAYMENT' });
    await sendPaymentEmail({
      recipient: recipientOf(updated),
      category: updated.category,
      afterMemberApproval: true,
    });
    return updated;
  }

  const updated = await patch(id, { status: 'MEMBER_APPROVED' });
  await sendMemberApprovedEmail({ recipient: recipientOf(updated) });
  return updated;
}

/**
 * Reject a member's status by converting them to a standard tier
 * (Student / Non-student) and emailing the corresponding entry price.
 */
export async function rejectMember(
  id: string,
  convertTo: 'STUDENT' | 'NON_STUDENT',
): Promise<Registration> {
  const reg = await fetchOrThrow(id);
  if (reg.status !== 'MEMBER_PENDING') throw new AdminActionError('INVALID_STATE');

  const updated = await patch(id, {
    category: convertTo,
    member_number: null,
    status: 'PENDING',
    payment_status: 'WAITING_PAYMENT',
  });
  await sendPaymentEmail({ recipient: recipientOf(updated), category: convertTo });
  return updated;
}

/** Approve an engaged member (contributor): free ticket issued immediately. */
export async function approveContributor(id: string): Promise<Registration> {
  const reg = await fetchOrThrow(id);
  if (reg.status !== 'CONTRIBUTOR_PENDING') throw new AdminActionError('INVALID_STATE');

  const updated = await patch(id, { status: 'CONTRIBUTOR_APPROVED' });
  return issueTicket(updated);
}

export async function rejectContributor(id: string): Promise<Registration> {
  const reg = await fetchOrThrow(id);
  if (reg.status !== 'CONTRIBUTOR_PENDING') throw new AdminActionError('INVALID_STATE');

  const updated = await patch(id, { status: 'CONTRIBUTOR_REJECTED' });
  await sendContributorRejectedEmail({ recipient: recipientOf(updated) });
  return updated;
}

/** Mark a payment as received → generate + email the ticket. */
export async function markPaymentReceived(id: string): Promise<Registration> {
  const reg = await fetchOrThrow(id);
  if (reg.paymentStatus === 'PAID') throw new AdminActionError('ALREADY_PAID');

  const updated = await patch(id, { payment_status: 'PAID' });
  return issueTicket(updated);
}

/** Reverse a payment confirmation (correction). Invalidates the ticket. */
export async function undoPayment(id: string): Promise<Registration> {
  const reg = await fetchOrThrow(id);
  if (reg.paymentStatus !== 'PAID') throw new AdminActionError('NOT_PAID');

  return patch(id, {
    payment_status: 'WAITING_PAYMENT',
    ticket_status: 'NOT_GENERATED',
    ticket_id: null,
    ticket_token: null,
    ticket_sent_at: null,
  });
}

/** Re-send an already generated ticket. */
export async function resendTicket(id: string): Promise<Registration> {
  const reg = await fetchOrThrow(id);
  if (!reg.ticketToken || !reg.ticketId) throw new AdminActionError('NO_TICKET');

  await sendTicketEmail({
    recipient: recipientOf(reg),
    category: reg.category,
    ticketId: reg.ticketId,
    ticketToken: reg.ticketToken,
  });
  return patch(id, { ticket_sent_at: new Date().toISOString() });
}

export async function updateNotes(id: string, notes: string): Promise<Registration> {
  return patch(id, { admin_notes: notes.slice(0, 2000) });
}

/* ------------------------------------------------------------------ */
/* Scanner / check-in                                                  */
/* ------------------------------------------------------------------ */

const scanInfo = (r: Registration): ScanRegistrationInfo => ({
  firstName: r.firstName,
  lastName: r.lastName,
  category: r.category,
  ticketId: r.ticketId,
  checkedInAt: r.checkedInAt,
});

/**
 * Validate a scanned QR token at the door.
 * @param confirm  When true, perform the check-in (VALID → USED); otherwise
 *                 just report what would happen (preview for the UI).
 */
export async function scanTicket(token: string, confirm: boolean): Promise<ScanOutcome> {
  if (!isValidTicketToken(token)) return { result: 'INVALID' };

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('registrations')
    .select(REGISTRATION_COLUMNS)
    .eq('ticket_token', token)
    .maybeSingle();

  if (!data) return { result: 'NOT_FOUND' };
  const reg = mapRowToRegistration(data as unknown as Record<string, unknown>);

  // Ticket revoked (e.g. payment undone).
  if (!reg.ticketToken || reg.ticketStatus === 'NOT_GENERATED') {
    return { result: 'INVALID', registration: scanInfo(reg) };
  }
  // Already scanned in.
  if (reg.checkedIn) {
    return { result: 'ALREADY_USED', registration: scanInfo(reg) };
  }
  // Preview only.
  if (!confirm) {
    return { result: 'VALID', registration: scanInfo(reg) };
  }

  // Perform the check-in.
  const updated = await patch(reg.id, {
    checked_in: true,
    checked_in_at: new Date().toISOString(),
    ticket_status: 'USED',
  });
  await supabase.from('check_ins').insert({ registration_id: reg.id, result: 'VALID' });
  return { result: 'VALID', registration: scanInfo(updated) };
}

/** Recently checked-in attendees, most recent first (for the scanner history). */
export async function getRecentCheckIns(limit = 25): Promise<Registration[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('registrations')
    .select(REGISTRATION_COLUMNS)
    .eq('checked_in', true)
    .order('checked_in_at', { ascending: false })
    .limit(limit);

  if (error) throw new AdminActionError('DB_ERROR', error.message);
  return (data ?? []).map((row) => mapRowToRegistration(row as unknown as Record<string, unknown>));
}
