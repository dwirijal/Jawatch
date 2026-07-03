import { getMediaBySlug, getEpisodes, getEpisodeSources } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export const dynamicParams = true;

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  const content = await getMediaBySlug(slug);

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 rounded-full bg-[rgb(var(--color-bg-secondary))] flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-[rgb(var(--color-fg-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[rgb(var(--color-fg-primary))] mb-2">Content Not Found</h1>
        <p className="text-[rgb(var(--color-fg-secondary))] mb-8 max-w-md">
          We couldn&apos;t find the content you&apos;re looking for. It may have been removed or doesn&apos;t exist yet.
        </p>
        <Link href="/" className="px-6 py-3 bg-[rgb(var(--color-accent))] text-[rgb(var(--color-fg-primary))] rounded-lg font-semibold hover:bg-[rgb(var(--color-accent-hover))] transition-colors">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const episodes = await getEpisodes(slug);
  const firstEp = episodes[0];
  const sources = firstEp ? await getEpisodeSources(slug, firstEp.slug) : [];
  const videoUrl = sources[0]?.url;

  return (
    <div className="min-h-screen">
      {/* Cinematic Header */}
      <div className="relative bg-gradient-to-b from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-primary))]">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-8">
          <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-fg-muted))] mb-6">
            <Link href="/" className="hover:text-[rgb(var(--color-fg-primary))] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/" className="hover:text-[rgb(var(--color-fg-primary))] transition-colors">Watch</Link>
            <span>/</span>
            <span className="text-[rgb(var(--color-fg-primary))]">{content.title}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {content.coverImage && (
              <div className="flex-shrink-0">
                <div className="relative w-48 md:w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                  <Image src={content.coverImage} alt={content.title} fill className="object-cover" />
                </div>
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 heading-display text-[rgb(var(--color-fg-primary))]">
                {content.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-[rgb(var(--color-accent))] text-[rgb(var(--color-fg-primary))] text-xs font-bold uppercase tracking-wider rounded">
                  {content.type}
                </span>
                {content.status && (
                  <span className="px-3 py-1 bg-[rgb(var(--color-fg-primary))]/10 text-[rgb(var(--color-fg-primary))] text-xs font-semibold uppercase tracking-wider rounded">
                    {content.status}
                  </span>
                )}
                {content.rating?.average ? (
                  <span className="flex items-center gap-1 text-[rgb(var(--color-fg-secondary))]">
                    <svg className="w-5 h-5 text-[rgb(var(--color-accent))]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {content.rating.average.toFixed(1)}
                  </span>
                ) : null}
                <span className="text-[rgb(var(--color-fg-secondary))] text-sm">
                  {new Date(content.createdAt).getFullYear()}
                </span>
              </div>

              {content.genres && content.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {content.genres.map(g => (
                    <span key={g.slug} className="px-3 py-1 bg-[rgb(var(--color-fg-primary))]/5 text-[rgb(var(--color-fg-secondary))] text-xs rounded-full">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {content.synopsis && (
                <p className="text-[rgb(var(--color-fg-secondary))] text-base leading-relaxed mb-8 max-w-2xl">
                  {content.synopsis}
                </p>
              )}

              {videoUrl && (
                <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-[rgb(var(--color-fg-primary))] text-[rgb(var(--color-bg-primary))] font-bold rounded-lg hover:bg-[rgb(var(--color-bg-elevated))] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Watch Episode 1
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      {videoUrl && (
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 mb-8">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {videoUrl.endsWith('.m3u8') ? (
              <iframe src={videoUrl} className="w-full h-full" allowFullScreen />
            ) : (
              <video src={videoUrl} controls className="w-full h-full" />
            )}
          </div>
        </div>
      )}

      {/* Episode List */}
      {episodes.length > 0 && (
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 pb-16">
          <h2 className="text-2xl font-bold text-[rgb(var(--color-fg-primary))] mb-6">Episodes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {episodes.map((ep, i) => (
              <div key={`${ep.slug}-${i}`} className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg hover:bg-[rgb(var(--color-bg-elevated))] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center bg-[rgb(var(--color-accent))] rounded-lg text-[rgb(var(--color-fg-primary))] font-bold">
                    {ep.episodeNumber || i + 1}
                  </div>
                  <div>
                    <h3 className="text-[rgb(var(--color-fg-primary))] font-semibold">Episode {ep.episodeNumber || i + 1}</h3>
                    <p className="text-[rgb(var(--color-fg-muted))] text-xs">
                      {new Date(ep.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
