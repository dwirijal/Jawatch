import { getMediaBySlug, getChapters, getChapterPages } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export const dynamicParams = true;

export default async function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  const content = await getMediaBySlug(slug);

  if (!content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 rounded-full bg-[rgb(var(--color-bg-secondary))] flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-[rgb(var(--color-fg-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[rgb(var(--color-fg-primary))] mb-2">Content Not Found</h1>
        <p className="text-[rgb(var(--color-fg-secondary))] mb-8 max-w-md">
          We couldn&apos;t find the content you&apos;re looking for. It may have been removed or doesn&apos;t exist yet.
        </p>
        <Link href="/" className="px-6 py-3 bg-[rgb(var(--color-accent))] text-[rgb(var(--color-fg-primary))] rounded-lg font-semibold hover:bg-[rgb(var(--color-accent-hover))] transition-colors">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const chapters = await getChapters(slug);
  const firstCh = chapters[0];
  const pages = firstCh ? await getChapterPages(slug, firstCh.slug) : [];

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]" id="reader-root">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[rgb(var(--color-bg-primary))] via-[rgba(var(--color-bg-primary),0.95)] to-transparent transition-opacity duration-300">
        <div className="px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[rgb(var(--color-fg-primary))] hover:text-[rgb(var(--color-accent))] transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold">Back</span>
          </Link>
          <div className="text-center">
            <h1 className="text-lg md:text-xl font-bold text-[rgb(var(--color-fg-primary))] line-clamp-1">
              {content.title}
            </h1>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Content Header */}
      <div className="relative h-[50vh] min-h-[400px] mb-8">
        {content.coverImage ? (
          <Image src={content.coverImage} alt={content.title} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-primary))]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--color-bg-primary))] via-[rgba(var(--color-bg-primary),0.7)] to-transparent" />

        <div className="relative h-full flex flex-col justify-end px-4 md:px-8 pb-8">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-[rgb(var(--color-accent))] text-[rgb(var(--color-fg-primary))] text-xs font-bold uppercase tracking-wider rounded">
                {content.type}
              </span>
              {content.status && (
                <span className="px-3 py-1 bg-[rgb(var(--color-fg-primary))]/10 text-[rgb(var(--color-fg-primary))] text-xs font-semibold uppercase tracking-wider rounded">
                  {content.status}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 heading-display text-[rgb(var(--color-fg-primary))]">
              {content.title}
            </h1>
            {content.synopsis && (
              <p className="text-[rgb(var(--color-fg-secondary))] text-base leading-relaxed line-clamp-3 max-w-2xl">
                {content.synopsis}
              </p>
            )}
            {content.genres && content.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {content.genres.map(g => (
                  <span key={g.slug} className="px-3 py-1 bg-[rgb(var(--color-fg-primary))]/5 text-[rgb(var(--color-fg-secondary))] text-xs rounded-full">
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chapter List */}
      {chapters.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 md:px-8 pb-8">
          <h2 className="text-2xl font-bold text-[rgb(var(--color-fg-primary))] mb-6">Chapters</h2>
          <div className="space-y-2">
            {chapters.map((ch, i) => (
              <div key={`${ch.slug}-${i}`} className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg hover:bg-[rgb(var(--color-bg-elevated))] transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <h3 className="text-[rgb(var(--color-fg-primary))] font-semibold">Chapter {ch.chapterNumber || i + 1}</h3>
                  <span className="text-[rgb(var(--color-fg-muted))] text-xs">
                    {new Date(ch.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reader - Vertical scroll */}
      {pages.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold text-[rgb(var(--color-fg-primary))] mb-6 text-center">
            {firstCh ? `Chapter ${firstCh.chapterNumber}` : 'Reader'}
          </h2>
          <div className="space-y-1">
            {pages.map((page, i) => (
              <div key={i} className="w-full">
                <img src={page.url} alt={`Page ${i + 1}`} className="w-full h-auto" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No chapters yet */}
      {chapters.length === 0 && (
        <div className="max-w-4xl mx-auto px-4 md:px-8 pb-16 text-center">
          <svg className="w-24 h-24 text-[rgb(var(--color-fg-subtle))] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2 className="text-2xl font-bold text-[rgb(var(--color-fg-primary))] mb-2">No Chapters Yet</h2>
          <p className="text-[rgb(var(--color-fg-secondary))]">Chapters will appear here once available.</p>
        </div>
      )}
    </div>
  );
}
