const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8484';

export interface Media {
  slug: string;
  type: 'anime' | 'manga' | 'movie' | 'donghua' | 'comic' | 'novel';
  title: string;
  alternativeTitles?: string[] | null;
  synopsis?: string;
  status?: string;
  rating?: { average: number; count: number };
  genres?: { slug: string; name: string }[];
  studios?: { slug: string; name: string }[] | null;
  authors?: { slug: string; name: string }[] | null;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Episode {
  slug: string;
  episodeNumber: number;
  createdAt: string;
}

export interface Chapter {
  slug: string;
  chapterNumber: number;
  createdAt: string;
}

export interface EpisodeSource {
  slug?: string;
  quality?: string;
  url: string;
  label?: string;
}

export interface ChapterPage {
  slug?: string;
  pageNumber?: number;
  url: string;
}

export interface Pagination {
  hasMore: boolean;
  limit: number;
  page?: number;
  perPage?: number;
  total?: number;
}

export interface ApiResponse<T> {
  data: T | T[] | null;
  meta: {
    requestId?: string;
    timestamp?: string;
    pagination?: Pagination;
    query?: string;
    total?: number;
  };
  error: { code: string; message: string } | null;
}

async function fetchApi<T>(path: string): Promise<ApiResponse<T>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 300 },
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText} ${path}`);
      return { data: null, meta: {}, error: { code: String(res.status), message: res.statusText } };
    }

    return res.json();
  } catch (error) {
    console.error(`API fetch failed: ${path}`, error);
    return { data: null, meta: {}, error: { code: 'FETCH_ERROR', message: String(error) } };
  }
}

function unwrap<T>(r: ApiResponse<T>): T[] {
  if (!r.data) return [];
  return Array.isArray(r.data) ? r.data : [r.data];
}

export async function getMedia(type?: string, page?: number, limit?: number): Promise<{ data: Media[]; total: number; hasMore: boolean }> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (page) params.set('page', String(page));
  if (limit) params.set('limit', String(limit));
  const q = params.toString();
  const r = await fetchApi<Media>(`/v1/media${q ? `?${q}` : ''}`);
  return { data: unwrap(r), total: r.meta?.pagination?.total ?? 0, hasMore: r.meta?.pagination?.hasMore ?? false };
}

export async function getTrending(type?: string, limit?: number): Promise<Media[]> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (limit) params.set('limit', String(limit));
  const q = params.toString();
  const r = await fetchApi<Media>(`/v1/media/trending${q ? `?${q}` : ''}`);
  return unwrap(r);
}

export async function getLatest(type?: string, limit?: number): Promise<Media[]> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (limit) params.set('limit', String(limit));
  const q = params.toString();
  const r = await fetchApi<Media>(`/v1/media/latest${q ? `?${q}` : ''}`);
  return unwrap(r);
}

export async function getMediaBySlug(slug: string): Promise<Media | null> {
  const r = await fetchApi<Media>(`/v1/media/${slug}`);
  if (!r.data || r.error) return null;
  return Array.isArray(r.data) ? r.data[0] ?? null : r.data;
}

export async function getEpisodes(slug: string): Promise<Episode[]> {
  const r = await fetchApi<Episode>(`/v1/media/${slug}/episodes`);
  return unwrap(r);
}

export async function getEpisodeSources(slug: string, epSlug: string): Promise<EpisodeSource[]> {
  const r = await fetchApi<EpisodeSource>(`/v1/media/${slug}/episodes/${epSlug}/sources`);
  return unwrap(r);
}

export async function getChapters(slug: string): Promise<Chapter[]> {
  const r = await fetchApi<Chapter>(`/v1/media/${slug}/chapters`);
  return unwrap(r);
}

export async function getChapterPages(slug: string, chSlug: string): Promise<ChapterPage[]> {
  const r = await fetchApi<ChapterPage>(`/v1/media/${slug}/chapters/${chSlug}/pages`);
  return unwrap(r);
}

export async function searchMedia(query: string, limit?: number): Promise<{ data: Media[]; total: number }> {
  const params = new URLSearchParams();
  params.set('q', query);
  if (limit) params.set('limit', String(limit));
  const r = await fetchApi<Media>(`/v1/search?${params.toString()}`);
  return { data: unwrap(r), total: r.meta?.pagination?.total ?? 0 };
}
