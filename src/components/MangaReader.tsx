'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Chapter, ChapterPage } from '@/lib/api';
import { getChapterPagesClient } from '@/lib/client-media';

interface Props {
  slug: string;
  chapters: Chapter[];
  initialPages: ChapterPage[];
  currentChapterSlug: string;
}

export function MangaReader({ slug, chapters, initialPages, currentChapterSlug }: Props) {
  const initialIdx = chapters.findIndex((c) => c.slug === currentChapterSlug);
  const [chIndex, setChIndex] = useState(initialIdx !== -1 ? initialIdx : 0);
  const [pages, setPages] = useState(initialPages);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState('');

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


  return (
    <div className="space-y-4">
      {/* Chapter header */}
      <div className="flex items-center justify-between gap-2 border border-border bg-card/30 p-4 grain">
        <h2 className="text-sm font-mono uppercase tracking-wider text-foreground">
          Chapter {chapters[chIndex]?.chapterNumber || chIndex + 1}
        </h2>
        <button
          onClick={() => setShowList(!showList)}
          className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border border-border hover:border-amber/60 text-foreground transition-all"
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
                  : 'text-muted hover:bg-card/80 hover:text-foreground'
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
          <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-none animate-spin" />
        </div>
      ) : pages.length > 0 ? (
        <div className="space-y-1 bg-background p-1 border border-border">
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
          <p className="text-sm font-mono text-muted uppercase">Halaman belum tersedia.</p>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex justify-between gap-2 pt-4">
        <button
          onClick={() => switchChapter(Math.max(0, chIndex - 1))}
          disabled={chIndex === 0}
          className="flex-1 px-3 py-2 font-mono text-[10px] uppercase tracking-wider border border-border text-foreground disabled:opacity-30 hover:border-amber/60 hover:text-primary transition-colors"
        >
          ← Prev
        </button>
        <button
          onClick={() => switchChapter(Math.min(chapters.length - 1, chIndex + 1))}
          disabled={chIndex === chapters.length - 1}
          className="flex-1 px-3 py-2 text-xs font-semibold bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-fg-secondary))] rounded-lg disabled:opacity-30 hover:bg-[rgb(var(--color-bg-elevated))] transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
