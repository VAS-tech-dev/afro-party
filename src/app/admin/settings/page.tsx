import { Info } from 'lucide-react';
import { config, getFullAddress } from '@/config/config';
import { formatPrice } from '@/lib/utils';
import { CATEGORY_LABEL } from '@/features/admin/labels';

export const metadata = { title: 'Réglages' };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-white/5 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

/**
 * Read-only settings. Event data lives in src/config/config.ts (single source
 * of truth). Editing it there + redeploy is the safe path on Vercel, whose
 * filesystem is read-only at runtime.
 */
export default function AdminSettingsPage() {
  const date = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: config.timezone,
  }).format(new Date(config.startsAt));

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Réglages</h1>
        <p className="mt-1 text-sm text-ink-muted">Informations de l’événement.</p>
      </header>

      <div className="flex items-start gap-3 rounded-2xl border border-gold/20 bg-gold/5 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
        <p className="text-sm text-ink-muted">
          Ces valeurs proviennent de <code className="text-gold">src/config/config.ts</code>. Pour
          les modifier, édite ce fichier puis redéploie — c’est la source unique de vérité utilisée
          par le site, les emails et les billets.
        </p>
      </div>

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-2 font-display text-lg font-semibold">Événement</h2>
        <Row label="Nom" value={`${config.eventName} · ${config.organizer}`} />
        <Row label="Date & heure" value={date} />
        <Row label="Lieu" value={getFullAddress()} />
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-2 font-display text-lg font-semibold">Tarifs d’entrée</h2>
        {config.categories.map((c) => (
          <Row
            key={c.id}
            label={CATEGORY_LABEL[c.id]}
            value={c.price === 0 ? 'Gratuit' : formatPrice(c.price, 'fr', config.currency)}
          />
        ))}
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-2 font-display text-lg font-semibold">Contact & paiement</h2>
        <Row label="Email" value={config.contact.email} />
        <Row label="Téléphone" value={config.contact.phone} />
        {config.contact.instagram ? (
          <Row label="Instagram" value={config.contact.instagram} />
        ) : null}
        <Row label="Lien PayPal" value={config.paypalLink} />
      </section>
    </div>
  );
}
