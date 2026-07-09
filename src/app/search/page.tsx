import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { searchMedia } from '@/lib/api';
import Link from 'next/link';
import { EmptyState } from '@/components/sections/EmptyState';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { RecentSearches } from '@/components/sections/RecentSearches';
import { Search } from 'lucide-react';
import { COPY } from '@/lib/copy';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Cari anime, manga, donghua, movie, comic, dan novel di jawatch.',
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const params = await searchParams;
  const query = params.q || '';
  const activeType = params.type || '';
  const result = query ? await searchMedia(query, 50, activeType || undefined) : { data: [], total: 0 };
  const contents = result.data || [];

  const types = ['anime', 'donghua', 'manga', 'comic', 'movie', 'novel'];

  return (
    <Container>
      <SectionHeader eyebrow="Search" title="Find your next title" description="Search across watch and read formats without leaving jawatch." />
      <form action="/search" method="GET" className="mb-4">
        <label className="flex items-center gap-3 rounded-card border border-border bg-card px-4 py-3 focus-within:border-primary/70">
          <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Search query</span>
          <input name="q" defaultValue={query} placeholder={COPY.search.placeholder} className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" autoFocus />
        </label>
        {activeType && <input type="hidden" name="type" value={activeType} />}
      </form>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link href={activeType ? `/search?q=${encodeURIComponent(query)}` : '#'} className={`rounded-pill border px-4 py-2 font-mono text-micro uppercase transition-colors ${activeType ? 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary' : 'border-primary text-primary'}`}>all</Link>
        {types.map((t) => (
          <Link
            key={t}
            href={`/search?q=${encodeURIComponent(query)}&type=${t}`}
            className={`rounded-pill border px-4 py-2 font-mono text-micro uppercase transition-colors ${activeType === t ? 'border-primary text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'}`}
          >
            {t}
          </Link>
        ))}
      </div>

      <RecentSearches current={query} />

      {contents.length > 0 ? (
        <>
          <p className="mb-4 font-mono text-xs text-muted-foreground">{COPY.search.count(contents.length)}{activeType ? ` ${activeType}` : ''} untuk &quot;{query}&quot;</p>
          <MediaGrid items={contents} />
        </>
      ) : query ? (
        <EmptyState icon={<Search className="h-6 w-6" aria-hidden="true" />} title={COPY.search.emptyTitle} description={COPY.search.emptyDesc(query)} href="/discover" actionLabel="Browse catalog" />
      ) : null}
    </Container>
  );
}
