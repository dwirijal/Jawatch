import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import Image from 'next/image';
import Link from 'next/link';
import { EmptyState } from '@/components/sections/EmptyState';
import { Bookmark } from 'lucide-react';
import { getUserId } from '@/lib/session';
import { listBookmarks } from '@/lib/library';
import { decodeMediaRef, buildCanonicalPath } from '@/lib/api';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function BookmarksPage() {
  const userId = await getUserId();

  if (!userId) {
    return (
      <Container>
        <EmptyState icon={<Bookmark className="h-6 w-6" aria-hidden="true" />} eyebrow="Library" title="Sign in to see bookmarks" description="Saved titles are tied to your account. Sign in to start building your shelf." href="/login" actionLabel="Sign in" />
      </Container>
    );
  }

  const bookmarks = await listBookmarks(userId);

  if (bookmarks.length === 0) {
    return (
      <Container>
        <EmptyState icon={<Bookmark className="h-6 w-6" aria-hidden="true" />} eyebrow="Library" title="No bookmarks yet" description="Tap the bookmark on any title to save it here." href="/discover" actionLabel="Browse titles" />
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="mb-6 border-l-2 border-amber pl-4 font-serif text-xl font-bold text-foreground">Bookmarks</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bookmarks.map((item) => {
          const ref = decodeMediaRef(item.mediaRef);
          if (!ref) return null;
          const path = buildCanonicalPath(ref);
          return (
            <Link key={item.mediaRef} href={path} className="group rounded-page border border-border bg-card/40 p-3">
              <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-background">
                {item.coverImage ? <Image src={item.coverImage} alt={item.title} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
              </div>
              <div className="mt-3 font-serif text-sm text-foreground line-clamp-2">{item.title}</div>
              <div className="mt-1 text-tag uppercase text-muted-foreground">{item.mediaType}</div>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
