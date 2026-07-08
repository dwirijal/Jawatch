import type { Metadata } from 'next';
import { EmptyState } from '@/components/sections/EmptyState';
import { PlayCircle } from 'lucide-react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function WatchProgressPage() {
  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <EmptyState icon={<PlayCircle className="h-6 w-6" aria-hidden="true" />} eyebrow="Library" title="No watch progress" description="Watch progress will appear here after persistent library state is added." href="/discover/anime" actionLabel="Find anime" />
    </div>
  );
}
