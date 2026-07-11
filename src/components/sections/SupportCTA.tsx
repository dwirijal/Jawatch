import { Heart, ChevronDown } from 'lucide-react';
import { COPY } from '@/lib/copy';
import { CryptoDonate } from '@/components/sections/CryptoDonate';
import { SAWERIA_URL, SAWERIA_SHOP_URL } from '@/lib/wallets';

// End-of-content support prompt (tasteful, non-nagging per retention research).
// Donate link defaults to the public Saweria profile; env override wins if set.
const DONATE_URL = process.env.NEXT_PUBLIC_DONATE_URL || SAWERIA_URL;

export function SupportCTA() {
  return (
    <aside className="flex flex-col items-center gap-4 rounded-card border border-border bg-card/40 p-6 text-center grain">
      <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
      <p className="max-w-md text-balance font-serif text-sm text-foreground">
        {COPY.support.prompt}
      </p>
      {/* Hierarchy: donate is the primary action, top-up secondary, follow tertiary. */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <a
          href={DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-5 py-2.5 font-mono text-tag font-medium uppercase tracking-tag text-void shadow-lift transition-all duration-base hover:bg-primary/90 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {COPY.support.donate}
        </a>
        <a
          href={SAWERIA_SHOP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-pill border border-border px-4 py-2.5 font-mono text-tag uppercase tracking-tag text-foreground transition-all duration-base hover:border-primary/60 hover:text-primary motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {COPY.support.shop}
        </a>
      </div>
      <a
        href="https://x.com/Anvxxr"
        target="_blank"
        rel="noopener noreferrer me"
        className="font-mono text-micro uppercase tracking-micro text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {COPY.support.follow}
      </a>
      {/* Crypto tucked behind native disclosure — present, never nagging. */}
      <details className="group w-full max-w-md">
        <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-pill px-3 py-1.5 font-mono text-micro uppercase tracking-micro text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
          {COPY.support.crypto}
          <ChevronDown className="h-3.5 w-3.5 transition-transform duration-base group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="mt-3 flex justify-center">
          <CryptoDonate />
        </div>
      </details>
    </aside>
  );
}
