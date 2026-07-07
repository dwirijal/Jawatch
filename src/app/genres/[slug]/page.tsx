import type { Metadata } from 'next';
import { getMediaByGenre } from '@/lib/api';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';

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
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <SectionHeader eyebrow="Genre" title={title} href="/genres" actionLabel="All genres" />
      <MediaGrid items={contents} />
    </div>
  );
}
