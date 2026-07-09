import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { EmptyState } from '@/components/sections/EmptyState';
import { Bell } from 'lucide-react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function NotificationsPage() {
  return (
    <Container>
      <EmptyState icon={<Bell className="h-6 w-6" aria-hidden="true" />} eyebrow="Notifications" title="Quiet for now" description="Release alerts need account storage. For now, discover pages are the source of truth." href="/latest" actionLabel="See latest" />
    </Container>
  );
}
