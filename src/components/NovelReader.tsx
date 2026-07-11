import Link from 'next/link';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import type { Chapter, NovelChapter } from '@/lib/api';

interface Props {
  chapter: NovelChapter;
  chapters: Chapter[];
  currentChapterSlug: string;
  itemBasePath: string;
  detailPath: string;
}

// Server component: novel chapters are prose. Paragraphs arrive pre-stripped to plain
// text so React auto-escapes them — no dangerouslySetInnerHTML, no sanitizer dep.
export function NovelReader({ chapter, chapters, currentChapterSlug, itemBasePath, detailPath }: Props) {
  const idx = chapters.findIndex((c) => c.slug === currentChapterSlug);
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx !== -1 && idx < chapters.length - 1 ? chapters[idx + 1] : null;

  return (
    <article className="mx-auto max-w-2xl">
      <Nav prev={prev} next={next} base={itemBasePath} detailPath={detailPath} />
      <div className="prose-reader mt-8 space-y-4 text-pretty font-serif text-lg leading-relaxed text-foreground">
        {chapter.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mt-10">
        <Nav prev={prev} next={next} base={itemBasePath} detailPath={detailPath} />
      </div>
    </article>
  );
}

function Nav({ prev, next, base, detailPath }: { prev: Chapter | null; next: Chapter | null; base: string; detailPath: string }) {
  return (
    <nav className="flex items-center justify-between gap-2" aria-label="Chapter navigation">
      {prev ? (
        <Link href={`${base}/${prev.slug}`} className="inline-flex items-center gap-1 rounded-pill border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Prev
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-pill border border-border/50 px-4 py-2 text-sm text-muted-foreground" aria-disabled="true">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Prev
        </span>
      )}
      <Link href={detailPath} className="inline-flex items-center gap-1 rounded-pill border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary" aria-label="Chapter list">
        <List className="h-4 w-4" aria-hidden="true" />
      </Link>
      {next ? (
        <Link href={`${base}/${next.slug}`} className="inline-flex items-center gap-1 rounded-pill border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary">
          Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-pill border border-border/50 px-4 py-2 text-sm text-muted-foreground" aria-disabled="true">
          Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
