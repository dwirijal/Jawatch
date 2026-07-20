// Local Go API client. Self-hosted replacement for Sanka-backed api.ts.
//
// Wire-up: when process.env.JAWATCH_USE_LOCAL_API === '1', the public
// functions here are used instead of the Sanka-backed ones in api.ts.
// Set JAWATCH_LOCAL_API_URL to the Go API base (e.g. http://jawatch-api:8080).
//
// Response shape from Go API:
//   - { ok: true, data: ... } for most endpoints
//   - { ok: true, rails: [{ key, items: [...] }] } for /api/v1/home
//
// We translate the local response into the same Media shape that api.ts
// exports, so consumers don't need to know which backend is active.

import {
  mapGenres,
  baseMedia,
  encodeMediaRef,
  safeHttpUrl,
  type Media,
} from './api';

const LOCAL_API_BASE = stripTrailingSlash(
  process.env.JAWATCH_LOCAL_API_URL || 'http://127.0.0.1:8080',
);
const LOCAL_API_TIMEOUT_MS = Number(process.env.JAWATCH_LOCAL_API_TIMEOUT_MS || 4000);

class LocalApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'LocalApiError';
    this.status = status;
  }
}

function stripTrailingSlash(s: string): string {
  return s.replace(/\/+$/, '');
}

function toMediaType(s: string): 'anime' | 'manga' | 'movie' | 'donghua' | 'comic' | 'novel' {
  if (s === 'anime' || s === 'manga' || s === 'movie' || s === 'donghua' || s === 'comic' || s === 'novel') {
    return s;
  }
  return 'anime';
}

async function localGet<T = any>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOCAL_API_TIMEOUT_MS);
  try {
    const res = await fetch(`${LOCAL_API_BASE}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new LocalApiError(`local api ${res.status}`, res.status);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    if (err?.name === 'AbortError') throw new LocalApiError('local api timeout');
    if (err instanceof LocalApiError) throw err;
    throw new LocalApiError('local api unavailable');
  } finally {
    clearTimeout(timer);
  }
}

function slugToRef(slug: string): { type: string; provider: string; upstream: string } {
  const parts = slug.split(';');
  if (parts.length === 3) {
    return { type: parts[0], provider: parts[1], upstream: parts[2] };
  }
  if (parts.length === 2) {
    return { type: parts[0], provider: 'resolve', upstream: parts[1] };
  }
  return { type: 'anime', provider: 'resolve', upstream: slug };
}

function toMedia(item: any): Media {
  const { type, provider, upstream } = slugToRef(item.slug || '');
  const mediaType = toMediaType(item.type || type);
  // Prefer public work slug for links: type/publicSlug (mediaHref → /{type}/{publicSlug}).
  const publicSlug = (item.publicSlug || item.public_slug || '').toString().trim();
  const workSlug = publicSlug || item.upstreamSlug || upstream || '';
  const ref = workSlug
    ? `${mediaType}/${workSlug}`
    : item.slug || encodeMediaRef(mediaType, provider, item.upstreamSlug || upstream);
  return {
    ...baseMedia(mediaType, ref, item.title || 'Untitled', item.coverImage || undefined),
    status: item.status,
    synopsis: item.synopsis || undefined,
    alternativeTitles: Array.isArray(item.alternativeTitles) ? item.alternativeTitles : null,
    rating: item.rating && (item.rating.average || item.rating.count)
      ? { average: Number(item.rating.average) || 0, count: Number(item.rating.count) || 0 }
      : undefined,
    genres: mapGenres(item.genres, 'name'),
    studios: Array.isArray(item.studios) ? item.studios : null,
    authors: Array.isArray(item.authors) ? item.authors : null,
  };
}

function cover(url: unknown): string | undefined {
  if (typeof url !== 'string') return undefined;
  return safeHttpUrl(url) || undefined;
}

// ============ PUBLIC API ============

export async function getHomeRails(): Promise<any[]> {
  try {
    const body = await localGet<{ ok: boolean; rails: Array<{ key: string; items: any[] }> }>('/api/v1/home');
    if (!body?.ok || !Array.isArray(body.rails)) return [];
    // Normalize rail items through toMedia so slug/href shape matches catalog pages.
    return body.rails.map((r) => ({
      key: r.key,
      title: r.key,
      href: r.key === 'popular' ? '/popular' : r.key === 'latest' ? '/latest' : `/discover`,
      items: (r.items || []).map((it: any) => toMedia(it)),
    }));
  } catch (err) {
    return [];
  }
}

export async function getMedia(
  type?: string,
  page?: number,
  limit?: number,
): Promise<{ data: Media[]; total: number; hasMore: boolean }> {
  try {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    const qs = params.toString() ? `?${params.toString()}` : '';
    const body = await localGet<{ ok: boolean; data: any[]; total: number; hasMore: boolean }>(`/api/v1/media${qs}`);
    if (!body?.ok) return { data: [], total: 0, hasMore: false };
    return {
      data: (body.data || []).map(toMedia),
      total: body.total || 0,
      hasMore: !!body.hasMore,
    };
  } catch {
    return { data: [], total: 0, hasMore: false };
  }
}

export async function getPopular(limit?: number): Promise<Media[]> {
  try {
    const body = await localGet<{ ok: boolean; data: any[] }>(`/api/v1/popular?limit=${limit || 20}`);
    return (body?.data || []).map(toMedia);
  } catch {
    return [];
  }
}

export async function getTrending(type?: string, limit?: number): Promise<Media[]> {
  try {
    const qs = new URLSearchParams();
    if (type) qs.set('type', type);
    if (limit) qs.set('limit', String(limit));
    const body = await localGet<{ ok: boolean; data: any[] }>(`/api/v1/trending?${qs.toString()}`);
    return (body?.data || []).map(toMedia);
  } catch {
    return [];
  }
}

export async function getLatest(type?: string, limit?: number): Promise<Media[]> {
  try {
    const qs = new URLSearchParams();
    if (type) qs.set('type', type);
    if (limit) qs.set('limit', String(limit));
    const body = await localGet<{ ok: boolean; data: any[] }>(`/api/v1/latest?${qs.toString()}`);
    return (body?.data || []).map(toMedia);
  } catch {
    return [];
  }
}

export async function getRandom(): Promise<Media | null> {
  try {
    const body = await localGet<{ ok: boolean; data: any }>('/api/v1/random');
    if (!body?.ok || !body.data) return null;
    return toMedia(body.data);
  } catch {
    return null;
  }
}

export async function suggestMedia(query: string, limit = 8): Promise<Media[]> {
  try {
    const body = await localGet<{ ok: boolean; data: any[] }>(`/api/v1/suggest?q=${encodeURIComponent(query)}&limit=${limit}`);
    return (body?.data || []).map(toMedia);
  } catch {
    return [];
  }
}

export async function searchMedia(query: string, type?: string, limit = 20, opts?: { genre?: string; status?: string; sort?: string }): Promise<Media[]> {
  try {
    const qs = new URLSearchParams({ q: query, limit: String(limit) });
    if (type) qs.set('type', type);
    if (opts?.genre) qs.set('genre', opts.genre);
    if (opts?.status) qs.set('status', opts.status);
    if (opts?.sort) qs.set('sort', opts.sort);
    const body = await localGet<{ ok: boolean; data: any[] }>(`/api/v1/search?${qs.toString()}`);
    return (body?.data || []).map(toMedia);
  } catch {
    return [];
  }
}

export async function getMediaBySlug(slug: string): Promise<Media | null> {
  try {
    const body = await localGet<{ ok: boolean; data: any }>(`/api/v1/media/${encodeURIComponent(slug)}`);
    if (!body?.ok || !body.data) return null;
    return toMedia(body.data);
  } catch {
    return null;
  }
}

export async function getEpisodes(mediaSlug: string): Promise<any[]> {
  try {
    const body = await localGet<{ ok: boolean; data: any[] }>(`/api/v1/media/${encodeURIComponent(mediaSlug)}/episodes`);
    return body?.data || [];
  } catch {
    return [];
  }
}

export async function getEpisodeSources(mediaSlug: string, epSlug: string): Promise<any[]> {
  try {
    const body = await localGet<{ ok: boolean; sources: any[] }>(
      `/api/v1/media/${encodeURIComponent(mediaSlug)}/episodes/${encodeURIComponent(epSlug)}/sources`,
    );
    return body?.sources || [];
  } catch {
    return [];
  }
}

export async function getChapters(mediaSlug: string): Promise<any[]> {
  try {
    const body = await localGet<{ ok: boolean; data: any[] }>(`/api/v1/media/${encodeURIComponent(mediaSlug)}/chapters`);
    return body?.data || [];
  } catch {
    return [];
  }
}

export async function getChapterPages(mediaSlug: string, chSlug: string): Promise<any[]> {
  try {
    const body = await localGet<{ ok: boolean; data: any[] }>(
      `/api/v1/media/${encodeURIComponent(mediaSlug)}/chapters/${encodeURIComponent(chSlug)}/pages`,
    );
    return body?.data || [];
  } catch {
    return [];
  }
}

export async function getGenres(): Promise<any[]> {
  try {
    const body = await localGet<{ ok: boolean; data: any[] }>('/api/v1/genres');
    return body?.data || [];
  } catch {
    return [];
  }
}

export async function getMediaByGenre(genreSlug: string, limit?: number): Promise<Media[]> {
  try {
    const qs = limit ? `?limit=${limit}` : '';
    const body = await localGet<{ ok: boolean; data: any[] }>(`/api/v1/genres/${encodeURIComponent(genreSlug)}${qs}`);
    return (body?.data || []).map(toMedia);
  } catch {
    return [];
  }
}

export async function getStudios(): Promise<any[]> {
  try {
    const body = await localGet<{ ok: boolean; data: any[] }>('/api/v1/studios');
    return body?.data || [];
  } catch {
    return [];
  }
}

export function isLocalApiEnabled(): boolean {
  return process.env.JAWATCH_USE_LOCAL_API === '1';
}

export { LOCAL_API_BASE, LocalApiError };
