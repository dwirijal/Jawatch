'use client';
import { useEffect, useState } from 'react';
import type { ProgressInput } from '@/lib/library';
import { SectionHeader } from './SectionHeader';
import { ProgressList } from './ProgressList';
import { COPY } from '@/lib/copy';

// Home "Continue watching/reading" rail. Fetches session progress client-side so the
// homepage shell stays ISR-static (CDN-cached, ~0 Vercel invocation). Renders nothing
// for guests, on error, or when there's no progress — costs guests zero space.
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
          <ProgressList items={watch.slice(0, 6)} kind="episodes" />
        </section>
      )}
      {read.length > 0 && (
        <section className={watch.length > 0 ? 'mt-12' : ''}>
          <SectionHeader eyebrow={COPY.library.resumeEyebrow} title={COPY.library.resumeRead} href="/library/reading-progress" />
          <ProgressList items={read.slice(0, 6)} kind="chapters" />
        </section>
      )}
    </div>
  );
}
