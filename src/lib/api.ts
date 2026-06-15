const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Content {
  id: number;
  title: string;
  source_id: number;
  content_type: 'anime' | 'manga' | 'movie' | 'donghua' | 'comic' | 'novel' | 'other';
  description?: string;
  cover_url?: string;
  episode_count?: number;
  chapter_count?: number;
  status?: string;
  genres?: string;
  year?: number;
  rating?: number;
  scraped_at: string;
  last_scraped_at: string;
}

export interface Stream {
  id: number;
  content_id: number;
  episode: number;
  url: string;
  quality?: string;
  created_at: string;
}

export interface Download {
  id: number;
  content_id: number;
  episode: number;
  url: string;
  label?: string;
  created_at: string;
}

export interface Page {
  id: number;
  content_id: number;
  chapter: number;
  page_number: number;
  url: string;
  created_at: string;
}

async function fetchApi<T>(path: string, isArray: boolean = false): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 300 },
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`);
      return (isArray ? [] : {}) as unknown as T;
    }

    return res.json();
  } catch (error) {
    console.error(`API fetch failed:`, error);
    return (isArray ? [] : {}) as unknown as T;
  }
}

export interface PaginatedResponse<T> {
  total: number;
  limit: number;
  offset: number;
  items: T[];
}

export async function getContents(type?: string, limit?: number, offset?: number): Promise<PaginatedResponse<Content>> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (limit) params.set('limit', String(limit));
  if (offset) params.set('offset', String(offset));
  const query = params.toString();
  const path = `/api/contents${query ? `?${query}` : ''}`;
  return fetchApi(path, true);
}

export interface TrendingResponse {
  data: Content[];
  meta: {
    limit: number;
    total: number;
  };
  error: null;
}

export async function getTrending(type?: string, limit?: number): Promise<TrendingResponse> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);
  if (limit) params.set('limit', String(limit));
  const query = params.toString();
  const path = `/api/trending${query ? `?${query}` : ''}`;
  return fetchApi(path, false);
}

export async function getContent(id: number): Promise<Content> {
  return fetchApi(`/api/contents/${id}`, false);
}

export async function getStreams(contentId: number): Promise<Stream[]> {
  return fetchApi(`/api/contents/${contentId}/streams`, true);
}

export async function getDownloads(contentId: number): Promise<Download[]> {
  return fetchApi(`/api/contents/${contentId}/downloads`, true);
}

export async function getPages(contentId: number): Promise<Page[]> {
  return fetchApi(`/api/contents/${contentId}/pages`, true);
}

export interface FullContent extends Content {
  streams: Stream[];
  downloads: Download[];
  pages: Page[];
}

export async function getFullContent(contentId: number): Promise<FullContent> {
  return fetchApi(`/api/contents/${contentId}/full`, false);
}

export interface SearchResult {
  query: string;
  count: number;
  items: Content[];
}

export async function searchContents(query: string, limit?: number): Promise<SearchResult> {
  const params = new URLSearchParams();
  params.set('q', query);
  if (limit) params.set('limit', String(limit));
  return fetchApi(`/api/search?${params.toString()}`, true);
}
