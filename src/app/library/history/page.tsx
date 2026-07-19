import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import Link from 'next/link';
import { EmptyState } from '@/components/sections/EmptyState';
import { Clock3 } from 'lucide-react';
import { getUserId } from '@/lib/session';
import { listHistory } from '@/lib/library';
import { decodeMediaRef, buildCanonicalPath } from '@/lib/api';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const VIDEO_TYPES = ['anime', 'donghua', 'movie'];

export default async function HistoryPage() {
  const userId = await getUserId();
  if (!userId) {
    return (
      <Container>
        <EmptyState icon={<Clock3 className="h-6 w-6" aria-hidden="true" />} eyebrow="Library" title="Sign in to see history" description="Your recently opened episodes and chapters are tied to your account." href="/login" actionLabel="Sign in" />
      </Container>
    );
  }
  const history = await listHistory(userId);
  if (history.length === 0) {
    return (
      <Container>
        <EmptyState icon={<Clock3 className="h-6 w-6" aria-hidden="true" />} eyebrow="Library" title="No history yet" description="Episodes and chapters you open will appear here." href="/discover" actionLabel="Start browsing" />
      </Container>
    );
  }
  return (
    <Container>
      <h1 className="mb-6 border-l-2 border-amber pl-4 font-serif text-xl font-bold text-foreground">History</h1>
      <ul className="divide-y divide-border rounded-page border border-border bg-card/40">
        {history.map((h) => {
          const ref = decodeMediaRef(h.mediaRef);
          if (!ref) return null;
          const href = `${buildCanonicalPath(ref)}/${h.itemSlug}`;
          return (
            <li key={`${h.mediaRef}-${h.itemSlug}`}>
              <Link href={href} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-card">
                <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="font-mono text-sm text-foreground line-clamp-1">{h.itemSlug}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
