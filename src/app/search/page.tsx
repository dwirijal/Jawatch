import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { searchMedia } from '@/lib/api';
import Link from 'next/link';
import { EmptyState } from '@/components/sections/EmptyState';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { RecentSearches } from '@/components/sections/RecentSearches';
import { Search, SlidersHorizontal } from 'lucide-react';
import { COPY } from '@/lib/copy';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Cari anime, manga, donghua, movie, comic, dan novel di jawatch.',
  robots: { index: false, follow: true },
};

const TYPES = ['anime', 'donghua', 'manga', 'comic', 'movie', 'novel'];
const STATUSES = ['Ongoing', 'Completed'];
const SORTS = [
  { value: '', label: 'Relevance' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'az', label: 'A→Z' },
];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; genre?: string; status?: string; sort?: string }> }) {
  const params = await searchParams;
  const query = params.q || '';
  const activeType = params.type || '';
  const activeGenre = params.genre || '';
  const activeStatus = params.status || '';
  const activeSort = params.sort || '';

  const result = query
    ? await searchMedia(query, 50, activeType || undefined, { genre: activeGenre || undefined, status: activeStatus || undefined, sort: activeSort || undefined })
    : { data: [], total: 0 };
  const contents = result.data || [];

  const buildHref = (overrides: Record<string, string>) => {
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    const merged = { type: activeType, genre: activeGenre, status: activeStatus, sort: activeSort, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v);
    }
    return `/search?${p.toString()}`;
  };

  return (
    <Container>
      <SectionHeader as="h1" eyebrow="Search" title="Find your next title" description="Search across watch and read formats without leaving jawatch." />
      <form action="/search" method="GET" className="mb-4">
        <label className="flex items-center gap-3 rounded-card border border-border bg-card px-4 py-3 focus-within:border-primary/70">
          <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Search query</span>
          <input name="q" defaultValue={query} placeholder={COPY.search.placeholder} className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          {activeType && <input type="hidden" name="type" value={activeType} />}
          {activeGenre && <input type="hidden" name="genre" value={activeGenre} />}
          {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
          {activeSort && <input type="hidden" name="sort" value={activeSort} />}
        </label>
      </form>

      {/* Type pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Pill href={buildHref({ type: '' })} active={!activeType}>all</Pill>
        {TYPES.map((t) => (
          <Pill key={t} href={buildHref({ type: activeType === t ? '' : t })} active={activeType === t}>{t}</Pill>
        ))}
      </div>

      {/* Filters row: status + sort */}
      {query && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden />
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <Pill key={s} href={buildHref({ status: activeStatus === s ? '' : s })} active={activeStatus === s} size="sm">{s}</Pill>
            ))}
          </div>
          <div className="h-4 w-px bg-border" aria-hidden />
          <div className="flex flex-wrap gap-1.5">
            {SORTS.map((s) => (
              <Pill key={s.value} href={buildHref({ sort: activeSort === s.value ? '' : s.value })} active={activeSort === s.value} size="sm">{s.label}</Pill>
            ))}
          </div>
        </div>
      )}

      <RecentSearches current={query} />

      {contents.length > 0 ? (
        <>
          <p className="mb-4 font-mono text-xs text-muted-foreground">{COPY.search.count(contents.length)}{activeType ? ` ${activeType}` : ''} untuk &quot;{query}&quot;</p>
          <MediaGrid items={contents} />
        </>
      ) : query ? (
        <EmptyState icon={<Search className="h-6 w-6" aria-hidden />} title={COPY.search.emptyTitle} description={COPY.search.emptyDesc(query)} href="/discover" actionLabel="Browse catalog" />
      ) : null}
    </Container>
  );
}

function Pill({ href, active, size = 'md', children }: { href: string; active: boolean; size?: 'sm' | 'md'; children: React.ReactNode }) {
  const base = size === 'sm' ? 'px-2.5 py-1 text-micro' : 'px-4 py-2 text-micro';
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`rounded-pill border font-mono uppercase transition-colors ${active ? 'border-primary text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'} ${base}`}
    >
      {children}
    </Link>
  );
}
