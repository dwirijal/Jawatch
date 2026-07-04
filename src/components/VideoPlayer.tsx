'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Episode, EpisodeSource } from '@/lib/api';

interface Props {
  slug: string;
  episodes: Episode[];
  initialEpIndex: number;
  initialSources: EpisodeSource[];
}

export function VideoPlayer({ slug, episodes, initialEpIndex, initialSources }: Props) {
  const [epIndex, setEpIndex] = useState(initialEpIndex);
  const [sources, setSources] = useState(initialSources);
  const [loading, setLoading] = useState(false);

  const videoUrl = sources[0]?.url;
  const currentEp = episodes[epIndex];

  const switchEpisode = useCallback(async (idx: number) => {
    if (idx === epIndex) return;
    setLoading(true);
    const ep = episodes[idx];
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/media/${slug}/episodes/${ep.slug}/sources`);
      const json = await res.json();
      const newSources = Array.isArray(json.data) ? json.data : (json.data ? [json.data] : []);
      setSources(newSources);
      setEpIndex(idx);
    } catch {
      // keep old sources on failure
    } finally {
      setLoading(false);
    }
  }, [epIndex, episodes, slug]);

  useEffect(() => {
    if (epIndex < episodes.length - 1) {
      const nextEp = episodes[epIndex + 1];
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/media/${slug}/episodes/${nextEp.slug}/sources`)
        .catch(() => {});
    }
  }, [epIndex, episodes, slug]);

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
        <p className="text-[rgb(var(--color-fg-muted))] text-sm">Stream belum tersedia untuk episode ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="w-10 h-10 border-2 border-[rgb(var(--color-accent))] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <iframe
          src={videoUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
        />
      </div>

      {/* Episode selector */}
      {episodes.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[rgb(var(--color-fg-secondary))]">
              Episode {currentEp?.episodeNumber || epIndex + 1}
            </h3>
            <span className="text-xs text-[rgb(var(--color-fg-muted))]">{episodes.length} episodes</span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {episodes.map((ep, i) => (
              <button
                key={`${ep.slug}-${i}`}
                onClick={() => switchEpisode(i)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                  i === epIndex
                    ? 'bg-[rgb(var(--color-accent))] text-[rgb(var(--color-fg-primary))]'
                    : 'bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-fg-secondary))] hover:bg-[rgb(var(--color-bg-elevated))]'
                }`}
              >
                {ep.episodeNumber || i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
