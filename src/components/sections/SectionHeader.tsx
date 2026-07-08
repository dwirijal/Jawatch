import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  actionLabel?: string;
};

export function SectionHeader({ eyebrow, title, description, href, actionLabel = 'View all' }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-l-2 border-amber pl-4">
      <div>
        {eyebrow && <div className="font-mono text-eyebrow uppercase text-accent-bright">{eyebrow}</div>}
        <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
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
