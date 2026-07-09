import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { getMedia } from '@/lib/api';
import { MediaGrid } from '@/components/sections/MediaGrid';
import Link from 'next/link';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Discover',
  description: 'Jelajahi katalog anime, manga, donghua, movie, comic, dan novel di jawatch.',
  alternates: { canonical: '/discover' },
};

// Only types with an upstream data source. manga/movie have no backing feed -> would render empty dead-end pages.
const types = ['anime', 'donghua', 'comic', 'novel'];

export default async function DiscoverPage() {
  const { data: contents } = await getMedia(undefined, 1, 60);

  return (
    <Container>
      <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Discover</h1>
      <p className="mt-2 text-sm text-muted-foreground">Filter the catalog by format, then jump into the title that fits tonight.</p>
      <div className="mb-8 flex flex-wrap gap-2">
        {types.map((type) => (
          <Link key={type} href={`/discover/${type}`} className="rounded-pill border border-border bg-card px-4 py-2 font-mono text-micro uppercase text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            {type}
          </Link>
        ))}
      </div>
      <MediaGrid items={contents} />
    </Container>
  );
}
