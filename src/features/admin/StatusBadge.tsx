import { cn } from '@/lib/utils';
import type { PaymentStatus, RegistrationStatus, TicketStatus } from '@/types/registration';

type Tone = 'gold' | 'green' | 'amber' | 'red' | 'blue' | 'grey';

const toneClass: Record<Tone, string> = {
  gold: 'border-gold/30 bg-gold/10 text-gold',
  green: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  amber: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  red: 'border-red-400/30 bg-red-400/10 text-red-300',
  blue: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  grey: 'border-white/10 bg-white/5 text-ink-muted',
};

/** French labels + tone for each registration status. */
export const STATUS_META: Record<RegistrationStatus, { label: string; tone: Tone }> = {
  PENDING: { label: 'En attente', tone: 'blue' },
  MEMBER_PENDING: { label: 'Membre à vérifier', tone: 'amber' },
  MEMBER_APPROVED: { label: 'Membre validé', tone: 'green' },
  MEMBER_REJECTED: { label: 'Membre refusé', tone: 'red' },
  CONTRIBUTOR_PENDING: { label: 'Engagé à valider', tone: 'amber' },
  CONTRIBUTOR_APPROVED: { label: 'Engagé validé', tone: 'green' },
  CONTRIBUTOR_REJECTED: { label: 'Engagé refusé', tone: 'red' },
};

export const PAYMENT_META: Record<PaymentStatus, { label: string; tone: Tone }> = {
  NOT_REQUESTED: { label: 'Non requis', tone: 'grey' },
  WAITING_PAYMENT: { label: 'Paiement attendu', tone: 'amber' },
  PAID: { label: 'Payé', tone: 'green' },
};

export const TICKET_META: Record<TicketStatus, { label: string; tone: Tone }> = {
  NOT_GENERATED: { label: 'Aucun billet', tone: 'grey' },
  GENERATED: { label: 'Billet envoyé', tone: 'green' },
  USED: { label: 'Billet utilisé', tone: 'blue' },
};

export function Badge({ label, tone, className }: { label: string; tone: Tone; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
        toneClass[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: RegistrationStatus }) {
  const m = STATUS_META[status];
  return <Badge label={m.label} tone={m.tone} />;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const m = PAYMENT_META[status];
  return <Badge label={m.label} tone={m.tone} />;
}

export function TicketBadge({ status }: { status: TicketStatus }) {
  const m = TICKET_META[status];
  return <Badge label={m.label} tone={m.tone} />;
}
