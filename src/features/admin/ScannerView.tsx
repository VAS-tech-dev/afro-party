'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Ban, Camera, Check, Loader2, RotateCcw, ScanLine, XCircle } from 'lucide-react';
import type { Registration } from '@/types/registration';
import type { ScanOutcome } from '@/types/admin';
import { CATEGORY_LABEL, formatDateTime } from './labels';

type Phase = 'idle' | 'scanning' | 'processing' | 'result';

interface RecentEntry {
  name: string;
  at: string;
}

const READER_ID = 'qr-reader';

export function ScannerView({ initialRecent }: { initialRecent: Registration[] }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [recent, setRecent] = useState<RecentEntry[]>(
    initialRecent.map((r) => ({ name: `${r.firstName} ${r.lastName}`, at: r.checkedInAt ?? '' })),
  );

  // html5-qrcode instance kept in a ref across renders.
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        await scanner.stop();
        scanner.clear();
      } catch {
        /* already stopped */
      }
    }
  }, []);

  // Ensure the camera is released when leaving the page.
  useEffect(() => () => void stopCamera(), [stopCamera]);

  async function processToken(scanned: string) {
    setToken(scanned);
    setPhase('processing');
    try {
      const res = await fetch('/api/admin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: scanned, confirm: false }),
      });
      const json = (await res.json()) as { ok: boolean } & ScanOutcome;
      setOutcome(json.ok ? json : { result: 'INVALID' });
    } catch {
      setOutcome({ result: 'INVALID' });
    } finally {
      setPhase('result');
    }
  }

  async function startCamera() {
    setError(null);
    setOutcome(null);
    setPhase('scanning');
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      // Wait a tick so the #reader div is mounted.
      await new Promise((r) => setTimeout(r, 0));
      const scanner = new Html5Qrcode(READER_ID, { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (vw: number, vh: number) => {
            const size = Math.floor(Math.min(vw, vh) * 0.75);
            return { width: size, height: size };
          },
        },
        async (decoded: string) => {
          await stopCamera();
          void processToken(decoded);
        },
        () => {
          /* per-frame decode errors are normal; ignore */
        },
      );
    } catch (e) {
      setError(
        e instanceof Error && /permission|denied|NotAllowed/i.test(e.message)
          ? 'Accès à la caméra refusé. Autorise la caméra dans ton navigateur.'
          : 'Impossible de démarrer la caméra.',
      );
      setPhase('idle');
    }
  }

  async function confirmCheckIn() {
    if (!token) return;
    setCheckingIn(true);
    try {
      const res = await fetch('/api/admin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, confirm: true }),
      });
      const json = (await res.json()) as { ok: boolean } & ScanOutcome;
      setOutcome(json.ok ? json : { result: 'INVALID' });
      if (json.ok && json.result === 'VALID' && json.registration) {
        setRecent((prev) => [
          {
            name: `${json.registration!.firstName} ${json.registration!.lastName}`,
            at: new Date().toISOString(),
          },
          ...prev,
        ]);
        router.refresh();
      }
    } finally {
      setCheckingIn(false);
    }
  }

  function reset() {
    setOutcome(null);
    setToken(null);
    setError(null);
    setPhase('idle');
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Scanner</h1>
        <p className="mt-1 text-sm text-ink-muted">Contrôle des entrées le soir de l’événement.</p>
      </header>

      <div className="mx-auto w-full max-w-md">
        {phase === 'idle' ? (
          <div className="glass flex flex-col items-center gap-5 rounded-3xl p-10 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
              <ScanLine className="h-8 w-8" aria-hidden="true" />
            </span>
            <p className="text-sm text-ink-muted">
              Ouvre la caméra et vise le QR code du billet.
            </p>
            {error ? (
              <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-8 py-4 font-semibold text-navy-950 shadow-glow-gold transition-transform hover:-translate-y-0.5"
            >
              <Camera className="h-5 w-5" aria-hidden="true" />
              Ouvrir la caméra
            </button>
          </div>
        ) : null}

        {phase === 'scanning' ? (
          <div className="glass flex flex-col items-center gap-4 rounded-3xl p-5">
            <div id={READER_ID} className="w-full overflow-hidden rounded-2xl [&_video]:rounded-2xl" />
            <button
              type="button"
              onClick={() => {
                void stopCamera();
                reset();
              }}
              className="text-sm text-ink-muted hover:text-ink"
            >
              Annuler
            </button>
          </div>
        ) : null}

        {phase === 'processing' ? (
          <div className="glass flex flex-col items-center gap-3 rounded-3xl p-16">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="text-sm text-ink-muted">Vérification…</p>
          </div>
        ) : null}

        {phase === 'result' && outcome ? (
          <ResultScreen
            outcome={outcome}
            onCheckIn={confirmCheckIn}
            onReset={reset}
            checkingIn={checkingIn}
          />
        ) : null}
      </div>

      {/* Recent check-ins */}
      <section className="mx-auto w-full max-w-md">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-faint">
          Entrées récentes
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-ink-muted">Aucune entrée scannée pour le moment.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.slice(0, 25).map((e, i) => (
              <li key={`${e.name}-${i}`} className="glass flex items-center justify-between rounded-xl px-4 py-2.5 text-sm">
                <span className="inline-flex items-center gap-2 text-ink">
                  <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  {e.name}
                </span>
                <span className="text-xs text-ink-faint">{formatDateTime(e.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ResultScreen({
  outcome,
  onCheckIn,
  onReset,
  checkingIn,
}: {
  outcome: ScanOutcome;
  onCheckIn: () => void;
  onReset: () => void;
  checkingIn: boolean;
}) {
  const info = outcome.registration;
  const alreadyIn = outcome.result === 'ALREADY_USED';
  const valid = outcome.result === 'VALID';
  const checkedIn = valid && !!info?.checkedInAt;

  const config = {
    VALID: { color: 'emerald', Icon: Check, title: checkedIn ? 'ENTRÉE VALIDÉE' : 'BILLET VALIDE' },
    ALREADY_USED: { color: 'red', Icon: AlertTriangle, title: 'DÉJÀ UTILISÉ' },
    INVALID: { color: 'red', Icon: Ban, title: 'BILLET INVALIDE' },
    NOT_FOUND: { color: 'red', Icon: XCircle, title: 'BILLET INTROUVABLE' },
  }[outcome.result];

  const ring =
    config.color === 'emerald'
      ? 'border-emerald-400/50 bg-emerald-500/10'
      : 'border-red-400/50 bg-red-500/10';
  const iconColor = config.color === 'emerald' ? 'text-emerald-300' : 'text-red-300';

  return (
    <div className={`flex flex-col items-center gap-5 rounded-3xl border p-8 text-center ${ring}`}>
      <span className={`grid h-20 w-20 place-items-center rounded-full border ${ring} ${iconColor}`}>
        <config.Icon className="h-10 w-10" aria-hidden="true" />
      </span>
      <h2 className={`font-display text-2xl font-bold ${iconColor}`}>{config.title}</h2>

      {info ? (
        <div className="w-full rounded-2xl border border-white/10 bg-navy-900/50 p-4 text-left text-sm">
          <p className="text-lg font-semibold text-ink">{info.firstName} {info.lastName}</p>
          <p className="text-ink-muted">{CATEGORY_LABEL[info.category]}</p>
          {info.ticketId ? <p className="mt-1 font-mono text-xs text-gold">{info.ticketId}</p> : null}
          {alreadyIn && info.checkedInAt ? (
            <p className="mt-2 text-xs text-red-300">Premier scan : {formatDateTime(info.checkedInAt)}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-2">
        {valid && !checkedIn ? (
          <button
            type="button"
            onClick={onCheckIn}
            disabled={checkingIn}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 font-semibold text-navy-950 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {checkingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
            Valider l’entrée (check-in)
          </button>
        ) : null}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-ink hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
          Scanner à nouveau
        </button>
      </div>
    </div>
  );
}
