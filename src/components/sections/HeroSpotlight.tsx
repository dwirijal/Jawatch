import { BookOpen, Info, Play, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { buttonClasses } from '@/components/ui/Button';
import type { Media } from '@/lib/api';

const readableTypes = new Set(['manga', 'comic', 'novel']);

type HeroSpotlightProps = {
  item?: Media;
};

export function HeroSpotlight({ item }: HeroSpotlightProps) {
  if (!item) return null;

  const isReadable = readableTypes.has(item.type);
  const primaryHref = `/media/${item.slug}`;
  const genres = item.genres?.slice(0, 3).map((genre) => genre.name).join(' · ');

  return (
    <section className="relative min-h-[82vh] overflow-hidden border-b border-border bg-background grain">
      {item.coverImage && (
        <Image src={item.coverImage} alt="" fill className="object-cover opacity-20 blur-[2px] saturate-50" priority unoptimized referrerPolicy="no-referrer" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/90 to-void/30" />
      <div className="absolute inset-y-0 left-0 w-2/3 bg-[radial-gradient(circle_at_26%_34%,rgba(232,163,61,.18),transparent_32rem)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent" />
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <div className="relative z-10 mx-auto grid min-h-[82vh] w-full max-w-[1160px] items-end gap-10 px-4 pb-16 pt-28 sm:px-8 md:grid-cols-[minmax(0,1fr)_300px] md:pb-24">
        <div className="max-w-3xl">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="rounded-sm border border-amber/60 px-2 py-1 font-mono text-[10px] uppercase tracking-[.14em] text-primary">{item.type}</span>
            {item.rating?.average ? (
              <span className="inline-flex items-center gap-1 font-mono text-xs text-primary">
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                {item.rating.average.toFixed(1)}
              </span>
            ) : null}
            <span className="font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground">Now on the shelf</span>
          </div>

          <h1 className="max-w-4xl font-serif text-5xl font-semibold leading-none tracking-tight text-foreground text-shadow-lg sm:text-7xl">{item.title}</h1>
          {genres && <p className="mt-5 font-mono text-xs uppercase tracking-[.08em] text-muted-foreground">{genres}</p>}
          {item.synopsis && <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground line-clamp-3">{item.synopsis}</p>}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={primaryHref} className="inline-flex items-center gap-2 rounded-[4px] bg-primary px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[.08em] text-void transition-colors hover:bg-primary/90">
              {isReadable ? <BookOpen className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4 fill-void" aria-hidden="true" />}
              Start watching
            </Link>
            <Link href={primaryHref} className="inline-flex items-center gap-2 border border-border bg-card/75 px-[26px] py-[13px] font-mono text-xs uppercase tracking-[.06em] text-foreground transition-colors hover:border-amber/60 hover:text-primary">
              <Info className="h-4 w-4" aria-hidden="true" />
              Details
            </Link>
          </div>
        </div>

        {item.coverImage && (
          <div className="relative hidden aspect-[2/3] overflow-hidden rounded-[4px] border border-amber/20 bg-card shadow-2xl shadow-amber/5 md:block">
            <Image src={item.coverImage} alt="" fill sizes="300px" className="object-cover" priority unoptimized referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-void/40 to-transparent" />
          </div>
        )}
      </div>
    </section>
  );
}
