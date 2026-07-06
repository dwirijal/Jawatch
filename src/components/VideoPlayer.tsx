'use client';

import { useState, useCallback, useEffect } from 'react';
import { getEpisodeSources, type Episode, type EpisodeSource } from '@/lib/api';

interface Props {
  slug: string;
  episodes: Episode[];
  initialEpIndex: number;
  initialSources: EpisodeSource[];
  episodeListError?: boolean;
}

export function VideoPlayer({ slug, episodes, initialEpIndex, initialSources, episodeListError = false }: Props) {
  const [epIndex, setEpIndex] = useState(initialEpIndex);
  const [sources, setSources] = useState(initialSources);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showList, setShowList] = useState(false);

  const videoUrl = sources[0]?.url;
  const currentEp = episodes[epIndex];
  const nextEp = episodes[epIndex + 1];
  const nearbyEpisodes = episodes.slice(Math.max(0, epIndex - 3), epIndex + 4);
  const currentNumber = currentEp?.episodeNumber || epIndex + 1;
  const currentTitle = currentEp?.title || `Episode ${currentNumber}`;

  const switchEpisode = useCallback(async (idx: number) => {
    if (idx === epIndex) return;
    const ep = episodes[idx];
    if (!ep) return;

    setLoading(true);
    setError('');
    try {
      const newSources = await getEpisodeSources(slug, ep.slug);
      if (newSources.length === 0) throw new Error('No episode sources');
      setSources(newSources);
      setEpIndex(idx);
      setShowList(false);
    } catch {
      setError('Gagal memuat episode. Stream lama tetap diputar.');
    } finally {
      setLoading(false);
    }
  }, [epIndex, episodes, slug]);

  useEffect(() => {
    if (epIndex >= episodes.length - 1) return;
    const next = episodes[epIndex + 1];
    getEpisodeSources(slug, next.slug).catch(() => {});
  }, [epIndex, episodes, slug]);

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
        <p className="text-[rgb(var(--color-fg-muted))] text-sm">Stream belum tersedia untuk episode ini.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6" aria-label="Watch room">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-1 ring-hairline">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="h-10 w-10 rounded-full border-2 border-amber border-t-transparent animate-spin" />
              </div>
            )}
            <iframe
              title={currentTitle}
              src={videoUrl}
              className="h-full w-full"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400" role="alert">{error}</p>
          )}

          <div className="flex flex-col gap-3 border border-hairline bg-surface/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[.14em] text-amber">Now watching</p>
              <h1 className="mt-1 font-serif text-2xl text-paper">Episode {currentNumber}</h1>
              <p className="mt-1 text-sm text-muted">{currentTitle}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => switchEpisode(Math.max(0, epIndex - 1))}
                disabled={epIndex === 0 || loading}
                aria-label="Previous episode"
                className="border border-hairline px-4 py-2 font-mono text-xs uppercase tracking-[.08em] text-paper transition-colors hover:border-paper disabled:cursor-not-allowed disabled:opacity-35"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => switchEpisode(Math.min(episodes.length - 1, epIndex + 1))}
                disabled={!nextEp || loading}
                aria-label="Next episode"
                className="border border-amber px-4 py-2 font-mono text-xs uppercase tracking-[.08em] text-amber transition-colors hover:bg-amber hover:text-void disabled:cursor-not-allowed disabled:opacity-35"
              >
                Next →
              </button>
            </div>
          </div>

          {episodeListError && (
            <p className="text-xs text-amber" role="status">Daftar episode gagal dimuat. Episode saat ini tetap bisa diputar.</p>
          )}

          {nearbyEpisodes.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Nearby episodes">
              {nearbyEpisodes.map((ep) => {
                const idx = episodes.findIndex((item) => item.slug === ep.slug);
                const number = ep.episodeNumber || idx + 1;
                return (
                  <button
                    key={ep.slug}
                    type="button"
                    onClick={() => switchEpisode(idx)}
                    disabled={loading}
                    aria-label={`Play nearby episode ${number} ${ep.title || ''}`.trim()}
                    className={`min-w-14 border px-3 py-2 font-mono text-xs transition-colors ${idx === epIndex ? 'border-amber bg-amber text-void' : 'border-hairline text-muted hover:border-paper hover:text-paper'}`}
                  >
                    EP {number}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="space-y-3">
          {nextEp && (
            <button
              type="button"
              onClick={() => switchEpisode(epIndex + 1)}
              disabled={loading}
              className="w-full border border-hairline bg-surface p-4 text-left transition-colors hover:border-amber"
            >
              <span className="font-mono text-[10px] uppercase tracking-[.14em] text-amber">Up next</span>
              <span className="mt-2 block font-serif text-lg text-paper">Episode {nextEp.episodeNumber || epIndex + 2}</span>
              <span className="mt-1 block text-sm text-muted">{nextEp.title || 'Untitled'}</span>
            </button>
          )}

          {episodes.length > 1 && (
            <div className="border border-hairline bg-surface/70">
              <button
                type="button"
                onClick={() => setShowList(!showList)}
                aria-expanded={showList}
                aria-controls="episode-queue"
                aria-label="Open episode queue"
                className="flex w-full items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-[.08em] text-paper transition-colors hover:text-amber"
              >
                Episodes
                <span className="text-muted">{episodes.length}</span>
              </button>
              {showList && (
                <div id="episode-queue" role="region" aria-label="Episode queue" className="max-h-80 overflow-y-auto border-t border-hairline p-2">
                  {episodes.map((ep, idx) => {
                    const number = ep.episodeNumber || idx + 1;
                    return (
                      <button
                        key={ep.slug}
                        type="button"
                        onClick={() => switchEpisode(idx)}
                        disabled={loading}
                        className={`block w-full px-3 py-2 text-left transition-colors ${idx === epIndex ? 'bg-amber text-void' : 'text-muted hover:bg-void/40 hover:text-paper'}`}
                      >
                        <span className="font-mono text-xs">Episode {number}</span>
                        <span className="ml-2 text-sm">{ep.title || 'Untitled'}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
