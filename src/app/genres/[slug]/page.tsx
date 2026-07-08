import type { Metadata } from 'next';
import { getMediaByGenre } from '@/lib/api';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { Container } from '@/components/layout/Container';

type Props = { params: Promise<{ slug: string }> };

function genreTitle(slug: string): string {
  return slug.replaceAll('-', ' ');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = genreTitle(slug);

  return {
    title,
    description: `Browse ${title} titles on jawatch.`,
    alternates: { canonical: `/genres/${slug}` },
  };
}

export default async function GenreSlugPage({ params }: Props) {
  const { slug } = await params;
  const contents = await getMediaByGenre(slug);
  const title = genreTitle(slug);

  return (
    <Container y="48px">
      <SectionHeader eyebrow="Genre" title={title} href="/genres" actionLabel="All genres" />
      <p className="mb-4 font-mono text-xs text-muted-foreground-foreground">{contents.length} titles</p>
      <MediaGrid items={contents} />
    </Container>
  );
}
