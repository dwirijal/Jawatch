import type { Metadata } from 'next';
import { getPopular } from '@/lib/api';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Popular',
  description: 'Judul populer di jawatch untuk tontonan dan bacaan berikutnya.',
  alternates: { canonical: '/popular' },
};

export const revalidate = 300;

export default async function PopularPage() {
  const contents = await getPopular(60);

  return (
    <Container y="48px">
      <SectionHeader as="h1" eyebrow="Browse" title="Popular now" description="Crowd-favorite titles across watch and read modes." />
      <p className="mb-4 font-mono text-xs text-muted-foreground">{contents.length} titles</p>
      <MediaGrid items={contents} />
    </Container>
  );
}
