import { MetadataRoute } from 'next'
import { browse, contentUrl } from '@/lib/api'

export const revalidate = 43200 // ISR: 12h

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://jawatch.vercel.app'

  let items: { entry_kind?: string; media_type?: string; slug: string; updated_at: string }[] = []
  try {
    const result = await browse({ limit: 200, sort: 'popularity' })
    items = result.items
  } catch {
    // API down — static routes only
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/browse`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/browse?media_type=manga`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ]

  const dynamicRoutes: MetadataRoute.Sitemap = items.map((item) => ({
    url: `${baseUrl}${contentUrl(item)}`,
    lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...dynamicRoutes]
}
