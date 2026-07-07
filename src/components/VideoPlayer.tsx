'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Episode, EpisodeSource } from '@/lib/api';
import { getEpisodeSourcesClient } from '@/lib/client-media';

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
  const [activeSource, setActiveSource] = useState(0);

  const videoUrl = sources[activeSource]?.url;
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
      const newSources = await getEpisodeSourcesClient(slug, ep.slug);
      if (newSources.length === 0) throw new Error('No episode sources');
      setSources(newSources);
      setActiveSource(0);
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
    getEpisodeSourcesClient(slug, next.slug).catch(() => {});
  }, [epIndex, episodes, slug]);

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-void rounded-none border border-hairline flex items-center justify-center grain">
        <p className="text-muted text-sm font-mono uppercase tracking-wider">Stream belum tersedia untuk episode ini.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6" aria-label="Watch room">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-none bg-void shadow-2xl ring-1 ring-hairline">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-void/80 backdrop-blur-sm">
                <div className="h-10 w-10 rounded-none border-2 border-amber border-t-transparent animate-spin" />
              </div>
            )}
            <iframe
              key={activeSource}
              title={currentTitle}
              src={videoUrl}
              className="h-full w-full"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-mono" role="alert">{error}</p>
          )}

          {sources.length > 1 && (
            <div className="flex flex-wrap items-center gap-2" aria-label="Server & quality">
              <span className="font-mono text-[9px] uppercase tracking-[.18em] text-teal-bright">Server</span>
              {sources.map((s, i) => (
                <button
                  key={s.url}
                  type="button"
                  onClick={() => setActiveSource(i)}
                  aria-pressed={i === activeSource}
                  className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.08em] transition-colors rounded-none ${i === activeSource ? 'border-amber bg-amber text-void' : 'border-hairline text-muted hover:border-paper hover:text-paper'}`}
                >
                  {s.label || s.quality || `S${i + 1}`}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 border border-hairline bg-surface/30 p-5 sm:flex-row sm:items-center sm:justify-between grain">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[.18em] text-teal-bright">Now playing</p>
              <h1 className="mt-1.5 font-serif text-2xl font-bold text-paper">Episode {currentNumber}</h1>
              <p className="mt-1 text-xs text-muted">{currentTitle}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => switchEpisode(Math.max(0, epIndex - 1))}
                disabled={epIndex === 0 || loading}
                aria-label="Previous episode"
                className="border border-hairline px-4 py-2 font-mono text-[10px] uppercase tracking-[.08em] text-paper transition-colors hover:border-amber/60 hover:text-amber disabled:cursor-not-allowed disabled:opacity-30 rounded-none"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => switchEpisode(Math.min(episodes.length - 1, epIndex + 1))}
                disabled={!nextEp || loading}
                aria-label="Next episode"
                className="border border-amber px-4 py-2 font-mono text-[10px] uppercase tracking-[.08em] text-amber transition-colors hover:bg-amber hover:text-void disabled:cursor-not-allowed disabled:opacity-30 rounded-none"
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
