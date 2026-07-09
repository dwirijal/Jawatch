import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { EmptyState } from '@/components/sections/EmptyState';
import { ListPlus } from 'lucide-react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ListsPage() {
  return (
    <Container>
      <EmptyState icon={<ListPlus className="h-6 w-6" aria-hidden="true" />} eyebrow="Library" title="No custom lists" description="Manual list building is intentionally not wired until account storage exists." href="/popular" actionLabel="See popular" />
    </Container>
  );
}
