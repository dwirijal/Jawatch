'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

// ponytail: one scroll-in primitive replacing the dead rise-in/fade-in-up CSS
// keyframes. Reduced-motion -> instant (opacity only, no travel). Tokens mirror
// motion.duration.slow (0.38s) + ease.outExpo from ui/tokens.ts.
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** stagger index -> delay; 0 when standalone */
  delay?: number;
  /** travel distance in px; 0 disables translate */
  y?: number;
};

export function Reveal({ children, className, delay = 0, y = 16 }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: reduce ? 0.15 : 0.38, ease: EASE_OUT_EXPO, delay: reduce ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}
