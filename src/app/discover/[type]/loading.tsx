import { Skeleton, SkeletonGrid } from '@/components/ui';
import { Container } from '@/components/layout/Container';

export default function DiscoverTypeLoading() {
  return (
    <Container>
      <div className="mb-8 space-y-3">
        <Skeleton className="h-4 w-20" rounded="sm" />
        <Skeleton className="h-9 w-56" rounded="sm" />
      </div>
      <SkeletonGrid count={15} />
    </Container>
  );
}
