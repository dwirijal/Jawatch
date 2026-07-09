import type { EpisodeMirror, EpisodeDownload } from '@/lib/api';

export interface Group<T> { key: string; items: T[]; }

// Stable grouping: first-seen key order preserved, so the UI order matches upstream order.
function groupBy<T>(items: T[], keyOf: (item: T) => string): Group<T>[] {
  const order: string[] = [];
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item) || 'Lainnya';
    if (!map.has(key)) { map.set(key, []); order.push(key); }
    map.get(key)!.push(item);
  }
  return order.map((key) => ({ key, items: map.get(key)! }));
}

// Streaming mirrors grouped by provider (mirror.label). One provider may offer several qualities.
export function groupMirrorsByProvider(mirrors: EpisodeMirror[]): Group<EpisodeMirror>[] {
  return groupBy(mirrors, (m) => m.label);
}

// Downloads grouped by resolution (download.quality, e.g. "Mp4_360p").
export function groupDownloadsByResolution(downloads: EpisodeDownload[]): Group<EpisodeDownload>[] {
  return groupBy(downloads, (d) => d.quality || '');
}
