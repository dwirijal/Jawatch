import { Skeleton, SkeletonGrid } from '@/components/ui';
import { Container } from '@/components/layout/Container';

export default function LatestLoading() {
  return (
    <Container y="48px">
      <div className="mb-6 border-l-2 border-amber pl-4">
        <Skeleton className="h-3 w-16" rounded="sm" />
        <Skeleton className="mt-2 h-8 w-48" rounded="sm" />
      </div>
      <Skeleton className="mb-4 h-3 w-20" rounded="sm" />
      <SkeletonGrid count={10} />
    </Container>
  );
}
