// Server-only Supabase data access via PostgREST (native fetch, zero deps).
// RLS allows public read on jawatch.* — anon key is safe to use server-side here.
import 'server-only';

const REST_URL = process.env.SUPABASE_URL || '';        // https://<ref>.supabase.co
const ANON_KEY = process.env.SUPABASE_ANON_KEY || '';   // publishable/anon key

if (!REST_URL || !ANON_KEY) {
  // ponytail: fail loud at request time, not build time — allows build without env
  console.warn('[db] SUPABASE_URL / SUPABASE_ANON_KEY not set; queries will return empty.');
}

export type Item = {
  id: number;
  slug: string;
  title: string;
  type: string;
  status: string;
  score: number;
  genres: string[];
  cover_url: string;
  synopsis: string;
  release_year: number;
  total_episodes: number;
  episode_count: number;
};

// Strip CSV-quote artifact (e.g. ",0 Foo" → "Foo") from seeded titles.
export function cleanTitle(t: string): string {
  return (t || '').replace(/^,\s*\d+\s+/, '').trim();
}

// Immutable title cleanup for item rows (does not mutate input).
function withCleanTitles<T extends { title?: string }>(rows: T[]): T[] {
  return rows.map(r => (r.title ? { ...r, title: cleanTitle(r.title) } : r));
}

export type Episode = {
  id: number;
  item_slug: string;
  number: number;
  title: string;
  stream_url: string;
  stream_source: string;
  download_links: { url: string; provider: string; quality: string }[];
};

// Map DB type → content_type for routing/UI grouping.
export type ContentType = 'anime' | 'manga' | 'movie' | 'donghua' | 'comic' | 'novel' | 'other';
const TYPE_MAP: Record<string, ContentType> = {
  tv: 'anime', ona: 'anime', ova: 'anime', special: 'anime',
  movie: 'movie',
  donghua: 'donghua',
  manga: 'manga', comic: 'comic', novel: 'novel',
};
export function contentType(type: string): ContentType {
  return TYPE_MAP[type] || 'other';
}

// True when the content type is video (watchable) vs readable (manga/comic/novel).
export function isWatchable(ct: ContentType): boolean {
  return ct === 'anime' || ct === 'movie' || ct === 'donghua';
}

// Typed error so route error.tsx can render a useful message instead of silent empty.
export class DbError extends Error {
  constructor(public status: number, public table: string, message?: string) {
    super(message || `[db] ${table} failed: ${status}`);
    this.name = 'DbError';
  }
}

// Generic PostgREST GET with count. Throws DbError on non-OK responses (loud, not silent).
async function rpc<T>(
  table: string,
  params: Record<string, string | number | undefined>,
  select = '*'
): Promise<{ rows: T[]; total: number }> {
  if (!REST_URL || !ANON_KEY) return { rows: [], total: 0 };
  const qp = new URLSearchParams({ select });
  for (const [k, v] of Object.entries(params)) if (v !== undefined) qp.set(k, String(v));
  const res = await fetch(`${REST_URL}/rest/v1/${table}?${qp}`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      Accept: 'application/json',
      Prefer: 'count=exact',
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[db] ${table} ${res.status}: ${body}`);
    throw new DbError(res.status, table, `[db] ${table} ${res.status}`);
  }
  const rows = (await res.json()) as T[];
  const range = res.headers.get('content-range'); // "0-11/731"
  const total = range ? Number(range.split('/')[1]) : rows.length;
  return { rows, total };
}

export async function getItems(opts: {
  type?: string; genre?: string; status?: string; page?: number; limit?: number;
} = {}): Promise<{ rows: Item[]; total: number }> {
  const { type, genre, status, page = 1, limit = 24 } = opts;
  const from = (page - 1) * limit;
  const params: Record<string, string | number | undefined> = {
    limit,
    offset: from,
    order: 'updated_at.desc',
  };
  if (type) params.type = `eq.${type}`;
  if (status) params.status = `eq.${status}`;
  if (genre) params.genres = `cs.{${genre}}`; // contains
  const r = await rpc<Item>('items', params);
  return { rows: withCleanTitles(r.rows), total: r.total };
}

export async function getTrending(limit = 10): Promise<Item[]> {
  // Trending = recently updated with most episodes. ponytail: no separate table, derive.
  const r = await rpc<Item>('items', {
    limit,
    order: 'episode_count.desc',
  });
  return withCleanTitles(r.rows);
}

export async function getItem(slug: string): Promise<Item | null> {
  const r = await rpc<Item>('items', { slug: `eq.${slug}`, limit: 1 });
  const rows = withCleanTitles(r.rows);
  return rows[0] || null;
}

export async function getEpisodes(itemSlug: string): Promise<Episode[]> {
  const r = await rpc<Episode>('episodes', {
    item_slug: `eq.${itemSlug}`,
    order: 'number.asc',
    limit: 500,
  });
  return r.rows;
}

const MAX_QUERY = 128;

export async function searchItems(q: string, limit = 20): Promise<Item[]> {
  if (!REST_URL || !ANON_KEY) return [];
  // ponytail: cap + sanitize — PostgREST ilike treats * and _ as wildcards; escape both.
  const cleaned = q.trim().slice(0, MAX_QUERY).replace(/[*%_]/g, ' ');
  if (!cleaned) return [];
  const pattern = `*${cleaned}*`;
  const res = await fetch(
    `${REST_URL}/rest/v1/items?title=ilike.${encodeURIComponent(pattern)}&limit=${limit}&order=updated_at.desc`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }, next: { revalidate: 60 } }
  );
  if (!res.ok) {
    throw new DbError(res.status, 'items', `[db] items search ${res.status}`);
  }
  const rows = (await res.json()) as Item[];
  return withCleanTitles(rows);
}

export async function getGenres(): Promise<{ name: string; count: number }[]> {
  // ponytail: derive genre facets client-side from a single items pull instead of a view.
  const r = await rpc<Item>('items', { limit: 1000, select: 'genres' });
  const counts = new Map<string, number>();
  for (const row of r.rows) for (const g of row.genres || []) counts.set(g, (counts.get(g) || 0) + 1);
  return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}
