import type { Metadata } from 'next';
import { getMediaBySlug, getEpisodeSources, getEpisodes } from '@/lib/api';
import { VideoPlayer } from '@/components/VideoPlayer';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function EpisodePage({ params }: { params: Promise<{ slug: string; episodeSlug: string }> }) {
  const { slug, episodeSlug } = await params;
  const [content, episodeResult, sources] = await Promise.all([
    getMediaBySlug(slug),
    getEpisodes(slug)
      .then((items) => ({ items, failed: false }))
      .catch(() => ({ items: [], failed: true })),
    getEpisodeSources(slug, episodeSlug).catch(() => []),
  ]);

  if (!content || sources.length === 0) notFound();

  const episodeIndex = episodeResult.items.findIndex((ep) => ep.slug === episodeSlug);
  const resolvedEpisodes = episodeIndex >= 0 ? episodeResult.items : [{ slug: episodeSlug, episodeNumber: 1, createdAt: '' }];

  return (
    <div className="mx-auto max-w-[1160px] px-4 py-6 sm:px-8">
      <VideoPlayer slug={slug} episodes={resolvedEpisodes} initialEpIndex={Math.max(0, episodeIndex)} initialSources={sources} episodeListError={episodeResult.failed} />
    </div>
  );
}
