import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { getMedia } from '@/lib/api';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 300;

const validTypes = ['anime', 'donghua', 'comic', 'novel'];
const PER_PAGE = 40;

export function generateStaticParams() {
  return validTypes.map((type) => ({ type }));
}

type Props = {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  if (!validTypes.includes(type)) return { robots: { index: false, follow: false } };
  return {
    title: `Discover ${type}`,
    description: `Curated ${type} picks from the jawatch catalog.`,
    alternates: { canonical: `/discover/${type}` },
  };
}

export default async function DiscoverTypePage({ params, searchParams }: Props) {
  const { type } = await params;
  const sp = searchParams ? await searchParams : {};
  const { page: pageStr } = sp;

  if (!validTypes.includes(type)) notFound();

  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);
  const { data: contents, total } = await getMedia(type, page, PER_PAGE);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <Container>
      <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground capitalize">{type}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Curated {type} picks from the jawatch catalog.</p>

      {/* Type filter tabs */}
      <div className="mt-6 mb-8 flex flex-wrap gap-2">
        <Link href="/discover" className="rounded-pill border border-border bg-card px-4 py-2 font-mono text-micro uppercase text-muted-foreground transition-colors hover:border-primary hover:text-primary">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/discover/${type}?page=${page - 1}`}
              className="rounded-pill border border-border bg-card px-4 py-2 font-mono text-micro uppercase text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              ← Prev
            </Link>
          )}
          <span className="font-mono text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/discover/${type}?page=${page + 1}`}
              className="rounded-pill border border-border bg-card px-4 py-2 font-mono text-micro uppercase text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </Container>
  );
}
