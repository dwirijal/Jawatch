import type { Metadata } from 'next';
import { getLatest } from '@/lib/api';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Latest',
  description: 'Rilisan terbaru anime, donghua, manga, comic, movie, dan novel di jawatch.',
  alternates: { canonical: '/latest' },
};

export const revalidate = 300;

export default async function LatestPage() {
  const contents = await getLatest(undefined, 60);

  return (
    <Container y="48px">
      <SectionHeader as="h1" eyebrow="Browse" title="Latest drops" description="Fresh episodes, chapters, and releases added to the shelf." />
      <p className="mb-4 font-mono text-xs text-muted-foreground">{contents.length} titles</p>
      <MediaGrid items={contents} />
    </Container>
  );
}
