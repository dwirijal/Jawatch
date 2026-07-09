import type { Metadata } from 'next';
import { getMediaBySlug, getChapterPages, getChapters } from '@/lib/api';
import { MangaReader } from '@/components/MangaReader';
import { EmptyState } from '@/components/sections/EmptyState';
import { SupportCTA } from '@/components/sections/SupportCTA';
import { after } from 'next/server';
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

  // Record resume point + history via after(): runs post-response so DB latency never
  // blocks reading, and Vercel keeps the instance alive until it settles.
  const current = chapters.find((c) => c.slug === chapterSlug);
  const userId = await getUserId();
  if (userId) {
    after(Promise.all([
      upsertProgress(userId, { mediaRef: decodeSlug, mediaType: content.type, itemSlug: chapterSlug, itemNumber: current?.chapterNumber ?? 1, title: content.title }),
      recordHistory(userId, decodeSlug, chapterSlug),
    ]).catch(() => {}));
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <MangaReader slug={decodeSlug} chapters={chapters} initialPages={pages} currentChapterSlug={chapterSlug} mediaType={content.type} title={content.title} />
      <div className="mt-10"><SupportCTA /></div>
    </div>
  );
}
