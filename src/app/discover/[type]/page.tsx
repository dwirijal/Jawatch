import type { Metadata } from 'next';
import { getMedia } from '@/lib/api';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { notFound } from 'next/navigation';

const validTypes = ['anime', 'donghua', 'comic'];

type Props = { params: Promise<{ type: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;

  if (!validTypes.includes(type)) return { robots: { index: false, follow: false } };

  return {
    title: `Discover ${type}`,
    description: `Curated ${type} picks from the jawatch catalog.`,
    alternates: { canonical: `/discover/${type}` },
  };
}

export default async function DiscoverTypePage({ params }: Props) {
  const { type } = await params;

  if (!validTypes.includes(type)) notFound();

  const { data: contents } = await getMedia(type, 1, 60);

  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <SectionHeader eyebrow="Discover" title={type} description={`Curated ${type} picks from the jawatch catalog.`} href="/discover" actionLabel="All formats" />
      <MediaGrid items={contents} />
    </div>
  );
}
