import { MetadataRoute } from 'next';
import { getGenres, getMedia, getStudios, decodeMediaRef, buildCanonicalPath } from '@/lib/api';
import { siteUrl } from '@/lib/site-url';

export const revalidate = 300;

const SITEMAP_MEDIA_LIMIT = 1000;

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

async function getSitemapMedia() {
  const { data } = await getMedia(undefined, 1, SITEMAP_MEDIA_LIMIT).catch(() => ({ data: [] }));
  return [...new Map(data.map((item) => [item.slug, item])).values()];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl();
  const now = new Date();
  const [mediaItems, genres, studios] = await Promise.all([
    getSitemapMedia(),
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
    ...mediaItems.map((item) => {
      const ref = decodeMediaRef(item.slug);
      if (!ref) return null;
      return {
        url: `${baseUrl}${buildCanonicalPath(ref)}`,
        lastModified: safeDate(item.updatedAt || item.createdAt, now),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    }).filter(Boolean) as MetadataRoute.Sitemap,
  ];
}
