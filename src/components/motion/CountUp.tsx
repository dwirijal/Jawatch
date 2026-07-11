'use client';

import { useEffect, useRef, useState } from 'react';

// ponytail: anime.js count-up for a single numeric stat (hero rating). SSR/no-JS
// and reduced-motion render the final value immediately (progressive enhancement);
// JS animates from 0 on mount. anime imported dynamically to stay out of the bundle.
export function CountUp({ value, decimals = 1, durationMs = 900 }: { value: number; decimals?: number; durationMs?: number }) {
  const [display, setDisplay] = useState(() => value.toFixed(decimals));
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let cancelled = false;
    (async () => {
      const { animate } = await import('animejs');
      if (cancelled) return;
      const obj = { n: 0 };
      animate(obj, {
        n: value,
        duration: durationMs,
        ease: 'outExpo',
        onUpdate: () => setDisplay(obj.n.toFixed(decimals)),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [value, decimals, durationMs]);

  return <span>{display}</span>;
}
