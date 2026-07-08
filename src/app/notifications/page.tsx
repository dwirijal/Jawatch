import type { Metadata } from 'next';
import { EmptyState } from '@/components/sections/EmptyState';
import { Bell } from 'lucide-react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <EmptyState icon={<Bell className="h-6 w-6" aria-hidden="true" />} eyebrow="Notifications" title="Quiet for now" description="Release alerts need account storage. For now, discover pages are the source of truth." href="/latest" actionLabel="See latest" />
    </div>
  );
}
