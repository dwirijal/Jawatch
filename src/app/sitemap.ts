import { getContents } from '@/lib/api';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Fetch all content for sitemap
  const response = await getContents(undefined, 1, 1000);
  const contents = response.data || [];

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/watch`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/read`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  const contentUrls = contents.map((content) => ({
    url: `${baseUrl}/${content.content_type === 'anime' ? 'watch' : 'read'}/${content.id}`,
    lastModified: new Date(content.scraped_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticUrls, ...contentUrls];
}
