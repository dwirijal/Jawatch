import type { Metadata } from 'next';
import { Badge, Strip } from '@/components/ui';
import { buttonClasses } from '@/components/ui/Button';
import { getMediaBySlug, getChapters, getEpisodes, getMediaRelated } from '@/lib/api';
import { BookOpen, Calendar, Play, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const content = await getMediaBySlug(slug);

  if (!content) {
    return {
      title: 'Media tidak ditemukan | jawatch',
      robots: { index: false, follow: false },
    };
  }

  const title = `${content.title} | jawatch`;
  const description = content.synopsis || `Tonton dan baca ${content.title} di jawatch.`;
  const images = content.coverImage ? [{ url: content.coverImage }] : [];

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/media/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/media/${slug}`,
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

export default async function MediaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getMediaBySlug(slug);

  if (!content) notFound();

  const year = content.createdAt ? new Date(content.createdAt).getUTCFullYear() : null;
  const isVideo = ['anime', 'donghua', 'movie'].includes(content.type);
  const items = isVideo ? await getEpisodes(slug) : await getChapters(slug);
  const firstItem = items[0];
  const startHref = firstItem ? `/media/${slug}/${isVideo ? 'episodes' : 'chapters'}/${firstItem.slug}` : null;
  const related = await getMediaRelated(slug);

  return (
    <div className="min-h-screen bg-void grain">
      <div className="relative min-h-[520px] overflow-hidden border-b border-hairline bg-void">
        {content.coverImage && <Image src={content.coverImage} alt="" fill priority sizes="100vw" className="object-cover opacity-15 blur-[2px] saturate-50" />}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/85 to-void/25" />
        <div className="absolute inset-y-0 left-0 w-2/3 bg-[radial-gradient(circle_at_25%_32%,rgba(232,163,61,.16),transparent_28rem)]" />
        <div className="absolute inset-0 scanlines pointer-events-none" />

        <div className="relative mx-auto grid min-h-[520px] max-w-[1160px] items-end gap-8 px-4 pb-12 pt-28 sm:px-8 md:grid-cols-[220px_1fr] md:pb-16">
          <div className="relative aspect-[2/3] w-44 overflow-hidden rounded-[4px] border border-amber/20 bg-surface shadow-2xl shadow-amber/5 md:w-full">
            {content.coverImage && <Image src={content.coverImage} alt={content.title} fill priority sizes="220px" className="object-cover" />}
          </div>

          <div className="max-w-3xl pb-2">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-sm border border-amber/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[.14em] text-amber">{content.type}</span>
              {content.status && <span className="rounded-sm border border-hairline px-2 py-0.5 font-mono text-[9px] uppercase tracking-[.14em] text-muted">{content.status}</span>}
            </div>
            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-paper text-shadow-lg md:text-5.5xl">{content.title}</h1>
            <div className="mt-5 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-[.08em] text-muted">
              {content.rating?.average ? <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 text-amber fill-amber" aria-hidden="true" />{content.rating.average.toFixed(1)}</span> : null}
              {year && <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4 text-teal-bright" aria-hidden="true" />{year}</span>}
              <span>{items.length} {isVideo ? 'episodes' : 'chapters'}</span>
            </div>
            {content.synopsis && <p className="mt-6 max-w-2xl text-sm leading-7 text-muted line-clamp-4">{content.synopsis}</p>}
            {startHref && (
              <Link href={startHref} className="mt-8 inline-flex items-center gap-2 rounded-[4px] bg-amber px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[.08em] text-void transition-colors hover:bg-amber/90">
                {isVideo ? <Play className="h-4 w-4 fill-void" aria-hidden="true" /> : <BookOpen className="h-4 w-4" aria-hidden="true" />}
                {isVideo ? 'Start watching' : 'Start reading'}
              </Link>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1160px] px-4 py-16 sm:px-8">
        <section className="max-w-3xl">
          <div className="mb-6 border-l-2 border-amber pl-4">
            <h2 className="font-serif text-xl font-bold text-paper">{isVideo ? 'Episodes' : 'Chapters'}</h2>
          </div>
          <Strip items={items.map((item, index) => ({
             number: `${isVideo ? 'EP' : 'CH'} ${'episodeNumber' in item ? item.episodeNumber : item.chapterNumber || index + 1}`,
             name: item.title || 'Untitled',
             href: `/media/${slug}/${isVideo ? 'episodes' : 'chapters'}/${item.slug}`,
          }))} />

        <section className="mt-16">
          <div className="mb-6 border-l-2 border-amber pl-4">
            <h2 className="font-serif text-xl font-bold text-paper">Related</h2>
          </div>
          {related.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.slice(0, 8).map((item) => (
                <a key={item.slug} href={`/media/${item.slug}`} className="group rounded-[4px] border border-hairline bg-surface/40 p-3">
                  <div className="aspect-[2/3] overflow-hidden rounded-[3px] bg-void">
                    {item.coverImage ? <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
                  </div>
                  <div className="mt-3">
                    <div className="font-serif text-sm text-paper line-clamp-2">{item.title}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[.14em] text-muted">{item.type}</div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-[4px] border border-hairline bg-surface/30 p-6 text-sm text-muted">No related items.</div>
          )}
        </section>
        </section>
      </main>
    </div>
  );
}
