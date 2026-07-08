import type { Metadata } from 'next';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { getGenres } from '@/lib/api';
import Link from 'next/link';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Genres',
  description: 'Browse jawatch titles by genre, mood, trope, or format lane.',
  alternates: { canonical: '/genres' },
};

export default async function GenresPage() {
  const genres = await getGenres();

  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <SectionHeader eyebrow="Browse" title="Genres" description="Jump into a mood, trope, or format lane." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {genres.map((genre) => (
          <Link key={genre.slug} href={`/genres/${genre.slug}`} className="rounded-2xl border border-border bg-card p-6 text-center font-serif text-lg italic text-foreground transition-colors hover:border-primary hover:text-primary">
            {genre.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
