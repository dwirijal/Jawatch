import type { Metadata } from 'next';
import { Container } from '@/components/layout/Container';
import { EmptyState } from '@/components/sections/EmptyState';
import { ProgressList } from '@/components/sections/ProgressList';
import { BookOpen } from 'lucide-react';
import { getUserId } from '@/lib/session';
import { listProgress } from '@/lib/library';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ReadingProgressPage() {
  const userId = await getUserId();
  if (!userId) {
    return (
      <Container>
        <EmptyState icon={<BookOpen className="h-6 w-6" aria-hidden="true" />} eyebrow="Library" title="Sign in to track reading" description="Chapter positions are tied to your account." href="/login" actionLabel="Sign in" />
      </Container>
    );
  }
  const items = await listProgress(userId, 'read');
  if (items.length === 0) {
    return (
      <Container>
        <EmptyState icon={<BookOpen className="h-6 w-6" aria-hidden="true" />} eyebrow="Library" title="No reading progress" description="Chapters you read will show up here to resume." href="/discover/comic" actionLabel="Find comics" />
      </Container>
    );
  }
  return (
    <Container>
      <h1 className="mb-6 border-l-2 border-amber pl-4 font-serif text-xl font-bold text-foreground">Reading progress</h1>
      <ProgressList items={items} kind="chapters" />
    </Container>
  );
}
