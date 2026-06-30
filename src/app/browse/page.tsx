import Link from 'next/link';
import { getItems, getGenres, type Item } from '@/lib/db';
import { ContentCard } from '@/components/ContentCard';

export const revalidate = 300;

const STATUS = ['all', 'ongoing', 'completed'] as const;
const TYPES = ['all', 'tv', 'movie', 'ona', 'ova', 'special'] as const;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; status?: string; type?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const genre = sp.genre || '';
  const status = sp.status === 'ongoing' || sp.status === 'completed' ? sp.status : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 30;

  const [{ rows, total }, genres] = await Promise.all([
    getItems({ genre, page, limit }),
    getGenres(),
  ]);

  let filtered = rows;
  if (status) filtered = filtered.filter(i => i.status === status);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen container mx-auto px-4 md:px-8 py-8">
      <header className="mb-8">
        <h1 className="heading-display text-3xl md:text-5xl text-[rgb(var(--color-fg-primary))]">Browse Catalog</h1>
        <p className="text-[rgb(var(--color-fg-secondary))] mt-2">{total} titles across anime, movies & more</p>
      </header>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto content-row pb-2">
          <Link
            href={`/browse${buildQuery({ genre: '', status, type: undefined, page: 1 })}`}
            className={`px-3 py-1.5 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${!genre ? 'bg-[rgb(var(--color-accent))] text-white' : 'bg-[rgba(var(--color-fg-primary),0.05)] text-[rgb(var(--color-fg-secondary))] hover:text-[rgb(var(--color-fg-primary))]'}`}
          >
            All
          </Link>
          {genres.slice(0, 18).map(g => (
            <Link
              key={g.name}
              href={`/browse${buildQuery({ genre: g.name, status, type: undefined, page: 1 })}`}
              className={`px-3 py-1.5 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${genre === g.name ? 'bg-[rgb(var(--color-accent))] text-white' : 'bg-[rgba(var(--color-fg-primary),0.05)] text-[rgb(var(--color-fg-secondary))] hover:text-[rgb(var(--color-fg-primary))]'}`}
            >
              {g.name} <span className="opacity-60">{g.count}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[rgb(var(--color-fg-muted))] uppercase tracking-wide">Status</span>
          {STATUS.map(s => (
            <Link
              key={s}
              href={`/browse${buildQuery({ genre, status: s === 'all' ? undefined : s, type: undefined, page: 1 })}`}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${(!status && s === 'all') || status === s ? 'bg-white/10 text-white' : 'text-[rgb(var(--color-fg-muted))] hover:text-[rgb(var(--color-fg-primary))]'}`}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {filtered.map((item: Item, i) => (
            <ContentCard key={item.slug} item={item} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <h2 className="text-2xl font-bold text-[rgb(var(--color-fg-primary))] mb-2">No titles found</h2>
          <p className="text-[rgb(var(--color-fg-secondary))] mb-6">Try a different genre or status filter.</p>
          <Link href="/browse" className="px-6 py-3 bg-[rgb(var(--color-accent))] text-white rounded-lg font-semibold hover:bg-[rgb(var(--color-accent-hover))] transition-colors">
            Reset filters
          </Link>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
          {page > 1 && (
            <Link href={`/browse${buildQuery({ genre, status, type: undefined, page: page - 1 })}`} className="px-4 py-2 rounded-lg bg-[rgba(var(--color-fg-primary),0.05)] hover:bg-[rgba(var(--color-fg-primary),0.1)] text-sm font-semibold">
              ← Prev
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-[rgb(var(--color-fg-secondary))]">Page {page} of {pages}</span>
          {page < pages && (
            <Link href={`/browse${buildQuery({ genre, status, type: undefined, page: page + 1 })}`} className="px-4 py-2 rounded-lg bg-[rgba(var(--color-fg-primary),0.05)] hover:bg-[rgba(var(--color-fg-primary),0.1)] text-sm font-semibold">
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

function buildQuery(opts: { genre?: string; status?: string; type?: string; page?: number }): string {
  const p = new URLSearchParams();
  if (opts.genre) p.set('genre', opts.genre);
  if (opts.status) p.set('status', opts.status);
  if (opts.type && opts.type !== 'all') p.set('type', opts.type);
  if (opts.page && opts.page > 1) p.set('page', String(opts.page));
  const s = p.toString();
  return s ? `?${s}` : '';
}
