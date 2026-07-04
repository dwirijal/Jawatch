'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Chapter, ChapterPage } from '@/lib/api';

interface Props {
  slug: string;
  chapters: Chapter[];
  initialPages: ChapterPage[];
}

export function MangaReader({ slug, chapters, initialPages }: Props) {
  const [chIndex, setChIndex] = useState(0);
  const [pages, setPages] = useState(initialPages);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);

  const switchChapter = useCallback(async (idx: number) => {
	if (idx === chIndex) return;
	setLoading(true);
	const ch = chapters[idx];
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/media/${slug}/chapters/${ch.slug}/pages`);
		const json = await res.json();
		const newPages = Array.isArray(json.data) ? json.data : (json.data ? [json.data] : []);
		setPages(newPages);
		setChIndex(idx);
		setShowList(false);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	} catch {
		// keep old pages
	} finally {
		setLoading(false);
	}
}, [chIndex, chapters, slug]);

useEffect(() => {
	if (chIndex < chapters.length - 1) {
		const nextCh = chapters[chIndex + 1];
		fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/media/${slug}/chapters/${nextCh.slug}/pages`).catch(() => {});
	}
}, [chIndex, chapters, slug]);


  return (
    <div className="space-y-4">
      {/* Chapter header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm sm:text-base font-bold text-[rgb(var(--color-fg-primary))]">
          Chapter {chapters[chIndex]?.chapterNumber || chIndex + 1}
        </h2>
        <button
          onClick={() => setShowList(!showList)}
          className="px-3 py-1.5 text-xs font-semibold bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-fg-secondary))] rounded-lg hover:bg-[rgb(var(--color-bg-elevated))] transition-colors"
        >
          {chapters.length} chapters
        </button>
      </div>

      {/* Chapter dropdown */}
      {showList && (
        <div className="max-h-60 overflow-y-auto bg-[rgb(var(--color-bg-secondary))] rounded-lg p-2 grid grid-cols-2 sm:grid-cols-3 gap-1">
          {chapters.map((ch, i) => (
            <button
              key={`${ch.slug}-${i}`}
              onClick={() => switchChapter(i)}
              className={`px-2 py-1.5 text-xs rounded text-left transition-colors ${
                i === chIndex
                  ? 'bg-[rgb(var(--color-accent))] text-[rgb(var(--color-fg-primary))] font-semibold'
                  : 'text-[rgb(var(--color-fg-secondary))] hover:bg-[rgb(var(--color-bg-elevated))]'
              }`}
            >
              Ch {ch.chapterNumber || i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Pages */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[rgb(var(--color-accent))] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pages.length > 0 ? (
        <div className="space-y-1">
          {pages.map((page, i) => (
            <img
              key={i}
              src={page.url}
              alt={`Page ${i + 1}`}
              className="w-full h-auto"
              loading={i < 3 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center py-20">
          <p className="text-sm text-[rgb(var(--color-fg-muted))]">Halaman belum tersedia.</p>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex justify-between gap-2 pt-4">
        <button
          onClick={() => switchChapter(Math.max(0, chIndex - 1))}
          disabled={chIndex === 0}
          className="flex-1 px-3 py-2 text-xs font-semibold bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-fg-secondary))] rounded-lg disabled:opacity-30 hover:bg-[rgb(var(--color-bg-elevated))] transition-colors"
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
