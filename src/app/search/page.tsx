import Link from 'next/link';
import { searchItems } from '@/lib/db';
import { ContentCard } from '@/components/ContentCard';

export const revalidate = 60;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const results = q ? await searchItems(q, 50) : [];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="max-w-2xl mx-auto mb-10">
          <h1 className="heading-display text-3xl md:text-5xl text-white mb-4 text-center">Search</h1>
          <form action="/search" method="GET" className="flex items-center gap-3 px-5 py-3.5 bg-[rgba(var(--color-fg-primary),0.04)] rounded-full border border-[rgba(var(--color-fg-primary),0.1)] focus-within:border-[rgba(var(--color-accent),0.5)] transition-colors">
            <svg className="w-5 h-5 text-[rgb(var(--color-fg-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search titles..."
              className="flex-1 bg-transparent text-[rgb(var(--color-fg-primary))] placeholder-[rgb(var(--color-fg-subtle))] outline-none text-lg"
              autoFocus
            />
            {q && (
              <Link href="/search" className="text-xs text-[rgb(var(--color-fg-muted))] hover:text-[rgb(var(--color-fg-primary))]">Clear</Link>
            )}
          </form>
        </div>

        {q ? (
          <>
            <p className="text-[rgb(var(--color-fg-secondary))] mb-6 text-center">
              {results.length} {results.length === 1 ? 'result' : 'results'} for &ldquo;{q}&rdquo;
            </p>
            {results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {results.map((item, i) => <ContentCard key={item.slug} item={item} index={i} />)}
              </div>
            ) : (
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-[rgb(var(--color-fg-primary))] mb-2">No results</h2>
                <p className="text-[rgb(var(--color-fg-secondary))] mb-6">Try a different title or browse the catalog.</p>
                <Link href="/browse" className="px-6 py-3 bg-[rgb(var(--color-accent))] text-white rounded-lg font-semibold hover:bg-[rgb(var(--color-accent-hover))] transition-colors">Browse Catalog</Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-[rgb(var(--color-fg-secondary))]">
            <p>Enter a title to search across the catalog.</p>
          </div>
        )}
      </div>
    </div>
  );
}
