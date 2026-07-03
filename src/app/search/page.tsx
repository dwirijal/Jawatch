import { searchMedia } from '@/lib/api';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const result = query ? await searchMedia(query, 50) : { data: [], total: 0 };
  const contents = result.data || [];
  const total = result.total || 0;

  const getRoute = (type: string, slug: string) => {
    if (type === 'anime' || type === 'donghua' || type === 'movie') return `/watch/${slug}`;
    return `/read/${slug}`;
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-fg-primary))]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[rgba(var(--color-bg-primary),0.95)] backdrop-blur-sm border-b border-[rgba(var(--color-fg-primary),0.1)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <a href="/" className="text-2xl font-bold text-[rgb(var(--color-accent))]">JAWATCH</a>
            <form action="/search" method="GET" className="flex-1 max-w-2xl">
              <div className="flex items-center gap-2 px-4 py-2 bg-[rgba(var(--color-fg-primary),0.05)] rounded-lg border border-[rgba(var(--color-fg-primary),0.1)] focus-within:border-[rgba(var(--color-accent),0.5)] transition-colors">
                <svg className="w-5 h-5 text-[rgb(var(--color-fg-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Search anime, manga, donghua, comics, novels, movies..."
                  className="flex-1 bg-transparent text-[rgb(var(--color-fg-primary))] placeholder-[rgb(var(--color-fg-subtle))] outline-none"
                  autoFocus
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {query ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Search Results for &ldquo;{query}&rdquo;
              </h1>
              <p className="text-[rgb(var(--color-fg-secondary))]">
                {total} {total === 1 ? 'result' : 'results'} found
              </p>
            </div>

            {contents.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {contents.map((content) => (
                  <a key={content.slug} href={getRoute(content.type, content.slug)} className="group block">
                    <div className="aspect-[2/3] bg-[rgb(var(--color-bg-secondary))] rounded-lg overflow-hidden mb-3 relative">
                      {content.coverImage ? (
                        <img src={content.coverImage} alt={content.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-elevated))]">
                          <svg className="w-16 h-16 text-[rgb(var(--color-fg-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="text-[rgb(var(--color-fg-primary))] font-semibold text-sm line-clamp-2">{content.title}</h3>
                    <p className="text-[rgb(var(--color-fg-secondary))] text-xs mt-1">{new Date(content.createdAt).getFullYear()}</p>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <svg className="w-24 h-24 text-[rgb(var(--color-fg-subtle))] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold mb-2">No results found</h2>
                <p className="text-[rgb(var(--color-fg-secondary))] mb-4">
                  Try adjusting your search or browse our catalog
                </p>
                <a href="/" className="inline-block px-6 py-3 bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent-hover))] text-[rgb(var(--color-fg-primary))] rounded-lg font-semibold transition-colors">
                  Browse Catalog
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-[rgb(var(--color-fg-subtle))] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Start your search</h2>
            <p className="text-[rgb(var(--color-fg-secondary))]">
              Enter a title to search our catalog
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
