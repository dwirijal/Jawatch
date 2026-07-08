import type { Metadata } from 'next';
import { EmptyState } from '@/components/sections/EmptyState';
import { Clock3 } from 'lucide-react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <EmptyState icon={<Clock3 className="h-6 w-6" aria-hidden="true" />} eyebrow="Library" title="No history yet" description="Watched and read activity will appear here after progress tracking is enabled." href="/discover" actionLabel="Start browsing" />
    </div>
  );
}
