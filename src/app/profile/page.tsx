import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { EmptyState } from '@/components/sections/EmptyState';
import { UserRound } from 'lucide-react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <Container>
      <EmptyState as="h1" icon={<UserRound className="h-6 w-6" aria-hidden="true" />} eyebrow="Profile" title="Profile is offline" description="jawatch is running standalone here. Account features can be added after storage and auth are approved." href="/discover" actionLabel="Browse instead" />
    </Container>
  );
}
