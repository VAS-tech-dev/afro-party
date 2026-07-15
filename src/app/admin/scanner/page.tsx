import { isSupabaseConfigured } from '@/lib/supabase/server';
import { getRecentCheckIns } from '@/services/admin';
import { ScannerView } from '@/features/admin/ScannerView';

export const metadata = { title: 'Scanner' };
export const dynamic = 'force-dynamic';

export default async function AdminScannerPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="glass rounded-2xl p-8 text-ink-muted">
        Base de données non configurée. Renseigne les variables Supabase dans{' '}
        <code className="text-gold">.env.local</code>.
      </div>
    );
  }

  const recent = await getRecentCheckIns();
  return <ScannerView initialRecent={recent} />;
}
