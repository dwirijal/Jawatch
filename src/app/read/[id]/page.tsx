import { getFullContent } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default async function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  const fullContent = await getFullContent(id);

  // Handle content not found
  if (!fullContent || !fullContent.id) {
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
        <Link
          href="/"
          className="px-6 py-3 bg-[rgb(var(--color-accent))] text-[rgb(var(--color-fg-primary))] rounded-lg font-semibold hover:bg-[rgb(var(--color-accent-hover))] transition-colors"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  const content = fullContent;
  const pages = fullContent.pages || [];

  // Group pages by chapter
  const chapters = pages.reduce((acc, page) => {
    if (!acc[page.chapter]) {
      acc[page.chapter] = [];
    }
    acc[page.chapter].push(page);
    return acc;
  }, {} as Record<number, typeof pages>);

  const chapterNumbers = Object.keys(chapters).map(Number).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]" id="reader-root">
      {/* Fixed Header - Tap to toggle */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[rgb(var(--color-bg-primary))] via-[rgba(var(--color-bg-primary),0.95)] to-transparent transition-opacity duration-300 reader-header">
        <div className="px-4 md:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[rgb(var(--color-fg-primary))] hover:text-[rgb(var(--color-accent))] transition-colors"
          >
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

      {/* Content Header - Webtoon Style */}
      <div className="relative h-[50vh] min-h-[400px] mb-8">
        {content.cover_url ? (
          <Image
            src={content.cover_url}
            alt={content.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[rgb(var(--color-bg-secondary))] to-[rgb(var(--color-bg-primary))]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--color-bg-primary))] via-[rgba(var(--color-bg-primary),0.7)] to-transparent" />

        <div className="relative h-full flex flex-col justify-end px-4 md:px-8 pb-8">
          <div className="max-w-4xl mx-auto w-full">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-[rgb(var(--color-accent))] text-[rgb(var(--color-fg-primary))] text-xs font-bold uppercase tracking-wider rounded">
                Manga
              </span>
              <span className="px-3 py-1 bg-[rgba(var(--color-fg-primary),0.05)] backdrop-blur-sm text-[rgb(var(--color-fg-primary))] text-xs font-semibold uppercase tracking-wider rounded">
                {chapterNumbers.length} Chapters
              </span>
              <span className="px-3 py-1 bg-[rgba(var(--color-fg-primary),0.05)] backdrop-blur-sm text-[rgb(var(--color-fg-primary))] text-xs font-semibold uppercase tracking-wider rounded">
                {pages.length} Pages
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[rgb(var(--color-fg-primary))] mb-4 heading-display">
              {content.title}
            </h1>

            {/* Description */}
            {content.description && (
              <p className="text-base md:text-lg text-[rgb(var(--color-fg-primary))] line-clamp-3 max-w-2xl">
                {content.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reading Content - Seamless Vertical Scroll */}
      <div className="max-w-4xl mx-auto px-0 md:px-4 pb-16">
        {/* Table of Contents */}
        <section className="mb-12 px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--color-fg-primary))] mb-6 heading-section">
            Chapters
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {chapterNumbers.map((chapterNum) => (
              <a
                key={chapterNum}
                href={`#chapter-${chapterNum}`}
                className="px-4 py-3 bg-[rgba(var(--color-fg-primary),0.05)] hover:bg-[rgba(var(--color-fg-primary),0.05)] backdrop-blur-sm rounded-lg border border-[rgba(var(--color-fg-primary),0.1)] hover:border-[rgba(var(--color-accent),0.5)] transition-all group"
              >
                <div className="text-[rgb(var(--color-fg-primary))] font-semibold group-hover:text-[rgb(var(--color-accent))] transition-colors">
                  Chapter {chapterNum}
                </div>
                <div className="text-sm text-[rgb(var(--color-fg-muted))] mt-1">
                  {chapters[chapterNum].length} pages
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Vertical Scroll Reader - True Webtoon Style */}
        {chapterNumbers.map((chapterNum) => (
          <section
            key={chapterNum}
            id={`chapter-${chapterNum}`}
            className="mb-0 scroll-mt-20"
          >
            {/* Chapter Header - Minimal */}
            <div className="sticky top-20 z-40 mb-0">
              <div className="bg-[rgb(var(--color-bg-primary))]/95 backdrop-blur-sm border-y border-[rgba(var(--color-fg-primary),0.1)] px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-[rgb(var(--color-fg-primary))]">
                    Chapter {chapterNum}
                  </h2>
                  <p className="text-sm text-[rgb(var(--color-fg-muted))] mt-1">
                    {chapters[chapterNum].length} pages
                  </p>
                </div>
                <div className="text-sm text-[rgb(var(--color-fg-muted))]">
                  Scroll to read
                </div>
              </div>
            </div>

            {/* Pages - Seamless Vertical Scroll (NO GAPS) */}
            <div className="flex flex-col">
              {chapters[chapterNum]
                .sort((a, b) => a.page_number - b.page_number)
                .map((page) => (
                  <div
                    key={page.id}
                    className="relative w-full bg-[rgb(var(--color-bg-secondary))]"
                  >
                    <Image
                      src={page.url}
                      alt={`${content.title} - Chapter ${chapterNum} - Page ${page.page_number}`}
                      width={800}
                      height={1200}
                      className="w-full h-auto"
                      sizes="(max-width: 768px) 100vw, 800px"
                      loading="lazy"
                    />
                  </div>
                ))}
            </div>
          </section>
        ))}

        {/* Empty State */}
        {pages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="w-24 h-24 rounded-full bg-[rgb(var(--color-bg-secondary))] flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-[rgb(var(--color-fg-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[rgb(var(--color-fg-primary))] mb-2">No Pages Available</h2>
            <p className="text-[rgb(var(--color-fg-secondary))] mb-6 max-w-md">
              This content hasn&apos;t been scraped yet. Our system is working on it. Please check back later or try a different title.
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-[rgb(var(--color-accent))] text-[rgb(var(--color-fg-primary))] rounded-lg font-semibold hover:bg-[rgb(var(--color-accent-hover))] transition-colors"
            >
              Browse Other Titles
            </Link>
          </div>
        )}
      </div>

      {/* Floating Progress Indicator */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-12 h-12 bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent-hover))] rounded-full flex items-center justify-center shadow-2xl transition-colors"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6 text-[rgb(var(--color-fg-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

      {/* Client-side script for tap-to-toggle UI */}
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const header = document.querySelector('.reader-header');
            const root = document.getElementById('reader-root');
            let headerVisible = true;

            function toggleHeader() {
              headerVisible = !headerVisible;
              header.style.opacity = headerVisible ? '1' : '0';
              header.style.pointerEvents = headerVisible ? 'auto' : 'none';
            }

            // Tap on reader area to toggle
            root.addEventListener('click', function(e) {
              // Don't toggle if clicking on links or buttons
              if (e.target.closest('a, button, select, input')) return;
              toggleHeader();
            });

            // Keyboard shortcut: H to toggle header
            document.addEventListener('keydown', function(e) {
              if (e.key === 'h' || e.key === 'H') {
                e.preventDefault();
                toggleHeader();
              }
            });
          })();
        `
      }} />
    </div>
  );
}
