import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { getMediaBySlug, getEpisodePlayback, getEpisodes, useLocalApi } from '@/lib/api';
import * as localApiLib from '@/lib/localApi';
import { VideoPlayer } from '@/components/VideoPlayer';
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

export default async function EpisodePage({ params }: { params: Promise<{ type: string; slug: string; episodeSlug: string }> }) {
  const { type, slug, episodeSlug } = await params;
  // slug from URL is semicolon-encoded — decode and reconstruct full ref
  const decodedStr = decodeURIComponent(slug).replace(/;/g, '/');
  const decodeSlug = `${type}/${decodedStr}`;

  const [content, episodeResult, playback] = await Promise.all([
    useLocalApi()
      ? localApiLib.getMediaBySlug(decodeSlug)
      : getMediaBySlug(decodeSlug),
    useLocalApi()
      ? localApiLib.getEpisodes(decodeSlug)
          .then((items) => ({ items, failed: false }))
          .catch(() => ({ items: [], failed: true }))
      : getEpisodes(decodeSlug)
          .then((items) => ({ items, failed: false }))
          .catch(() => ({ items: [], failed: true })),
    useLocalApi()
      ? localApiLib.getEpisodeSources(decodeSlug, episodeSlug)
          .then((sources) => ({ sources, mirrors: [], downloads: [] }))
          .catch(() => ({ sources: [], mirrors: [], downloads: [] }))
      : getEpisodePlayback(decodeSlug, episodeSlug)
          .catch(() => ({ sources: [], mirrors: [], downloads: [] })),
  ]);

  if (!content || playback.sources.length === 0) {
    return (
      <Container y="4rem">
        <EmptyState
          eyebrow="Not found"
          title={COPY.empty.itemUnavailable(true)}
          description={COPY.empty.notAvailableDesc('Episode')}
          href={`/media/${type}/${slug}`}
          actionLabel={COPY.empty.backToDetail}
        />
      </Container>
    );
  }

  const episodeIndex = episodeResult.items.findIndex((ep) => ep.slug === episodeSlug);
  const resolvedEpisodes = episodeIndex >= 0 ? episodeResult.items : [{ slug: episodeSlug, episodeNumber: 1, createdAt: '' }];

  // Record resume point + history for signed-in users via after(): runs post-response so
  // DB latency never blocks render, and Vercel keeps the instance alive until it settles
  // (a bare void promise can be dropped when the serverless instance freezes).
  const current = resolvedEpisodes[Math.max(0, episodeIndex)];
  const userId = await getUserId();
  if (userId) {
    after(Promise.all([
      upsertProgress(userId, { mediaRef: decodeSlug, mediaType: content.type, itemSlug: episodeSlug, itemNumber: current.episodeNumber, title: content.title }),
      recordHistory(userId, decodeSlug, episodeSlug),
    ]).catch(() => {}));
  }

  return (
    <Container y="1.5rem">
      <BreadcrumbJsonLd crumbs={[
        { name: 'Home', path: '' },
        { name: content.type, path: `/discover/${content.type}` },
        { name: content.title, path: `/media/${type}/${slug}` },
        { name: `Episode ${current.episodeNumber}`, path: `/media/${type}/${slug}/episodes/${episodeSlug}` },
      ]} />
      <VideoPlayer slug={decodeSlug} episodes={resolvedEpisodes} initialEpIndex={Math.max(0, episodeIndex)} initialPlayback={playback} episodeListError={episodeResult.failed} mediaType={content.type} title={content.title} />
      <Reveal><div className="mt-10"><SupportCTA /></div></Reveal>
    </Container>
  );
}
