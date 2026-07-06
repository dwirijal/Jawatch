import { MetadataRoute } from 'next';
import { getMedia } from '@/lib/api';

export const revalidate = 300; // 5m

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jawatch.web.id';
  
  const staticRoutes = [
    '',
    '/discover',
    '/discover/anime',
    '/discover/manga',
    '/discover/movie',
    '/discover/donghua',
    '/discover/comic',
    '/discover/novel',
    '/trending',
    '/popular',
    '/latest',
    '/random',
    '/search',
    '/genres',
    '/library',
    '/library/bookmarks',
    '/library/history',
    '/library/reading-progress',
    '/library/watch-progress',
    '/library/lists',
    '/profile',
    '/notifications'
  ];

  const { data: mediaItems } = await getMedia(undefined, 1, 120).catch(() => ({ data: [] }));

  const dynamicRoutes = mediaItems.map((item) => ({
    url: `${baseUrl}/media/${item.slug}`,
    lastModified: new Date(item.updatedAt || item.createdAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const statics = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.5,
  }));

  return [...statics, ...dynamicRoutes];
}
