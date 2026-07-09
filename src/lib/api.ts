const MEDIA_API_BASE = process.env.JAWATCH_MEDIA_API_URL !== undefined
  ? stripTrailingSlash(process.env.JAWATCH_MEDIA_API_URL)
  : 'https://www.sankavollerei.web.id';
const MEDIA_API_TIMEOUT_MS = Number(process.env.JAWATCH_MEDIA_API_TIMEOUT_MS || 8000);
const EMPTY_DATE = '1970-01-01T00:00:00.000Z';

type MediaType = 'anime' | 'manga' | 'movie' | 'donghua' | 'comic' | 'novel';

export type MediaRef = {
  type: MediaType;
  provider: string;
  slug: string;
};

const CANONICAL_PROVIDER_SEPARATOR = ';';

function toMediaType(value: unknown): MediaType | null {
  return typeof value === 'string' && ['anime', 'manga', 'movie', 'donghua', 'comic', 'novel'].includes(value)
    ? value as MediaType
    : null;
}

function encodeCanonicalPart(value: string): string {
  return encodeURIComponent(String(value || '').trim());
}

function decodeCanonicalPart(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

class MediaApiTimeoutError extends Error {
  constructor() {
    super('Media source timeout');
    this.name = 'MediaApiTimeoutError';
  }
}

class MediaApiError extends Error {
  status?: number;
  constructor(message = 'Media source unavailable', status?: number) {
    super(message);
    this.name = 'MediaApiError';
    this.status = status;
  }
}

// ponytail: fail-soft facade — only upstream-source errors are swallowed; real bugs propagate
export type SafeResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function safe<T>(p: Promise<T>): Promise<SafeResult<T>> {
  try {
    return { ok: true, data: await p };
  } catch (error) {
    if (error instanceof MediaApiTimeoutError || error instanceof MediaApiError) {
      return { ok: false, error: error instanceof Error ? error.message : 'Media source unavailable' };
    }
    throw error;
  }
}

export async function safeGetMediaBySlug(slug: string): Promise<SafeResult<Media | null>> {
  return safe(getMediaBySlug(slug));
}

export async function safeGetMediaRelated(slug: string): Promise<SafeResult<Media[]>> {
  return safe(getMediaRelated(slug));
}

export async function safeGetEpisodes(slug: string): Promise<SafeResult<Episode[]>> {
  return safe(getEpisodes(slug));
}

export async function safeGetEpisodeSources(slug: string, epSlug: string): Promise<SafeResult<EpisodeSource[]>> {
  return safe(getEpisodeSources(slug, epSlug));
}

export async function safeGetChapters(slug: string): Promise<SafeResult<Chapter[]>> {
  return safe(getChapters(slug));
}

export async function safeGetChapterPages(slug: string, chSlug: string): Promise<SafeResult<ChapterPage[]>> {
  return safe(getChapterPages(slug, chSlug));
}

export async function safeSearchMedia(
  query: string,
  limit?: number,
  type?: string,
): Promise<SafeResult<{ data: Media[]; total: number }>> {
  return safe(searchMedia(query, limit, type));
}

export async function safeGetHomeRails(): Promise<
  SafeResult<Array<{ title: string; href: string; items: Media[] }>>
> {
  return safe(getHomeRails());
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
  suggestions?: { slug: string; title: string; type?: string }[];
  downloadUrls?: { url: string; label: string; resolution?: string }[];
  streamUrls?: { url: string; label?: string; quality?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Episode { slug: string; episodeNumber: number; title?: string; createdAt: string; }
export interface Chapter { slug: string; chapterNumber: number; title?: string; createdAt: string; }
export interface EpisodeSource { slug?: string; quality?: string; url: string; label?: string; }
export interface EpisodeMirror { serverId: string; label: string; quality?: string; }
export interface EpisodeDownload { url: string; label: string; quality?: string; size?: string; }
export interface EpisodePlayback {
  sources: EpisodeSource[];   // playable immediately (default + animasu/donghua multi-stream)
  mirrors: EpisodeMirror[];   // resolve on demand via resolveEpisodeMirror (otakudesu/samehadaku)
  downloads: EpisodeDownload[];
}
export interface ChapterPage { slug?: string; pageNumber?: number; url: string; }

function encodeMediaRef(type: MediaType, provider: string, slug: string): string {
  return `m~${Buffer.from(JSON.stringify({ type, provider, slug: endpointSlug(slug) })).toString('base64url')}`;
}

const canonicalToRef = new Map<string, MediaRef>();
const upstreamToCanonical = new Map<string, string>();

const PROVIDER_CANDIDATES: Record<MediaType, string[]> = {
  anime: ['anime', 'samehadaku', 'animasu', 'alqanime'],
  donghua: ['donghub'],
  comic: ['komikstation', 'generic', 'mangasusuku', 'kiryuu', 'komikindo'],
  manga: [],
  movie: [],
  novel: ['sakuranovel'],
};

export function registerMedia(type: MediaType, provider: string, upstreamSlug: string, title: string): string {
  const canonicalSlug = slugFromTitle(title);
  const upstreamKey = `${type}/${provider}/${upstreamSlug}`;

  const existingCanonical = upstreamToCanonical.get(upstreamKey);
  if (existingCanonical) return existingCanonical;

  const key = `${type}/${canonicalSlug}`;
  const existingRef = canonicalToRef.get(key);

  if (existingRef && (existingRef.provider !== provider || existingRef.slug !== upstreamSlug)) {
    const collidedSlug = `${canonicalSlug}--${provider}`;
    const collidedKey = `${type}/${collidedSlug}`;
    canonicalToRef.set(collidedKey, { type, provider, slug: upstreamSlug });
    upstreamToCanonical.set(upstreamKey, collidedSlug);
    return collidedSlug;
  } else {
    canonicalToRef.set(key, { type, provider, slug: upstreamSlug });
    upstreamToCanonical.set(upstreamKey, canonicalSlug);
    return canonicalSlug;
  }
}

export async function resolveCanonicalRef(type: MediaType, canonicalSlug: string): Promise<MediaRef | null> {
  const key = `${type}/${canonicalSlug}`;
  const existing = canonicalToRef.get(key);
  if (existing) return existing;

  const candidates = PROVIDER_CANDIDATES[type] || [];

  for (const provider of candidates) {
    if (canonicalSlug.endsWith(`--${provider}`)) {
      const baseSlug = canonicalSlug.slice(0, -(provider.length + 2));
      const ref = { type, provider, slug: baseSlug };
      canonicalToRef.set(key, ref);
      upstreamToCanonical.set(`${type}/${provider}/${baseSlug}`, canonicalSlug);
      return ref;
    }
  }

  const results = await Promise.allSettled(
    candidates.map(async (provider) => {
      const ref = { type, provider, slug: canonicalSlug };
      const media = await getMediaBySlugInternal(ref);
      if (media) return ref;
      throw new Error('Not found');
    })
  );

  for (const res of results) {
    if (res.status === 'fulfilled' && res.value) {
      const ref = res.value;
      canonicalToRef.set(key, ref);
      upstreamToCanonical.set(`${type}/${ref.provider}/${ref.slug}`, canonicalSlug);
      return ref;
    }
  }

  return null;
}

export async function resolveLegacySlug(slug: string): Promise<MediaRef | null> {
  const ref = decodeMediaRef(slug);
  if (ref && ref.provider !== 'resolve') return ref;

  const types: MediaType[] = ['anime', 'donghua', 'comic'];
  for (const type of types) {
    const resolved = await resolveCanonicalRef(type, slug);
    if (resolved) return resolved;
  }
  return null;
}

async function resolveRefIfNeeded(ref: MediaRef | null): Promise<MediaRef | null> {
  if (!ref) return null;
  if (ref.provider === 'resolve') {
    return resolveCanonicalRef(ref.type, ref.slug);
  }
  return ref;
}

export function buildCanonicalPath(ref: MediaRef): string {
  const upstreamKey = `${ref.type}/${ref.provider}/${ref.slug}`;
  let canonicalSlug = upstreamToCanonical.get(upstreamKey);
  if (!canonicalSlug) {
    canonicalSlug = slugFromTitle(ref.slug);
  }
  return `/media/${ref.type}/${canonicalSlug}`;
}

export function decodeMediaRef(value: string): MediaRef | null {
  const canonicalParts = value.split('/');
  if (canonicalParts.length === 2) {
    const type = toMediaType(canonicalParts[0]);
    if (!type) return null;

    const secondPart = canonicalParts[1];
    if (secondPart.startsWith('m~') || secondPart.includes('~')) {
      return decodeMediaRef(secondPart);
    }

    const key = `${type}/${secondPart}`;
    const registered = canonicalToRef.get(key);
    if (registered) return registered;

    return { type, provider: 'resolve', slug: secondPart };
  }

  if (value.startsWith('m~')) {
    try {
      const parsed = JSON.parse(Buffer.from(value.slice(2), 'base64url').toString('utf8'));
      const type = toMediaType(parsed?.type);
      if (!type || typeof parsed.provider !== 'string' || typeof parsed.slug !== 'string') return null;
      const slug = endpointSlug(parsed.slug);
      if (!slug) return null;
      return { type, provider: parsed.provider, slug };
    } catch {
      return null;
    }
  }

  const parts = value.split('~');
  if (parts.length < 3) return null;

  const [rawType, provider, ...rest] = parts;
  const type = toMediaType(rawType);
  const slug = endpointSlug(rest.join('~'));
  if (!type || !provider || !slug) return null;

  return { type, provider, slug };
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
      if (typeof item === 'string') {
        const trimmed = item.trim();
        return { slug: trimmed.toLowerCase(), name: trimmed };
      }
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

async function fetchUpstreamJsonOnce(path: string) {
  if (!MEDIA_API_BASE) throw new MediaApiError();
  if (!path.startsWith('/')) throw new MediaApiError('Invalid request path');

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
      // 5xx = transient (retryable); 4xx = definitive (fail fast, don't hammer upstream)
      throw new MediaApiError(res.status >= 500 ? 'Media source unavailable' : undefined, res.status);
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

// ponytail: 2 retries w/ linear backoff on transient upstream (timeout + 5xx) only.
// Fixes false "not found" when a cold detail load's provider probe hits a blip (#286).
// 4xx (404/429) never retried — a miss stays a miss, and we don't amplify rate-limits.
async function fetchUpstreamJson(path: string, attempts = 3): Promise<any> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchUpstreamJsonOnce(path);
    } catch (error) {
      const retryable =
        error instanceof MediaApiTimeoutError ||
        (error instanceof MediaApiError && (error.status ?? 0) >= 500);
      if (!retryable || i === attempts - 1) throw error;
      await new Promise((r) => setTimeout(r, 150 * (i + 1)));
    }
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
  const ref = decodeMediaRef(slug);
  if (ref && ref.provider !== 'resolve') {
    registerMedia(type, ref.provider, ref.slug, title);
  }
  return {
    slug,
    type,
    title,
    coverImage,
    createdAt: EMPTY_DATE,
    updatedAt: EMPTY_DATE,
  };
}

function mapAnimeListItem(item: any, provider = 'anime'): Media {
  const slug = item.animeId || item.slug;
  const score = item.score?.value || item.score;
  return {
    ...baseMedia('anime', encodeMediaRef('anime', provider, slug), item.title, item.poster),
    status: item.status,
    rating: toRating(score),
    genres: mapGenres(item.genreList || item.genres, 'name'),
  };
}

function mapAlqanimeListItem(item: any): Media {
  const slug = item.slug || slugFromTitle(item.title);
  return {
    ...baseMedia('anime', encodeMediaRef('anime', 'alqanime', slug), item.title, item.poster),
    status: item.status,
    rating: toRating(item.rating),
    genres: mapGenres(item.genres, 'name'),
  };
}

function mapDonghuaListItem(item: any): Media {
  return {
    ...baseMedia('donghua', encodeMediaRef('donghua', 'donghub', item.slug), dedupeTitle(item.title), item.poster),
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
  let data: any;
  let alternativeTitles: string[] | null = null;
  let synopsis = '';
  let status = '';
  let rating: any;
  let genres: any[] = [];
  let studios: any[] | null = null;

  if (ref.provider === 'anime') {
    data = unwrapUpstreamEnvelope(`/anime/anime/${ref.slug}`, payload).data;
    alternativeTitles = data.japanese ? [data.japanese] : null;
    synopsis = Array.isArray(data.synopsis?.paragraphs) ? data.synopsis.paragraphs.join('\n\n') : '';
    status = data.status;
    rating = data.score;
    genres = mapGenres(data.genreList);
    studios = data.studios ? [{ slug: String(data.studios).toLowerCase().replace(/\s+/g, '-'), name: data.studios }] : null;
  } else if (ref.provider === 'samehadaku') {
    data = unwrapUpstreamEnvelope(`/anime/samehadaku/anime/${ref.slug}`, payload).data;
    alternativeTitles = data.japanese ? [data.japanese] : null;
    synopsis = Array.isArray(data.synopsis?.paragraphs) ? data.synopsis.paragraphs.join('\n\n') : '';
    status = data.status;
    rating = data.score?.value || data.score;
    genres = mapGenres(data.genreList);
    studios = data.studios ? [{ slug: String(data.studios).toLowerCase().replace(/\s+/g, '-'), name: data.studios }] : null;
  } else if (ref.provider === 'animasu') {
    data = payload.detail || payload;
    alternativeTitles = data.synonym ? [data.synonym] : null;
    synopsis = data.synopsis || '';
    status = data.status;
    rating = data.rating;
    genres = mapGenres(data.genres, 'name');
    studios = data.studio ? [{ slug: String(data.studio).toLowerCase().replace(/\s+/g, '-'), name: data.studio }] : null;
  } else {
    data = payload;
  }

  return {
    ...baseMedia('anime', encodeMediaRef('anime', ref.provider, ref.slug), data.title, data.poster),
    alternativeTitles,
    synopsis,
    status,
    rating: toRating(rating),
    genres,
    studios,
  };
}

function mapAlqanimeDetail(ref: MediaRef, payload: any): Media {
  const data = payload?.data || payload;
  const genres = mapGenres(data.genres, 'name');
  const media: Media = {
    ...baseMedia('anime', encodeMediaRef('anime', 'alqanime', ref.slug), data.title, data.poster),
    synopsis: data.synopsis || '',
    status: data.status,
    rating: toRating(data.rating),
    genres,
    studios: data.info?.studio
      ? [{ slug: String(data.info.studio).toLowerCase().replace(/\s+/g, '-'), name: data.info.studio }]
      : null,
    nsfw: false,
  };
  const downloadUrls = flattenAlqanimeDownloads(data.downloads);
  if (downloadUrls.length) media.downloadUrls = downloadUrls;
  const streamUrls = flattenAlqanimeStreams(data.stream_links);
  if (streamUrls.length) media.streamUrls = streamUrls;
  const suggestions = collectSuggestions(data.recommendations, data.related);
  if (suggestions.length) media.suggestions = suggestions;
  return media;
}

function flattenAlqanimeDownloads(downloads: any): { url: string; label: string; resolution?: string }[] {
  if (!Array.isArray(downloads)) return [];
  const out: { url: string; label: string; resolution?: string }[] = [];
  for (const group of downloads) {
    if (!group?.links || !Array.isArray(group.links)) continue;
    for (const link of group.links) {
      const resolution = link.resolution || '';
      for (const entry of link.urls || []) {
        if (entry?.url) out.push({ url: entry.url, label: `${group.title || 'Batch'}${resolution ? ` ${resolution}` : ''}`, resolution });
      }
    }
  }
  return out;
}

function flattenAlqanimeStreams(streamLinks: any): { url: string; label?: string; quality?: string }[] {
  if (!Array.isArray(streamLinks)) return [];
  return streamLinks.filter((item: any) => item?.url).map((item: any) => ({ url: item.url, label: item.server || item.label, quality: item.quality }));
}

function collectSuggestions(recommendations: any, related: any): { slug: string; title: string; type?: string }[] {
  const seen = new Set<string>();
  const out: { slug: string; title: string; type?: string }[] = [];
  const push = (item: any) => {
    if (!item?.slug || !item?.title || seen.has(item.slug)) return;
    seen.add(item.slug);
    out.push({ slug: item.slug, title: item.title, type: item.type });
  };
  (Array.isArray(recommendations) ? recommendations : []).forEach(push);
  (Array.isArray(related) ? related : []).forEach(push);
  return out;
}

function mapDonghuaDetail(ref: MediaRef, payload: any): Media {
  const data = unwrapUpstreamEnvelope(`/anime/donghua/detail/${ref.slug}`, payload).data;
  return {
    ...baseMedia('donghua', encodeMediaRef('donghua', ref.provider, ref.slug), dedupeTitle(data.title), data.poster),
    synopsis: data.synopsis,
    status: data.info?.status,
    genres: mapGenres(data.genres, 'name'),
    studios: data.info?.studio ? [{ slug: String(data.info.studio).toLowerCase().replace(/\s+/g, '-'), name: data.info.studio }] : null,
  };
}

// ponytail: upstream Donghub sometimes returns "Title Title" — detect and halve.
function dedupeTitle(title: string): string {
  const t = title.trim();
  const half = Math.floor(t.length / 2);
  if (t.length >= 4 && half >= 2 && t.slice(0, half) === t.slice(half).trim()) return t.slice(0, half).trim();
  return t;
}

function isNsfwGenre(genre: { slug?: string; name?: string } | undefined): boolean {
  const slug = String(genre?.slug || '').toLowerCase();
  const name = String(genre?.name || '').toLowerCase();
  return ['21', 'adult', 'hentai', 'nsfw'].includes(slug) || ['adult', 'hentai', 'nsfw'].includes(name);
}

function mapComicDetail(ref: MediaRef, payload: any): Media {
  let data = payload;
  if (ref.provider === 'komikstation') {
    data = unwrapUpstreamEnvelope(`/comic/komikstation/manga/${ref.slug}`, payload);
  } else if (ref.provider === 'komikindo') {
    data = payload.data || payload;
  }

  const cover = data.image || data.imageSrc || data.thumbnail;
  const status = data.status || data.detail?.status;
  const rating = data.rating;
  const rawGenres = data.genres;
  const synopsis = data.synopsis || data.synopsis_full || data.summary || data.description;
  const author = data.author || data.detail?.author;
  const genres = mapGenres(rawGenres, 'name');
  // ponytail: mangasusuku is an NSFW-class provider; explicit genre slugs 21/adult/hentai/nsfw also mark NSFW.
  const nsfw = ref.provider === 'mangasusuku' || genres.some(isNsfwGenre);

  return {
    ...baseMedia('comic', encodeMediaRef('comic', ref.provider, ref.slug), data.title, cover),
    alternativeTitles: data.alternative ? [data.alternative] : data.detail?.alternativeTitle ? [data.detail.alternativeTitle] : null,
    synopsis,
    status,
    rating: toRating(rating),
    genres,
    nsfw,
    authors: author ? [{ slug: String(author).toLowerCase().replace(/\s+/g, '-'), name: author }] : null,
  };
}

function mapAnimeGenreItem(item: any): Media {
  return mapAnimeListItem(item, 'anime');
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

function mapNovelDetail(ref: MediaRef, payload: any): Media {
  const data = payload?.data || payload;
  const genres = mapGenres(data.genres, 'name');
  const nsfw = genres.some(isNsfwGenre);
  return {
    ...baseMedia('novel', encodeMediaRef('novel', 'sakuranovel', ref.slug), data.title || data.alt_title, data.poster),
    alternativeTitles: data.alt_title ? [data.alt_title] : null,
    synopsis: data.synopsis || '',
    status: data.status,
    rating: toRating(data.rating),
    genres,
    nsfw,
  };
}

async function getSakuranovelHome(): Promise<Media[]> {
  const body = await fetchUpstreamJson('/novel/sakuranovel/home');
  const data = body.data || body;
  const arr = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
  return arr.map((item: any) => ({
    ...baseMedia('novel', encodeMediaRef('novel', 'sakuranovel', item.slug || slugFromTitle(item.title)), item.title, item.poster),
    status: item.status,
    rating: toRating(item.rating),
    genres: mapGenres(item.genres, 'name'),
  }));
}

async function getUpstreamMediaByType(type: MediaType, limit?: number): Promise<Media[]> {
  switch (type) {
    case 'anime': {
      const [home, samehadaku, alq] = await Promise.all([
        getOtakudesuHome().catch(() => [] as Media[]),
        getSamehadakuLists().catch(() => [] as Media[]),
        getAlqanimeLists().catch(() => [] as Media[]),
      ]);
      return [...home, ...samehadaku, ...alq].slice(0, limit || 20);
    }
    case 'novel': {
      return (await getSakuranovelHome().catch(() => [] as Media[])).slice(0, limit || 20);
    }
    case 'donghua': {
      // /anime/donghua/list is 403 (not a real endpoint); /latest returns { latest_donghua: [...] }.
      const body = unwrapUpstreamEnvelope('/anime/donghua/latest', await fetchUpstreamJson('/anime/donghua/latest'));
      return firstArray(body.latest_donghua, body.data).map(mapDonghuaListItem).slice(0, limit || 20);
    }
    case 'comic': {
      // komikstation is the primary source but its scraper fails intermittently; fall back to mangasusuku so comic discover isn't empty.
      const komik = await getComicListFrom('/comic/komikstation/list', 'komikstation', ['results', 'seriesList', 'data']).catch(() => [] as Media[]);
      if (komik.length > 0) return komik.slice(0, limit || 20);
      const manga = await getComicListFrom('/comic/mangasusuku/list', 'mangasusuku', ['mangaList', 'data', 'results']).catch(() => [] as Media[]);
      return manga.slice(0, limit || 20);
    }
    default:
      return [];
  }
}

function emptyMediaPage(): { data: Media[]; total: number; hasMore: boolean } {
  return { data: [], total: 0, hasMore: false };
}

async function getOtakudesuHome(): Promise<Media[]> {
  const body = unwrapUpstreamEnvelope('/anime/home', await fetchUpstreamJson('/anime/home'));
  const ongoing = Array.isArray(body.data?.ongoing?.animeList) ? body.data.ongoing.animeList : [];
  const completed = Array.isArray(body.data?.completed?.animeList) ? body.data.completed.animeList : [];
  return [...ongoing, ...completed].map((item: any) => mapAnimeListItem(item, 'anime'));
}

// Samehadaku home envelope: data.{recent,batch,movie,top10}, each with .animeList. Items carry
// animeId (mapAnimeListItem reads animeId||slug). recent is the discover-relevant section.
async function getSamehadakuLists(): Promise<Media[]> {
  const body = unwrapUpstreamEnvelope('/anime/samehadaku/home', await fetchUpstreamJson('/anime/samehadaku/home'));
  const recent = firstArray(body.data?.recent?.animeList);
  const movie = firstArray(body.data?.movie?.animeList);
  return [...recent, ...movie].map((item: any) => mapAnimeListItem(item, 'samehadaku'));
}

async function getAlqanimeLists(): Promise<Media[]> {
  const body = await fetchUpstreamJson('/anime/alqanime/home');
  const data = body.data || body;
  const latest = Array.isArray(data.latest) ? data.latest : [];
  const completed = Array.isArray(data.completed) ? data.completed : [];
  return [...latest, ...completed].map(mapAlqanimeListItem);
}

async function getAlqanimeRanking(kind: 'ongoing' | 'popular'): Promise<Media[]> {
  const body = await fetchUpstreamJson(`/anime/alqanime/${kind}`);
  const data = body.data || body;
  const arr = Array.isArray(data) ? data : [];
  return arr.map(mapAlqanimeListItem);
}

async function searchAlqanime(query: string): Promise<Media[]> {
  const body = await fetchUpstreamJson(`/anime/alqanime/search/${encodeURIComponent(query)}`);
  const data = body.data || body;
  const arr = Array.isArray(data) ? data : [];
  return arr.map(mapAlqanimeListItem);
}

function slugFromTitle(title: string): string {
  return String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function firstArray(...values: any[]): any[] {
  for (const value of values) if (Array.isArray(value)) return value;
  return [];
}

// Fetch a comic list from one provider, reading the item array from whichever envelope key it uses.
async function getComicListFrom(path: string, provider: string, keys: string[]): Promise<Media[]> {
  const body = unwrapUpstreamEnvelope(path, await fetchUpstreamJson(path));
  return firstArray(...keys.map((k) => body[k])).map((item: any) => mapComicListItem(item, provider));
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
      const body = unwrapUpstreamEnvelope('/anime/donghua/latest', await fetchUpstreamJson('/anime/donghua/latest'));
      const list = firstArray(body.latest_donghua, body.data, body.latest_release);
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

export async function getMediaBySlugInternal(ref: MediaRef): Promise<Media | null> {
  try {
    if (ref.type === 'anime') {
      if (ref.provider === 'anime') return mapAnimeDetail(ref, await fetchUpstreamJson(`/anime/anime/${ref.slug}`));
      if (ref.provider === 'samehadaku') return mapAnimeDetail(ref, await fetchUpstreamJson(`/anime/samehadaku/anime/${ref.slug}`));
      if (ref.provider === 'animasu') return mapAnimeDetail(ref, await fetchUpstreamJson(`/anime/animasu/detail/${ref.slug}`));
      if (ref.provider === 'alqanime') return mapAlqanimeDetail(ref, await fetchUpstreamJson(`/anime/alqanime/detail/${ref.slug}`));
    }
    if (ref.type === 'donghua') return mapDonghuaDetail(ref, await fetchUpstreamJson(`/anime/donghua/detail/${ref.slug}`));

    if (ref.type === 'comic') {
      if (ref.provider === 'komikstation') return mapComicDetail(ref, await fetchUpstreamJson(`/comic/komikstation/manga/${ref.slug}`));
      if (ref.provider === 'generic') return mapComicDetail(ref, await fetchUpstreamJson(`/comic/comic/${ref.slug}`));
      if (ref.provider === 'mangasusuku') return mapComicDetail(ref, await fetchUpstreamJson(`/comic/mangasusuku/detail/${ref.slug}`));
      if (ref.provider === 'kiryuu') return mapComicDetail(ref, await fetchUpstreamJson(`/comic/kiryuu/manga/${ref.slug}`));
      if (ref.provider === 'komikindo') return mapComicDetail(ref, await fetchUpstreamJson(`/comic/komikindo/detail/${ref.slug}`));
    }

    if (ref.type === 'novel') {
      if (ref.provider === 'sakuranovel') return mapNovelDetail(ref, await fetchUpstreamJson(`/novel/sakuranovel/detail/${ref.slug}`));
    }
  } catch {
    return null;
  }
  return null;
}

export async function getMediaBySlug(slug: string): Promise<Media | null> {
  const ref = await resolveRefIfNeeded(decodeMediaRef(slug));
  if (!ref) return null;
  return getMediaBySlugInternal(ref);
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
    return (Array.isArray(body.data) ? body.data : []).map((item: any) => mapAnimeListItem(item, 'anime'));
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

// Upstream providers return newest-first; readers assume oldest-first (ep1 top, next = index+1). Sort ascending.
export async function getEpisodes(slug: string): Promise<Episode[]> {
  const items = await getEpisodesUnsorted(slug);
  return items.sort((a, b) => a.episodeNumber - b.episodeNumber);
}

async function getEpisodesUnsorted(slug: string): Promise<Episode[]> {
  const ref = await resolveRefIfNeeded(decodeMediaRef(slug));
  if (!ref) return [];

  if (ref.type === 'anime') {
    if (ref.provider === 'anime') {
      const body = unwrapUpstreamEnvelope(`/anime/anime/${ref.slug}`, await fetchUpstreamJson(`/anime/anime/${ref.slug}`));
      return (Array.isArray(body.data?.episodeList) ? body.data.episodeList : []).map((item: any, index: number) => ({
        slug: item.episodeId,
        episodeNumber: Number(item.eps ?? index + 1) || index + 1,
        title: item.title,
        createdAt: EMPTY_DATE,
      }));
    }
    if (ref.provider === 'samehadaku') {
      const body = unwrapUpstreamEnvelope(`/anime/samehadaku/anime/${ref.slug}`, await fetchUpstreamJson(`/anime/samehadaku/anime/${ref.slug}`));
      return (Array.isArray(body.data?.episodeList) ? body.data.episodeList : []).map((item: any, index: number) => ({
        slug: item.episodeId,
        episodeNumber: Number(item.title) || index + 1,
        title: `Episode ${item.title}`,
        createdAt: EMPTY_DATE,
      }));
    }
    if (ref.provider === 'animasu') {
      const body = await fetchUpstreamJson(`/anime/animasu/detail/${ref.slug}`);
      return (Array.isArray(body.episodes) ? body.episodes : []).map((item: any, index: number) => ({
        slug: item.slug,
        episodeNumber: chapterNumberFromTitle(item.name, index + 1),
        title: item.name,
        createdAt: EMPTY_DATE,
      }));
    }
  }

  if (ref.type === 'donghua') {
    const body = unwrapUpstreamEnvelope(`/anime/donghua/detail/${ref.slug}`, await fetchUpstreamJson(`/anime/donghua/detail/${ref.slug}`));
    return (Array.isArray(body.data?.episodes) ? body.data.episodes : []).map((item: any, index: number) => ({
      slug: item.slug,
      episodeNumber: Number(item.episode ?? index + 1) || index + 1,
      title: item.title,
      createdAt: EMPTY_DATE,
    }));
  }

  return [];
}

const EMPTY_PLAYBACK: EpisodePlayback = { sources: [], mirrors: [], downloads: [] };

// otakudesu & samehadaku share this episode shape: single defaultStreamingUrl +
// server.qualities[].serverList[] (mirrors needing on-demand resolve) + downloadUrl.qualities[].
function playbackFromDefaultShape(data: any): EpisodePlayback {
  const sources: EpisodeSource[] = data?.defaultStreamingUrl
    ? [{ url: data.defaultStreamingUrl, label: 'Default', quality: 'auto' }]
    : [];
  return { sources, mirrors: flattenMirrors(data?.server), downloads: flattenEpisodeDownloads(data?.downloadUrl) };
}

function flattenMirrors(server: any): EpisodeMirror[] {
  const qualities = Array.isArray(server?.qualities) ? server.qualities : [];
  const out: EpisodeMirror[] = [];
  for (const q of qualities) {
    const quality = typeof q?.title === 'string' ? q.title.trim() : undefined;
    for (const s of Array.isArray(q?.serverList) ? q.serverList : []) {
      if (s?.serverId) out.push({ serverId: String(s.serverId), label: String(s.title || 'Mirror').trim(), quality });
    }
  }
  return out;
}

function flattenEpisodeDownloads(downloadUrl: any): EpisodeDownload[] {
  const qualities = Array.isArray(downloadUrl?.qualities) ? downloadUrl.qualities : [];
  const out: EpisodeDownload[] = [];
  for (const q of qualities) {
    const quality = typeof q?.title === 'string' ? q.title.trim() : undefined;
    const size = typeof q?.size === 'string' ? q.size.trim() : undefined;
    for (const u of Array.isArray(q?.urls) ? q.urls : []) {
      if (u?.url) out.push({ url: u.url, label: String(u.title || 'Download').trim(), quality, size });
    }
  }
  return out;
}

export async function getEpisodePlayback(slug: string, epSlug: string): Promise<EpisodePlayback> {
  const ref = await resolveRefIfNeeded(decodeMediaRef(slug));
  if (!ref) return EMPTY_PLAYBACK;

  if (ref.type === 'anime') {
    if (ref.provider === 'anime') {
      const body = unwrapUpstreamEnvelope(`/anime/episode/${epSlug}`, await fetchUpstreamJson(`/anime/episode/${epSlug}`));
      return playbackFromDefaultShape(body.data);
    }
    if (ref.provider === 'samehadaku') {
      const body = unwrapUpstreamEnvelope(`/anime/samehadaku/episode/${epSlug}`, await fetchUpstreamJson(`/anime/samehadaku/episode/${epSlug}`));
      return playbackFromDefaultShape(body.data);
    }
    if (ref.provider === 'animasu') {
      const body = await fetchUpstreamJson(`/anime/animasu/episode/${epSlug}`);
      const sources = (Array.isArray(body.streams) ? body.streams : []).map((item: any) => ({
        url: item.url,
        label: item.name,
        quality: String(item.name).split(' ')[0] || 'auto',
      }));
      return { sources, mirrors: [], downloads: [] };
    }
  }

  if (ref.type === 'donghua') {
    const body = unwrapUpstreamEnvelope(`/anime/donghua/episode/${epSlug}`, await fetchUpstreamJson(`/anime/donghua/episode/${epSlug}`));
    const sources = (Array.isArray(body.data?.streams) ? body.data.streams : [])
      .filter((item: any) => item?.url)
      .map((item: any) => ({ url: item.url, label: item.server, quality: item.server }));
    return { sources, mirrors: [], downloads: [] };
  }

  return EMPTY_PLAYBACK;
}

// Mirror stream URLs are lazy — resolved one hop when the user picks a server.
export async function resolveEpisodeMirror(slug: string, serverId: string): Promise<string> {
  const ref = await resolveRefIfNeeded(decodeMediaRef(slug));
  if (!ref) throw new Error('Unknown media ref');
  const prefix = ref.provider === 'samehadaku' ? '/anime/samehadaku/server' : '/anime/server';
  const path = `${prefix}/${serverId}`;
  const body = unwrapUpstreamEnvelope(path, await fetchUpstreamJson(path));
  const url = body.data?.url;
  if (!url) throw new Error('Mirror unavailable');
  return url;
}

export async function getEpisodeSources(slug: string, epSlug: string): Promise<EpisodeSource[]> {
  return (await getEpisodePlayback(slug, epSlug)).sources;
}

export async function getChapters(slug: string): Promise<Chapter[]> {
  const items = await getChaptersUnsorted(slug);
  return items.sort((a, b) => a.chapterNumber - b.chapterNumber);
}

async function getChaptersUnsorted(slug: string): Promise<Chapter[]> {
  const ref = await resolveRefIfNeeded(decodeMediaRef(slug));
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

  if (ref.provider === 'kiryuu') {
    const body = await fetchUpstreamJson(`/comic/kiryuu/manga/${ref.slug}`);
    return (Array.isArray(body.chapters) ? body.chapters : []).map((item: any, index: number) => ({
      slug: stripTrailingSlash(item.slug),
      chapterNumber: chapterNumberFromTitle(item.title, index + 1),
      title: item.title,
      createdAt: toDate(item.date),
    }));
  }

  if (ref.provider === 'komikindo') {
    const body = await fetchUpstreamJson(`/comic/komikindo/detail/${ref.slug}`);
    const data = body.data || body;
    return (Array.isArray(data.chapters) ? data.chapters : []).map((item: any, index: number) => ({
      slug: stripTrailingSlash(item.slug),
      chapterNumber: chapterNumberFromTitle(item.title, index + 1),
      title: item.title,
      createdAt: toDate(item.releaseTime),
    }));
  }

  return [];
}

export async function getChapterPages(slug: string, chSlug: string): Promise<ChapterPage[]> {
  const ref = await resolveRefIfNeeded(decodeMediaRef(slug));
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

  if (ref.provider === 'kiryuu') {
    const body = await fetchUpstreamJson(`/comic/kiryuu/chapter/${chSlug}`);
    return (Array.isArray(body.images) ? body.images : []).map((url: string, index: number) => ({
      url,
      pageNumber: index + 1,
    }));
  }

  if (ref.provider === 'komikindo') {
    const body = await fetchUpstreamJson(`/comic/komikindo/chapter/${chSlug}`);
    const data = body.data || body;
    return (Array.isArray(data.images) ? data.images : []).map((img: any, index: number) => ({
      url: img.url || img,
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

export async function searchMedia(query: string, limit?: number, type?: string): Promise<{ data: Media[]; total: number }> {
  const encoded = encodeURIComponent(query);
  const [
    otakudesuBody,
    samehadakuBody,
    animasuBody,
    donghuaBody,
    komikstationBody,
    kiryuuBody,
    komikindoBody,
    alqanimeBody,
  ] = await Promise.all([
    safeSearchSource(fetchUpstreamJson(`/anime/search/${encoded}`)),
    safeSearchSource(fetchUpstreamJson(`/anime/samehadaku/search?q=${encoded}`)),
    safeSearchSource(fetchUpstreamJson(`/anime/animasu/search/${encoded}`)),
    safeSearchSource(fetchUpstreamJson(`/anime/donghua/search/${encoded}`)),
    safeSearchSource(fetchUpstreamJson(`/comic/komikstation/search/${encoded}/1`)),
    safeSearchSource(fetchUpstreamJson(`/comic/kiryuu/search/${encoded}/1`)),
    safeSearchSource(fetchUpstreamJson(`/comic/komikindo/search/${encoded}/1`)),
    safeSearchSource(searchAlqanime(query).then((items) => ({ data: items }))),
  ]);

  const animeOtakudesu = otakudesuBody
    ? firstArray(otakudesuBody?.data?.animeList, otakudesuBody?.animeList, otakudesuBody?.data).map((item) => mapAnimeListItem(item, 'anime'))
    : [];

  const animeSamehadaku = samehadakuBody
    ? firstArray(samehadakuBody?.data?.animeList, samehadakuBody?.animeList, samehadakuBody?.data).map((item) => mapAnimeListItem(item, 'samehadaku'))
    : [];

  const animeAnimasu = animasuBody
    ? firstArray(animasuBody?.animes, animasuBody?.data?.animeList, animasuBody?.animeList, animasuBody?.data, animasuBody?.results).map((item) => mapAnimeListItem(item, 'animasu'))
    : [];

  const donghua = donghuaBody
    ? firstArray(donghuaBody?.data, donghuaBody?.results, donghuaBody?.animeList).map(mapDonghuaListItem)
    : [];

  const comicKomikstation = komikstationBody
    ? firstArray(komikstationBody?.seriesList, komikstationBody?.results, komikstationBody?.data).map((item) => mapComicListItem(item, 'komikstation'))
    : [];

  const comicKiryuu = kiryuuBody
    ? firstArray(kiryuuBody?.seriesList, kiryuuBody?.results, kiryuuBody?.mangaList, kiryuuBody?.data).map((item) => mapComicListItem(item, 'kiryuu'))
    : [];

  const comicKomikindo = komikindoBody
    ? firstArray(komikindoBody?.komikList, komikindoBody?.results, komikindoBody?.data, komikindoBody?.seriesList).map((item) => mapComicListItem(item, 'komikindo'))
    : [];

  const animeAlqanime = alqanimeBody ? (Array.isArray(alqanimeBody.data) ? alqanimeBody.data : []).map(mapAlqanimeListItem) : [];

  const data = [
    ...animeOtakudesu,
    ...animeSamehadaku,
    ...animeAnimasu,
    ...animeAlqanime,
    ...donghua,
    ...comicKomikstation,
    ...comicKiryuu,
    ...comicKomikindo,
  ].slice(0, limit || 20);

  const filtered = type ? data.filter((item) => item.type === type) : data;
  return { data: filtered, total: filtered.length };
}


export async function getHomeRails(): Promise<Array<{ title: string; href: string; items: Media[] }>> {
  const [featured, latestDonghua, recommendations, topWeekly, popular] = await Promise.all([
    getMedia('anime', 1, 10).then((result) => result.data),
    getLatest('donghua', 10),
    getComicRecommendations(10).catch(emptyMediaListOnSourceError),
    getTopWeeklyComics(10).catch(emptyMediaListOnSourceError),
    getPopular(10),
  ]);

  const safe = (items: Media[]) => items.filter((item) => !item.nsfw);

  return [
    { title: 'Featured Anime', href: '/discover/anime', items: safe(featured) },
    { title: 'Latest Donghua', href: '/discover/donghua', items: safe(latestDonghua) },
    { title: 'Comic Recommendations', href: '/discover/comic', items: safe(recommendations) },
    { title: 'Top Weekly Comics', href: '/trending', items: safe(topWeekly) },
    { title: 'Popular Comics', href: '/popular', items: safe(popular) },
  ].filter((rail) => rail.items.length > 0);
}
