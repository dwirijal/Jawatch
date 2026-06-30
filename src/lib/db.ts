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
function cleanTitle(t: string): string {
  return (t || '').replace(/^,\s*\d+\s+/, '').trim();
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
  tv: 'anime', ona: 'anime', ova: 'anime', movie: 'movie', special: 'anime',
};
export function contentType(type: string): ContentType {
  return TYPE_MAP[type] || 'other';
}

// Generic PostgREST GET with count.
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
    console.error(`[db] ${table} ${res.status}: ${await res.text()}`);
    return { rows: [], total: 0 };
  }
  const rows = (await res.json()) as T[];
  const range = res.headers.get('content-range'); // "0-11/731"
  const total = range ? Number(range.split('/')[1]) : rows.length;
  // Apply title cleanup for item rows (duck-typed by presence of slug+title).
  for (const r of rows) {
    const it = r as unknown as { title?: string };
    if (it && typeof it.title === 'string') it.title = cleanTitle(it.title);
  }
  return { rows, total };
}

export async function getItems(opts: {
  type?: string; genre?: string; page?: number; limit?: number;
} = {}): Promise<{ rows: Item[]; total: number }> {
  const { type, genre, page = 1, limit = 24 } = opts;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const params: Record<string, string | number | undefined> = {
    limit,
    offset: from,
    order: 'updated_at.desc',
  };
  if (type) params.type = `eq.${type}`;
  if (genre) params.genres = `cs.{${genre}}`; // contains
  const r = await rpc<Item>('items', params);
  return { rows: r.rows, total: r.total };
}

export async function getTrending(limit = 10): Promise<Item[]> {
  // Trending = recently updated with most episodes. ponytail: no separate table, derive.
  const r = await rpc<Item>('items', {
    limit,
    order: 'episode_count.desc',
  });
  return r.rows;
}

export async function getItem(slug: string): Promise<Item | null> {
  const r = await rpc<Item>('items', { slug: `eq.${slug}`, limit: 1 });
  return r.rows[0] || null;
}

export async function getEpisodes(itemSlug: string): Promise<Episode[]> {
  const r = await rpc<Episode>('episodes', {
    item_slug: `eq.${itemSlug}`,
    order: 'number.asc',
    limit: 500,
  });
  return r.rows;
}

export async function searchItems(q: string, limit = 20): Promise<Item[]> {
  if (!REST_URL) return [];
  // PostgREST ilike uses * as wildcard. Encode q, wrap with * for substring match.
  const pattern = `*${q.trim().replace(/\*/g, '%')}*`;
  const res = await fetch(
    `${REST_URL}/rest/v1/items?title=ilike.${encodeURIComponent(pattern)}&limit=${limit}&order=updated_at.desc`,
    { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }, next: { revalidate: 60 } }
  );
  if (!res.ok) return [];
  return (await res.json()) as Item[];
}

export async function getGenres(): Promise<{ name: string; count: number }[]> {
  // ponytail: derive genre facets client-side from a single items pull instead of a view.
  const r = await rpc<Item>('items', { limit: 1000, select: 'genres' });
  const counts = new Map<string, number>();
  for (const row of r.rows) for (const g of row.genres || []) counts.set(g, (counts.get(g) || 0) + 1);
  return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}
