import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { getMedia } from '@/lib/api';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 300;

// Only types with an upstream data source. manga/movie have no backing feed -> 404 instead of empty page.
const validTypes = ['anime', 'donghua', 'comic', 'novel'];

// Prerender the fixed type set so these pages are cached (SSG + ISR), not rendered
// per request. Bounded list → safe to build-time generate.
export function generateStaticParams() {
  return validTypes.map((type) => ({ type }));
}

type Props = { params: Promise<{ type: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;

  if (!validTypes.includes(type)) return { robots: { index: false, follow: false } };

  return {
    title: `Discover ${type}`,
    description: `Curated ${type} picks from the jawatch catalog.`,
    alternates: { canonical: `/discover/${type}` },
  };
}

export default async function DiscoverTypePage({ params }: Props) {
  const { type } = await params;

  if (!validTypes.includes(type)) notFound();

  const { data: contents } = await getMedia(type, 1, 60);

  return (
    <Container>
      <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground capitalize">{type}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Curated {type} picks from the jawatch catalog.</p>
      <div className="mt-6 mb-8 flex flex-wrap gap-2">
        <Link href="/discover" className="rounded-full border border-border bg-card px-4 py-2 font-mono text-micro uppercase text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          All
        </Link>
        {validTypes.map((t) => (
          <Link
            key={t}
            href={`/discover/${t}`}
            aria-current={t === type ? 'page' : undefined}
            className={`rounded-pill border px-4 py-2 font-mono text-micro uppercase transition-colors ${t === type ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'}`}
          >
            {t}
          </Link>
        ))}
      </div>
      <MediaGrid items={contents} />
    </Container>
  );
}
