import type { Metadata } from 'next';
import { getTrending } from '@/lib/api';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';

export const metadata: Metadata = {
  title: 'Trending',
  description: 'Judul yang sedang ramai ditonton dan dibaca di jawatch.',
  alternates: { canonical: '/trending' },
};

export default async function TrendingPage() {
  const contents = await getTrending(undefined, 60);

  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <SectionHeader eyebrow="Browse" title="Trending tonight" description="Fast-moving picks for the next watch or chapter run." />
      <MediaGrid items={contents} />
    </div>
  );
}
