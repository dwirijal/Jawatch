import Link from 'next/link';
import Image from 'next/image';
import { getItems, getTrending, getGenres, contentType, type Item } from '@/lib/db';
import { ContentCard } from '@/components/ContentCard';

export const revalidate = 300;

function route(item: Item): string {
  const ct = contentType(item.type);
  return ct === 'movie' || ct === 'anime' ? `/watch/${item.slug}` : `/read/${item.slug}`;
}

export default async function HomePage() {
  const [{ rows: latest }, trending, genres] = await Promise.all([
    getItems({ page: 1, limit: 24 }),
    getTrending(12),
    getGenres(),
  ]);

  const ongoing = latest.filter(i => i.status === 'ongoing');
  const completed = latest.filter(i => i.status !== 'ongoing');
  const hero = trending[0] || latest[0];
  const topGenres = genres.slice(0, 6).map(g => g.name);

  async function genreRow(genre: string, limit = 12): Promise<Item[]> {
    const { rows } = await getItems({ genre, limit });
    return rows;
  }
  const genreRows = await Promise.all(topGenres.slice(0, 3).map(g => genreRow(g, 12).then(items => ({ genre: g, items }))));

  return (
    <div className="min-h-screen">
      {hero && (
        <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden">
          <Image
            src={hero.cover_url || 'https://images.unsplash.com/photo-1578632767115-35f5973e7e5b?w=1600'}
            alt={hero.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--color-bg-primary))] via-[rgba(10,10,10,0.6)] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--color-bg-primary))] via-[rgba(10,10,10,0.5)] to-transparent" />
          <div className="relative h-full flex items-end">
            <div className="container mx-auto px-4 md:px-8 pb-12 md:pb-16 max-w-3xl">
              <div className="flex items-center gap-3 mb-4 animate-fade-in-up">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full bg-[rgb(var(--color-accent))] text-white">Trending</span>
                {hero.status === 'ongoing' && <span className="text-xs font-semibold text-[rgb(var(--color-success))]">● Ongoing</span>}
                {hero.genres?.slice(0, 3).map(g => (
                  <span key={g} className="text-xs text-[rgb(var(--color-fg-secondary))] hidden sm:inline">{g}</span>
                ))}
              </div>
              <h1 className="heading-display text-4xl md:text-6xl lg:text-7xl text-white mb-4 max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>{hero.title}</h1>
              <div className="flex items-center gap-4 mb-6 text-sm text-[rgb(var(--color-fg-secondary))] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {hero.release_year > 0 && <span>{hero.release_year}</span>}
                {hero.episode_count > 0 && <span>· {hero.episode_count} Episodes</span>}
                {hero.score > 0 && <span>· ★ {hero.score.toFixed(1)}</span>}
              </div>
              <div className="flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Link href={route(hero)} className="inline-flex items-center gap-2 px-6 py-3 bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent-hover))] text-white font-bold rounded-lg transition-colors shadow-xl">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                  {contentType(hero.type) === 'movie' ? 'Watch Now' : 'Watch Episode 1'}
                </Link>
                <Link href={route(hero)} className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg transition-colors border border-white/10">More Info</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {ongoing.length > 0 && <Rail title="Currently Airing" subtitle="Fresh episodes, updated daily" items={ongoing} />}

      {genreRows.map(({ genre, items }) =>
        items.length > 0 ? <Rail key={genre} title={genre} subtitle={`${items.length}+ titles`} items={items} href={`/browse?genre=${encodeURIComponent(genre)}`} /> : null
      )}

      <section className="container mx-auto px-4 md:px-8 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="heading-section text-2xl md:text-4xl text-[rgb(var(--color-fg-primary))]">Most Episodes</h2>
            <p className="text-[rgb(var(--color-fg-secondary))] mt-1">Deep catalogs worth bingeing</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {trending.map((item, i) => <ContentCard key={item.slug} item={item} index={i} />)}
        </div>
      </section>

      {topGenres.length > 0 && (
        <section className="container mx-auto px-4 md:px-8 py-12">
          <h2 className="heading-section text-2xl md:text-4xl text-[rgb(var(--color-fg-primary))] mb-6">Browse by Genre</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {topGenres.map((g, i) => (
              <Link key={g} href={`/browse?genre=${encodeURIComponent(g)}`} className="group relative h-24 md:h-28 rounded-xl overflow-hidden ring-1 ring-[rgba(var(--color-fg-primary),0.06)] animate-scale-in" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--color-bg-elevated))] to-[rgb(var(--color-bg-secondary))] group-hover:from-[rgb(var(--color-accent-hover))] group-hover:to-[rgb(var(--color-accent))] transition-colors duration-300" />
                <div className="relative h-full flex items-center justify-center p-2">
                  <span className="text-sm md:text-base font-bold text-center text-[rgb(var(--color-fg-primary))] group-hover:text-white transition-colors">{g}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 md:px-8 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="heading-section text-2xl md:text-4xl text-[rgb(var(--color-fg-primary))]">Latest Additions</h2>
            <p className="text-[rgb(var(--color-fg-secondary))] mt-1">Fresh in the catalog</p>
          </div>
          <Link href="/browse" className="text-sm font-semibold text-[rgb(var(--color-accent))] hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {completed.slice(0, 12).map((item, i) => <ContentCard key={item.slug} item={item} index={i} />)}
        </div>
      </section>
    </div>
  );
}

function Rail({ title, subtitle, items, href }: { title: string; subtitle: string; items: Item[]; href?: string }) {
  if (items.length === 0) return null;
  return (
    <section className="container mx-auto px-4 md:px-8 py-8">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="heading-section text-xl md:text-3xl text-[rgb(var(--color-fg-primary))]">{title}</h2>
          <p className="text-sm text-[rgb(var(--color-fg-secondary))] mt-1">{subtitle}</p>
        </div>
        {href && <Link href={href} className="text-sm font-semibold text-[rgb(var(--color-accent))] hover:underline whitespace-nowrap">See all →</Link>}
      </div>
      <div className="content-row flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4">
        {items.map((item, i) => (
          <div key={item.slug} className="flex-shrink-0 w-[150px] md:w-[180px] snap-start">
            <ContentCard item={item} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
