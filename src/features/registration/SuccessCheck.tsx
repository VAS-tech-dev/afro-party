'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * Animated success badge — a gold ring with a check that draws in. Purely
 * decorative; the surrounding page conveys the message textually.
 */
export function SuccessCheck() {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="relative grid h-24 w-24 place-items-center rounded-full border border-gold/40 bg-gold/10 shadow-glow-gold-lg"
      aria-hidden="true"
    >
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-gold/30"
        animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 12 }}
      >
        <Check className="h-12 w-12 text-gold" strokeWidth={2.5} />
      </motion.span>
    </motion.div>
  );
}
