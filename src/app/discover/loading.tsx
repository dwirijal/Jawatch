import { Skeleton, SkeletonGrid } from '@/components/ui';
import { Container } from '@/components/layout/Container';

export default function DiscoverLoading() {
  return (
    <Container>
      <Skeleton className="h-9 w-40" rounded="sm" />
      <Skeleton className="mt-2 h-4 w-80" rounded="sm" />
      <div className="mb-8 mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20" rounded="pill" />
        ))}
      </div>
      <SkeletonGrid count={10} />
    </Container>
  );
}
