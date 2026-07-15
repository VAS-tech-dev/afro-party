import { isSupabaseConfigured } from '@/lib/supabase/server';
import { listRegistrations } from '@/services/admin';
import { RegistrationsView } from '@/features/admin/RegistrationsView';

export const metadata = { title: 'Inscriptions' };
export const dynamic = 'force-dynamic';

export default async function AdminRegistrationsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="glass rounded-2xl p-8 text-ink-muted">
        Base de données non configurée. Renseigne les variables Supabase dans{' '}
        <code className="text-gold">.env.local</code>.
      </div>
    );
  }

  const registrations = await listRegistrations();
  return <RegistrationsView initial={registrations} />;
}
