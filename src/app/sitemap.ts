import { getMedia } from '@/lib/api';

export default async function sitemap() {
  const baseUrl = 'https://jawatch.web.id';
  const staticUrls = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.5 },
  ];

  const { data: contents } = await getMedia(undefined, 1, 500);

  const contentUrls = contents.map((content) => ({
    url: `${baseUrl}/${content.type === 'anime' || content.type === 'donghua' || content.type === 'movie' ? 'watch' : 'read'}/${content.slug}`,
    lastModified: new Date(content.updatedAt || content.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticUrls, ...contentUrls];
}
