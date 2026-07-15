'use client';

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { Particles } from './Particles';

/**
 * Fixed, full-viewport ambient backdrop shared by the whole site.
 *
 * Layers, back to front:
 *   1. Deep navy radial base
 *   2. Two slow-floating gold glow blobs
 *   3. A faint navy accent glow (depth)
 *   4. Gold "dust" particle field (canvas)
 *   5. Subtle vignette to keep foreground text legible
 *
 * Everything is decorative (aria-hidden) and honors prefers-reduced-motion:
 * blobs stop drifting, particles are removed.
 */
export function AnimatedBackground() {
  const prefersReduced = usePrefersReducedMotion();

  const floatTransition = (duration: number) =>
    prefersReduced
      ? undefined
      : {
          duration,
          repeat: Infinity,
          repeatType: 'reverse' as const,
          ease: 'easeInOut' as const,
        };

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-navy-950">
      {/* Base navy radial */}
      <div className="absolute inset-0 bg-navy-radial" />

      {/* Gold glow — top left */}
      <motion.div
        className="absolute -left-40 -top-40 h-[38rem] w-[38rem] rounded-full bg-gold/20 blur-[120px]"
        animate={prefersReduced ? undefined : { x: [0, 60, 0], y: [0, 40, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={floatTransition(18)}
      />

      {/* Gold glow — bottom right */}
      <motion.div
        className="absolute -bottom-52 -right-40 h-[42rem] w-[42rem] rounded-full bg-gold-light/15 blur-[140px]"
        animate={prefersReduced ? undefined : { x: [0, -50, 0], y: [0, -30, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={floatTransition(22)}
      />

      {/* Navy accent glow — center depth */}
      <motion.div
        className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-navy-600/30 blur-[130px]"
        animate={prefersReduced ? undefined : { scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={floatTransition(16)}
      />

      {/* Particle field */}
      <Particles />

      {/* Vignette for foreground legibility */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_40%,transparent_40%,rgb(var(--navy-950)/0.7)_100%)]" />
    </div>
  );
}
