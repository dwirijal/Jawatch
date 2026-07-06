const PROXY_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8484';
const SANKA_API_BASE = process.env.NEXT_PUBLIC_SANKA_API_URL || 'https://www.sankavollerei.web.id';
const USE_SANKA = process.env.NEXT_PUBLIC_USE_SANKA === '1';
const SANKA_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_SANKA_TIMEOUT_MS || 8000);
const EMPTY_DATE = '1970-01-01T00:00:00.000Z';

type MediaType = 'anime' | 'manga' | 'movie' | 'donghua' | 'comic' | 'novel';

type SankaRef = {
  type: MediaType;
  provider: string;
  slug: string;
};

class SankaTimeoutError extends Error {
  constructor(path: string) {
    super(`Sanka timeout: ${path}`);
    this.name = 'SankaTimeoutError';
  }
}

class SankaPreviewError extends Error {
  constructor(path: string, message: string) {
    super(`Sanka ${path}: ${message}`);
    this.name = 'SankaPreviewError';
  }
}

export interface Media {
  slug: string;
  type: MediaType;
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

function encodeSankaSlug(type: MediaType, provider: string, slug: string): string {
  return `${type}~${provider.replace(/~/g, '-')}~${sankaSlug(slug).replace(/~/g, '-')}`;
}

function decodeSankaSlug(slug: string): SankaRef | null {
  const parts = slug.split('~');
  if (parts.length < 3) return null;

  const [type, provider, ...rest] = parts;
  if (!['anime', 'manga', 'movie', 'donghua', 'comic', 'novel'].includes(type)) return null;
  if (!provider || rest.length === 0) return null;

  return {
    type: type as MediaType,
    provider,
    slug: rest.join('~'),
  };
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof SankaTimeoutError;
}

function toDate(value?: string | null): string {
  return value || EMPTY_DATE;
}

function toRating(value: unknown): { average: number; count: number } | undefined {
  const average = Number.parseFloat(String(value ?? ''));
  if (!Number.isFinite(average) || average <= 0) return undefined;
  return { average, count: 0 };
}

function mapGenres(list: any[] | undefined | null, key: 'title' | 'name' = 'title') {
  if (!Array.isArray(list)) return [];

  return list
    .map((item) => {
      const name = String(item?.[key] || '').trim();
      const slug = String(item?.genreId || item?.slug || item?.value || '').trim();
      if (!name || !slug) return null;
      return { slug, name };
    })
    .filter(Boolean) as { slug: string; name: string }[];
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function sankaSlug(value: string): string {
  return stripTrailingSlash(String(value || '').trim()).split('/').pop() || '';
}

function chapterNumberFromTitle(title?: string, fallback = 1): number {
  const match = title?.match(/(\d+(?:\.\d+)?)/);
  if (!match) return fallback;
  const parsed = Number.parseFloat(match[1]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function proxyReq<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${PROXY_API_BASE}${path}`, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const body = await res.json();
    if (!body.data) return [];
    return Array.isArray(body.data) ? body.data : [body.data];
  } catch (error) {
    console.error(`API err: ${path}`, error);
    return [];
  }
}

async function proxyGetMedia(type?: string, page?: number, limit?: number): Promise<{ data: Media[]; total: number; hasMore: boolean }> {
  const p = new URLSearchParams();
  if (type) p.set('type', type);
  if (page) p.set('page', String(page));
  if (limit) p.set('limit', String(limit));
  const data = await proxyReq<Media>(`/v1/jw/media?${p.toString()}`);
  return { data, total: data.length, hasMore: data.length === (limit || 20) };
}

async function proxyGetTrending(type?: string, limit?: number): Promise<Media[]> {
  const p = new URLSearchParams();
  if (type) p.set('type', type);
  if (limit) p.set('limit', String(limit));
  return proxyReq<Media>(`/v1/jw/media/trending?${p.toString()}`);
}

async function proxyGetPopular(limit?: number): Promise<Media[]> {
  const p = new URLSearchParams();
  if (limit) p.set('limit', String(limit));
  return proxyReq<Media>(`/v1/jw/media/popular?${p.toString()}`);
}

async function proxyGetLatest(type?: string, limit?: number): Promise<Media[]> {
  const p = new URLSearchParams();
  if (type) p.set('type', type);
  if (limit) p.set('limit', String(limit));
  return proxyReq<Media>(`/v1/jw/media/latest?${p.toString()}`);
}

async function proxyGetRandom(): Promise<Media | null> {
  const data = await proxyReq<Media>('/v1/jw/media/random');
  return data[0] || null;
}

async function proxyGetMediaBySlug(slug: string): Promise<Media | null> {
  const data = await proxyReq<Media>(`/v1/jw/media/${slug}`);
  return data[0] || null;
}

async function proxyGetGenres(): Promise<{ slug: string; name: string }[]> {
  return proxyReq<{ slug: string; name: string }>(`/v1/genres`);
}

async function proxyGetMediaByGenre(slug: string): Promise<Media[]> {
  return proxyReq<Media>(`/v1/genres/${slug}`);
}

async function proxyGetStudios(): Promise<{ slug: string; name: string }[]> { return proxyReq<{ slug: string; name: string }>(`/v1/studios`); }
async function proxyGetMediaByStudio(slug: string): Promise<Media[]> { return proxyReq<Media>(`/v1/studios/${slug}`); }
async function proxyGetAuthors(): Promise<{ slug: string; name: string }[]> { return proxyReq<{ slug: string; name: string }>(`/v1/authors`); }
async function proxyGetMediaByAuthor(slug: string): Promise<Media[]> { return proxyReq<Media>(`/v1/authors/${slug}`); }
async function proxyGetMediaRelated(slug: string): Promise<Media[]> { return proxyReq<Media>(`/v1/jw/media/${slug}/related`); }
async function proxyGetMediaReviews(slug: string): Promise<any[]> { return proxyReq<any>(`/v1/jw/media/${slug}/reviews`); }
async function proxyGetMediaComments(slug: string): Promise<any[]> { return proxyReq<any>(`/v1/jw/media/${slug}/comments`); }
async function proxyGetEpisodes(slug: string): Promise<Episode[]> { return proxyReq<Episode>(`/v1/jw/media/${slug}/episodes`); }
async function proxyGetEpisodeSources(slug: string, epSlug: string): Promise<EpisodeSource[]> { return proxyReq<EpisodeSource>(`/v1/jw/media/${slug}/episodes/${epSlug}/sources`); }
async function proxyGetChapters(slug: string): Promise<Chapter[]> { return proxyReq<Chapter>(`/v1/jw/media/${slug}/chapters`); }
async function proxyGetChapterPages(slug: string, chSlug: string): Promise<ChapterPage[]> { return proxyReq<ChapterPage>(`/v1/jw/media/${slug}/chapters/${chSlug}/pages`); }
async function proxySearchMedia(query: string, limit?: number): Promise<{ data: Media[]; total: number }> {
  const p = new URLSearchParams({ q: query });
  if (limit) p.set('limit', String(limit));
  const data = await proxyReq<Media>(`/v1/jw/search?${p.toString()}`);
  return { data, total: data.length };
}

async function fetchSankaJson(path: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SANKA_TIMEOUT_MS);

  try {
    const res = await fetch(`${SANKA_API_BASE}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      next: { revalidate: 300 },
    });

    const text = await res.text();
    let body: any = null;

    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      throw new SankaPreviewError(path, `non-JSON response (${res.status})`);
    }

    if (!res.ok) {
      throw new SankaPreviewError(path, body?.message || body?.errors?.message || `HTTP ${res.status}`);
    }

    return body;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new SankaTimeoutError(path);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function unwrapSanka(path: string, body: any) {
  const isSuccess =
    body?.status === 'success' ||
    body?.success === true ||
    body?.status === true ||
    body?.ok === true;

  if (!isSuccess) {
    throw new SankaPreviewError(path, body?.message || body?.errors?.message || 'unexpected envelope');
  }

  return body;
}

async function useSankaOrProxy<T>(sankaFn: () => Promise<T>, proxyFn: () => Promise<T>): Promise<T> {
  if (!USE_SANKA) return proxyFn();

  try {
    return await sankaFn();
  } catch (error) {
    if (isTimeoutError(error)) {
      return proxyFn();
    }
    throw error;
  }
}

function baseMedia(type: MediaType, slug: string, title: string, coverImage?: string): Media {
  return {
    slug,
    type,
    title,
    coverImage,
    createdAt: EMPTY_DATE,
    updatedAt: EMPTY_DATE,
  };
}

function mapAnimeListItem(item: any): Media {
  return {
    ...baseMedia('anime', encodeSankaSlug('anime', 'anime', item.animeId), item.title, item.poster),
    status: item.status,
    rating: toRating(item.score),
    genres: mapGenres(item.genreList),
  };
}

function mapDonghuaListItem(item: any): Media {
  return {
    ...baseMedia('donghua', encodeSankaSlug('donghua', 'donghub', item.slug), item.title, item.poster),
    status: item.status,
  };
}

function mapComicListItem(item: any, provider = 'komikstation'): Media {
  return {
    ...baseMedia('comic', encodeSankaSlug('comic', provider, item.slug), item.title, item.image || item.imageSrc || item.thumbnail),
    status: item.status,
    rating: toRating(item.rating),
  };
}

function mapAnimeDetail(ref: SankaRef, payload: any): Media {
  const data = unwrapSanka(`/anime/anime/${ref.slug}`, payload).data;
  return {
    ...baseMedia('anime', encodeSankaSlug('anime', ref.provider, ref.slug), data.title, data.poster),
    alternativeTitles: data.japanese ? [data.japanese] : null,
    synopsis: Array.isArray(data.synopsis?.paragraphs) ? data.synopsis.paragraphs.join('\n\n') : '',
    status: data.status,
    rating: toRating(data.score),
    genres: mapGenres(data.genreList),
    studios: data.studios ? [{ slug: String(data.studios).toLowerCase().replace(/\s+/g, '-'), name: data.studios }] : null,
  };
}

function mapDonghuaDetail(ref: SankaRef, payload: any): Media {
  const data = unwrapSanka(`/anime/donghub/detail/${ref.slug}`, payload).data;
  return {
    ...baseMedia('donghua', encodeSankaSlug('donghua', ref.provider, ref.slug), data.title, data.poster),
    synopsis: data.synopsis,
    status: data.info?.status,
    genres: mapGenres(data.genres, 'name'),
    studios: data.info?.studio ? [{ slug: String(data.info.studio).toLowerCase().replace(/\s+/g, '-'), name: data.info.studio }] : null,
  };
}

function mapComicDetail(ref: SankaRef, payload: any): Media {
  const data = ref.provider === 'komikstation'
    ? unwrapSanka(`/comic/komikstation/manga/${ref.slug}`, payload)
    : payload;

  return {
    ...baseMedia('comic', encodeSankaSlug('comic', ref.provider, ref.slug), data.title, data.image || data.imageSrc),
    alternativeTitles: data.alternative ? [data.alternative] : data.title_indonesian ? [data.title_indonesian] : null,
    synopsis: data.synopsis || data.synopsis_full || data.summary,
    status: data.status,
    rating: toRating(data.rating),
    genres: mapGenres(data.genres, 'name'),
    authors: data.author ? [{ slug: String(data.author).toLowerCase().replace(/\s+/g, '-'), name: data.author }] : null,
  };
}

function mapAnimeGenreItem(item: any): Media {
  return {
    ...baseMedia('anime', encodeSankaSlug('anime', 'anime', item.animeId), item.title, item.poster),
    status: item.status,
    rating: toRating(item.score),
    genres: mapGenres(item.genreList),
  };
}

function normalizeComicGenreSlug(link: string): string {
  const trimmed = stripTrailingSlash(link);
  return trimmed.split('/').pop() || trimmed;
}

function mapComicGenreItem(item: any): Media {
  const slug = normalizeComicGenreSlug(item.link || '');
  return {
    ...baseMedia('comic', encodeSankaSlug('comic', 'generic', slug), item.title, item.image),
    status: item.status,
    genres: item.genre ? [{ slug: String(item.genre).toLowerCase(), name: item.genre }] : [],
  };
}

async function getSankaMediaByType(type: MediaType, limit?: number): Promise<Media[]> {
  switch (type) {
    case 'anime': {
      const body = unwrapSanka('/anime/home', await fetchSankaJson('/anime/home'));
      const ongoing = Array.isArray(body.data?.ongoing?.animeList) ? body.data.ongoing.animeList : [];
      const completed = Array.isArray(body.data?.completed?.animeList) ? body.data.completed.animeList : [];
      return [...ongoing, ...completed].map(mapAnimeListItem).slice(0, limit || 20);
    }
    case 'donghua': {
      const body = unwrapSanka('/anime/donghub/list', await fetchSankaJson('/anime/donghub/list'));
      return (Array.isArray(body.data) ? body.data : []).map(mapDonghuaListItem).slice(0, limit || 20);
    }
    case 'comic': {
      const body = unwrapSanka('/comic/komikstation/list', await fetchSankaJson('/comic/komikstation/list'));
      return (Array.isArray(body.results) ? body.results : []).map((item: any) => mapComicListItem(item, 'komikstation')).slice(0, limit || 20);
    }
    default:
      return [];
  }
}

async function proxySupplementTypes(limit?: number) {
  const { data } = await proxyGetMedia(undefined, 1, limit || 20);
  return data.filter((item) => item.type === 'movie' || item.type === 'novel');
}

export async function getMedia(type?: string, page?: number, limit?: number): Promise<{ data: Media[]; total: number; hasMore: boolean }> {
  if (!USE_SANKA) return proxyGetMedia(type, page, limit);

  if (type === 'movie' || type === 'novel' || type === 'manga') {
    return proxyGetMedia(type, page, limit);
  }

  return useSankaOrProxy(async () => {
    const perTypeLimit = Math.max(1, Math.ceil((limit || 20) / 3));

    if (type) {
      const data = await getSankaMediaByType(type as MediaType, limit);
      return { data, total: data.length, hasMore: data.length === (limit || 20) };
    }

    const [anime, donghua, comic, proxyExtras] = await Promise.all([
      getSankaMediaByType('anime', perTypeLimit),
      getSankaMediaByType('donghua', perTypeLimit),
      getSankaMediaByType('comic', perTypeLimit),
      proxySupplementTypes(perTypeLimit),
    ]);

    const data = [...anime, ...donghua, ...comic, ...proxyExtras].slice(0, limit || 20);
    return { data, total: data.length, hasMore: data.length === (limit || 20) };
  }, () => proxyGetMedia(type, page, limit));
}

export async function getTrending(type?: string, limit?: number): Promise<Media[]> {
  if (!USE_SANKA || type === 'movie' || type === 'novel' || type === 'manga') {
    return proxyGetTrending(type, limit);
  }

  return useSankaOrProxy(async () => {
    const { data } = await getMedia(type, 1, limit || 20);
    return data;
  }, () => proxyGetTrending(type, limit));
}

export async function getPopular(limit?: number): Promise<Media[]> {
  if (!USE_SANKA) return proxyGetPopular(limit);

  return useSankaOrProxy(async () => {
    const [comicBody, proxyExtras] = await Promise.all([
      fetchSankaJson('/comic/mangasusuku/popular').then((body) => unwrapSanka('/comic/mangasusuku/popular', body)),
      proxySupplementTypes(limit),
    ]);

    const comics = (Array.isArray(comicBody.mangaList) ? comicBody.mangaList : []).map((item: any) => {
      const slug = String(item.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return mapComicListItem({ ...item, slug }, 'mangasusuku');
    });

    return [...comics, ...proxyExtras].slice(0, limit || 20);
  }, () => proxyGetPopular(limit));
}

export async function getLatest(type?: string, limit?: number): Promise<Media[]> {
  if (!USE_SANKA || type === 'movie' || type === 'novel' || type === 'manga') {
    return proxyGetLatest(type, limit);
  }

  return useSankaOrProxy(async () => {
    if (type === 'comic') {
      const body = unwrapSanka('/comic/mangasusuku/latest', await fetchSankaJson('/comic/mangasusuku/latest'));
      return (Array.isArray(body.mangaList) ? body.mangaList : []).map((item: any) => {
        const slug = String(item.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return mapComicListItem({ ...item, slug }, 'mangasusuku');
      }).slice(0, limit || 20);
    }

    if (type === 'donghua') {
      const body = unwrapSanka('/anime/donghub/latest', await fetchSankaJson('/anime/donghub/latest'));
      const list = Array.isArray(body.data) ? body.data : Array.isArray(body.latest_release) ? body.latest_release : [];
      return list.map((item: any) => ({
        ...baseMedia('donghua', encodeSankaSlug('donghua', 'donghub', item.slug), item.title, item.poster),
        status: item.status,
      })).slice(0, limit || 20);
    }

    const { data } = await getMedia(type, 1, limit || 20);
    return data;
  }, () => proxyGetLatest(type, limit));
}

export async function getRandom(): Promise<Media | null> {
  if (!USE_SANKA) return proxyGetRandom();

  return useSankaOrProxy(async () => {
    const { data } = await getMedia(undefined, 1, 24);
    if (data.length === 0) return null;
    return data[Math.floor(Math.random() * data.length)] || null;
  }, () => proxyGetRandom());
}

export async function getMediaBySlug(slug: string): Promise<Media | null> {
  const ref = decodeSankaSlug(slug);
  if (!USE_SANKA || !ref) return proxyGetMediaBySlug(slug);

  return useSankaOrProxy(async () => {
    if (ref.type === 'anime') {
      return mapAnimeDetail(ref, await fetchSankaJson(`/anime/anime/${ref.slug}`));
    }

    if (ref.type === 'donghua') {
      return mapDonghuaDetail(ref, await fetchSankaJson(`/anime/donghub/detail/${ref.slug}`));
    }

    if (ref.type === 'comic') {
      if (ref.provider === 'komikstation') {
        return mapComicDetail(ref, await fetchSankaJson(`/comic/komikstation/manga/${ref.slug}`));
      }

      if (ref.provider === 'generic') {
        return mapComicDetail(ref, await fetchSankaJson(`/comic/comic/${ref.slug}`));
      }

      if (ref.provider === 'mangasusuku') {
        return mapComicDetail(ref, await fetchSankaJson(`/comic/mangasusuku/detail/${ref.slug}`));
      }
    }

    return proxyGetMediaBySlug(slug);
  }, () => proxyGetMediaBySlug(slug));
}

export async function getGenres(): Promise<{ slug: string; name: string }[]> {
  if (!USE_SANKA) return proxyGetGenres();

  return useSankaOrProxy(async () => {
    const [animeBody, comicBody] = await Promise.all([
      unwrapSanka('/anime/genre', await fetchSankaJson('/anime/genre')),
      fetchSankaJson('/comic/genres'),
    ]);

    const genres = new Map<string, { slug: string; name: string }>();
    mapGenres(animeBody.data?.genreList).forEach((genre) => genres.set(genre.slug, genre));

    Object.values(comicBody || {}).forEach((item: any) => {
      const slug = String(item?.value || '').trim();
      const name = String(item?.name || '').trim();
      if (slug && name && !genres.has(slug)) {
        genres.set(slug, { slug, name });
      }
    });

    return Array.from(genres.values());
  }, () => proxyGetGenres());
}

export async function getMediaByGenre(slug: string): Promise<Media[]> {
  if (!USE_SANKA) return proxyGetMediaByGenre(slug);

  return useSankaOrProxy(async () => {
    const [animeBody, comicBody, proxyItems] = await Promise.all([
      fetchSankaJson(`/anime/genre/${slug}`),
      fetchSankaJson(`/comic/genre/${slug}`),
      proxyGetMediaByGenre(slug),
    ]);

    const animeData = unwrapSanka(`/anime/genre/${slug}`, animeBody).data;
    const animeItems = (Array.isArray(animeData?.animeList) ? animeData.animeList : []).map(mapAnimeGenreItem);

    const comicItems = (Array.isArray(comicBody?.comics) ? comicBody.comics : []).map(mapComicGenreItem);
    const proxyExtras = proxyItems.filter((item) => item.type === 'movie' || item.type === 'novel');

    return [...animeItems, ...comicItems, ...proxyExtras];
  }, () => proxyGetMediaByGenre(slug));
}

export async function getStudios(): Promise<{ slug: string; name: string }[]> { return proxyGetStudios(); }
export async function getMediaByStudio(slug: string): Promise<Media[]> { return proxyGetMediaByStudio(slug); }
export async function getAuthors(): Promise<{ slug: string; name: string }[]> { return proxyGetAuthors(); }
export async function getMediaByAuthor(slug: string): Promise<Media[]> { return proxyGetMediaByAuthor(slug); }
export async function getMediaRelated(slug: string): Promise<Media[]> {
  if (decodeSankaSlug(slug)) return [];
  return proxyGetMediaRelated(slug);
}
export async function getMediaReviews(slug: string): Promise<any[]> {
  if (decodeSankaSlug(slug)) return [];
  return proxyGetMediaReviews(slug);
}
export async function getMediaComments(slug: string): Promise<any[]> {
  if (decodeSankaSlug(slug)) return [];
  return proxyGetMediaComments(slug);
}

export async function getEpisodes(slug: string): Promise<Episode[]> {
  const ref = decodeSankaSlug(slug);
  if (!USE_SANKA || !ref) return proxyGetEpisodes(slug);

  return useSankaOrProxy(async () => {
    if (ref.type === 'anime') {
      const body = unwrapSanka(`/anime/anime/${ref.slug}`, await fetchSankaJson(`/anime/anime/${ref.slug}`));
      return (Array.isArray(body.data?.episodeList) ? body.data.episodeList : []).map((item: any, index: number) => ({
        slug: item.episodeId,
        episodeNumber: Number(item.eps ?? index + 1) || index + 1,
        title: item.title,
        createdAt: EMPTY_DATE,
      }));
    }

    if (ref.type === 'donghua') {
      const body = unwrapSanka(`/anime/donghub/detail/${ref.slug}`, await fetchSankaJson(`/anime/donghub/detail/${ref.slug}`));
      return (Array.isArray(body.data?.episodes) ? body.data.episodes : []).map((item: any, index: number) => ({
        slug: item.slug,
        episodeNumber: Number(item.episode ?? index + 1) || index + 1,
        title: item.title,
        createdAt: EMPTY_DATE,
      }));
    }

    return proxyGetEpisodes(slug);
  }, () => proxyGetEpisodes(slug));
}

export async function getEpisodeSources(slug: string, epSlug: string): Promise<EpisodeSource[]> {
  const ref = decodeSankaSlug(slug);
  if (!USE_SANKA || !ref) return proxyGetEpisodeSources(slug, epSlug);

  return useSankaOrProxy(async () => {
    if (ref.type === 'anime') {
      const body = unwrapSanka(`/anime/episode/${epSlug}`, await fetchSankaJson(`/anime/episode/${epSlug}`));
      const sources: EpisodeSource[] = [];

      if (body.data?.defaultStreamingUrl) {
        sources.push({ url: body.data.defaultStreamingUrl, label: 'Default', quality: 'auto' });
      }

      return sources;
    }

    if (ref.type === 'donghua') {
      const body = unwrapSanka(`/anime/donghub/episode/${epSlug}`, await fetchSankaJson(`/anime/donghub/episode/${epSlug}`));
      return (Array.isArray(body.data?.streams) ? body.data.streams : [])
        .filter((item: any) => item?.url)
        .map((item: any) => ({
          url: item.url,
          label: item.server,
          quality: item.server,
        }));
    }

    return proxyGetEpisodeSources(slug, epSlug);
  }, () => proxyGetEpisodeSources(slug, epSlug));
}

export async function getChapters(slug: string): Promise<Chapter[]> {
  const ref = decodeSankaSlug(slug);
  if (!USE_SANKA || !ref) return proxyGetChapters(slug);

  return useSankaOrProxy(async () => {
    if (ref.type !== 'comic') {
      return proxyGetChapters(slug);
    }

    if (ref.provider === 'komikstation') {
      const body = unwrapSanka(`/comic/komikstation/manga/${ref.slug}`, await fetchSankaJson(`/comic/komikstation/manga/${ref.slug}`));
      return (Array.isArray(body.chapters) ? body.chapters : []).map((item: any, index: number) => ({
        slug: stripTrailingSlash(item.slug),
        chapterNumber: chapterNumberFromTitle(item.title, index + 1),
        title: item.title,
        createdAt: toDate(item.date),
      }));
    }

    if (ref.provider === 'generic') {
      const body = await fetchSankaJson(`/comic/comic/${ref.slug}`);
      return (Array.isArray(body.chapters) ? body.chapters : []).map((item: any, index: number) => ({
        slug: stripTrailingSlash(item.slug),
        chapterNumber: chapterNumberFromTitle(item.chapter, index + 1),
        title: item.chapter,
        createdAt: toDate(item.date),
      }));
    }

    if (ref.provider === 'mangasusuku') {
      const body = unwrapSanka(`/comic/mangasusuku/detail/${ref.slug}`, await fetchSankaJson(`/comic/mangasusuku/detail/${ref.slug}`));
      return (Array.isArray(body.chapters) ? body.chapters : []).map((item: any, index: number) => ({
        slug: stripTrailingSlash(item.slug),
        chapterNumber: chapterNumberFromTitle(item.title, index + 1),
        title: item.title,
        createdAt: toDate(item.date),
      }));
    }

    return proxyGetChapters(slug);
  }, () => proxyGetChapters(slug));
}

export async function getChapterPages(slug: string, chSlug: string): Promise<ChapterPage[]> {
  const ref = decodeSankaSlug(slug);
  if (!USE_SANKA || !ref) return proxyGetChapterPages(slug, chSlug);

  return useSankaOrProxy(async () => {
    if (ref.type !== 'comic') {
      return proxyGetChapterPages(slug, chSlug);
    }

    if (ref.provider === 'komikstation') {
      const body = unwrapSanka(`/comic/komikstation/chapter/${chSlug}`, await fetchSankaJson(`/comic/komikstation/chapter/${chSlug}`));
      return (Array.isArray(body.images) ? body.images : []).map((url: string, index: number) => ({
        url,
        pageNumber: index + 1,
      }));
    }

    if (ref.provider === 'generic') {
      const body = await fetchSankaJson(`/comic/chapter/${chSlug}`);
      return (Array.isArray(body.images) ? body.images : []).map((url: string, index: number) => ({
        url,
        pageNumber: index + 1,
      }));
    }

    if (ref.provider === 'mangasusuku') {
      const body = unwrapSanka(`/comic/mangasusuku/chapter/${chSlug}`, await fetchSankaJson(`/comic/mangasusuku/chapter/${chSlug}`));
      return (Array.isArray(body.images) ? body.images : []).map((url: string, index: number) => ({
        url,
        pageNumber: index + 1,
      }));
    }

    return proxyGetChapterPages(slug, chSlug);
  }, () => proxyGetChapterPages(slug, chSlug));
}

export async function searchMedia(query: string, limit?: number): Promise<{ data: Media[]; total: number }> {
  if (!USE_SANKA) return proxySearchMedia(query, limit);

  return useSankaOrProxy(async () => {
    const encoded = encodeURIComponent(query);
    const [animeBody, comicBody, proxyResult] = await Promise.all([
      fetchSankaJson(`/anime/search/${encoded}`),
      fetchSankaJson(`/comic/komikstation/search/${encoded}/1`),
      proxySearchMedia(query, limit),
    ]);

    const anime = (Array.isArray(animeBody?.data?.animeList) ? animeBody.data.animeList : []).map(mapAnimeListItem);
    const comic = (Array.isArray(comicBody?.seriesList) ? comicBody.seriesList : []).map((item: any) => mapComicListItem(item, 'komikstation'));
    const proxyExtras = proxyResult.data.filter((item) => item.type === 'movie' || item.type === 'novel');
    const data = [...anime, ...comic, ...proxyExtras].slice(0, limit || 20);

    return { data, total: data.length };
  }, () => proxySearchMedia(query, limit));
}
