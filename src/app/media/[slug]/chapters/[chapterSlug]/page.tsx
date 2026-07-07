import type { Metadata } from 'next';
import { getMediaBySlug, getChapterPages, getChapters } from '@/lib/api';
import { MangaReader } from '@/components/MangaReader';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function ChapterPage({ params }: { params: Promise<{ slug: string; chapterSlug: string }> }) {
  const { slug, chapterSlug } = await params;
  const pages = await getChapterPages(slug, chapterSlug);
  const content = await getMediaBySlug(slug);
  const chapters = await getChapters(slug);

  if (!content || pages.length === 0) notFound();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <MangaReader slug={slug} chapters={chapters} initialPages={pages} currentChapterSlug={chapterSlug} />
    </div>
  );
}
