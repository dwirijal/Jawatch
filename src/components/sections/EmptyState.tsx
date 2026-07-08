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
};

export function EmptyState({ icon, eyebrow, title, description, href, actionLabel = 'Browse catalog' }: EmptyStateProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-card/80 px-6 py-14 text-center shadow-2xl shadow-black/20">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background/60 text-primary">
        {icon ?? <Compass className="h-6 w-6" aria-hidden="true" />}
      </div>
      {eyebrow && <div className="font-mono text-xs uppercase tracking-wide2 text-accent">{eyebrow}</div>}
      <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {href && (
        <Link href={href} className={buttonClasses('default', 'mt-7')}>
          {actionLabel}
        </Link>
      )}
    </section>
  );
}
