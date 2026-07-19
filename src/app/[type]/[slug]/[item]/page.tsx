import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { getMediaBySlug, getEpisodePlayback, getEpisodes, getChapterPages, getChapters, getNovelChapter, useLocalApi } from '@/lib/api';
import * as localApiLib from '@/lib/localApi';
import { VideoPlayer } from '@/components/VideoPlayer';
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
import { notFound } from 'next/navigation';

// Public path: /{type}/{workSlug}/e{n}|c{n}
const MEDIA_TYPES = new Set(['anime', 'donghua', 'comic', 'manga', 'movie', 'novel']);
const ITEM_RE = /^[ec]\d+$/i;

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

function apiSlug(slug: string): string {
  const s = decodeURIComponent(slug);
  if (s.includes(';')) return s.includes('/') ? s.replace(/\//g, ';') : s;
  return s;
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ type: string; slug: string; item: string }>;
}) {
  const { type, slug, item } = await params;
  if (!MEDIA_TYPES.has(type)) notFound();
  if (!ITEM_RE.test(item) && !item) notFound();

  const work = decodeURIComponent(slug);
  const itemSlug = decodeURIComponent(item);
  const localKey = apiSlug(work);
  const decodeSlug = `${type}/${work}`;
  const isVideo = ['anime', 'donghua', 'movie'].includes(type);
  const isNovel = type === 'novel';
  const detailPath = `/${type}/${work}`;
  const itemPath = `${detailPath}/${itemSlug}`;

  if (isVideo) {
    const [content, episodeResult, playback] = await Promise.all([
      useLocalApi()
        ? localApiLib.getMediaBySlug(localKey)
        : getMediaBySlug(decodeSlug),
      useLocalApi()
        ? localApiLib.getEpisodes(localKey)
            .then((items) => ({ items, failed: false }))
            .catch(() => ({ items: [], failed: true }))
        : getEpisodes(decodeSlug)
            .then((items) => ({ items, failed: false }))
            .catch(() => ({ items: [], failed: true })),
      useLocalApi()
        ? getEpisodePlayback(localKey, itemSlug)
            .catch(() => ({ sources: [], mirrors: [], downloads: [] }))
        : getEpisodePlayback(decodeSlug, itemSlug)
            .catch(() => ({ sources: [], mirrors: [], downloads: [] })),
    ]);

    if (!content || playback.sources.length === 0) {
      return (
        <Container y="4rem">
          <EmptyState
            eyebrow="Not found"
            title={COPY.empty.itemUnavailable(true)}
            description={COPY.empty.notAvailableDesc('Episode')}
            href={detailPath}
            actionLabel={COPY.empty.backToDetail}
          />
        </Container>
      );
    }

    const episodeIndex = episodeResult.items.findIndex((ep) => ep.slug === itemSlug);
    const resolvedEpisodes =
      episodeIndex >= 0 ? episodeResult.items : [{ slug: itemSlug, episodeNumber: 1, createdAt: '' }];
    const current = resolvedEpisodes[Math.max(0, episodeIndex)];
    const userId = await getUserId();
    if (userId) {
      after(
        Promise.all([
          upsertProgress(userId, {
            mediaRef: decodeSlug,
            mediaType: content.type,
            itemSlug,
            itemNumber: current.episodeNumber,
            title: content.title,
          }),
          recordHistory(userId, decodeSlug, itemSlug),
        ]).catch(() => {}),
      );
    }

    return (
      <Container y="1.5rem">
        <BreadcrumbJsonLd
          crumbs={[
            { name: 'Home', path: '' },
            { name: content.type, path: `/discover/${content.type}` },
            { name: content.title, path: detailPath },
            { name: `Episode ${current.episodeNumber}`, path: itemPath },
          ]}
        />
        <VideoPlayer
          slug={decodeSlug}
          episodes={resolvedEpisodes}
          initialEpIndex={Math.max(0, episodeIndex)}
          initialPlayback={playback}
          episodeListError={episodeResult.failed}
          mediaType={content.type}
          title={content.title}
        />
        <Reveal>
          <div className="mt-10">
            <SupportCTA />
          </div>
        </Reveal>
      </Container>
    );
  }

  // Comic / manga / novel chapter
  const [pages, novel, content, chapters] = await Promise.all([
    isNovel
      ? Promise.resolve([])
      : useLocalApi()
        ? localApiLib.getChapterPages(localKey, itemSlug)
        : getChapterPages(decodeSlug, itemSlug),
    isNovel ? getNovelChapter(decodeSlug, itemSlug) : Promise.resolve(null),
    useLocalApi() ? localApiLib.getMediaBySlug(localKey) : getMediaBySlug(decodeSlug),
    useLocalApi() ? localApiLib.getChapters(localKey) : getChapters(decodeSlug),
  ]);

  if (!content) {
    return (
      <Container y="4rem">
        <EmptyState
          eyebrow="Not found"
          title={COPY.empty.itemUnavailable(false)}
          description={COPY.empty.notAvailableDesc('Chapter')}
          href={detailPath}
          actionLabel={COPY.empty.backToDetail}
        />
      </Container>
    );
  }

  const chapterIndex = chapters.findIndex((ch) => ch.slug === itemSlug);
  const current = chapterIndex >= 0 ? chapters[chapterIndex] : { slug: itemSlug, chapterNumber: 1, createdAt: '' };
  const userId = await getUserId();
  if (userId) {
    after(
      Promise.all([
        upsertProgress(userId, {
          mediaRef: decodeSlug,
          mediaType: content.type,
          itemSlug,
          itemNumber: current.chapterNumber,
          title: content.title,
        }),
        recordHistory(userId, decodeSlug, itemSlug),
      ]).catch(() => {}),
    );
  }

  if (isNovel && novel) {
    return (
      <Container y="1.5rem">
        <BreadcrumbJsonLd
          crumbs={[
            { name: 'Home', path: '' },
            { name: content.type, path: `/discover/${content.type}` },
            { name: content.title, path: detailPath },
            { name: `Chapter ${current.chapterNumber}`, path: itemPath },
          ]}
        />
        <NovelReader
          chapter={novel}
          chapters={chapters}
          currentChapterSlug={itemSlug}
          itemBasePath={detailPath}
          detailPath={detailPath}
        />
        <Reveal>
          <div className="mt-10">
            <SupportCTA />
          </div>
        </Reveal>
      </Container>
    );
  }

  if (!pages || pages.length === 0) {
    return (
      <Container y="4rem">
        <EmptyState
          eyebrow="Not found"
          title={COPY.empty.itemUnavailable(false)}
          description={COPY.empty.notAvailableDesc('Chapter')}
          href={detailPath}
          actionLabel={COPY.empty.backToDetail}
        />
      </Container>
    );
  }

  return (
    <Container y="1.5rem">
      <BreadcrumbJsonLd
        crumbs={[
          { name: 'Home', path: '' },
          { name: content.type, path: `/discover/${content.type}` },
          { name: content.title, path: detailPath },
          { name: `Chapter ${current.chapterNumber}`, path: itemPath },
        ]}
      />
      <MangaReader
        slug={decodeSlug}
        chapters={chapters}
        initialPages={pages}
        currentChapterSlug={itemSlug}
        mediaType={content.type}
        title={content.title}
      />
      <Reveal>
        <div className="mt-10">
          <SupportCTA />
        </div>
      </Reveal>
    </Container>
  );
}
