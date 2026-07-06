import { MetadataRoute } from 'next';

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://jawatch.web.id').replace(/\/+$/, '');
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/library', '/profile', '/notifications', '/login'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
