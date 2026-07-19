'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, BookOpen } from 'lucide-react';
import { BookmarkButton } from '@/components/BookmarkButton';
import type { BookmarkInput } from '@/lib/library';
import { COPY } from '@/lib/copy';

interface LibraryState {
  bookmarked: boolean;
  resume: { itemSlug: string; itemNumber: number } | null;
}

// Client hydration of the per-user detail-page bits, so the page shell stays ISR-static.
// SSR/CDN renders the neutral "Start" CTA + un-saved bookmark; on mount we fetch the
// signed-in user's state and upgrade to a resume CTA + real bookmark. Signed-out or
// error => shell stays as-is (progressive enhancement, never blocks the static render).
export function DetailActions({
  mediaRef,
  isVideo,
  startHref,
  itemBasePath,
  bookmarkInput,
}: {
  mediaRef: string;
  isVideo: boolean;
  startHref: string | null;
  itemBasePath: string; // e.g. /anime/one-piece
  bookmarkInput: BookmarkInput;
}) {
  const [state, setState] = useState<LibraryState>({ bookmarked: false, resume: null });

  useEffect(() => {
    const ctrl = new AbortController();
    const kind = isVideo ? 'watch' : 'read';
    fetch(`/api/user/library-state?ref=${encodeURIComponent(mediaRef)}&kind=${kind}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: LibraryState | null) => data && setState(data))
      .catch(() => {}); // signed-out / offline: keep static shell
    return () => ctrl.abort();
  }, [mediaRef, isVideo]);

  const resumeHref = state.resume ? `${itemBasePath}/${state.resume.itemSlug}` : null;
  const ctaHref = resumeHref ?? startHref;
  const ctaLabel = state.resume
    ? COPY.detail.resume(isVideo, state.resume.itemNumber)
    : isVideo ? 'Start watching' : 'Start reading';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {ctaHref && (
        <Link href={ctaHref} className="mt-8 inline-flex items-center gap-2 rounded-page bg-primary px-6 py-3 font-mono text-xs font-semibold uppercase tracking-tag text-void transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          {isVideo ? <Play className="h-4 w-4 fill-void" aria-hidden="true" /> : <BookOpen className="h-4 w-4" aria-hidden="true" />}
          {ctaLabel}
        </Link>
      )}
      <BookmarkButton media={bookmarkInput} initial={state.bookmarked} />
    </div>
  );
}
