import type { Metadata } from 'next';
import { getMediaBySlug, getChapterPages, getChapters, getNovelChapter, useLocalApi } from '@/lib/api';
import * as localApiLib from '@/lib/localApi';
import { MangaReader } from '@/components/MangaReader';
import { NovelReader } from '@/components/NovelReader';
import { EmptyState } from '@/components/sections/EmptyState';
import { SupportCTA } from '@/components/sections/SupportCTA';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { after } from 'next/server';
import { getUserId } from '@/lib/session';
import { upsertProgress, recordHistory } from '@/lib/library';
import { COPY } from '@/lib/copy';
import { Reveal } from '@/components/motion/Reveal';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function ChapterPage({ params }: { params: Promise<{ type: string; slug: string; chapterSlug: string }> }) {
  const { type, slug, chapterSlug } = await params;
  const decodedStr = decodeURIComponent(slug).replace(/;/g, '/');
  const decodeSlug = `${type}/${decodedStr}`;
  // localApi expects "type;provider;upstream" semicolon format.
  // URL path: /media/[type]/[slug] → slug param = "provider;upstream", type is separate.
  // Always reconstruct as "type;decoded(slug)".
  const localSlug = `${type};${decodeURIComponent(slug)}`;
  const isNovel = type === 'novel';
  const [pages, novel, content, chapters] = await Promise.all([
    isNovel ? Promise.resolve([]) : (useLocalApi() ? localApiLib.getChapterPages(localSlug, chapterSlug) : getChapterPages(decodeSlug, chapterSlug)),
    isNovel ? getNovelChapter(decodeSlug, chapterSlug) : Promise.resolve(null),
    useLocalApi() ? localApiLib.getMediaBySlug(localSlug) : getMediaBySlug(decodeSlug),
    useLocalApi() ? localApiLib.getChapters(localSlug) : getChapters(decodeSlug),
  ]);

  const hasContent = isNovel ? (novel?.paragraphs.length ?? 0) > 0 : pages.length > 0;
  if (!content || !hasContent) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <EmptyState
          eyebrow="Not found"
          title={COPY.empty.itemUnavailable(false)}
          description={COPY.empty.notAvailableDesc('Chapter')}
          href={`/${type}/${slug}`}
          actionLabel={COPY.empty.backToDetail}
        />
      </div>
    );
  }

  // Record resume point + history via after(): runs post-response so DB latency never
  // blocks reading, and Vercel keeps the instance alive until it settles.
  const current = chapters.find((c) => c.slug === chapterSlug);
  const userId = await getUserId();
  if (userId) {
    after(Promise.all([
      upsertProgress(userId, { mediaRef: decodeSlug, mediaType: content.type, itemSlug: chapterSlug, itemNumber: current?.chapterNumber ?? 1, title: content.title }),
      recordHistory(userId, decodeSlug, chapterSlug),
    ]).catch(() => {}));
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <BreadcrumbJsonLd crumbs={[
        { name: 'Home', path: '' },
        { name: content.type, path: `/discover/${content.type}` },
        { name: content.title, path: `/${type}/${slug}` },
        { name: `Chapter ${current?.chapterNumber ?? 1}`, path: `/${type}/${slug}/chapters/${chapterSlug}` },
      ]} />
      {isNovel && novel ? (
        <NovelReader chapter={novel} chapters={chapters} currentChapterSlug={chapterSlug} itemBasePath={`/media/${type}/${slug}/chapters`} detailPath={`/media/${type}/${slug}`} />
      ) : (
        <MangaReader slug={decodeSlug} chapters={chapters} initialPages={pages} currentChapterSlug={chapterSlug} mediaType={content.type} title={content.title} />
      )}
      <Reveal><div className="mt-10"><SupportCTA /></div></Reveal>
    </div>
  );
}
