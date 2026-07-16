import { NextResponse } from 'next/server';
import { siteUrl } from '@/lib/site-url';
import { generateSitemaps } from '../sitemap';

export const revalidate = 300;

// Next 16's `generateSitemaps()` pattern does NOT auto-serve a `/sitemap.xml`
// index — the dynamic metadata handler only matches explicit chunk ids like
// `/sitemap/0.xml`, `/sitemap/1.xml`. A bare `/sitemap.xml` hits the handler,
// fails to match an id, and returns 404. This route is reachable because
// `next.config.js` rewrites `/sitemap.xml` → `/sitemap-index`, avoiding the
// reserved metadata filename collision.
export async function GET() {
  const baseUrl = siteUrl();
  const sitemaps = await generateSitemaps();
  const locs = sitemaps.map((s) => `${baseUrl}/sitemap/${s.id}.xml`);
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    locs.map((u) => `  <sitemap><loc>${u}</loc></sitemap>`).join('\n') +
    `\n</sitemapindex>\n`;
  return new NextResponse(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
