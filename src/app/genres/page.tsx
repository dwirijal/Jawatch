import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
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
    <Container>
      <SectionHeader as="h1" eyebrow="Browse" title="Genres" description="Jump into a mood, trope, or format lane." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {genres.map((genre) => (
          <Link key={genre.slug} href={`/genres/${genre.slug}`} className="rounded-card border border-border bg-card p-6 text-center font-serif text-lg italic text-foreground transition-all duration-base hover:border-primary hover:text-primary motion-safe:hover:-translate-y-0.5">
            {genre.name}
          </Link>
        ))}
      </div>
    </Container>
  );
}
