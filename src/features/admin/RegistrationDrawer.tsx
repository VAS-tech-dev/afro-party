'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  CreditCard,
  Loader2,
  Mail,
  RotateCcw,
  Send,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { config, getCategory } from '@/config/config';
import { formatPrice } from '@/lib/utils';
import type { Registration } from '@/types/registration';
import type { AdminAction } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import { PaymentBadge, StatusBadge, TicketBadge } from './StatusBadge';
import { CATEGORY_LABEL, LANGUAGE_LABEL, formatDateTime } from './labels';

type ActionBody =
  | { action: Exclude<AdminAction, 'rejectMember' | 'updateNotes'> }
  | { action: 'rejectMember'; convertTo: 'STUDENT' | 'NON_STUDENT' }
  | { action: 'updateNotes'; notes: string };

interface Props {
  registration: Registration | null;
  onClose: () => void;
  /** Runs an action; resolves with the updated registration or throws. */
  onAction: (id: string, body: ActionBody) => Promise<void>;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-right text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

export function RegistrationDrawer({ registration, onClose, onAction }: Props) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setNotes(registration?.adminNotes ?? '');
    setError(null);
    setRejectOpen(false);
  }, [registration]);

  if (!registration) return null;
  const reg = registration;
  const cat = getCategory(reg.category);
  const price = cat.price === 0 ? 'Gratuit' : formatPrice(cat.price, 'fr', config.currency);

  async function run(key: string, body: ActionBody) {
    setPending(key);
    setError(null);
    try {
      await onAction(reg.id, body);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec de l’action.');
    } finally {
      setPending(null);
    }
  }

  const isPendingApproval = reg.status === 'MEMBER_PENDING' || reg.status === 'CONTRIBUTOR_PENDING';
  const canReceivePayment =
    reg.category !== 'CONTRIBUTOR' &&
    reg.paymentStatus !== 'PAID' &&
    !isPendingApproval &&
    reg.status !== 'MEMBER_REJECTED' &&
    reg.status !== 'CONTRIBUTOR_REJECTED';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.aside
          className="glass-strong absolute right-0 top-0 flex h-dvh w-full max-w-md flex-col overflow-y-auto p-6"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">
                {reg.firstName} {reg.lastName}
              </h2>
              <p className="text-xs text-gold">{reg.registrationCode}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-ink-muted hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <StatusBadge status={reg.status} />
            <PaymentBadge status={reg.paymentStatus} />
            <TicketBadge status={reg.ticketStatus} />
            {reg.checkedIn ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-xs text-emerald-300">
                <Check className="h-3 w-3" /> Présent·e
              </span>
            ) : null}
          </div>

          {/* Details */}
          <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-navy-900/40 px-4">
            <Row label="Tarif d’entrée" value={`${CATEGORY_LABEL[reg.category]} · ${price}`} />
            <Row label="Email" value={<a href={`mailto:${reg.email}`} className="text-gold">{reg.email}</a>} />
            <Row label="Téléphone" value={<a href={`tel:${reg.phone}`} className="text-gold">{reg.phone}</a>} />
            <Row label="Langue" value={LANGUAGE_LABEL[reg.language]} />
            {reg.memberNumber ? <Row label="Matricule" value={reg.memberNumber} /> : null}
            <Row label="Paiement immédiat" value={reg.payNow ? 'Oui' : 'Non'} />
            <Row label="Inscrit le" value={formatDateTime(reg.createdAt)} />
            {reg.ticketId ? <Row label="N° billet" value={reg.ticketId} /> : null}
            {reg.ticketSentAt ? <Row label="Billet envoyé le" value={formatDateTime(reg.ticketSentAt)} /> : null}
            {reg.checkedInAt ? <Row label="Scanné le" value={formatDateTime(reg.checkedInAt)} /> : null}
          </div>

          {error ? (
            <p role="alert" className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          {/* Actions */}
          <div className="mt-5 flex flex-col gap-2">
            {reg.status === 'MEMBER_PENDING' ? (
              <>
                <ActionButton
                  icon={UserCheck}
                  label="Valider le membre"
                  loading={pending === 'approveMember'}
                  onClick={() => run('approveMember', { action: 'approveMember' })}
                />
                <ActionButton
                  icon={UserX}
                  variant="danger"
                  label="Refuser le membre"
                  loading={false}
                  onClick={() => setRejectOpen((v) => !v)}
                />
                {rejectOpen ? (
                  <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-navy-900/60 p-3">
                    <p className="text-xs text-ink-muted">Convertir en :</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="secondary" disabled={pending !== null}
                        onClick={() => run('rejectMember', { action: 'rejectMember', convertTo: 'STUDENT' })}>
                        Étudiant · 7 €
                      </Button>
                      <Button size="sm" variant="secondary" disabled={pending !== null}
                        onClick={() => run('rejectMember', { action: 'rejectMember', convertTo: 'NON_STUDENT' })}>
                        Non-étudiant · 10 €
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}

            {reg.status === 'CONTRIBUTOR_PENDING' ? (
              <>
                <ActionButton
                  icon={UserCheck}
                  label="Valider l’engagé (billet gratuit)"
                  loading={pending === 'approveContributor'}
                  onClick={() => run('approveContributor', { action: 'approveContributor' })}
                />
                <ActionButton
                  icon={UserX}
                  variant="danger"
                  label="Refuser l’engagé"
                  loading={pending === 'rejectContributor'}
                  onClick={() => run('rejectContributor', { action: 'rejectContributor' })}
                />
              </>
            ) : null}

            {canReceivePayment ? (
              <ActionButton
                icon={CreditCard}
                label="Paiement reçu → envoyer le billet"
                loading={pending === 'paymentReceived'}
                onClick={() => run('paymentReceived', { action: 'paymentReceived' })}
              />
            ) : null}

            {reg.paymentStatus === 'PAID' ? (
              <ActionButton
                icon={RotateCcw}
                variant="danger"
                label="Annuler le paiement"
                loading={pending === 'undoPayment'}
                onClick={() => run('undoPayment', { action: 'undoPayment' })}
              />
            ) : null}

            {reg.ticketToken ? (
              <ActionButton
                icon={Send}
                label="Renvoyer le billet"
                loading={pending === 'resendTicket'}
                onClick={() => run('resendTicket', { action: 'resendTicket' })}
              />
            ) : null}
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label htmlFor="notes" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink">
              <Mail className="h-4 w-4 text-gold" aria-hidden="true" /> Notes administrateur
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-navy-900/60 px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              placeholder="Ajouter une note…"
            />
            <Button
              size="sm"
              variant="secondary"
              className="mt-2"
              disabled={pending !== null || notes === (reg.adminNotes ?? '')}
              onClick={() => run('updateNotes', { action: 'updateNotes', notes })}
            >
              {pending === 'updateNotes' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer la note'}
            </Button>
          </div>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  loading,
  variant = 'default',
}: {
  icon: typeof UserCheck;
  label: string;
  onClick: () => void;
  loading: boolean;
  variant?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={
        'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors disabled:opacity-60 ' +
        (variant === 'danger'
          ? 'border-red-400/30 bg-red-500/5 text-red-200 hover:bg-red-500/10'
          : 'border-gold/30 bg-gold/5 text-gold hover:bg-gold/10')
      }
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {label}
    </button>
  );
}
