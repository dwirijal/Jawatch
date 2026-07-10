import { Heart } from 'lucide-react';
import { COPY } from '@/lib/copy';
import { CryptoDonate } from '@/components/sections/CryptoDonate';
import { SAWERIA_URL, SAWERIA_SHOP_URL } from '@/lib/wallets';

// End-of-content support prompt (tasteful, non-nagging per retention research).
// Donate link defaults to the public Saweria profile; env override wins if set.
const DONATE_URL = process.env.NEXT_PUBLIC_DONATE_URL || SAWERIA_URL;

export function SupportCTA() {
  return (
    <aside className="flex flex-col items-center gap-3 rounded-card border border-border bg-card/40 p-6 text-center grain">
      <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
      <p className="max-w-md font-serif text-sm text-foreground">
        {COPY.support.prompt}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <a
          href={DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-4 py-2 font-mono text-tag uppercase tracking-tag text-void transition-all duration-base hover:bg-primary/90 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {COPY.support.donate}
        </a>
        <a
          href={SAWERIA_SHOP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-pill border border-border px-4 py-2 font-mono text-tag uppercase tracking-tag text-foreground transition-all duration-base hover:border-primary/60 hover:text-primary motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {COPY.support.shop}
        </a>
        <a
          href="https://x.com/Anvxxr"
          target="_blank"
          rel="noopener noreferrer me"
          className="inline-flex items-center gap-1.5 rounded-pill border border-border px-4 py-2 font-mono text-tag uppercase tracking-tag text-foreground transition-all duration-base hover:border-primary/60 hover:text-primary motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {COPY.support.follow}
        </a>
      </div>
      <CryptoDonate />
    </aside>
  );
}
