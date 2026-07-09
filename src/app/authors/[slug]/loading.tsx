import { Skeleton, SkeletonGrid } from '@/components/ui';
import { Container } from '@/components/layout/Container';

export default function AuthorSlugLoading() {
  return (
    <Container>
      <div className="mb-8">
        <Skeleton className="h-3 w-16" rounded="sm" />
        <Skeleton className="mt-2 h-9 w-48" rounded="sm" />
      </div>
      <SkeletonGrid count={10} />
    </Container>
  );
}
