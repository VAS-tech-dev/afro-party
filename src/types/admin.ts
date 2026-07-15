import type { Registration } from './registration';

/** Aggregate counts shown on the dashboard. */
export interface AdminStats {
  total: number;
  vasMembers: number;
  students: number;
  nonStudents: number;
  contributors: number;
  pendingMembers: number;
  pendingContributors: number;
  waitingPayment: number;
  paid: number;
  ticketsGenerated: number;
  checkedIn: number;
}

/** Quick filters available on the registrations table. */
export type RegistrationFilter =
  | 'ALL'
  | 'VAS_MEMBER'
  | 'STUDENT'
  | 'NON_STUDENT'
  | 'CONTRIBUTOR'
  | 'PENDING_APPROVAL'
  | 'WAITING_PAYMENT'
  | 'PAID'
  | 'TICKET_SENT'
  | 'CHECKED_IN';

/** Admin action names accepted by the action endpoint. */
export type AdminAction =
  | 'approveMember'
  | 'rejectMember'
  | 'approveContributor'
  | 'rejectContributor'
  | 'paymentReceived'
  | 'undoPayment'
  | 'resendTicket'
  | 'updateNotes';

export interface AdminActionResult {
  ok: boolean;
  registration?: Registration;
  error?: string;
}

/** Result of scanning a ticket QR at the door. */
export type ScanResult = 'VALID' | 'ALREADY_USED' | 'INVALID' | 'NOT_FOUND';

/** Compact info shown on the scanner result screen. */
export interface ScanRegistrationInfo {
  firstName: string;
  lastName: string;
  category: Registration['category'];
  ticketId: string | null;
  checkedInAt: string | null;
}

export interface ScanOutcome {
  result: ScanResult;
  registration?: ScanRegistrationInfo;
}
