import { MetadataRoute } from 'next';
import { getMedia, getGenres, getStudios, decodeMediaRef, buildCanonicalPath } from '@/lib/api';
import { siteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

// Sitemaps are capped at 50,000 URLs/file by the protocol. With ~70k media we
// split across chunked child sitemaps. Chunk 0 holds static + genre + studio
// URLs; chunks 1..N hold media URLs. Next turns this into a <sitemapindex>.
const PAGE_LIMIT = 1000;
const MEDIA_PER_CHUNK = 40000;

const staticRoutes = [
  { path: '', priority: 1, changeFrequency: 'daily' as const },
  { path: '/discover', priority: 0.8, changeFrequency: 'daily' as const },
  { path: '/discover/anime', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/discover/donghua', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/discover/comic', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/popular', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/latest', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/genres', priority: 0.5, changeFrequency: 'weekly' as const },
  { path: '/studios', priority: 0.5, changeFrequency: 'weekly' as const },
];

function safeDate(value: string | undefined, fallback: Date): Date {
  if (!value || value === '1970-01-01T00:00:00.000Z') return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export async function generateSitemaps(): Promise<{ id: string }[]> {
  let total = 0;
  try {
    const first = await getMedia(undefined, 1, 1);
    total = first.total;
  } catch {
    total = 0;
  }
  const mediaChunks = Math.max(1, Math.ceil(total / MEDIA_PER_CHUNK));
  return Array.from({ length: mediaChunks + 1 }, (_, i) => ({ id: String(i) }));
}

export default async function sitemap({
  id,
}: {
  id: string | Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  // Next 16 metadata loader passes `id` as a Promise — must await it.
  const idStr = await id;
  const baseUrl = siteUrl();
  const now = new Date();
  const numericId = parseInt(idStr, 10);

  if (numericId === 0) {
    const [genres, studios] = await Promise.all([
      getGenres().catch(() => []),
      getStudios().catch(() => []),
    ]);
    return [
      ...staticRoutes.map((route) => ({
        url: `${baseUrl}${route.path}`,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      })),
      ...genres.map((genre) => ({
        url: `${baseUrl}/genres/${genre.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })),
      ...studios.map((studio) => ({
        url: `${baseUrl}/studios/${studio.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })),
    ];
  }

  // Media chunks: chunk 1 covers media [0, MEDIA_PER_CHUNK), etc.
  const mediaChunkIndex = numericId - 1;
  const start = mediaChunkIndex * MEDIA_PER_CHUNK;
  const end = start + MEDIA_PER_CHUNK;
  const startPage = Math.floor(start / PAGE_LIMIT) + 1;
  const endPage = Math.ceil(end / PAGE_LIMIT);

  const urls: MetadataRoute.Sitemap = [];
  for (let page = startPage; page <= endPage; page++) {
    const res = await getMedia(undefined, page, PAGE_LIMIT).catch(() => ({
      data: [] as any[],
      total: 0,
      hasMore: false,
    }));
    for (const item of res.data) {
      const ref = decodeMediaRef(item.slug);
      if (!ref) continue;
      urls.push({
        url: `${baseUrl}${buildCanonicalPath(ref)}`,
        lastModified: safeDate(item.updatedAt || item.createdAt, now),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
    if (!res.hasMore) break;
  }
  return urls;
}
