import type { Metadata } from 'next';
import { getMediaBySlug, getEpisodeSources, getEpisodes } from '@/lib/api';
import { VideoPlayer } from '@/components/VideoPlayer';
import { EmptyState } from '@/components/sections/EmptyState';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function EpisodePage({ params }: { params: Promise<{ type: string; slug: string; episodeSlug: string }> }) {
  const { type, slug, episodeSlug } = await params;
  const decodeSlug = `${type}/${slug}`;
  const [content, episodeResult, sources] = await Promise.all([
    getMediaBySlug(decodeSlug),
    getEpisodes(decodeSlug)
      .then((items) => ({ items, failed: false }))
      .catch(() => ({ items: [], failed: true })),
    getEpisodeSources(decodeSlug, episodeSlug).catch(() => []),
  ]);

  if (!content || sources.length === 0) {
    return (
      <div className="mx-auto max-w-[1160px] px-4 py-16 sm:px-8">
        <EmptyState
          eyebrow="Not found"
          title="Episode tidak tersedia"
          description="Episode yang kamu cari mungkin sudah dipindah atau tidak tersedia."
          href={`/${type}/${slug}`}
          actionLabel="Kembali ke detail"
        />
      </div>
    );
  }

  const episodeIndex = episodeResult.items.findIndex((ep) => ep.slug === episodeSlug);
  const resolvedEpisodes = episodeIndex >= 0 ? episodeResult.items : [{ slug: episodeSlug, episodeNumber: 1, createdAt: '' }];

  return (
    <div className="mx-auto max-w-[1160px] px-4 py-6 sm:px-8">
      <VideoPlayer slug={decodeSlug} episodes={resolvedEpisodes} initialEpIndex={Math.max(0, episodeIndex)} initialSources={sources} episodeListError={episodeResult.failed} />
    </div>
  );
}
