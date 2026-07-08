import type { Metadata } from 'next';
import { getMediaBySlug, getChapterPages, getChapters } from '@/lib/api';
import { MangaReader } from '@/components/MangaReader';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function ChapterPage({ params }: { params: Promise<{ type: string; slug: string; chapterSlug: string }> }) {
  const { type, slug, chapterSlug } = await params;
  const decodeSlug = `${type}/${slug}`;
  const pages = await getChapterPages(decodeSlug, chapterSlug);
  const content = await getMediaBySlug(decodeSlug);
  const chapters = await getChapters(decodeSlug);

  if (!content || pages.length === 0) notFound();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <MangaReader slug={decodeSlug} chapters={chapters} initialPages={pages} currentChapterSlug={chapterSlug} />
    </div>
  );
}
