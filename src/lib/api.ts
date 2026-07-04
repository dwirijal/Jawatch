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
  nsfw?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Episode { slug: string; episodeNumber: number; title?: string; createdAt: string; }
export interface Chapter { slug: string; chapterNumber: number; title?: string; createdAt: string; }
export interface EpisodeSource { slug?: string; quality?: string; url: string; label?: string; }
export interface ChapterPage { slug?: string; pageNumber?: number; url: string; }

async function req<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 300 },
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return [];
    const body = await res.json();
    if (!body.data) return [];
    return Array.isArray(body.data) ? body.data : [body.data];
  } catch (e) {
    console.error(`API err: ${path}`, e);
    return [];
  }
}

export async function getMedia(type?: string, page?: number, limit?: number) {
  const p = new URLSearchParams();
  if (type) p.set('type', type);
  if (page) p.set('page', String(page));
  if (limit) p.set('limit', String(limit));
  const data = await req<Media>(`/v1/media?${p.toString()}`);
  return { data, total: data.length, hasMore: data.length === (limit || 20) };
}

export async function getTrending(type?: string, limit?: number) {
  const p = new URLSearchParams();
  if (type) p.set('type', type);
  if (limit) p.set('limit', String(limit));
  return req<Media>(`/v1/media/trending?${p.toString()}`);
}

export async function getPopular(limit?: number) {
  const p = new URLSearchParams();
  if (limit) p.set('limit', String(limit));
  return req<Media>(`/v1/media/popular?${p.toString()}`);
}

export async function getLatest(type?: string, limit?: number) {
  const p = new URLSearchParams();
  if (type) p.set('type', type);
  if (limit) p.set('limit', String(limit));
  return req<Media>(`/v1/media/latest?${p.toString()}`);
}

export async function getRandom() {
  const data = await req<Media>('/v1/media/random');
  return data[0] || null;
}

export async function getMediaBySlug(slug: string) {
  const data = await req<Media>(`/v1/media/${slug}`);
  return data[0] || null;
}

export async function getGenres() { return req<{ slug: string; name: string }>(`/v1/genres`); }
export async function getMediaByGenre(slug: string) { return req<Media>(`/v1/genres/${slug}`); }

export async function getStudios() { return req<{ slug: string; name: string }>(`/v1/studios`); }
export async function getMediaByStudio(slug: string) { return req<Media>(`/v1/studios/${slug}`); }

export async function getAuthors() { return req<{ slug: string; name: string }>(`/v1/authors`); }
export async function getMediaByAuthor(slug: string) { return req<Media>(`/v1/authors/${slug}`); }

export async function getMediaRelated(slug: string) { return req<Media>(`/v1/media/${slug}/related`); }
export async function getMediaReviews(slug: string) { return req<any>(`/v1/media/${slug}/reviews`); }
export async function getMediaComments(slug: string) { return req<any>(`/v1/media/${slug}/comments`); }

export async function getEpisodes(slug: string) { return req<Episode>(`/v1/media/${slug}/episodes`); }
export async function getEpisodeSources(slug: string, epSlug: string) { return req<EpisodeSource>(`/v1/media/${slug}/episodes/${epSlug}/sources`); }
export async function getChapters(slug: string) { return req<Chapter>(`/v1/media/${slug}/chapters`); }
export async function getChapterPages(slug: string, chSlug: string) { return req<ChapterPage>(`/v1/media/${slug}/chapters/${chSlug}/pages`); }

export async function searchMedia(query: string, limit?: number) {
  const p = new URLSearchParams({ q: query });
  if (limit) p.set('limit', String(limit));
  const data = await req<Media>(`/v1/search?${p.toString()}`);
  return { data, total: data.length };
}
