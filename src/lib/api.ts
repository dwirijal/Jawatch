const MEDIA_API_BASE = stripTrailingSlash(process.env.JAWATCH_MEDIA_API_URL || 'http://localhost:8484');
const MEDIA_API_TIMEOUT_MS = Number(process.env.JAWATCH_MEDIA_API_TIMEOUT_MS || 8000);
const EMPTY_DATE = '1970-01-01T00:00:00.000Z';

type MediaType = 'anime' | 'manga' | 'movie' | 'donghua' | 'comic' | 'novel';

type MediaRef = {
  type: MediaType;
  provider: string;
  slug: string;
};

class MediaApiTimeoutError extends Error {
  constructor() {
    super('Media source timeout');
    this.name = 'MediaApiTimeoutError';
  }
}

class MediaApiError extends Error {
  constructor(message = 'Media source unavailable') {
    super(message);
    this.name = 'MediaApiError';
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

function encodeMediaRef(type: MediaType, provider: string, slug: string): string {
  return `m~${Buffer.from(JSON.stringify({ type, provider, slug: endpointSlug(slug) })).toString('base64url')}`;
}

function decodeMediaRef(value: string): MediaRef | null {
  if (value.startsWith('m~')) {
    try {
      const parsed = JSON.parse(Buffer.from(value.slice(2), 'base64url').toString('utf8'));
      if (!['anime', 'manga', 'movie', 'donghua', 'comic', 'novel'].includes(parsed?.type)) return null;
      if (typeof parsed.provider !== 'string' || typeof parsed.slug !== 'string') return null;
      return { type: parsed.type as MediaType, provider: parsed.provider, slug: parsed.slug };
    } catch {
      return null;
    }
  }

  const parts = value.split('~');
  if (parts.length < 3) return null;

  const [type, provider, ...rest] = parts;
  if (!['anime', 'manga', 'movie', 'donghua', 'comic', 'novel'].includes(type)) return null;
  if (!provider || rest.length === 0) return null;

  return { type: type as MediaType, provider, slug: rest.join('~') };
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof MediaApiTimeoutError;
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

function endpointSlug(value: string): string {
  return stripTrailingSlash(String(value || '').trim()).split('/').pop() || '';
}

function chapterNumberFromTitle(title?: string, fallback = 1): number {
  const match = title?.match(/(\d+(?:\.\d+)?)/);
  if (!match) return fallback;
  const parsed = Number.parseFloat(match[1]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function fetchUpstreamJson(path: string) {
  if (!MEDIA_API_BASE) throw new MediaApiError();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MEDIA_API_TIMEOUT_MS);

  try {
    const res = await fetch(`${MEDIA_API_BASE}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      next: { revalidate: 300 },
    });

    const text = await res.text();
    let body: any = null;

    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      throw new MediaApiError('Media source returned an invalid response');
    }

    if (!res.ok) {
      throw new MediaApiError();
    }

    return body;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new MediaApiTimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function unwrapUpstreamEnvelope(path: string, body: any) {
  const isSuccess =
    body?.status === 'success' ||
    body?.success === true ||
    body?.status === true ||
    body?.ok === true;

  if (!isSuccess) {
    throw new MediaApiError('Unexpected media source envelope');
  }

  return body;
}

function emptyMediaListOnSourceError(error: unknown): Media[] {
  if (error instanceof MediaApiTimeoutError || error instanceof MediaApiError) return [];
  throw error;
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
    ...baseMedia('anime', encodeMediaRef('anime', 'anime', item.animeId), item.title, item.poster),
    status: item.status,
    rating: toRating(item.score),
    genres: mapGenres(item.genreList),
  };
}

function mapDonghuaListItem(item: any): Media {
  return {
    ...baseMedia('donghua', encodeMediaRef('donghua', 'donghub', item.slug), item.title, item.poster),
    status: item.status,
  };
}

function mapComicListItem(item: any, provider = 'komikstation'): Media {
  return {
    ...baseMedia('comic', encodeMediaRef('comic', provider, item.slug), item.title, item.image || item.imageSrc || item.thumbnail),
    status: item.status,
    rating: toRating(item.rating),
  };
}

function mapAnimeDetail(ref: MediaRef, payload: any): Media {
  const data = unwrapUpstreamEnvelope(`/anime/anime/${ref.slug}`, payload).data;
  return {
    ...baseMedia('anime', encodeMediaRef('anime', ref.provider, ref.slug), data.title, data.poster),
    alternativeTitles: data.japanese ? [data.japanese] : null,
    synopsis: Array.isArray(data.synopsis?.paragraphs) ? data.synopsis.paragraphs.join('\n\n') : '',
    status: data.status,
    rating: toRating(data.score),
    genres: mapGenres(data.genreList),
    studios: data.studios ? [{ slug: String(data.studios).toLowerCase().replace(/\s+/g, '-'), name: data.studios }] : null,
  };
}

function mapDonghuaDetail(ref: MediaRef, payload: any): Media {
  const data = unwrapUpstreamEnvelope(`/anime/donghub/detail/${ref.slug}`, payload).data;
  return {
    ...baseMedia('donghua', encodeMediaRef('donghua', ref.provider, ref.slug), data.title, data.poster),
    synopsis: data.synopsis,
    status: data.info?.status,
    genres: mapGenres(data.genres, 'name'),
    studios: data.info?.studio ? [{ slug: String(data.info.studio).toLowerCase().replace(/\s+/g, '-'), name: data.info.studio }] : null,
  };
}

function mapComicDetail(ref: MediaRef, payload: any): Media {
  const data = ref.provider === 'komikstation'
    ? unwrapUpstreamEnvelope(`/comic/komikstation/manga/${ref.slug}`, payload)
    : payload;

  return {
    ...baseMedia('comic', encodeMediaRef('comic', ref.provider, ref.slug), data.title, data.image || data.imageSrc),
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
    ...baseMedia('anime', encodeMediaRef('anime', 'anime', item.animeId), item.title, item.poster),
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
    ...baseMedia('comic', encodeMediaRef('comic', 'generic', slug), item.title, item.image),
    status: item.status,
    genres: item.genre ? [{ slug: String(item.genre).toLowerCase(), name: item.genre }] : [],
  };
}

async function getUpstreamMediaByType(type: MediaType, limit?: number): Promise<Media[]> {
  switch (type) {
    case 'anime': {
      const body = unwrapUpstreamEnvelope('/anime/home', await fetchUpstreamJson('/anime/home'));
      const ongoing = Array.isArray(body.data?.ongoing?.animeList) ? body.data.ongoing.animeList : [];
      const completed = Array.isArray(body.data?.completed?.animeList) ? body.data.completed.animeList : [];
      return [...ongoing, ...completed].map(mapAnimeListItem).slice(0, limit || 20);
    }
    case 'donghua': {
      const body = unwrapUpstreamEnvelope('/anime/donghub/list', await fetchUpstreamJson('/anime/donghub/list'));
      return (Array.isArray(body.data) ? body.data : []).map(mapDonghuaListItem).slice(0, limit || 20);
    }
    case 'comic': {
      const body = unwrapUpstreamEnvelope('/comic/komikstation/list', await fetchUpstreamJson('/comic/komikstation/list'));
      return (Array.isArray(body.results) ? body.results : []).map((item: any) => mapComicListItem(item, 'komikstation')).slice(0, limit || 20);
    }
    default:
      return [];
  }
}

function emptyMediaPage(): { data: Media[]; total: number; hasMore: boolean } {
  return { data: [], total: 0, hasMore: false };
}

function slugFromTitle(title: string): string {
  return String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function firstArray(...values: any[]): any[] {
  for (const value of values) if (Array.isArray(value)) return value;
  return [];
}

async function getComicRecommendations(limit?: number): Promise<Media[]> {
  const body = await fetchUpstreamJson('/comic/komikstation/recommendation');
  return firstArray(body.results, body.recommendations, body.mangaList, body.data)
    .map((item: any) => mapComicListItem(item, 'komikstation'))
    .slice(0, limit || 20);
}

async function getTopWeeklyComics(limit?: number): Promise<Media[]> {
  const body = await fetchUpstreamJson('/comic/komikstation/top-weekly');
  return firstArray(body.results, body.mangaList, body.data)
    .map((item: any) => mapComicListItem(item, 'komikstation'))
    .slice(0, limit || 20);
}

export async function getMedia(type?: string, page?: number, limit?: number): Promise<{ data: Media[]; total: number; hasMore: boolean }> {
  try {
    const size = limit || 20;

    if (type) {
      const data = await getUpstreamMediaByType(type as MediaType, size);
      return { data, total: data.length, hasMore: false };
    }

    const perTypeLimit = Math.max(1, Math.ceil(size / 3));
    const [anime, donghua, comic] = await Promise.all([
      getUpstreamMediaByType('anime', perTypeLimit),
      getUpstreamMediaByType('donghua', perTypeLimit),
      getUpstreamMediaByType('comic', perTypeLimit),
    ]);

    const data = [...anime, ...donghua, ...comic].slice(0, size);
    return { data, total: data.length, hasMore: false };
  } catch (error) {
    if (error instanceof MediaApiTimeoutError || error instanceof MediaApiError) return emptyMediaPage();
    throw error;
  }
}

export async function getPopular(limit?: number): Promise<Media[]> {
  try {
    const size = limit || 20;
    const [weekly, recommendations, popularBody] = await Promise.all([
      getTopWeeklyComics(Math.ceil(size / 3)),
      getComicRecommendations(Math.ceil(size / 3)),
      fetchUpstreamJson('/comic/mangasusuku/popular'),
    ]);

    const popular = firstArray(popularBody.mangaList, popularBody.results, popularBody.data).map((item: any) => {
      const slug = item.slug || slugFromTitle(item.title);
      return mapComicListItem({ ...item, slug }, 'mangasusuku');
    });

    return [...weekly, ...recommendations, ...popular].slice(0, size);
  } catch (error) {
    if (error instanceof MediaApiTimeoutError || error instanceof MediaApiError) return [];
    throw error;
  }
}

export async function getTrending(type?: string, limit?: number): Promise<Media[]> {
  if (type) return getMedia(type, 1, limit || 20).then((result) => result.data);
  return getPopular(limit);
}

export async function getLatest(type?: string, limit?: number): Promise<Media[]> {
  try {
    if (type === 'comic') {
      const body = unwrapUpstreamEnvelope('/comic/mangasusuku/latest', await fetchUpstreamJson('/comic/mangasusuku/latest'));
      return (Array.isArray(body.mangaList) ? body.mangaList : []).map((item: any) => {
        const slug = item.slug || slugFromTitle(item.title);
        return mapComicListItem({ ...item, slug }, 'mangasusuku');
      }).slice(0, limit || 20);
    }

    if (type === 'donghua') {
      const body = unwrapUpstreamEnvelope('/anime/donghub/latest', await fetchUpstreamJson('/anime/donghub/latest'));
      const list = Array.isArray(body.data) ? body.data : Array.isArray(body.latest_release) ? body.latest_release : [];
      return list.map((item: any) => ({
        ...baseMedia('donghua', encodeMediaRef('donghua', 'donghub', item.slug), item.title, item.poster),
        status: item.status,
      })).slice(0, limit || 20);
    }

    const { data } = await getMedia(type, 1, limit || 20);
    return data;
  } catch (error) {
    if (error instanceof MediaApiTimeoutError || error instanceof MediaApiError) return [];
    throw error;
  }
}

export async function getRandom(): Promise<Media | null> {
  const { data } = await getMedia(undefined, 1, 24);
  if (data.length === 0) return null;
  return data[Math.floor(Math.random() * data.length)] || null;
}

export async function getMediaBySlug(slug: string): Promise<Media | null> {
  const ref = decodeMediaRef(slug);
  if (!ref) return null;

  if (ref.type === 'anime') return mapAnimeDetail(ref, await fetchUpstreamJson(`/anime/anime/${ref.slug}`));
  if (ref.type === 'donghua') return mapDonghuaDetail(ref, await fetchUpstreamJson(`/anime/donghub/detail/${ref.slug}`));

  if (ref.type === 'comic') {
    if (ref.provider === 'komikstation') return mapComicDetail(ref, await fetchUpstreamJson(`/comic/komikstation/manga/${ref.slug}`));
    if (ref.provider === 'generic') return mapComicDetail(ref, await fetchUpstreamJson(`/comic/comic/${ref.slug}`));
    if (ref.provider === 'mangasusuku') return mapComicDetail(ref, await fetchUpstreamJson(`/comic/mangasusuku/detail/${ref.slug}`));
  }

  return null;
}

export async function getGenres(): Promise<{ slug: string; name: string }[]> {
  try {
    const [animeBody, comicBody] = await Promise.all([
      unwrapUpstreamEnvelope('/anime/genre', await fetchUpstreamJson('/anime/genre')),
      fetchUpstreamJson('/comic/genres'),
    ]);

    const genres = new Map<string, { slug: string; name: string }>();
    mapGenres(animeBody.data?.genreList).forEach((genre) => genres.set(genre.slug, genre));

    Object.values(comicBody || {}).forEach((item: any) => {
      const slug = String(item?.value || '').trim();
      const name = String(item?.name || '').trim();
      if (slug && name && !genres.has(slug)) genres.set(slug, { slug, name });
    });

    return Array.from(genres.values());
  } catch (error) {
    if (error instanceof MediaApiTimeoutError || error instanceof MediaApiError) return [];
    throw error;
  }
}

export async function getMediaByGenre(slug: string): Promise<Media[]> {
  const [animeBody, comicBody] = await Promise.all([
    fetchUpstreamJson(`/anime/genre/${slug}`),
    fetchUpstreamJson(`/comic/genre/${slug}`),
  ]);

  const animeData = unwrapUpstreamEnvelope(`/anime/genre/${slug}`, animeBody).data;
  const animeItems = (Array.isArray(animeData?.animeList) ? animeData.animeList : []).map(mapAnimeGenreItem);
  const comicItems = (Array.isArray(comicBody?.comics) ? comicBody.comics : []).map(mapComicGenreItem);

  return [...animeItems, ...comicItems];
}

export async function getStudios(): Promise<{ slug: string; name: string }[]> {
  try {
    const body = unwrapUpstreamEnvelope('/anime/animekompi/studios', await fetchUpstreamJson('/anime/animekompi/studios'));
    return (Array.isArray(body.data) ? body.data : [])
      .map((item: any) => ({ slug: String(item?.value || '').trim(), name: String(item?.name || '').trim() }))
      .filter((item: any) => item.slug && item.name);
  } catch (error) {
    if (error instanceof MediaApiTimeoutError || error instanceof MediaApiError) return [];
    throw error;
  }
}
export async function getMediaByStudio(slug: string): Promise<Media[]> {
  try {
    const body = unwrapUpstreamEnvelope(`/anime/animekompi/studio/${slug}`, await fetchUpstreamJson(`/anime/animekompi/studio/${slug}`));
    return (Array.isArray(body.data) ? body.data : []).map(mapAnimeListItem);
  } catch (error) {
    if (error instanceof MediaApiTimeoutError || error instanceof MediaApiError) return [];
    throw error;
  }
}
export async function getAuthors(): Promise<{ slug: string; name: string }[]> { return []; }
export async function getMediaByAuthor(slug: string): Promise<Media[]> { return []; }
export async function getMediaRelated(slug: string): Promise<Media[]> {
  const current = await getMediaBySlug(slug);
  if (!current) return [];
  const genres = current.genres?.map(g => g.slug).filter(Boolean) || [];
  const pools = await Promise.all(genres.slice(0, 3).map((genre) => getMediaByGenre(genre).catch(() => [])));
  const seen = new Set([current.slug]);
  const out: Media[] = [];
  for (const item of pools.flat()) {
    if (seen.has(item.slug) || item.type !== current.type) continue;
    seen.add(item.slug);
    out.push(item);
    if (out.length >= 12) break;
  }
  return out;
}
export async function getMediaReviews(slug: string): Promise<any[]> { return []; }
export async function getMediaComments(slug: string): Promise<any[]> { return []; }

export async function getEpisodes(slug: string): Promise<Episode[]> {
  const ref = decodeMediaRef(slug);
  if (!ref) return [];

  if (ref.type === 'anime') {
    const body = unwrapUpstreamEnvelope(`/anime/anime/${ref.slug}`, await fetchUpstreamJson(`/anime/anime/${ref.slug}`));
    return (Array.isArray(body.data?.episodeList) ? body.data.episodeList : []).map((item: any, index: number) => ({
      slug: item.episodeId,
      episodeNumber: Number(item.eps ?? index + 1) || index + 1,
      title: item.title,
      createdAt: EMPTY_DATE,
    }));
  }

  if (ref.type === 'donghua') {
    const body = unwrapUpstreamEnvelope(`/anime/donghub/detail/${ref.slug}`, await fetchUpstreamJson(`/anime/donghub/detail/${ref.slug}`));
    return (Array.isArray(body.data?.episodes) ? body.data.episodes : []).map((item: any, index: number) => ({
      slug: item.slug,
      episodeNumber: Number(item.episode ?? index + 1) || index + 1,
      title: item.title,
      createdAt: EMPTY_DATE,
    }));
  }

  return [];
}

export async function getEpisodeSources(slug: string, epSlug: string): Promise<EpisodeSource[]> {
  const ref = decodeMediaRef(slug);
  if (!ref) return [];

  if (ref.type === 'anime') {
    const body = unwrapUpstreamEnvelope(`/anime/episode/${epSlug}`, await fetchUpstreamJson(`/anime/episode/${epSlug}`));
    const sources: EpisodeSource[] = [];

    if (body.data?.defaultStreamingUrl) {
      sources.push({ url: body.data.defaultStreamingUrl, label: 'Default', quality: 'auto' });
    }

    return sources;
  }

  if (ref.type === 'donghua') {
    const body = unwrapUpstreamEnvelope(`/anime/donghub/episode/${epSlug}`, await fetchUpstreamJson(`/anime/donghub/episode/${epSlug}`));
    return (Array.isArray(body.data?.streams) ? body.data.streams : [])
      .filter((item: any) => item?.url)
      .map((item: any) => ({
        url: item.url,
        label: item.server,
        quality: item.server,
      }));
  }

  return [];
}

export async function getChapters(slug: string): Promise<Chapter[]> {
  const ref = decodeMediaRef(slug);
  if (!ref) return [];
  if (ref.type !== 'comic') return [];

  if (ref.provider === 'komikstation') {
    const body = unwrapUpstreamEnvelope(`/comic/komikstation/manga/${ref.slug}`, await fetchUpstreamJson(`/comic/komikstation/manga/${ref.slug}`));
    return (Array.isArray(body.chapters) ? body.chapters : []).map((item: any, index: number) => ({
      slug: stripTrailingSlash(item.slug),
      chapterNumber: chapterNumberFromTitle(item.title, index + 1),
      title: item.title,
      createdAt: toDate(item.date),
    }));
  }

  if (ref.provider === 'generic') {
    const body = await fetchUpstreamJson(`/comic/comic/${ref.slug}`);
    return (Array.isArray(body.chapters) ? body.chapters : []).map((item: any, index: number) => ({
      slug: stripTrailingSlash(item.slug),
      chapterNumber: chapterNumberFromTitle(item.chapter, index + 1),
      title: item.chapter,
      createdAt: toDate(item.date),
    }));
  }

  if (ref.provider === 'mangasusuku') {
    const body = unwrapUpstreamEnvelope(`/comic/mangasusuku/detail/${ref.slug}`, await fetchUpstreamJson(`/comic/mangasusuku/detail/${ref.slug}`));
    return (Array.isArray(body.chapters) ? body.chapters : []).map((item: any, index: number) => ({
      slug: stripTrailingSlash(item.slug),
      chapterNumber: chapterNumberFromTitle(item.title, index + 1),
      title: item.title,
      createdAt: toDate(item.date),
    }));
  }

  return [];
}

export async function getChapterPages(slug: string, chSlug: string): Promise<ChapterPage[]> {
  const ref = decodeMediaRef(slug);
  if (!ref) return [];
  if (ref.type !== 'comic') return [];

  if (ref.provider === 'komikstation') {
    const body = unwrapUpstreamEnvelope(`/comic/komikstation/chapter/${chSlug}`, await fetchUpstreamJson(`/comic/komikstation/chapter/${chSlug}`));
    return (Array.isArray(body.images) ? body.images : []).map((url: string, index: number) => ({
      url,
      pageNumber: index + 1,
    }));
  }

  if (ref.provider === 'generic') {
    const body = await fetchUpstreamJson(`/comic/chapter/${chSlug}`);
    return (Array.isArray(body.images) ? body.images : []).map((url: string, index: number) => ({
      url,
      pageNumber: index + 1,
    }));
  }

  if (ref.provider === 'mangasusuku') {
    const body = unwrapUpstreamEnvelope(`/comic/mangasusuku/chapter/${chSlug}`, await fetchUpstreamJson(`/comic/mangasusuku/chapter/${chSlug}`));
    return (Array.isArray(body.images) ? body.images : []).map((url: string, index: number) => ({
      url,
      pageNumber: index + 1,
    }));
  }

  return [];
}

async function safeSearchSource<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof MediaApiTimeoutError || error instanceof MediaApiError) return null;
    throw error;
  }
}

export async function searchMedia(query: string, limit?: number): Promise<{ data: Media[]; total: number }> {
  const encoded = encodeURIComponent(query);
  const [animeBody, donghuaBody, comicBody] = await Promise.all([
    safeSearchSource(fetchUpstreamJson(`/anime/search/${encoded}`)),
    safeSearchSource(fetchUpstreamJson(`/anime/donghub/search/${encoded}`)),
    safeSearchSource(fetchUpstreamJson(`/comic/komikstation/search/${encoded}/1`)),
  ]);

  const anime = animeBody ? firstArray(animeBody?.data?.animeList, animeBody?.animeList, animeBody?.data).map(mapAnimeListItem) : [];
  const donghua = donghuaBody ? firstArray(donghuaBody?.data, donghuaBody?.results, donghuaBody?.animeList).map(mapDonghuaListItem) : [];
  const comic = comicBody ? firstArray(comicBody?.seriesList, comicBody?.results, comicBody?.data).map((item: any) => mapComicListItem(item, 'komikstation')) : [];
  const data = [...anime, ...donghua, ...comic].slice(0, limit || 20);

  return { data, total: data.length };
}


export async function getHomeRails(): Promise<Array<{ title: string; href: string; items: Media[] }>> {
  const [featured, latestDonghua, recommendations, topWeekly, popular] = await Promise.all([
    getMedia('anime', 1, 15).then((result) => result.data),
    getLatest('donghua', 15),
    getComicRecommendations(15).catch(emptyMediaListOnSourceError),
    getTopWeeklyComics(15).catch(emptyMediaListOnSourceError),
    getPopular(15),
  ]);

  return [
    { title: 'Featured Anime', href: '/discover/anime', items: featured },
    { title: 'Latest Donghua', href: '/discover/donghua', items: latestDonghua },
    { title: 'Comic Recommendations', href: '/discover/comic', items: recommendations },
    { title: 'Top Weekly Comics', href: '/trending', items: topWeekly },
    { title: 'Popular Comics', href: '/popular', items: popular },
  ].filter((rail) => rail.items.length > 0);
}
