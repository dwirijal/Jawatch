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

export interface Episode {
  unit_key: string; item_key: string; unit_kind: string; unit_number: number;
  title: string | null; preferred_source?: string; thumbnail_url?: string;
  stream_links?: { source: string; url: string }[];
  download_links?: { provider?: string; quality?: string; url: string }[];
}

export interface BrowseResult { items: AnimeCard[]; has_next: boolean; next_cursor?: string; }

const API_BASE = typeof window === "undefined"
  ? (process.env.INTERNAL_API_URL || "http://localhost:8080/v1")
  : (process.env.NEXT_PUBLIC_API_URL || "https://api.dwizzy.my.id/v1");

export async function browse(params: {
  media_type?: string; sort?: string; genre?: string; limit?: number; cursor?: string;
}): Promise<BrowseResult> {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) sp.set(k, String(v));
  const res = await fetch(`${API_BASE}/media?${sp}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return (await res.json()).data;
}

export async function getDetail(slug: string): Promise<AnimeDetail> {
  const res = await fetch(`${API_BASE}/media/slug/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return (await res.json()).data;
}

export async function getEpisodes(itemKey: string): Promise<Episode[]> {
  const res = await fetch(`${API_BASE}/media/${encodeURIComponent(itemKey)}/units?limit=500`, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()).data?.units || [];
}

export async function getEpisodeDetail(itemKey: string, unitNumber: number): Promise<Episode | null> {
  const res = await fetch(`${API_BASE}/media/${encodeURIComponent(itemKey)}/units/${unitNumber}`, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()).data;
}

export async function searchAnime(query: string): Promise<AnimeCard[]> {
  const res = await fetch(`${API_BASE}/media/search?q=${encodeURIComponent(query)}&limit=20`, { cache: "no-store" });
  if (!res.ok) return [];
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