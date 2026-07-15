'use client';

import { useEffect, useState } from 'react';

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the target date is reached/passed. */
  isComplete: boolean;
}

function computeTimeLeft(target: number): TimeLeft {
  const diff = target - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }
  const seconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    isComplete: false,
  };
}

/**
 * Live countdown to an ISO date-time.
 *
 * Returns `null` until the component has mounted on the client, which keeps
 * server and first client render identical (no hydration mismatch) — the
 * consumer renders a stable placeholder while `null`.
 */
export function useCountdown(targetIso: string): TimeLeft | null {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    setTimeLeft(computeTimeLeft(target));

    const id = window.setInterval(() => {
      const next = computeTimeLeft(target);
      setTimeLeft(next);
      if (next.isComplete) window.clearInterval(id);
    }, 1000);

    return () => window.clearInterval(id);
  }, [targetIso]);

  return timeLeft;
}
