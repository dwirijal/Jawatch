import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  actionLabel?: string;
  // Heading level: 'h1' when this is the page's primary title, else 'h2' (default) for sections.
  as?: 'h1' | 'h2';
};

export function SectionHeader({ eyebrow, title, description, href, actionLabel = 'View all', as: Heading = 'h2' }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="relative pl-4">
        {/* Animated primary underline — grows from left on mount */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-primary shadow-[0_0_8px_oklch(var(--primary)/0.6)] animate-[growUp_0.5s_ease-out_expo_forwards]" />

        {/* Eyebrow with accent glow */}
        {eyebrow && (
          <div className="font-mono text-eyebrow uppercase text-accent-bright animate-[glowPulse_2.5s_ease-in-out_infinite]"
            style={{ textShadow: '0 0 12px oklch(var(--accent-bright)/0.5)' }}
          >
            {eyebrow}
          </div>
        )}
        <Heading className="mt-1 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </Heading>
        {description && <p className="mt-2 max-w-2xl text-xs text-muted-foreground">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1.5 font-mono text-tag uppercase text-primary transition-colors hover:text-primary/80 min-h-[48px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-2 sm:p-0">
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
