import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Suspense } from 'react';
import { HeroSpotlight } from '@/components/sections/HeroSpotlight';
import { ContinueRail } from '@/components/sections/ContinueRail';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { getHomeRails, getGenres } from '@/lib/api';
import { Reveal } from '@/components/motion/Reveal';
import Link from 'next/link';
import { mediaHref } from '@/lib/mediaHref';

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  let rails: Awaited<ReturnType<typeof getHomeRails>> = [];
  let genres: Awaited<ReturnType<typeof getGenres>> = [];
  try {
    [rails, genres] = await Promise.all([getHomeRails(), getGenres()]);
  } catch {
    return (
      <Container className="text-center" y="6rem">
        <h1 className="font-serif text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">Failed to load content. Please try again.</p>
        <Link href="/"> <span className="mt-6 inline-block rounded-page bg-primary px-6 py-3 font-mono text-xs font-semibold uppercase text-void cursor-pointer">Retry</span></Link>
      </Container>
    );
  }
  const contents = rails.flatMap((rail) => rail.items);

  return (
    <>
      <HeroSpotlight item={contents[0]} />

      <Suspense fallback={null}>
        <ContinueRail />
      </Suspense>

      {contents.length > 0 && (
        <section className="overflow-hidden border-b border-border bg-card/30 py-6 grain">
          <Container className="mb-4">
            <div className="flex items-center gap-2 font-mono text-eyebrow uppercase text-accent-bright">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              On the shelf now
            </div>
          </Container>
          <div className="flex gap-2 animate-marquee">
            {[...contents.slice(0, 20), ...contents.slice(0, 20)].map((item, index) => (
              <Link
                key={`${item.slug}-${index}`}
                href={mediaHref(item.slug)}
                className="group flex min-w-[260px] shrink-0 items-center gap-3 rounded-page border border-border bg-card/50 px-4 py-2.5 transition-all duration-300 hover:border-amber/40 hover:-translate-y-0.5"
              >
                <span className="w-5 font-mono text-tag tabular-nums text-primary/60">{String((index % 20) + 1).padStart(2, '0')}</span>
                <span className="truncate font-serif text-sm text-foreground transition-colors group-hover:text-primary">{item.title}</span>
                <span className="ml-auto shrink-0 font-mono text-eyebrow uppercase text-accent-bright/70">{item.type}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Container y="4rem">
        <div className="space-y-20">
          {rails.map((rail) => (
            <Reveal key={rail.title}>
              <section>
                <SectionHeader eyebrow="Shelf" title={rail.title} href={rail.href} />
                <MediaGrid items={rail.items} limit={15} />
              </section>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <section className="mt-20">
            <SectionHeader eyebrow="Browse" title="Genres" href="/genres" />
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <Link
                  key={genre.slug}
                  href={`/genres/${genre.slug}`}
                  className="rounded-pill border border-border bg-card px-4 py-2 font-mono text-micro uppercase text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:-translate-y-0.5 motion-safe:duration-base"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
        <section className="mt-24 rounded-page border border-border bg-card/40 px-6 py-16 text-center grain relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber/30 to-transparent" />
          <h2 className="font-serif text-3.5xl font-semibold text-foreground">Explore the full catalog</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Find something to watch, read, queue, or revisit.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/discover" className="inline-flex rounded-page bg-primary px-6 py-3 font-mono text-xs font-semibold uppercase tracking-tag text-void shadow-lift transition-all duration-base hover:bg-primary/90 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95">
              Browse all
            </Link>
            <Link href="/random" className="inline-flex rounded-page border border-border px-6 py-3 font-mono text-xs font-semibold uppercase tracking-tag text-foreground transition-all duration-base hover:border-primary hover:text-primary motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95" aria-label="Surprise me with a random title">
              🎲 Surprise me
            </Link>
          </div>
        </section>
        </Reveal>
      </Container>
    </>
  );
}
