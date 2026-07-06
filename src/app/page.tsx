import { getMedia } from '@/lib/api';
import { Card } from '@/components/ui';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 300;

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

  // ── Hero ──────────────────────────────────────
  const Hero = () => {
    if (!heroContent) return null;
    const genres = heroContent.genres?.map((g: { name: string }) => g.name).join(' · ') || '';
    const rating = heroContent.rating?.average;

    return (
      <section className="relative overflow-hidden min-h-[70vh] sm:min-h-[85vh] flex items-end">
        {/* Parallax poster backdrop */}
        <div className="absolute inset-0 hero-parallax">
          {heroContent.coverImage && (
            <Image
              src={heroContent.coverImage}
              alt={heroContent.title}
              fill
              className="object-cover opacity-30"
              unoptimized
              referrerPolicy="no-referrer"
              priority
            />
          )}
        </div>

        {/* Cinematic gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/85 to-void/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-void/70 via-transparent to-void/70" />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-void/50" />

        {/* Scanlines */}
        <div className="absolute inset-0 scanlines pointer-events-none" />

        {/* Vignette */}
        <div className="absolute inset-0" style={{
          boxShadow: 'inset 0 0 200px 80px rgba(0,0,0,0.7)',
        }} />

        {/* Content */}
        <div className="relative z-10 w-full max-w-[1160px] mx-auto px-4 sm:px-8 pb-12 sm:pb-20">
          <div className="max-w-[640px]">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[10px] tracking-[.15em] uppercase text-teal-bright border border-teal/30 rounded-[3px] px-2 py-0.5">
                {heroContent.type}
              </span>
              {rating && rating > 0 && (
                <span className="font-mono text-[11px] text-amber flex items-center gap-1">
                  ★ {rating.toFixed(1)}
                </span>
              )}
              <span className="font-mono text-[10px] tracking-[.1em] uppercase text-muted/60">
                Featured
              </span>
            </div>

            <Link href={`/media/${heroContent.slug}`} className="group">
              <h1 className="font-serif text-[36px] sm:text-[56px] font-light leading-[1.04] tracking-tight text-paper group-hover:text-amber transition-colors text-shadow-lg">
                {heroContent.title}
              </h1>
              {heroContent.alternativeTitles?.[0] && (
                <p className="font-mono text-[11px] text-muted/60 mt-2 tracking-wide">
                  {heroContent.alternativeTitles[0]}
                </p>
              )}
            </Link>

            {genres && (
              <p className="font-mono text-[11px] tracking-[.06em] text-muted mt-4 uppercase">
                {genres}
              </p>
            )}

            {heroContent.synopsis && (
              <p className="text-[14px] text-muted/80 mt-4 leading-relaxed line-clamp-3 max-w-[480px]">
                {heroContent.synopsis}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <Link
                href={`/media/${heroContent.slug}`}
                className="font-mono text-[11px] tracking-[.08em] uppercase bg-amber text-void px-5 py-2.5 rounded-[4px] hover:bg-amber/90 transition-colors font-semibold"
              >
                {heroContent.type === 'manga' || heroContent.type === 'comic' || heroContent.type === 'novel' ? 'Start Reading' : 'Watch Now'}
              </Link>
              <Link
                href={`/media/${heroContent.slug}`}
                className="font-mono text-[11px] tracking-[.08em] uppercase border border-hairline text-paper px-5 py-2.5 rounded-[4px] hover:border-amber/50 hover:text-amber transition-all"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // ── Marquee ──────────────────────────────────
  const MarqueeSection = () => {
    const trending = contents.slice(0, 20);
    if (trending.length === 0) return null;

    return (
      <section className="border-b border-hairline bg-surface/30 py-6 overflow-hidden">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-8 mb-4">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[.15em] uppercase text-teal-bright">
            <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
            Trending Now
          </div>
        </div>
        <div className="flex gap-2 animate-marquee">
          {trending.map((item, i) => (
            <Link
              key={`${item.slug}-${i}`}
              href={`/media/${item.slug}`}
              className="shrink-0 flex items-center gap-3 bg-surface border border-hairline rounded-[4px] px-4 py-2.5 hover:border-amber/30 hover:bg-surface/2 transition-all group min-w-[260px]"
            >
              <span className="font-mono text-[10px] text-amber/40 tabular-nums w-5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-serif text-[13px] text-paper group-hover:text-amber transition-colors truncate">
                {item.title}
              </span>
              <span className="font-mono text-[9px] tracking-[.08em] uppercase text-muted/50 ml-auto shrink-0">
                {item.type}
              </span>
            </Link>
          ))}
          {/* Duplicate for seamless loop */}
          {trending.map((item, i) => (
            <Link
              key={`${item.slug}-dup-${i}`}
              href={`/media/${item.slug}`}
              className="shrink-0 flex items-center gap-3 bg-surface border border-hairline rounded-[4px] px-4 py-2.5 hover:border-amber/30 hover:bg-surface/2 transition-all group min-w-[260px]"
            >
              <span className="font-mono text-[10px] text-amber/40 tabular-nums w-5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-serif text-[13px] text-paper group-hover:text-amber transition-colors truncate">
                {item.title}
              </span>
              <span className="font-mono text-[9px] tracking-[.08em] uppercase text-muted/50 ml-auto shrink-0">
                {item.type}
              </span>
            </Link>
          ))}
        </div>
      </section>
    );
  };

  // ── Section Row ──────────────────────────────
  const renderRow = (items: typeof contents, label: string) => {
    if (items.length === 0) return null;
    return (
      <section className="py-14">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-serif font-semibold tracking-tight">{label}</h2>
            <Link
              href={`/discover/${label.toLowerCase()}`}
              className="font-mono text-[11px] tracking-[.06em] uppercase text-teal-bright hover:text-amber transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {items.slice(0, 15).map(item => (
              <Card
                key={item.slug}
                href={`/media/${item.slug}`}
                kind={item.type}
                title={item.title}
                rating={item.rating?.average}
                coverImage={item.coverImage}
                isNew={isNew(item.createdAt)}
              />
            ))}
          </div>
        </div>
      </section>
    );
  };

  // ── Render ───────────────────────────────────
  return (
    <>
      <Hero />
      <MarqueeSection />
      <div className="max-w-[1160px] mx-auto">
        {renderRow(anime, 'Anime')}
        {renderRow(donghua, 'Donghua')}
        {renderRow(manga, 'Manga')}
        {renderRow(movie, 'Movies')}
        {renderRow(comic, 'Comics')}
        {renderRow(novel, 'Novels')}
      </div>

      {/* Browse all CTA */}
      <section className="py-20 text-center border-t border-hairline mt-8">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-light mb-4">Explore the catalog</h2>
          <p className="font-mono text-[12px] text-muted mb-8 max-w-[400px] mx-auto">
            Thousands of titles across anime, manga, donghua, movies, and more.
          </p>
          <Link
            href="/discover"
            className="inline-block font-mono text-[12px] tracking-[.08em] uppercase bg-amber text-void px-6 py-3 rounded-[4px] hover:bg-amber/90 transition-colors font-semibold"
          >
            Browse All
          </Link>
        </div>
      </section>
    </>
  );
}