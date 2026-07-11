'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

// ponytail: container + item pair for list/grid entrances (rails, media grids).
// Wrap the list in <Stagger>, each child in <Stagger.Item>. Reduced-motion ->
// no travel, near-instant, no cascade. Add per-item props only if a surface needs it.
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type StaggerProps = { children: ReactNode; className?: string; step?: number };

export function Stagger({ children, className, step = 0.05 }: StaggerProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : step } },
      }}
    >
      {children}
    </motion.div>
  );
}

function Item({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 16 },
        show: { opacity: 1, y: 0, transition: { duration: reduce ? 0.15 : 0.38, ease: EASE_OUT_EXPO } },
      }}
    >
      {children}
    </motion.div>
  );
}

Stagger.Item = Item;
