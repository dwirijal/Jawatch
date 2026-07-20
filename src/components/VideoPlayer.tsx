'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Episode, EpisodeSource, EpisodeMirror, EpisodeDownload, EpisodePlayback } from '@/lib/api';
import { getEpisodePlaybackClient, resolveMirrorClient } from '@/lib/client-media';
import { groupMirrorsByProvider, groupDownloadsByResolution } from '@/lib/playback-groups';
import { recordProgressAction } from '@/app/[type]/[slug]/actions';
import { Spinner } from '@/components/ui/Spinner';
import { COPY } from '@/lib/copy';

interface Props {
  slug: string;
  episodes: Episode[];
  initialEpIndex: number;
  initialPlayback: EpisodePlayback;
  episodeListError?: boolean;
  mediaType: string;
  title?: string;
}

export function VideoPlayer({ slug, episodes, initialEpIndex, initialPlayback, episodeListError = false, mediaType, title }: Props) {
  const [epIndex, setEpIndex] = useState(initialEpIndex);
  const [sources, setSources] = useState<EpisodeSource[]>(initialPlayback.sources);
  const [mirrors, setMirrors] = useState<EpisodeMirror[]>(initialPlayback.mirrors);
  const [downloads, setDownloads] = useState<EpisodeDownload[]>(initialPlayback.downloads);
  const [loading, setLoading] = useState(false);
  const [mirrorLoading, setMirrorLoading] = useState('');
  const [error, setError] = useState('');
  const [showList, setShowList] = useState(false);
  const [activeSource, setActiveSource] = useState(0);
  const [activeMirror, setActiveMirror] = useState('');
  const [theater, setTheater] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ponytail: container ref so the Fullscreen API fullscreens our chrome + the
  // iframe together; more reliable than the embed's own (cross-embed-inconsistent) button.
  const containerRef = useRef<HTMLDivElement>(null);

  const enterFullscreen = useCallback(async () => {
    // ponytail: jsdom lacks Fullscreen/ScreenOrientation — every path feature-detects
    // so test render never throws. iOS <=17 falls back to iframe.webkitEnterFullscreen,
    // else to the CSS theater state. No dead clicks.
    const container = containerRef.current;
    if (container?.requestFullscreen) {
      try {
        await container.requestFullscreen();
        if ('orientation' in screen && typeof (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock === 'function') {
          try {
            await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape');
          } catch {
            // orientation.lock rejects on desktop/unsupported — swallow silently
          }
        }
        return;
      } catch {
        // fall through to theater fallback below
      }
    }
    const iframe = container?.querySelector('iframe');
    // non-standard iOS Safari fullscreen on the media element
    if (iframe && typeof (iframe as HTMLIFrameElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen === 'function') {
      (iframe as HTMLIFrameElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen?.();
      return;
    }
    setTheater(true);
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (typeof document.exitFullscreen === 'function') {
      try {
        await document.exitFullscreen();
      } catch {
        // already exited via system gesture
      }
    }
    if ('orientation' in screen && typeof screen.orientation?.unlock === 'function') {
      try {
        screen.orientation.unlock();
      } catch {
        // not locked — ignore
      }
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      void exitFullscreen();
    } else {
      void enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    // ponytail: webkit variant for legacy Safari; guarded so jsdom is safe.
    const webkitSync = () => {
      const el = (document as Document & { webkitFullscreenElement?: Element | null }).webkitFullscreenElement;
      setIsFullscreen(Boolean(el));
    };
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', webkitSync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', webkitSync);
    };
  }, []);

  const hasVideo = sources.length > 0;
  const videoUrl = hasVideo ? sources[activeSource]?.url : undefined;
  const currentEp = episodes[epIndex];
  const nextEp = episodes[epIndex + 1];
  const nearbyEpisodes = episodes.slice(Math.max(0, epIndex - 3), epIndex + 4);
  const currentNumber = currentEp?.episodeNumber || epIndex + 1;
  const currentTitle = currentEp?.title || `Episode ${currentNumber}`;
  const mirrorGroups = groupMirrorsByProvider(mirrors);
  const downloadGroups = groupDownloadsByResolution(downloads);

  const switchEpisode = useCallback(async (idx: number) => {
    if (idx === epIndex) return;
    const ep = episodes[idx];
    if (!ep) return;

    setLoading(true);
    setError('');
    try {
      const playback = await getEpisodePlaybackClient(slug, ep.slug);
      if (playback.sources.length === 0 && playback.downloads.length === 0) throw new Error('No episode sources');
      setSources(playback.sources);
      setMirrors(playback.mirrors);
      setDownloads(playback.downloads);
      setActiveSource(0);
      setActiveMirror('');
      setEpIndex(idx);
      setShowList(false);
      // fire-and-forget: keep resume point at the episode actually being watched
      void recordProgressAction({ mediaRef: slug, mediaType, itemSlug: ep.slug, itemNumber: ep.episodeNumber ?? idx + 1, title });
    } catch {
      setError(COPY.watch.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [epIndex, episodes, slug]);

  // Mirrors resolve lazily — one hop per click. On success, swap the iframe to the mirror URL.
  const playMirror = useCallback(async (mirror: EpisodeMirror) => {
    if (mirrorLoading) return;
    setMirrorLoading(mirror.serverId);
    setError('');
    try {
      const url = await resolveMirrorClient(slug, mirror.serverId);
      const label = mirror.quality ? `${mirror.label} ${mirror.quality}` : mirror.label;
      setSources((prev) => {
        const existing = prev.findIndex((s) => s.url === url);
        if (existing >= 0) { setActiveSource(existing); return prev; }
        setActiveSource(prev.length);
        return [...prev, { url, label, quality: mirror.quality }];
      });
      setActiveMirror(mirror.serverId);
    } catch {
      setError(COPY.watch.serverUnavailable);
    } finally {
      setMirrorLoading('');
    }
  }, [mirrorLoading, slug]);

  useEffect(() => {
    if (epIndex >= episodes.length - 1) return;
    const next = episodes[epIndex + 1];
    getEpisodePlaybackClient(slug, next.slug).catch(() => {});
  }, [epIndex, episodes, slug]);

  if (!hasVideo && downloads.length === 0) {
    return (
      <div className="aspect-video bg-background rounded-none border border-border flex items-center justify-center grain">
        <p className="font-mono text-sm text-muted-foreground">{error || COPY.empty.notAvailableDesc('Episode')}</p>
      </div>
    );
  }

  return (
    <section className="space-y-6" aria-label="Watch room">
      <div className={`grid gap-5 ${theater ? 'grid-cols-1' : 'lg:grid-cols-[minmax(0,1fr)_320px]'}`}>
        <div className="space-y-4">
          <div
            ref={containerRef}
            className={`relative aspect-video overflow-hidden rounded-card bg-background shadow-2xl ring-1 ring-hairline ${theater ? 'theater-breakout' : ''}`}
          >
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <Spinner size="lg" className="text-amber" />
              </div>
            )}
            <iframe
              key={activeSource}
              title={currentTitle}
              src={videoUrl}
              className="h-full w-full"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* ponytail: mobile-first real Fullscreen API; desktop keeps the CSS theater button below.
                min 44px tap target, lg:hidden so it never collides with theater on desktop. */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? COPY.watch.fullscreenExit : COPY.watch.fullscreenEnter}
              aria-pressed={isFullscreen}
              className="lg:hidden absolute bottom-3 right-3 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-pill border border-white/15 bg-background/70 backdrop-blur-sm text-white/70 transition-colors motion-safe:transition-colors hover:text-white hover:border-white/30 hover:bg-background/90 focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
                {isFullscreen ? (
                  <path d="M5 2L2 2L2 5M11 2L14 2L14 5M2 11L2 14L5 14M14 11L14 14L11 14" />
                ) : (
                  <path d="M2 5L2 2L5 2M14 5L14 2L11 2M5 14L2 14L2 11M11 14L14 14L14 11" />
                )}
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setTheater(!theater)}
              aria-label={theater ? 'Exit theater mode' : 'Enter theater mode'}
              aria-pressed={theater}
              className="hidden lg:flex absolute bottom-3 right-3 z-10 items-center gap-1.5 rounded-pill border border-white/15 bg-background/70 backdrop-blur-sm px-3 py-1.5 font-mono text-eyebrow uppercase text-white/70 transition-colors hover:text-white hover:border-white/30 hover:bg-background/90"
            >
              {theater ? (
                <>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
                    <path d="M5 2L2 2L2 5M11 2L14 2L14 5M2 11L2 14L5 14M14 11L14 14L11 14" />
                  </svg>
                  Exit
                </>
              ) : (
                <>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
                    <path d="M2 5L2 2L5 2M14 5L14 2L11 2M5 14L2 14L2 11M11 14L14 14L14 11" />
                  </svg>
                  Theater
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="flex items-center gap-2 rounded-chip border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive" role="alert">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5 shrink-0">
                <circle cx="8" cy="8" r="6" /><path d="M8 5v3.5M8 11h.01" />
              </svg>
              {error}
            </p>
          )}

          {sources.length > 1 && (
            <div className="flex flex-wrap items-center gap-2" aria-label="Server & quality">
              <span className="font-mono text-eyebrow uppercase text-accent-bright">Server</span>
              {sources.map((s, i) => (
                <button
                  key={s.url}
                  type="button"
                  onClick={() => setActiveSource(i)}
                  aria-pressed={i === activeSource}
                  className={`rounded-pill border px-3.5 py-1.5 font-mono text-tag uppercase transition-all duration-200 motion-safe:active:scale-95 motion-reduce:active:scale-100 ${i === activeSource ? 'border-amber bg-primary text-void shadow-[0_0_0_3px_rgba(var(--primary),0.15)]' : 'border-border text-muted-foreground hover:border-amber/50 hover:text-foreground hover:bg-card/60'}`}
                >
                  {s.label || s.quality || `S${i + 1}`}
                </button>
              ))}
            </div>
          )}

          {mirrorGroups.length > 0 && (
            <section aria-labelledby="alt-server-heading" className="space-y-3 rounded-card border border-border/70 bg-card/40 p-4 grain motion-safe:animate-rise-in">
              <h2 id="alt-server-heading" className="flex items-center gap-2 font-mono text-eyebrow uppercase text-accent-bright">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                  <rect x="2" y="2.5" width="12" height="4" rx="1" /><rect x="2" y="9.5" width="12" height="4" rx="1" /><path d="M4.5 4.5h.01M4.5 11.5h.01" />
                </svg>
                {COPY.watch.altServers}
              </h2>
              {mirrorGroups.map((group, gi) => (
                <div key={group.key} className="flex flex-wrap items-center gap-2 motion-safe:animate-rise-in" style={{ animationDelay: `${gi * 60}ms` }}>
                  <span className="flex min-w-24 items-center gap-1.5 font-mono text-tag uppercase text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-bright/70" aria-hidden="true" />
                    {group.key}
                  </span>
                  {group.items.map((m) => {
                    const busy = mirrorLoading === m.serverId;
                    const active = activeMirror === m.serverId;
                    return (
                      <button
                        key={m.serverId}
                        type="button"
                        onClick={() => playMirror(m)}
                        disabled={!!mirrorLoading}
                        aria-pressed={active}
                        aria-busy={busy}
                        aria-label={COPY.watch.playMirror(group.key, m.quality)}
                        className={`group/mirror inline-flex items-center gap-1.5 rounded-pill border px-3.5 py-1.5 font-mono text-tag uppercase transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95 motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${active ? 'border-amber bg-primary text-void shadow-[0_0_0_3px_rgba(var(--primary),0.15)]' : 'border-border text-muted-foreground hover:border-amber/50 hover:text-foreground hover:bg-card/60 hover:shadow-lift'}`}
                      >
                        {busy ? (
                          <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin" aria-hidden="true" />
                        ) : (
                          <svg viewBox="0 0 16 16" fill="currentColor" className="h-2.5 w-2.5 motion-safe:transition-transform motion-safe:group-hover/mirror:scale-125" aria-hidden="true"><path d="M4 3l9 5-9 5z" /></svg>
                        )}
                        {m.quality || 'Stream'}
                      </button>
                    );
                  })}
                </div>
              ))}
            </section>
          )}

          {downloadGroups.length > 0 && (
            <details className="group/dl rounded-card border border-border/70 bg-card/40 grain overflow-hidden motion-safe:animate-rise-in">
              <summary className="flex cursor-pointer items-center gap-2 px-5 py-3.5 font-mono text-eyebrow uppercase text-accent-bright transition-colors hover:text-primary">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
                  <path d="M8 2v8M4.5 6.5L8 10l3.5-3.5M3 13h10" />
                </svg>
                Download
                <span className="rounded-pill bg-primary/15 px-2 py-0.5 text-micro text-primary">{downloads.length}</span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-open/dl:rotate-180">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </summary>
              <div className="space-y-4 border-t border-border/70 p-4">
                {downloadGroups.map((group) => (
                  <div key={group.key} className="space-y-2">
                    <h3 className="flex items-center gap-2 font-mono text-tag uppercase text-foreground">
                      <span className="rounded-chip border border-amber/40 bg-amber/10 px-2 py-0.5 text-primary">{group.key}</span>
                      {group.items[0]?.size && <span className="text-muted-foreground">{group.items[0].size}</span>}
                    </h3>
                    <ul className="flex flex-wrap gap-2">
                      {group.items.map((d, i) => (
                        <li key={`${d.url}-${i}`} className="motion-safe:animate-rise-in" style={{ animationDelay: `${i * 40}ms` }}>
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Download ${d.label} ${group.key}`}
                            className="group/dlink inline-flex items-center gap-1.5 rounded-pill border border-border px-3.5 py-1.5 font-mono text-tag uppercase text-muted-foreground transition-all duration-200 hover:border-amber/50 hover:text-foreground hover:bg-card/60 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lift motion-safe:active:scale-95 motion-reduce:active:scale-100"
                          >
                            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-2.5 w-2.5 motion-safe:transition-transform motion-safe:group-hover/dlink:translate-y-0.5" aria-hidden="true"><path d="M8 2v7M5 6.5L8 9l3-2.5M3 12h10" /></svg>
                            {d.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          )}

          <div className="flex flex-col gap-3 border border-border bg-card/30 p-5 sm:flex-row sm:items-center sm:justify-between grain">
            <div>
              <p className="font-mono text-eyebrow uppercase text-accent-bright">Now playing</p>
              <h1 className="mt-1.5 font-serif text-2xl font-bold text-foreground">Episode {currentNumber}</h1>
              <p className="mt-1 text-xs text-muted-foreground">{currentTitle}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => switchEpisode(Math.max(0, epIndex - 1))}
                disabled={epIndex === 0 || loading}
                aria-label="Previous episode"
                className="rounded-pill border border-border px-4 py-2 font-mono text-tag uppercase text-foreground transition-all duration-200 hover:border-amber/60 hover:text-primary hover:bg-card/60 disabled:cursor-not-allowed disabled:opacity-30 motion-safe:active:scale-95 motion-reduce:active:scale-100"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => switchEpisode(Math.min(episodes.length - 1, epIndex + 1))}
                disabled={!nextEp || loading}
                aria-label="Next episode"
                className="rounded-pill border border-amber px-4 py-2 font-mono text-tag uppercase text-primary transition-all duration-200 hover:bg-primary hover:text-void disabled:cursor-not-allowed disabled:opacity-30 motion-safe:active:scale-95 motion-reduce:active:scale-100"
              >
                Next →
              </button>
            </div>
          </div>

          {episodeListError && (
            <p className="text-xs text-primary" role="status">{COPY.watch.listFailed}</p>
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
                    className={`min-w-14 border px-3 py-2 font-mono text-xs transition-colors ${idx === epIndex ? 'border-amber bg-primary text-void' : 'border-border text-muted-foreground hover:border-paper hover:text-foreground'}`}
                  >
                    EP {number}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className={`space-y-3 ${theater ? 'hidden' : ''}`}>
          {nextEp && (
            <button
              type="button"
              onClick={() => switchEpisode(epIndex + 1)}
              disabled={loading}
              className="w-full border border-border bg-card p-4 text-left transition-colors hover:border-amber"
            >
              <span className="font-mono text-tag uppercase text-primary">Up next</span>
              <span className="mt-2 block font-serif text-lg text-foreground">Episode {nextEp.episodeNumber || epIndex + 2}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{nextEp.title || 'Untitled'}</span>
            </button>
          )}

          {episodes.length > 1 && (
            <div className="border border-border bg-card/70">
              <button
                type="button"
                onClick={() => setShowList(!showList)}
                aria-expanded={showList}
                aria-controls="episode-queue"
                aria-label="Open episode queue"
                className="flex w-full items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-tag text-foreground transition-colors hover:text-primary"
              >
                Episodes
                <span className="text-muted-foreground">{episodes.length}</span>
              </button>
              {showList && (
                <div id="episode-queue" role="region" aria-label="Episode queue" className="max-h-80 overflow-y-auto border-t border-border p-2">
                  {episodes.map((ep, idx) => {
                    const number = ep.episodeNumber || idx + 1;
                    return (
                      <button
                        key={ep.slug}
                        type="button"
                        onClick={() => switchEpisode(idx)}
                        disabled={loading}
                        className={`block w-full px-3 py-2 text-left transition-colors ${idx === epIndex ? 'bg-primary text-void' : 'text-muted-foreground hover:bg-background/40 hover:text-foreground'}`}
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
