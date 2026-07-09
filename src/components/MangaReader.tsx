'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Chapter, ChapterPage } from '@/lib/api';
import { getChapterPagesClient } from '@/lib/client-media';
import { recordProgressAction } from '@/app/media/[type]/[slug]/actions';
import { Spinner } from '@/components/ui/Spinner';

interface Props {
  slug: string;
  chapters: Chapter[];
  initialPages: ChapterPage[];
  currentChapterSlug: string;
  mediaType: string;
  title?: string;
}

export function MangaReader({ slug, chapters, initialPages, currentChapterSlug, mediaType, title }: Props) {
  const initialIdx = chapters.findIndex((c) => c.slug === currentChapterSlug);
  const [chIndex, setChIndex] = useState(initialIdx !== -1 ? initialIdx : 0);
  const [pages, setPages] = useState(initialPages);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const hasNext = chIndex < chapters.length - 1;

  const switchChapter = useCallback(async (idx: number) => {
    if (idx === chIndex) return;
    const ch = chapters[idx];
    if (!ch) return;

    setLoading(true);
    setError('');
    try {
      const newPages = await getChapterPagesClient(slug, ch.slug);
      setPages(newPages);
      setChIndex(idx);
      setShowList(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // fire-and-forget: keep resume point at the chapter actually being read
      void recordProgressAction({ mediaRef: slug, mediaType, itemSlug: ch.slug, itemNumber: ch.chapterNumber ?? idx + 1, title });
    } catch {
      setError('Gagal memuat chapter. Halaman lama tetap ditampilkan.');
    } finally {
      setLoading(false);
    }
  }, [chIndex, chapters, slug]);

  useEffect(() => {
    if (chIndex >= chapters.length - 1) return;
    const nextCh = chapters[chIndex + 1];
    getChapterPagesClient(slug, nextCh.slug).catch(() => {});
  }, [chIndex, chapters, slug]);

  // Reading-progress bar: scroll % of the document, rAF-throttled.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [chIndex, pages]);

  // Auto-advance: when the end sentinel scrolls into view, load next chapter.
  useEffect(() => {
    if (!autoAdvance || !hasNext || loading) return;
    const el = endRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) switchChapter(chIndex + 1); },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoAdvance, hasNext, loading, chIndex, switchChapter]);

  return (
    <div className="space-y-4">
      {/* Reading progress bar — fixed under the sticky header */}
      <div
        className="fixed inset-x-0 top-16 z-40 h-0.5 bg-transparent"
        role="progressbar"
        aria-label="Progres baca"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full bg-primary transition-[width] duration-150 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {/* Chapter header */}
      <div className="flex items-center justify-between gap-2 border border-border bg-card/30 p-4 grain">
        <h2 className="text-sm font-mono uppercase tracking-wider text-foreground">
          Chapter {chapters[chIndex]?.chapterNumber || chIndex + 1}
        </h2>
        <button
          onClick={() => setShowList(!showList)}
          className="px-3 py-1.5 font-mono text-tag uppercase border border-border hover:border-amber/60 text-foreground transition-all"
        >
          {chapters.length} chapters
        </button>
      </div>

      {/* Chapter dropdown */}
      {showList && (
        <div className="max-h-60 overflow-y-auto bg-card/50 border border-border p-2 grid grid-cols-2 sm:grid-cols-3 gap-1 grain">
          {chapters.map((ch, i) => (
            <button
              key={`${ch.slug}-${i}`}
              onClick={() => switchChapter(i)}
              className={`px-2 py-1.5 text-xs font-mono transition-colors ${
                i === chIndex
                  ? 'bg-primary text-void font-bold'
                  : 'text-muted-foreground hover:bg-card/80 hover:text-foreground'
              }`}
            >
              Ch {ch.chapterNumber || i + 1}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 font-mono" role="alert">{error}</p>
      )}

      {/* Pages */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="md" className="text-amber" />
        </div>
      ) : pages.length > 0 ? (
        <div className="space-y-1 bg-background p-1 border border-border">
          {/* ponytail: raw <img> intentional — manga pages are many hotlinked images of unknown dimension; next/image would route each through Vercel's optimizer (more compute, opposite of goal). Keep raw. */}
          {pages.map((page, i) => (
            <img
              key={i}
              src={page.url}
              alt={`Page ${i + 1}`}
              className="w-full h-auto"
              loading={i < 3 ? 'eager' : 'lazy'}
              referrerPolicy="no-referrer"
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center py-20 border border-border bg-card/30 grain">
          <p className="text-sm font-mono text-muted-foreground uppercase">Halaman belum tersedia.</p>
        </div>
      )}

      {/* End sentinel — triggers auto-advance when scrolled into view */}
      {pages.length > 0 && <div ref={endRef} aria-hidden="true" className="h-px w-full" />}

      {/* End-of-chapter CTA */}
      {pages.length > 0 && hasNext && (
        <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-card/40 p-5 text-center grain">
          <p className="font-mono text-tag uppercase text-muted-foreground">Selesai bab ini</p>
          <button
            type="button"
            onClick={() => switchChapter(chIndex + 1)}
            className="inline-flex items-center gap-2 rounded-pill bg-primary px-6 py-3 font-mono text-tag font-semibold uppercase tracking-tag text-void transition-all duration-200 hover:bg-primary/90 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Bab berikutnya →
          </button>
          <label className="flex cursor-pointer items-center gap-2 font-mono text-micro uppercase text-muted-foreground">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="h-3.5 w-3.5 accent-primary"
            />
            Lanjut otomatis
          </label>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex justify-between gap-2 pt-4">
        <button
          onClick={() => switchChapter(Math.max(0, chIndex - 1))}
          disabled={chIndex === 0}
          className="flex-1 rounded-pill px-3 py-2 font-mono text-tag uppercase border border-border text-foreground disabled:opacity-30 hover:border-amber/60 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          ← Prev
        </button>
        <button
          onClick={() => switchChapter(Math.min(chapters.length - 1, chIndex + 1))}
          disabled={chIndex === chapters.length - 1}
          className="flex-1 rounded-pill px-3 py-2 font-mono text-tag uppercase border border-amber text-primary disabled:opacity-30 hover:bg-primary hover:text-void transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
