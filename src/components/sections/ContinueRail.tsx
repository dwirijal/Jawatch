'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from '@/components/ui/RefererImage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProgressInput } from '@/lib/library';
import { SectionHeader } from './SectionHeader';
import { COPY } from '@/lib/copy';

// ─── ProgressRail ─── Horizontal snap-scroll rail with pill progress bar ───
function ProgressRail({ items, kind }: { items: ProgressInput[]; kind: 'episodes' | 'chapters' }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const total = items.length;

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 260 : -260, behavior: 'smooth' });
  };

  return (
    <div className="group/rail relative">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-card/90 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-card/90 to-transparent" />

      {/* Prev / Next arrows — hidden until hover on desktop */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 hidden group-hover/rail:flex items-center justify-center w-8 h-8 rounded-full bg-card/90 border border-border text-foreground shadow-lg hover:bg-card hover:border-primary/50 transition-all duration-base"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 hidden group-hover/rail:flex items-center justify-center w-8 h-8 rounded-full bg-card/90 border border-border text-foreground shadow-lg hover:bg-card hover:border-primary/50 transition-all duration-base"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Scrollable rail */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
      >
        {items.map((item, idx) => {
          const ref = decodeMediaRef(item.mediaRef);
          if (!ref) return null;
          // Public item path: /{type}/{work}/eN|cN
          const href = `${buildCanonicalPath(ref)}/${item.itemSlug}`;
          // Pill fills based on position in the rail (simple visual progress)
          const pct = total > 1 ? ((idx) / (total - 1)) * 100 : 0;

          return (
            <Link
              key={item.mediaRef}
              href={href}
              className="group/continue snap-start shrink-0 w-[120px] sm:w-[140px] flex flex-col gap-1.5"
            >
              {/* Poster with progress pill at bottom */}
              <div className="relative aspect-[2/3] rounded-card overflow-hidden bg-card shadow-md shadow-black/40 group-hover/continue:shadow-lg group-hover/continue:shadow-primary/20 group-hover/continue:scale-[1.03] transition-all duration-300">
                {item.coverImage ? (
                  <Image
                    src={item.coverImage}
                    alt={item.title || item.mediaRef}
                    fill
                    sizes="140px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-card" />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                {/* Progress pill */}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="h-1 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="font-mono text-[9px] text-white/70 uppercase tracking-wide">
                      {kind === 'episodes' ? 'EP' : 'CH'} {item.itemNumber}
                    </span>
                  </div>
                </div>

                {/* Type badge */}
                <div className="absolute top-1.5 right-1.5">
                  <span className="font-mono text-[8px] uppercase tracking-widest bg-card/80 backdrop-blur-sm text-accent-bright px-1.5 py-0.5 rounded-sm">
                    {item.mediaType}
                  </span>
                </div>
              </div>

              {/* Title */}
              <span className="font-serif text-[11px] leading-tight text-foreground line-clamp-2 group-hover/continue:text-primary transition-colors duration-base">
                {item.title || item.mediaRef}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── ContinueRail ─── Home "Continue watching/reading" rail ───
export function ContinueRail() {
  const [watch, setWatch] = useState<ProgressInput[]>([]);
  const [read, setRead] = useState<ProgressInput[]>([]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/user/progress', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { watch: ProgressInput[]; read: ProgressInput[] } | null) => {
        if (!data) return;
        setWatch(data.watch);
        setRead(data.read);
      })
      .catch(() => {}); // guest / offline: stay empty
    return () => ctrl.abort();
  }, []);

  if (watch.length === 0 && read.length === 0) return null;

  return (
    <div className="mx-auto max-w-page px-4 pt-16 sm:px-8">
      {watch.length > 0 && (
        <section>
          <SectionHeader eyebrow={COPY.library.resumeEyebrow} title={COPY.library.resumeWatch} href="/library/watch-progress" />
          <ProgressRail items={watch.slice(0, 12)} kind="episodes" />
        </section>
      )}
      {read.length > 0 && (
        <section className={watch.length > 0 ? 'mt-12' : ''}>
          <SectionHeader eyebrow={COPY.library.resumeEyebrow} title={COPY.library.resumeRead} href="/library/reading-progress" />
          <ProgressRail items={read.slice(0, 12)} kind="chapters" />
        </section>
      )}
    </div>
  );
}

// Import helpers — ProgressList no longer used by ContinueRail
import { decodeMediaRef, buildCanonicalPath } from '@/lib/api';
