'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// ponytail: gsap-driven scroll parallax for the hero cover. Replaces the CSS
// background-attachment:fixed trick (which no-ops on mobile). gsap + ScrollTrigger
// loaded dynamically so they stay out of the initial bundle. Skips entirely under
// prefers-reduced-motion. One real effect; expand only if another surface needs it.
export function Parallax({ children, strength = 80, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.to(el, {
          y: strength,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
        });
      }, el);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [strength]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
