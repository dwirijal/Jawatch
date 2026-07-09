import { siteUrl } from '@/lib/site-url';

type Crumb = { name: string; path: string };

// BreadcrumbList JSON-LD for watch/reader pages (detail already emits its own via
// MediaJsonLd). Escape `<` so upstream titles can't break out of the script tag.
export function BreadcrumbJsonLd({ crumbs }: { crumbs: Crumb[] }) {
  const base = siteUrl().replace(/\/$/, '');
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${base}${c.path}`,
    })),
  };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
