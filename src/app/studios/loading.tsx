import { Skeleton } from '@/components/ui';
import { Container } from '@/components/layout/Container';

export default function StudiosLoading() {
  return (
    <Container>
      <div className="mb-6 border-l-2 border-amber pl-4">
        <Skeleton className="h-3 w-16" rounded="sm" />
        <Skeleton className="mt-2 h-8 w-32" rounded="sm" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" rounded="card" />
        ))}
      </div>
    </Container>
  );
}
