import type { Metadata } from 'next';
import { searchMedia } from '@/lib/api';
import { ContentCard } from '@/components/ContentCard';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Cari anime, manga, donghua, movie, comic, dan novel di jawatch.',
  alternates: { canonical: '/search' },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const result = query ? await searchMedia(query, 50) : { data: [], total: 0 };
  const contents = result.data || [];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search bar */}
        <form action="/search" method="GET" className="mb-6">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(var(--color-fg-primary),0.05)] rounded-lg border border-[rgba(var(--color-fg-primary),0.1)] focus-within:border-[rgba(var(--color-accent),0.5)] transition-colors">
            <svg className="w-5 h-5 text-[rgb(var(--color-fg-muted))] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Cari judul..."
              className="flex-1 bg-transparent outline-none text-sm text-[rgb(var(--color-fg-primary))] placeholder:text-[rgb(var(--color-fg-muted))]"
              autoFocus
            />
          </div>
        </form>

        {/* Results */}
        {query && (
          <p className="text-xs text-[rgb(var(--color-fg-muted))] mb-4">
            {contents.length > 0 ? `${contents.length} hasil untuk "${query}"` : `Tidak ada hasil untuk "${query}"`}
          </p>
        )}

        {contents.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {contents.map(item => (
              <ContentCard key={item.slug} content={item} />
            ))}
          </div>
        ) : query ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-16 h-16 text-[rgb(var(--color-fg-muted))] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm text-[rgb(var(--color-fg-secondary))]">Tidak ditemukan. Coba kata kunci lain.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
