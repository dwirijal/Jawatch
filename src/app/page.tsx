import { getMedia } from '@/lib/api';
import { Card } from '@/components/ui';
import Link from 'next/link';

export default async function HomePage() {
  const { data: contents } = await getMedia(undefined, 1, 60);

  const anime = contents.filter(c => c.type === 'anime');
  const donghua = contents.filter(c => c.type === 'donghua');
  const manga = contents.filter(c => c.type === 'manga');
  const comic = contents.filter(c => c.type === 'comic');
  const novel = contents.filter(c => c.type === 'novel');
  const movie = contents.filter(c => c.type === 'movie');

  const heroContent = contents[0];

  const isNew = (createdAt: string) => {
    const diffDays = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
    return diffDays <= 7;
  };

  const getRoute = (type: string, slug: string) =>
    (type === 'anime' || type === 'donghua' || type === 'movie') ? `/watch/${slug}` : `/read/${slug}`;

  const renderRow = (items: typeof contents, label: string) => {
    if (items.length === 0) return null;
    return (
      <section className="py-12 border-b border-hairline">
        <div className="flex items-center justify-between mb-8 px-1">
          <h2 className="text-2xl font-serif font-semibold">{label}</h2>
          <span className="font-mono text-xs text-muted">{items.length} items</span>
        </div>
        {/* Reel Grid - 5 columns on desktop, 2 on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-[2px] bg-hairline border-y border-hairline overflow-hidden">
          {items.slice(0, 10).map(item => (
            <Card
              key={item.slug}
              href={getRoute(item.type, item.slug)}
              kind={item.type}
              title={item.title}
              coverImage={item.coverImage}
              isNew={isNew(item.createdAt)}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      {heroContent && (
        <section className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-b from-amber/14 to-transparent border-b border-hairline">
          <div className="absolute inset-0 opacity-[.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 3px)' }} />
          <div className="max-w-[1160px] mx-auto px-8 relative z-10">
            <div className="font-mono text-teal-bright text-xs tracking-[.1em] uppercase">Featured · {heroContent.type}</div>
            <Link href={getRoute(heroContent.type, heroContent.slug)}>
              <h1 className="font-serif text-[40px] sm:text-[64px] font-light leading-[1.02] tracking-tight mt-3 text-paper hover:text-amber transition-colors">
                {heroContent.title.split(' ').map((w, i) => i === 0 ? <span key={i} className="text-amber font-semibold">{w} </span> : w + ' ')}
              </h1>
            </Link>
            {heroContent.synopsis && (
              <p className="text-muted text-base leading-relaxed mt-6 max-w-[560px]">{heroContent.synopsis}</p>
            )}
            <div className="flex gap-4.5 mt-9 font-mono text-xs text-muted border-y border-hairline py-3 max-w-[560px]">
              <span>TYPE <b>{heroContent.type}</b></span>
              <span>STATUS <b>{isNew(heroContent.createdAt) ? 'NEW' : 'STABLE'}</b></span>
            </div>
          </div>
        </section>
      )}

      {/* Catalog */}
      <div className="max-w-[1160px] mx-auto px-8">
        {renderRow(anime, 'Anime')}
        {renderRow(donghua, 'Donghua')}
        {renderRow(movie, 'Movie')}
        {renderRow(manga, 'Manga')}
        {renderRow(comic, 'Comic')}
        {renderRow(novel, 'Novel')}
      </div>
    </div>
  );
}
