import type { Metadata } from 'next';
import { getMedia, getGenres } from '@/lib/api';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const validTypes = ['anime', 'donghua', 'comic'];

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

  const [{ data: contents }, genres] = await Promise.all([
    getMedia(type, 1, 60),
    getGenres(),
  ]);

  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <SectionHeader eyebrow="Discover" title={type} description={`Curated ${type} picks from the jawatch catalog.`} href="/discover" actionLabel="All formats" />
      {genres.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Link
              key={genre.slug}
              href={`/genres/${genre.slug}`}
              className="rounded-full border border-border bg-card px-4 py-2 font-mono text-[11px] uppercase tracking-[.08em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {genre.name}
            </Link>
          ))}
        </div>
      )}
      <MediaGrid items={contents} />
    </div>
  );
}
