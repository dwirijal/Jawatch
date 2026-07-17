import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Badge, Strip } from '@/components/ui';
import { SafeSlotIklan } from '@/components/ads/SafeSlotIklan';
import { MediaJsonLd } from '@/components/seo/MediaJsonLd';
import { buttonClasses } from '@/components/ui/Button';
import * as localApiLib from '@/lib/localApi';
import { getMediaBySlug, getChapters, getEpisodes, getMediaRelated, decodeMediaRef, buildCanonicalPath, useLocalApi } from '@/lib/api';
import { Calendar, Star } from 'lucide-react';
import Image from '@/components/ui/RefererImage';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DetailActions } from '@/components/DetailActions';
import { Reveal } from '@/components/motion/Reveal';
import { CountUp } from '@/components/motion/CountUp';

// ISR: static CDN-cached shell (fast load + ~0 Vercel invocation). Per-user bits
// (bookmark + resume CTA) hydrate client-side via /api/user/library-state — so
// crawlers and signed-out visitors get pure static HTML.
// generateStaticParams (empty) opts this dynamic segment INTO on-demand ISR caching:
// no build-time upstream fetch, but the rendered page is cached on first visit and
// reused for `revalidate` seconds. Without it, `revalidate` alone leaves the route
// fully dynamic (rendered every request) — verified via x-nextjs-cache + timing.
export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ type: string; slug: string }> }): Promise<Metadata> {
  const { type, slug } = await params;

  // Use URL-friendly decoding explicitly
  const decodedStr = decodeURIComponent(slug).replace(/;/g, '/');
  const decodeSlug = `${type}/${decodedStr}`;
  const ref = decodeMediaRef(decodeSlug);
  // localApi expects "type;provider;upstream" semicolon format
  const localSlug = decodeURIComponent(slug).startsWith(type + ';')
    ? decodeURIComponent(slug)
    : `${type};${decodeURIComponent(slug)}`;

  const content = useLocalApi()
    ? await localApiLib.getMediaBySlug(localSlug)
    : await getMediaBySlug(decodeSlug);

  if (!content) {
    return {
      title: { absolute: 'Media tidak ditemukan | jawatch' },
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = ref ? buildCanonicalPath(ref) : `/media/${type}/${decodedStr}`;
  const title = `${content.title} | jawatch`;
  const description = content.synopsis || `Tonton dan baca ${content.title} di jawatch.`;
  const images = content.coverImage ? [{ url: content.coverImage }] : [];

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalPath,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((image) => image.url),
    },
  };
}

export default async function MediaPage({ params }: { params: Promise<{ type: string; slug: string }> }) {
  const { type, slug } = await params;
  
  // Use URL-friendly decoding explicitly
  const decodedStr = decodeURIComponent(slug).replace(/;/g, '/');
  const decodeSlug = `${type}/${decodedStr}`;
  const ref = decodeMediaRef(decodeSlug);
  // localApi expects "type;provider;upstream" semicolon format
  const localSlug = decodeURIComponent(slug).startsWith(type + ';')
    ? decodeURIComponent(slug)
    : `${type};${decodeURIComponent(slug)}`;

  if (useLocalApi()) {
    const data = await localApiLib.getMediaBySlug(localSlug);
    if (!data) {
      notFound();
    }
  }

  const content = useLocalApi()
    ? await localApiLib.getMediaBySlug(localSlug)
    : await getMediaBySlug(decodeSlug);
  if (!content) {
    notFound(); // real 404 status, not soft-200. Renders app/not-found.tsx.
  }

  const canonicalPath = ref ? buildCanonicalPath(ref) : `/media/${type}/${decodedStr}`;
  const year = content.createdAt ? new Date(content.createdAt).getUTCFullYear() : null;
  const isVideo = ['anime', 'donghua', 'movie'].includes(content.type);
  const items = isVideo
    ? await (useLocalApi() ? localApiLib.getEpisodes(localSlug) : getEpisodes(decodeSlug))
    : await (useLocalApi() ? localApiLib.getChapters(localSlug) : getChapters(decodeSlug));
  const firstItem = items[0];
  const startHref = firstItem ? `${canonicalPath}/${isVideo ? 'episodes' : 'chapters'}/${firstItem.slug}` : null;
  const related = await getMediaRelated(decodeSlug);

  const bookmarkInput = { mediaRef: decodeSlug, mediaType: content.type, title: content.title, coverImage: content.coverImage ?? null };

  return (
    <div className="min-h-screen bg-background grain">
      <MediaJsonLd media={content} canonicalPath={canonicalPath} />
      <div className="relative min-h-[520px] overflow-hidden border-b border-border bg-background">
        {content.coverImage && <Image src={content.coverImage} alt="" fill priority sizes="100vw" className="object-cover opacity-15 blur-[2px] saturate-50" />}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/85 to-void/25" />
        <div className="absolute inset-y-0 left-0 w-2/3 bg-[radial-gradient(circle_at_25%_32%,rgba(232,163,61,.16),transparent_28rem)]" />
        <div className="absolute inset-0 scanlines pointer-events-none" />

        <Container className="relative grid min-h-[520px] items-end gap-8 pb-12 pt-28 md:grid-cols-[220px_1fr] md:pb-16">
          <div className="relative aspect-[2/3] w-44 overflow-hidden rounded-page border border-amber/20 bg-card shadow-2xl shadow-amber/5 md:w-full">
            {content.coverImage && <Image src={content.coverImage} alt={content.title} fill priority sizes="220px" className="object-cover" />}
          </div>

          <div className="max-w-3xl pb-2">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-sm border border-amber/60 px-2 py-0.5 font-mono text-eyebrow uppercase text-primary">{content.type}</span>
              {content.status && <span className="rounded-sm border border-border px-2 py-0.5 font-mono text-eyebrow uppercase text-muted-foreground">{content.status}</span>}
            </div>
            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-foreground text-shadow-lg md:text-5.5xl">{content.title}</h1>
            <div className="mt-5 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-tag text-muted-foreground">
              {content.rating?.average ? <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 text-primary fill-amber" aria-hidden="true" /><CountUp value={content.rating.average} decimals={1} /></span> : null}
              {year && <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4 text-accent-bright" aria-hidden="true" />{year}</span>}
              <span>{items.length} {isVideo ? 'episodes' : 'chapters'}</span>
            </div>
            {content.synopsis && <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground line-clamp-4">{content.synopsis}</p>}
            {content.genres && content.genres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {content.genres.map((genre) => (
                  <Link
                    key={genre.slug}
                    href={`/genres/${genre.slug}`}
                    className="rounded-sm border border-border px-2 py-0.5 font-mono text-eyebrow uppercase text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}
            {content.studios && content.studios.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-eyebrow uppercase text-muted-foreground/70">Studio</span>
                {content.studios.map((studio) => (
                  <Link
                    key={studio.slug}
                    href={`/studios/${studio.slug}`}
                    className="rounded-sm border border-border px-2 py-0.5 font-mono text-eyebrow uppercase text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {studio.name}
                  </Link>
                ))}
              </div>
            )}
            <DetailActions
              mediaRef={decodeSlug}
              isVideo={isVideo}
              startHref={startHref}
              itemBasePath={`${canonicalPath}/${isVideo ? 'episodes' : 'chapters'}`}
              bookmarkInput={bookmarkInput}
            />
          </div>
        </Container>
      </div>

      <Container y="4rem">
        <section className="max-w-3xl">
          <Reveal>
            <div className="mb-6 border-l-2 border-amber pl-4">
              <h2 className="font-serif text-xl font-bold text-foreground">{isVideo ? 'Episodes' : 'Chapters'}</h2>
            </div>
            <Strip items={items.map((item, index) => ({
               number: `${isVideo ? 'EP' : 'CH'} ${'episodeNumber' in item ? item.episodeNumber : item.chapterNumber || index + 1}`,
               name: item.title || 'Untitled',
               href: `${canonicalPath}/${isVideo ? 'episodes' : 'chapters'}/${item.slug}`,
            }))} />
          </Reveal>

        {/* Non-intrusive ad slot: between content and recommendations, never mid-content */}
        <SafeSlotIklan slot="detail-related" format="horizontal" />

        <Reveal>
        <section className="mt-16">
          <div className="mb-6 border-l-2 border-amber pl-4">
            <h2 className="font-serif text-xl font-bold text-foreground">Related</h2>
          </div>
          {related.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.slice(0, 8).map((item) => {
                  const ref = decodeMediaRef(item.slug);
                  if (!ref) return null;
                  const path = buildCanonicalPath(ref);
                  return (
                    <Link key={item.slug} href={path} className="group block rounded-page border border-border bg-card/40 p-3 transition-all duration-base hover:border-amber/40 motion-safe:hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                      <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-background">
                        {item.coverImage ? <Image src={item.coverImage} alt={item.title} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" /> : null}
                      </div>
                      <div className="mt-3">
                        <div className="font-serif text-sm text-foreground line-clamp-2 transition-colors group-hover:text-primary">{item.title}</div>
                        <div className="mt-1 text-tag uppercase text-muted-foreground">{item.type}</div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          ) : (
            <div className="rounded-page border border-border bg-card/30 p-6 text-sm text-muted-foreground">No related items.</div>
          )}
        </section>
        </Reveal>
        </section>
      </Container>
    </div>
  );
}
