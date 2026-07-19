import Link from 'next/link';
import { decodeMediaRef, buildCanonicalPath } from '@/lib/api';
import type { ProgressInput } from '@/lib/library';
import { RemoveProgressButton } from './RemoveProgressButton';

// Renders a list of resume-points (watch or read progress). Each row deep-links to the
// last item (episode/chapter) so the user picks up where they left off.
export function ProgressList({ items, kind }: { items: ProgressInput[]; kind: 'episodes' | 'chapters' }) {
  return (
    <ul className="divide-y divide-border rounded-page border border-border bg-card/40">
      {items.map((item) => {
        const ref = decodeMediaRef(item.mediaRef);
        if (!ref) return null;
        // Public item path: /{type}/{work}/eN|cN (no /episodes|/chapters segment)
        const href = `${buildCanonicalPath(ref)}/${item.itemSlug}`;
        return (
          <li key={item.mediaRef} className="flex items-stretch">
            <Link href={href} className="flex flex-1 items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-card">
              <span className="font-serif text-sm text-foreground line-clamp-1">{item.title || item.mediaRef}</span>
              <span className="shrink-0 font-mono text-tag uppercase text-muted-foreground">
                {kind === 'episodes' ? 'EP' : 'CH'} {item.itemNumber}
              </span>
            </Link>
            <RemoveProgressButton mediaRef={item.mediaRef} />
          </li>
        );
      })}
    </ul>
  );
}
