import type { Metadata } from 'next';
import { EmptyState } from '@/components/sections/EmptyState';
import { ProgressList } from '@/components/sections/ProgressList';
import { PlayCircle } from 'lucide-react';
import { getUserId } from '@/lib/session';
import { listProgress } from '@/lib/library';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function WatchProgressPage() {
  const userId = await getUserId();
  if (!userId) {
    return (
      <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
        <EmptyState icon={<PlayCircle className="h-6 w-6" aria-hidden="true" />} eyebrow="Library" title="Sign in to track watch progress" description="Resume points are tied to your account." href="/login" actionLabel="Sign in" />
      </div>
    );
  }
  const items = await listProgress(userId, 'watch');
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
        <EmptyState icon={<PlayCircle className="h-6 w-6" aria-hidden="true" />} eyebrow="Library" title="No watch progress" description="Episodes you watch will show up here to resume." href="/discover/anime" actionLabel="Find anime" />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <h1 className="mb-6 border-l-2 border-amber pl-4 font-serif text-xl font-bold text-foreground">Watch progress</h1>
      <ProgressList items={items} kind="episodes" />
    </div>
  );
}
