import { getMediaBySlug, getChapterPages } from '@/lib/api';
import { MangaReader } from '@/components/MangaReader';
import { notFound } from 'next/navigation';

export default async function ChapterPage({ params }: { params: Promise<{ slug: string; chapterSlug: string }> }) {
  const { slug, chapterSlug } = await params;
  const content = await getMediaBySlug(slug);
  const pages = await getChapterPages(slug, chapterSlug);

  if (!content || pages.length === 0) notFound();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <MangaReader slug={slug} chapters={[{ slug: chapterSlug, chapterNumber: 1, createdAt: '' }]} initialPages={pages} />
    </div>
  );
}
