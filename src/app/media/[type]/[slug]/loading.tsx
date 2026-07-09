import { Skeleton, SkeletonGrid } from '@/components/ui';
import { Container } from '@/components/layout/Container';

export default function MediaLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative min-h-[520px] overflow-hidden border-b border-border bg-background">
        <Container className="relative grid min-h-[520px] items-end gap-8 pb-12 pt-28 md:grid-cols-[220px_1fr]">
          <Skeleton className="aspect-[2/3] w-44 md:w-full" rounded="card" />
          <div className="max-w-3xl space-y-4 pb-2">
            <Skeleton className="h-4 w-32" rounded="chip" />
            <Skeleton className="h-12 w-3/4" rounded="sm" />
            <Skeleton className="h-4 w-56" rounded="sm" />
            <Skeleton className="h-20 w-full" rounded="sm" />
            <Skeleton className="h-12 w-40" rounded="pill" />
          </div>
        </Container>
      </div>
      <Container y="4rem">
        <Skeleton className="mb-6 h-6 w-32" rounded="sm" />
        <SkeletonGrid count={8} />
      </Container>
    </div>
  );
}
