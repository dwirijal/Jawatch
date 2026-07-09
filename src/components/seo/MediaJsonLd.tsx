import type { Media } from '@/lib/api';
import { siteUrl } from '@/lib/site-url';

// schema.org type per media vertical → rich results eligibility.
const SCHEMA_TYPE: Record<string, string> = {
  anime: 'TVSeries',
  donghua: 'TVSeries',
  movie: 'Movie',
  manga: 'Book',
  comic: 'Book',
  novel: 'Book',
};

// Structured data for a media detail page: the work itself + breadcrumb trail.
// Rendered as a JSON-LD script (Google's recommended format).
export function MediaJsonLd({ media, canonicalPath }: { media: Media; canonicalPath: string }) {
  const base = siteUrl().replace(/\/$/, '');
  const url = `${base}${canonicalPath}`;

  const work: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': SCHEMA_TYPE[media.type] ?? 'CreativeWork',
    name: media.title,
    url,
    ...(media.synopsis ? { description: media.synopsis } : {}),
    ...(media.coverImage ? { image: media.coverImage } : {}),
    ...(media.genres?.length ? { genre: media.genres.map((g) => g.name) } : {}),
    ...(media.authors?.length ? { author: media.authors.map((a) => ({ '@type': 'Person', name: a.name })) } : {}),
    ...(media.rating && media.rating.count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: media.rating.average,
            ratingCount: media.rating.count,
            bestRating: 10,
          },
        }
      : {}),
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: base },
      { '@type': 'ListItem', position: 2, name: media.type, item: `${base}/discover/${media.type}` },
      { '@type': 'ListItem', position: 3, name: media.title, item: url },
    ],
  };

  // Escape `<` so an upstream title/synopsis containing "</script>" can't break out
  // of the JSON-LD tag (JSON.stringify alone does not neutralize this).
  const json = JSON.stringify([work, breadcrumb]).replace(/</g, '\\u003c');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
