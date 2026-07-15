import { Compass } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { buttonClasses } from '@/components/ui/Button';

type EmptyStateProps = {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
  // Heading level: 'h1' when this empty state is the page's sole heading, else 'h2' (default).
  as?: 'h1' | 'h2';
};

export function EmptyState({ icon, eyebrow, title, description, href, actionLabel = 'Browse catalog', as: Heading = 'h2' }: EmptyStateProps) {
  return (
    <section className="relative overflow-hidden rounded-card border border-border bg-card/80 px-6 py-14 text-center shadow-2xl shadow-black/20 animate-[rise-in_380ms_cubic-bezier(0.16,1,0.3,1)_both]">
      {/* Animated gradient border overlay */}
      <div className="absolute inset-0 rounded-card animate-[gradient-shift_4s_ease-in-out_infinite]" style={{
        background: 'linear-gradient(90deg, transparent, oklch(var(--primary)/0.3), oklch(var(--accent)/0.3), transparent)',
        backgroundSize: '300% 100%',
        padding: '1px',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'destination-out',
      }} />

      {/* Top shimmer line */}
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-[shimmer-line_3s_ease-in-out_infinite]" />

      {/* Floating icon container */}
      <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-card border border-border bg-background/60 text-primary animate-[float_3s_ease-in-out_infinite] shadow-lg shadow-primary/10">
        {icon ?? <Compass className="h-6 w-6" aria-hidden="true" />}
      </div>
      {eyebrow && <div className="font-mono text-xs uppercase tracking-wide2 text-accent animate-[glowPulse_2.5s_ease-in-out_infinite]" style={{ textShadow: '0 0 8px oklch(var(--accent)/0.4)' }}>{eyebrow}</div>}
      <Heading className="mt-2 font-serif text-3xl font-semibold text-foreground">{title}</Heading>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {href && (
        <Link href={href} className={buttonClasses('default', 'mt-7')}>
          {actionLabel}
        </Link>
      )}
    </section>
  );
}
