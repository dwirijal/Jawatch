import type { Metadata } from 'next';
import { HeroSpotlight } from '@/components/sections/HeroSpotlight';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { getHomeRails, getGenres } from '@/lib/api';
import Link from 'next/link';

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const rails = await getHomeRails();
  const contents = rails.flatMap((rail) => rail.items);
  const genres = await getGenres();

  return (
    <>
      <HeroSpotlight item={contents[0]} />

      {contents.length > 0 && (
        <section className="overflow-hidden border-b border-border bg-card/30 py-6 grain">
          <div className="mx-auto mb-4 max-w-[1160px] px-4 sm:px-8">
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.15em] text-accent-bright">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              On the shelf now
            </div>
          </div>
          <div className="flex gap-2 animate-marquee">
            {[...contents.slice(0, 20), ...contents.slice(0, 20)].map((item, index) => (
              <Link
                key={`${item.slug}-${index}`}
                href={`/media/${item.slug}`}
                className="group flex min-w-[260px] shrink-0 items-center gap-3 rounded-page border border-border bg-card/50 px-4 py-2.5 transition-all duration-300 hover:border-amber/40 hover:-translate-y-0.5"
              >
                <span className="w-5 font-mono text-[10px] tabular-nums text-primary/60">{String((index % 20) + 1).padStart(2, '0')}</span>
                <span className="truncate font-serif text-sm text-foreground transition-colors group-hover:text-primary">{item.title}</span>
                <span className="ml-auto shrink-0 font-mono text-[9px] uppercase tracking-tag text-accent-bright/70">{item.type}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <main className="mx-auto max-w-[1160px] px-4 py-16 sm:px-8">
        <div className="space-y-20">
          {rails.map((rail) => (
            <section key={rail.title}>
              <SectionHeader eyebrow="Shelf" title={rail.title} href={rail.href} />
              <MediaGrid items={rail.items} limit={15} />
            </section>
          ))}
        </div>

        <section className="mt-20">
          <SectionHeader eyebrow="Browse" title="Genres" href="/genres" />
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Link
                key={genre.slug}
                href={`/genres/${genre.slug}`}
                className="rounded-full border border-border bg-card px-4 py-2 font-mono text-[11px] uppercase tracking-tag text-muted-foreground-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {genre.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-24 rounded-page border border-border bg-card/40 px-6 py-16 text-center grain relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber/30 to-transparent" />
          <h2 className="font-serif text-3.5xl font-semibold text-foreground">Explore the full catalog</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Find something to watch, read, queue, or revisit.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/discover" className="inline-flex rounded-page bg-primary px-6 py-3 font-mono text-xs font-semibold uppercase tracking-tag text-void transition-colors hover:bg-primary/90">
              Browse all
            </Link>
            <Link href="/random" className="inline-flex rounded-page border border-border px-6 py-3 font-mono text-xs font-semibold uppercase tracking-tag text-foreground transition-colors hover:border-primary hover:text-primary" aria-label="Surprise me with a random title">
              🎲 Surprise me
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
