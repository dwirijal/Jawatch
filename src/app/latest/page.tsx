import type { Metadata } from 'next';
import { getLatest } from '@/lib/api';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';

export const metadata: Metadata = {
  title: 'Latest',
  description: 'Rilisan terbaru anime, donghua, manga, comic, movie, dan novel di jawatch.',
  alternates: { canonical: '/latest' },
};

export const revalidate = 300;

export default async function LatestPage() {
  const contents = await getLatest(undefined, 60);

  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <SectionHeader eyebrow="Browse" title="Latest drops" description="Fresh episodes, chapters, and releases added to the shelf." />
      <MediaGrid items={contents} />
    </div>
  );
}
