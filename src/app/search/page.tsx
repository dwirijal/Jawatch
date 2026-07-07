import type { Metadata } from 'next';
import { searchMedia } from '@/lib/api';
import { EmptyState } from '@/components/sections/EmptyState';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Cari anime, manga, donghua, movie, comic, dan novel di jawatch.',
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params.q || '';
  const result = query ? await searchMedia(query, 50) : { data: [], total: 0 };
  const contents = result.data || [];

  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <SectionHeader eyebrow="Search" title="Find your next title" description="Search across watch and read formats without leaving jawatch." />
      <form action="/search" method="GET" className="mb-8">
        <label className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 focus-within:border-primary/70">
          <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">Search query</span>
          <input name="q" defaultValue={query} placeholder="Cari judul..." className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" autoFocus />
        </label>
      </form>

      {contents.length > 0 ? (
        <>
          <p className="mb-4 font-mono text-xs text-muted-foreground">{contents.length} hasil untuk &quot;{query}&quot;</p>
          <MediaGrid items={contents} />
        </>
      ) : query ? (
        <EmptyState icon={<Search className="h-6 w-6" aria-hidden="true" />} title="Tidak ditemukan" description={`Tidak ada hasil untuk "${query}". Coba kata kunci lain.`} href="/discover" actionLabel="Browse catalog" />
      ) : null}
    </div>
  );
}
