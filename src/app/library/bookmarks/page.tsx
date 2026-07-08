import type { Metadata } from 'next';
import { EmptyState } from '@/components/sections/EmptyState';
import { Bookmark } from 'lucide-react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function BookmarksPage() {
  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <EmptyState icon={<Bookmark className="h-6 w-6" aria-hidden="true" />} eyebrow="Library" title="No bookmarks yet" description="Saved titles will appear here when library sync lands." href="/discover" actionLabel="Browse titles" />
    </div>
  );
}
