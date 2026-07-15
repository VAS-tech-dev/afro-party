'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Registration } from '@/types/registration';
import type { RegistrationFilter } from '@/types/admin';
import { PaymentBadge, StatusBadge } from './StatusBadge';
import { RegistrationDrawer } from './RegistrationDrawer';
import { CATEGORY_LABEL } from './labels';

const FILTERS: { id: RegistrationFilter; label: string }[] = [
  { id: 'ALL', label: 'Tous' },
  { id: 'PENDING_APPROVAL', label: 'À valider' },
  { id: 'WAITING_PAYMENT', label: 'Paiement attendu' },
  { id: 'PAID', label: 'Payés' },
  { id: 'TICKET_SENT', label: 'Billet envoyé' },
  { id: 'CHECKED_IN', label: 'Scannés' },
  { id: 'VAS_MEMBER', label: 'Membres' },
  { id: 'STUDENT', label: 'Étudiants' },
  { id: 'NON_STUDENT', label: 'Non-étudiants' },
  { id: 'CONTRIBUTOR', label: 'Engagés' },
];

const ERROR_LABELS: Record<string, string> = {
  INVALID_STATE: 'Action impossible dans cet état.',
  ALREADY_PAID: 'Le paiement est déjà confirmé.',
  NOT_PAID: 'Aucun paiement à annuler.',
  NO_TICKET: 'Aucun billet à renvoyer.',
  NOT_FOUND: 'Inscription introuvable.',
  UNAUTHORIZED: 'Session expirée, reconnecte-toi.',
};

function matchesFilter(r: Registration, f: RegistrationFilter): boolean {
  switch (f) {
    case 'ALL': return true;
    case 'PENDING_APPROVAL': return r.status === 'MEMBER_PENDING' || r.status === 'CONTRIBUTOR_PENDING';
    case 'WAITING_PAYMENT': return r.paymentStatus === 'WAITING_PAYMENT';
    case 'PAID': return r.paymentStatus === 'PAID';
    case 'TICKET_SENT': return r.ticketStatus === 'GENERATED' || r.ticketStatus === 'USED';
    case 'CHECKED_IN': return r.checkedIn;
    default: return r.category === f;
  }
}

export function RegistrationsView({ initial }: { initial: Registration[] }) {
  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<RegistrationFilter>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Re-sync when the server sends fresh data (after router.refresh()).
  useEffect(() => setItems(initial), [initial]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((r) => {
      if (!matchesFilter(r, filter)) return false;
      if (!q) return true;
      return [r.firstName, r.lastName, r.email, r.phone, r.registrationCode]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, filter]);

  const selected = items.find((r) => r.id === selectedId) ?? null;

  async function onAction(id: string, body: unknown) {
    const res = await fetch(`/api/admin/registrations/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { ok: boolean; error?: string; registration?: Registration };
    if (!res.ok || !json.ok || !json.registration) {
      throw new Error(ERROR_LABELS[json.error ?? ''] ?? 'Échec de l’action.');
    }
    const updated = json.registration;
    setItems((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Inscriptions</h1>
        <p className="text-sm text-ink-muted">
          {filtered.length} / {items.length} inscription{items.length > 1 ? 's' : ''}
        </p>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher nom, email, téléphone, code…"
          className="w-full rounded-xl border border-white/10 bg-navy-900/60 py-3 pl-11 pr-4 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              filter === f.id
                ? 'border-gold/50 bg-gold/10 text-gold'
                : 'border-white/10 bg-white/5 text-ink-muted hover:text-ink',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table (desktop) */}
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-900/60 text-xs uppercase tracking-wider text-ink-faint">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Tarif</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Paiement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((r) => (
              <tr
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className="cursor-pointer transition-colors hover:bg-white/5"
              >
                <td className="px-4 py-3 font-mono text-xs text-gold">{r.registrationCode}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{r.firstName} {r.lastName}</div>
                  <div className="text-xs text-ink-faint">{r.email}</div>
                </td>
                <td className="px-4 py-3 text-ink-muted">{CATEGORY_LABEL[r.category]}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3"><PaymentBadge status={r.paymentStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-muted">Aucune inscription.</p>
        ) : null}
      </div>

      {/* Cards (mobile) */}
      <div className="flex flex-col gap-3 lg:hidden">
        {filtered.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSelectedId(r.id)}
            className="glass flex flex-col gap-2 rounded-2xl p-4 text-left"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink">{r.firstName} {r.lastName}</span>
              <span className="font-mono text-xs text-gold">{r.registrationCode}</span>
            </div>
            <span className="text-xs text-ink-faint">{r.email}</span>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={r.status} />
              <PaymentBadge status={r.paymentStatus} />
            </div>
          </button>
        ))}
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-muted">Aucune inscription.</p>
        ) : null}
      </div>

      {selected ? (
        <RegistrationDrawer
          registration={selected}
          onClose={() => setSelectedId(null)}
          onAction={onAction}
        />
      ) : null}
    </div>
  );
}
