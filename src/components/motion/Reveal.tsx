'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { blurReveal, fadeIn, fadeUp, scaleIn, slideInLeft, slideInRight } from './variants';

const PRESETS = {
  fadeUp,
  fadeIn,
  scaleIn,
  blurReveal,
  slideInLeft,
  slideInRight,
} satisfies Record<string, Variants>;

export type RevealPreset = keyof typeof PRESETS;

interface RevealProps {
  children: ReactNode;
  /** Which motion variant to use. Default: fadeUp. */
  preset?: RevealPreset;
  /** Delay before the animation starts, in seconds. */
  delay?: number;
  /** Wrapper element tag. */
  as?: 'div' | 'section' | 'li' | 'article' | 'span';
  className?: string;
  /** Re-run the animation every time it enters the viewport. */
  repeat?: boolean;
}

/**
 * Scroll-reveal wrapper. Animates its children in when they scroll into view.
 * Respects reduced motion automatically (Framer reads the media query and
 * skips transforms). Use for section entrances, cards, headings.
 */
export function Reveal({
  children,
  preset = 'fadeUp',
  delay = 0,
  as = 'div',
  className,
  repeat = false,
}: RevealProps) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      variants={PRESETS[preset]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: !repeat, amount: 0.25, margin: '0px 0px -80px 0px' }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
