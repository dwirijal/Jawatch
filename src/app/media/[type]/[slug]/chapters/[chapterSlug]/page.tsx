import type { Metadata } from 'next';
import { getMediaBySlug, getChapterPages, getChapters } from '@/lib/api';
import { MangaReader } from '@/components/MangaReader';
import { EmptyState } from '@/components/sections/EmptyState';
import { getUserId } from '@/lib/session';
import { upsertProgress, recordHistory } from '@/lib/library';

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

  // Fire-and-forget: record resume point + history for signed-in users. Never blocks reading.
  const current = chapters.find((c) => c.slug === chapterSlug);
  const userId = await getUserId();
  if (userId) {
    await Promise.all([
      upsertProgress(userId, { mediaRef: decodeSlug, mediaType: content.type, itemSlug: chapterSlug, itemNumber: current?.chapterNumber ?? 1, title: content.title }),
      recordHistory(userId, decodeSlug, chapterSlug),
    ]).catch(() => {});
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <MangaReader slug={decodeSlug} chapters={chapters} initialPages={pages} currentChapterSlug={chapterSlug} />
    </div>
  );
}
