import type { Metadata } from 'next';
import { EmptyState } from '@/components/sections/EmptyState';
import { UserRound } from 'lucide-react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <EmptyState icon={<UserRound className="h-6 w-6" aria-hidden="true" />} eyebrow="Profile" title="Profile is offline" description="jawatch is running standalone here. Account features can be added after storage and auth are approved." href="/discover" actionLabel="Browse instead" />
    </div>
  );
}
