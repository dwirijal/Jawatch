import type { Metadata } from 'next';
import { getTrending } from '@/lib/api';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Trending',
  description: 'Judul yang sedang ramai ditonton dan dibaca di jawatch.',
  alternates: { canonical: '/trending' },
};

export default async function TrendingPage() {
  const contents = await getTrending(undefined, 60);

  return (
    <Container y="48px">
      <SectionHeader eyebrow="Browse" title="Trending tonight" description="Fast-moving picks for the next watch or chapter run." />
      <p className="mb-4 font-mono text-xs text-muted-foreground">{contents.length} titles</p>
      <MediaGrid items={contents} />
    </Container>
  );
}
