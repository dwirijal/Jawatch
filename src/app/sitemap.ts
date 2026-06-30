import { getItems, contentType } from '@/lib/db';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jawatch.vercel.app';
  const { rows } = await getItems({ page: 1, limit: 1000 });

  const staticUrls = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/browse`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
  ];

  const contentUrls = rows.map((item) => {
    const ct = contentType(item.type);
    const section = ct === 'movie' || ct === 'anime' ? 'watch' : 'read';
    return {
      url: `${baseUrl}/${section}/${item.slug}`,
      lastModified: new Date(item.release_year || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    };
  });

  return [...staticUrls, ...contentUrls];
}
