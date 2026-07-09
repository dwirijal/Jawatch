import { Skeleton, SkeletonGrid } from '@/components/ui';
import { Container } from '@/components/layout/Container';

export default function SearchLoading() {
  return (
    <Container>
      <div className="mb-8 space-y-3">
        <Skeleton className="h-4 w-24" rounded="sm" />
        <Skeleton className="h-10 w-72" rounded="sm" />
      </div>
      <Skeleton className="mb-8 h-12 w-full" rounded="card" />
      <SkeletonGrid count={10} />
    </Container>
  );
}
