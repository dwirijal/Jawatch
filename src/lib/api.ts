export interface AnimeCard {
  item_key: string; media_type: string; title: string; slug: string;
  cover_url?: string; score?: number; status?: string; release_year?: number;
  genres?: string[]; entry_kind?: string; season_number?: number; updated_at: string;
}

export interface AnimeDetail extends AnimeCard {
  backdrop_url?: string; overview?: string; normalized_title?: string;
  surface_type?: string; presentation_type?: string; origin_type?: string;
  enrichments?: Record<string, any>;
}

const READ_KINDS = new Set(["manga", "comic", "manhwa", "manhua", "novel"]);

export function isReadable(card: { media_type?: string; entry_kind?: string }): boolean {
  return READ_KINDS.has(card.entry_kind || "") || READ_KINDS.has(card.media_type || "");
}

export interface Episode {
  unit_key: string; item_key: string; unit_kind: string; unit_number: number;
  title: string | null; preferred_source?: string; thumbnail_url?: string;
  stream_links?: { source: string; url: string }[];
  download_links?: { provider?: string; quality?: string; url: string }[];
  pages?: string[];
}

export function contentUrl(card: { media_type?: string; entry_kind?: string; slug: string }): string {
  return isReadable(card) ? `/read/${card.slug}` : `/stream/${card.slug}`;
}

export interface BrowseResult { items: AnimeCard[]; has_next: boolean; next_cursor?: string; }

// ponytail: single env var — NEXT_PUBLIC_API_URL works for both client & server on Vercel
// (same domain, no internal routing needed for single-region free-tier app)
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  throw new Error(
    "Missing NEXT_PUBLIC_API_URL env var. " +
    "Run `vercel env pull .env.local` to sync from Vercel."
  );
}

// ponytail: 5s timeout prevents hanging fetches on flaky upstream
const TIMEOUT_MS = 5000;

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`API ${path}: ${res.status} ${res.statusText}`);
    }
    return res;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`API ${path}: timeout after ${TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function browse(params: {
  media_type?: string; sort?: string; genre?: string; limit?: number; cursor?: string;
}): Promise<BrowseResult> {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) sp.set(k, String(v));
  // ponytail: revalidate 1h — browse data changes slowly, saves ~98% function invocations
  const res = await apiFetch(`/media?${sp}`, { next: { revalidate: 3600 } });
  return (await res.json()).data;
}

export async function getDetail(slug: string): Promise<AnimeDetail> {
  // ponytail: revalidate 2h — detail pages rarely change
  const res = await apiFetch(`/media/slug/${encodeURIComponent(slug)}`, { next: { revalidate: 7200 } });
  return (await res.json()).data;
}

export async function getEpisodes(itemKey: string): Promise<Episode[]> {
  // ponytail: revalidate 24h — episode lists rarely change after release
  const res = await apiFetch(`/media/${encodeURIComponent(itemKey)}/units?limit=500`, { next: { revalidate: 86400 } });
  return (await res.json()).data?.units || [];
}

export async function getEpisodeDetail(itemKey: string, unitNumber: number): Promise<Episode | null> {
  // ponytail: no-store — episode stream links are session-specific, must be fresh
  const res = await apiFetch(`/media/${encodeURIComponent(itemKey)}/units/${unitNumber}`, { cache: "no-store" });
  return (await res.json()).data;
}

export async function searchAnime(query: string): Promise<AnimeCard[]> {
  // ponytail: revalidate 1h — search results stable for common queries
  const res = await apiFetch(`/media/search?q=${encodeURIComponent(query)}&limit=20`, { next: { revalidate: 3600 } });
  return (await res.json()).data?.items || [];
}

export function coverUrl(card?: { cover_url?: string }): string {
  if (!card?.cover_url) return "/placeholder-cover.jpg";
  return card.cover_url.startsWith("//") ? `https:${card.cover_url}` : card.cover_url;
}

export function statusColor(status?: string): string {
  switch (status) {
    case "ongoing": return "bg-green-600";
    case "completed": return "bg-blue-600";
    case "upcoming": return "bg-yellow-600";
    default: return "bg-gray-600";
  }
}
