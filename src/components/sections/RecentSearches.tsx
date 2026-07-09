'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { COPY } from '@/lib/copy';

const KEY = 'jawatch:recent-searches';
const MAX = 8;

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((s): s is string => typeof s === 'string').slice(0, MAX) : [];
  } catch {
    return [];
  }
}

// Records the current query (on the search page) and, when no query is active,
// surfaces recent queries as one-tap chips. Client-only (localStorage).
export function RecentSearches({ current }: { current: string }) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const q = current.trim();
    if (q) {
      // dedupe (case-insensitive), newest first, cap at MAX
      const next = [q, ...read().filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode — ignore */ }
    } else {
      setRecent(read());
    }
  }, [current]);

  if (current.trim() || recent.length === 0) return null;

  const clear = () => {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    setRecent([]);
  };

  return (
    <section aria-label={COPY.search.recent} className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-micro uppercase tracking-tag text-muted-foreground">{COPY.search.recent}</h2>
        <button type="button" onClick={clear} className="font-mono text-micro uppercase text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-page px-2 py-1">
          {COPY.search.clearRecent}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {recent.map((q) => (
          <Link
            key={q}
            href={`/search?q=${encodeURIComponent(q)}`}
            className="rounded-pill border border-border bg-card px-4 py-2 font-mono text-micro text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {q}
          </Link>
        ))}
      </div>
    </section>
  );
}
