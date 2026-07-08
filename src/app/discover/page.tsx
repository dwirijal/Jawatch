import type { Metadata } from 'next';
import { getMedia } from '@/lib/api';
import { MediaGrid } from '@/components/sections/MediaGrid';
import { SectionHeader } from '@/components/sections/SectionHeader';
import Link from 'next/link';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Discover',
  description: 'Jelajahi katalog anime, manga, donghua, movie, comic, dan novel di jawatch.',
  alternates: { canonical: '/discover' },
};

const types = ['anime', 'donghua', 'comic'];

export default async function DiscoverPage() {
  const { data: contents } = await getMedia(undefined, 1, 60);

  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <SectionHeader
        eyebrow="Discover"
        title="Browse the shelf"
        description="Filter the catalog by format, then jump into the title that fits tonight."
      />
      <div className="mb-8 flex flex-wrap gap-2">
        {types.map((type) => (
          <Link key={type} href={`/discover/${type}`} className="rounded-full border border-border bg-card px-4 py-2 font-mono text-[11px] uppercase tracking-[.08em] text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            {type}
          </Link>
        ))}
      </div>
      <MediaGrid items={contents} />
    </div>
  );
}
