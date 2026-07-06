import { MetadataRoute } from 'next';
import { getMedia } from '@/lib/api';

export const revalidate = 300;

const staticRoutes = [
  { path: '', priority: 1, changeFrequency: 'daily' as const },
  { path: '/discover', priority: 0.8, changeFrequency: 'daily' as const },
  { path: '/discover/anime', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/discover/manga', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/discover/movie', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/discover/donghua', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/discover/comic', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/discover/novel', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/trending', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/popular', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/latest', priority: 0.7, changeFrequency: 'daily' as const },
  { path: '/random', priority: 0.3, changeFrequency: 'weekly' as const },
  { path: '/search', priority: 0.3, changeFrequency: 'weekly' as const },
  { path: '/genres', priority: 0.5, changeFrequency: 'weekly' as const },
];

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://jawatch.web.id').replace(/\/+$/, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl();
  const now = new Date();
  const { data: mediaItems } = await getMedia(undefined, 1, 120).catch(() => ({ data: [] }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...mediaItems.map((item) => ({
      url: `${baseUrl}/media/${item.slug}`,
      lastModified: new Date(item.updatedAt || item.createdAt || now),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
