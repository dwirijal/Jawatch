import type { Metadata } from 'next';
import { getPopular } from '@/lib/api';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';

export const metadata: Metadata = {
  title: 'Popular',
  description: 'Judul populer di jawatch untuk tontonan dan bacaan berikutnya.',
  alternates: { canonical: '/popular' },
};

export default async function PopularPage() {
  const contents = await getPopular(60);

  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <SectionHeader eyebrow="Browse" title="Popular now" description="Crowd-favorite titles across watch and read modes." />
      <MediaGrid items={contents} />
    </div>
  );
}
