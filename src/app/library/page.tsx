import type { Metadata } from 'next';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { Bookmark, BookOpen, Clock3, ListPlus, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const tiles = [
  { href: '/library/bookmarks', label: 'Bookmarks', description: 'Saved titles land here once accounts exist.', icon: Bookmark },
  { href: '/library/history', label: 'History', description: 'Recently opened episodes and chapters.', icon: Clock3 },
  { href: '/library/reading-progress', label: 'Reading Progress', description: 'Chapter positions for manga, comics, and novels.', icon: BookOpen },
  { href: '/library/watch-progress', label: 'Watch Progress', description: 'Episode positions for anime, donghua, and movies.', icon: PlayCircle },
  { href: '/library/lists', label: 'Custom Lists', description: 'Personal shelves after storage is approved.', icon: ListPlus },
];

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <SectionHeader eyebrow="Library" title="Your shelf" description="Standalone placeholders for saved titles and progress surfaces." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href} className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/70">
            <Icon className="mb-5 h-6 w-6 text-primary" aria-hidden="true" />
            <div className="font-serif text-xl font-semibold text-foreground group-hover:text-primary">{label}</div>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
