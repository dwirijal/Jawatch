import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { Badge, Strip } from '@/components/ui';
import { SafeSlotIklan } from '@/components/ads/SafeSlotIklan';
import { MediaJsonLd } from '@/components/seo/MediaJsonLd';
import * as localApiLib from '@/lib/localApi';
import { getMediaBySlug, getChapters, getEpisodes, getMediaRelated, decodeMediaRef, buildCanonicalPath, useLocalApi } from '@/lib/api';
import { Calendar, Star } from 'lucide-react';
import Image from '@/components/ui/RefererImage';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DetailActions } from '@/components/DetailActions';
import { Reveal } from '@/components/motion/Reveal';
import { CountUp } from '@/components/motion/CountUp';

// Public path: /{type}/{workSlug}  (type allowlist enforced below)
const MEDIA_TYPES = new Set(['anime', 'donghua', 'comic', 'manga', 'movie', 'novel']);

export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

function assertType(type: string) {
  if (!MEDIA_TYPES.has(type)) notFound();
}

/** Local Go API accepts bare public_slug or type;public_slug. Prefer bare public. */
function apiSlug(type: string, slug: string): string {
  const s = decodeURIComponent(slug);
  // legacy semicolon path still accepted
  if (s.includes(';')) return s.includes('/') ? s.replace(/\//g, ';') : s;
  return s; // bare public_slug
}

export async function generateMetadata({ params }: { params: Promise<{ type: string; slug: string }> }): Promise<Metadata> {
  const { type, slug } = await params;
  if (!MEDIA_TYPES.has(type)) {
    return { title: { absolute: 'Not found | jawatch' }, robots: { index: false, follow: false } };
  }
  const work = decodeURIComponent(slug);
  const localKey = apiSlug(type, work);
  const decodeSlug = `${type}/${work}`;
  const content = useLocalApi()
    ? await localApiLib.getMediaBySlug(localKey)
    : await getMediaBySlug(decodeSlug);

  if (!content) {
    return {
      title: { absolute: 'Media tidak ditemukan | jawatch' },
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = `/${type}/${work}`;
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
  assertType(type);

  const work = decodeURIComponent(slug);
  const localKey = apiSlug(type, work);
  const decodeSlug = `${type}/${work}`;
  const ref = decodeMediaRef(decodeSlug);

  const content = useLocalApi()
    ? await localApiLib.getMediaBySlug(localKey)
    : await getMediaBySlug(decodeSlug);
  if (!content) notFound();

  const canonicalPath = `/${type}/${work}`;
  const year = content.createdAt ? new Date(content.createdAt).getUTCFullYear() : null;
  const isVideo = ['anime', 'donghua', 'movie'].includes(content.type);
  const items = isVideo
    ? await (useLocalApi() ? localApiLib.getEpisodes(localKey) : getEpisodes(decodeSlug))
    : await (useLocalApi() ? localApiLib.getChapters(localKey) : getChapters(decodeSlug));
  const firstItem = items[0];
  // Item path is /{type}/{work}/eN|cN — no /episodes|/chapters segment
  const startHref = firstItem ? `${canonicalPath}/${firstItem.slug}` : null;
  const related = await getMediaRelated(decodeSlug).catch(() => []);

  const bookmarkInput = {
    mediaRef: decodeSlug,
    mediaType: content.type,
    title: content.title,
    coverImage: content.coverImage ?? null,
  };

  return (
    <div className="min-h-screen bg-background grain">
      <MediaJsonLd media={content} canonicalPath={canonicalPath} />
      <div className="relative min-h-[520px] overflow-hidden border-b border-border bg-background">
        {content.coverImage && (
          <Image
            src={content.coverImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-15 blur-[2px] saturate-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/85 to-void/25" />
        <div className="absolute inset-y-0 left-0 w-2/3 bg-[radial-gradient(circle_at_25%_32%,rgba(232,163,61,.16),transparent_28rem)]" />
        <div className="absolute inset-0 scanlines pointer-events-none" />

        <Container className="relative grid min-h-[520px] items-end gap-8 pb-12 pt-28 md:grid-cols-[220px_1fr] md:pb-16">
          <div className="relative aspect-[2/3] w-44 overflow-hidden rounded-page border border-amber/20 bg-card shadow-2xl shadow-amber/5 md:w-full">
            {content.coverImage ? (
              <Image
                src={content.coverImage}
                alt={content.title}
                fill
                priority
                sizes="220px"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="max-w-3xl space-y-4 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{content.type}</Badge>
              {content.status ? <Badge variant="accent">{content.status}</Badge> : null}
              {year ? (
                <span className="inline-flex items-center gap-1 font-mono text-eyebrow uppercase text-muted-foreground">
                  <Calendar className="h-3 w-3" aria-hidden />
                  {year}
                </span>
              ) : null}
              {content.rating?.average ? (
                <span className="inline-flex items-center gap-1 font-mono text-eyebrow uppercase text-amber">
                  <Star className="h-3 w-3" aria-hidden />
                  <CountUp value={content.rating.average} decimals={1} />
                  {content.rating.count ? (
                    <span className="text-muted-foreground">({content.rating.count})</span>
                  ) : null}
                </span>
              ) : null}
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {content.title}
            </h1>
            {content.synopsis ? (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                {content.synopsis}
              </p>
            ) : null}
            {content.genres && content.genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
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
              itemBasePath={canonicalPath}
              bookmarkInput={bookmarkInput}
            />
          </div>
        </Container>
      </div>

      <Container y="4rem">
        <section className="max-w-3xl">
          <Reveal>
            <div className="mb-6 border-l-2 border-amber pl-4">
              <h2 className="font-serif text-xl font-bold text-foreground">
                {isVideo ? 'Episodes' : 'Chapters'}
              </h2>
            </div>
            <Strip
              items={items.map((item, index) => ({
                number: `${isVideo ? 'EP' : 'CH'} ${
                  'episodeNumber' in item ? item.episodeNumber : item.chapterNumber || index + 1
                }`,
                name: item.title || 'Untitled',
                href: `${canonicalPath}/${item.slug}`,
              }))}
            />
          </Reveal>
        </section>

        <SafeSlotIklan slot="detail-mid" className="my-10" />

        <section>
          <Reveal>
            <div className="mb-6 border-l-2 border-amber pl-4">
              <h2 className="font-serif text-xl font-bold text-foreground">Related</h2>
            </div>
            {related.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {related.slice(0, 8).map((item) => {
                  const r = decodeMediaRef(item.slug);
                  const path = r ? buildCanonicalPath(r) : `/${item.type || type}/${item.slug}`;
                  return (
                    <Link
                      key={item.slug}
                      href={path}
                      className="group block rounded-page border border-border bg-card/40 p-3 transition-all duration-base hover:border-amber/40 motion-safe:hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-background">
                        {item.coverImage ? (
                          <Image
                            src={item.coverImage}
                            alt={item.title}
                            fill
                            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                          />
                        ) : null}
                      </div>
                      <div className="mt-3">
                        <div className="font-serif text-sm text-foreground line-clamp-2 transition-colors group-hover:text-primary">
                          {item.title}
                        </div>
                        <div className="mt-1 text-tag uppercase text-muted-foreground">{item.type}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-page border border-border bg-card/30 p-6 text-sm text-muted-foreground">
                No related items.
              </div>
            )}
          </Reveal>
        </section>
      </Container>
    </div>
  );
}
