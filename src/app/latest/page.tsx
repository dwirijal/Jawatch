import type { Metadata } from 'next';
import { getLatest } from '@/lib/api';
import { Card } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Latest',
  description: 'Rilisan terbaru anime, donghua, manga, comic, movie, dan novel di jawatch.',
  alternates: { canonical: '/latest' },
};

export default async function LatestPage() {
  const contents = await getLatest(undefined, 60);

  return (
    <div className="max-w-[1160px] mx-auto px-8 py-12">
      <div className="mb-8">
        <div className="font-mono text-xs text-amber uppercase tracking-[.1em]">Browse</div>
        <h1 className="font-serif text-3xl font-semibold text-paper mt-2">Latest</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-[2px] bg-hairline border border-hairline overflow-hidden">
        {contents.map((item) => (
          <Card
            key={item.slug}
            href={(item.type === 'anime' || item.type === 'donghua' || item.type === 'movie') ? `/watch/${item.slug}` : `/read/${item.slug}`}
            kind={item.type}
            title={item.title}
            coverImage={item.coverImage}
          />
        ))}
      </div>
    </div>
  );
}
