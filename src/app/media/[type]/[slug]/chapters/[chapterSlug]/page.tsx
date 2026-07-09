import type { Metadata } from 'next';
import { getMediaBySlug, getChapterPages, getChapters } from '@/lib/api';
import { MangaReader } from '@/components/MangaReader';
import { EmptyState } from '@/components/sections/EmptyState';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function ChapterPage({ params }: { params: Promise<{ type: string; slug: string; chapterSlug: string }> }) {
  const { type, slug, chapterSlug } = await params;
  const decodeSlug = `${type}/${slug}`;
  const pages = await getChapterPages(decodeSlug, chapterSlug);
  const content = await getMediaBySlug(decodeSlug);
  const chapters = await getChapters(decodeSlug);

  if (!content || pages.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <EmptyState
          eyebrow="Not found"
          title="Chapter tidak tersedia"
          description="Chapter yang kamu cari mungkin sudah dipindah atau tidak tersedia."
          href={`/${type}/${slug}`}
          actionLabel="Kembali ke detail"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <MangaReader slug={decodeSlug} chapters={chapters} initialPages={pages} currentChapterSlug={chapterSlug} />
    </div>
  );
}
