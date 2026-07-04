import { getMediaBySlug, getEpisodeSources } from '@/lib/api';
import { VideoPlayer } from '@/components/VideoPlayer';
import { notFound } from 'next/navigation';

export default async function EpisodePage({ params }: { params: Promise<{ slug: string; episodeSlug: string }> }) {
  const { slug, episodeSlug } = await params;
  const content = await getMediaBySlug(slug);
  const sources = await getEpisodeSources(slug, episodeSlug);

  if (!content || sources.length === 0) notFound();

  return (
    <div className="max-w-[1160px] mx-auto px-8 py-8">
      <VideoPlayer slug={slug} episodes={[{ slug: episodeSlug, episodeNumber: 1, createdAt: '' }]} initialEpIndex={0} initialSources={sources} />
    </div>
  );
}
