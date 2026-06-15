import { getFullContent } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const response = await getFullContent(id);
  const fullContent = response.data;

  // Handle content not found
  if (!fullContent || !fullContent.id) {
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
        <Link
          href="/"
          className="px-6 py-3 bg-[rgb(var(--color-accent))] text-[rgb(var(--color-fg-primary))] rounded-lg font-semibold hover:bg-[rgb(var(--color-accent-hover))] transition-colors"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  const content = fullContent;
  const streams = fullContent.streams || [];
  const downloads = fullContent.downloads || [];

  // Group streams by episode
  const byEpisode = new Map<number, typeof streams>();
  for (const s of streams) {
    const list = byEpisode.get(s.episode) || [];
    list.push(s);
    byEpisode.set(s.episode, list);
  }

  const episodes = Array.from(byEpisode.entries()).sort(([a], [b]) => a - b);
  const currentEpisode = episodes[0]?.[0] || 1;
  const currentStreams = byEpisode.get(currentEpisode) || [];

  return (
    <div className="min-h-screen">
      {/* Cinematic Header */}
      <div className="relative bg-gradient-to-b from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-primary))]">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-fg-muted))] mb-6">
            <Link href="/" className="hover:text-[rgb(var(--color-fg-primary))] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/watch" className="hover:text-[rgb(var(--color-fg-primary))] transition-colors">
              Anime
            </Link>
            <span>/</span>
            <span className="text-[rgb(var(--color-fg-primary))]">{content.title}</span>
          </div>

          {/* Title and Meta */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Cover */}
            {content.cover_url && (
              <div className="flex-shrink-0">
                <div className="relative w-48 md:w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={content.cover_url}
                    alt={content.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 heading-display text-[rgb(var(--color-fg-primary))]">
                {content.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-[rgb(var(--color-accent))] text-[rgb(var(--color-fg-primary))] text-xs font-bold uppercase tracking-wider rounded">
                  {content.content_type}
                </span>
                {episodes.length > 0 && (
                  <span className="text-[rgb(var(--color-fg-muted))] text-sm">
                    {episodes.length} Episode{episodes.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {content.description && (
                <p className="text-[rgb(var(--color-fg-secondary))] text-lg leading-relaxed mb-6 line-clamp-4">
                  {content.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-8">
        {episodes.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player / Stream Section */}
            <div className="lg:col-span-2">
              <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl overflow-hidden shadow-2xl mb-8">
                {/* Episode Selector */}
                <div className="bg-[rgb(var(--color-bg-elevated))] px-6 py-4 border-b border-[rgba(var(--color-fg-primary),0.1)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[rgb(var(--color-fg-primary))]">
                      Episode {currentEpisode}
                    </h3>
                    <div className="flex gap-1">
                      {episodes.map(([ep]) => (
                        <a
                          key={ep}
                          href={`#episode-${ep}`}
                          className={`px-3 py-1.5 text-sm font-semibold rounded transition-colors ${
                            ep === currentEpisode
                              ? 'bg-[rgb(var(--color-accent))] text-[rgb(var(--color-fg-primary))]'
                              : 'bg-gray-700 text-[rgb(var(--color-fg-secondary))] hover:bg-[rgb(var(--color-bg-elevated))]'
                          }`}
                        >
                          {ep}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stream Links */}
                <div className="p-6">
                  <div className="space-y-3">
                    {currentStreams.map((stream, index) => (
                      <a
                        key={stream.id}
                        href={stream.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                          index === 0
                            ? 'bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent-hover))] text-[rgb(var(--color-fg-primary))]'
                            : 'bg-[rgb(var(--color-bg-elevated))] hover:bg-[rgb(var(--color-bg-elevated))] text-[rgb(var(--color-fg-primary))]'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <svg
                            className="w-8 h-8"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                          <div>
                            <p className="font-semibold">
                              {stream.quality || 'Stream'}
                            </p>
                            <p className="text-xs opacity-60">
                              Click to open in new tab
                            </p>
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Downloads Section */}
              {downloads.length > 0 && (
                <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl overflow-hidden shadow-2xl">
                  <div className="bg-[rgb(var(--color-bg-elevated))] px-6 py-4 border-b border-[rgba(var(--color-fg-primary),0.1)]">
                    <h3 className="text-xl font-bold text-[rgb(var(--color-fg-primary))] flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Downloads
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {downloads.map((d) => (
                        <a
                          key={d.id}
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-[rgb(var(--color-bg-elevated))] rounded-lg hover:bg-[rgb(var(--color-bg-elevated))] transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <svg className="w-6 h-6 text-[rgb(var(--color-fg-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <p className="font-semibold text-[rgb(var(--color-fg-primary))]">
                                Episode {d.episode}
                              </p>
                              <p className="text-sm text-[rgb(var(--color-fg-muted))]">{d.label || 'Download Link'}</p>
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-[rgb(var(--color-fg-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Episode Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl overflow-hidden shadow-2xl sticky top-24">
                <div className="bg-[rgb(var(--color-bg-elevated))] px-6 py-4 border-b border-[rgba(var(--color-fg-primary),0.1)]">
                  <h3 className="text-xl font-bold text-[rgb(var(--color-fg-primary))]">All Episodes</h3>
                </div>
                <div className="max-h-[500px] overflow-y-auto content-row">
                  {episodes.map(([ep, strms]) => (
                    <a
                      key={ep}
                      href={`#episode-${ep}`}
                      className={`block p-4 border-b border-gray-800 hover:bg-[rgb(var(--color-bg-elevated))] transition-colors cursor-pointer ${
                        ep === currentEpisode ? 'bg-[rgb(var(--color-bg-elevated))] border-l-2 border-l-red-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-[rgb(var(--color-fg-primary))] text-sm">
                          Episode {ep}
                        </p>
                        {strms.length > 0 && (
                          <span className="text-xs text-[rgb(var(--color-accent))] font-bold">{strms.length}</span>
                        )}
                      </div>
                      <p className="text-xs text-[rgb(var(--color-fg-muted))]">
                        {strms.length} stream{strms.length !== 1 ? 's' : ''} available
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="w-24 h-24 rounded-full bg-[rgb(var(--color-bg-secondary))] flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-[rgb(var(--color-fg-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--color-fg-primary))] mb-2">No Streams Available</h2>
            <p className="text-[rgb(var(--color-fg-secondary))] text-lg mb-8 max-w-md">
              This content hasn&apos;t been fully scraped yet. Our system is working on it. Please check back later or try a different title.
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-[rgb(var(--color-accent))] text-[rgb(var(--color-fg-primary))] rounded-lg font-semibold hover:bg-[rgb(var(--color-accent-hover))] transition-colors"
            >
              Browse Other Titles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}