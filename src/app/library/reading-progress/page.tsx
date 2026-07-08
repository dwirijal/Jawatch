import type { Metadata } from 'next';
import { EmptyState } from '@/components/sections/EmptyState';
import { BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ReadingProgressPage() {
  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <EmptyState icon={<BookOpen className="h-6 w-6" aria-hidden="true" />} eyebrow="Library" title="No reading progress" description="Reader progress will appear here after persistent library state is added." href="/discover/comic" actionLabel="Find comics" />
    </div>
  );
}
