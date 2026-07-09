import { Skeleton, SkeletonGrid } from '@/components/ui';

export default function DiscoverTypeLoading() {
  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-4 w-20" rounded="sm" />
        <Skeleton className="h-9 w-56" rounded="sm" />
      </div>
      <SkeletonGrid count={15} />
    </div>
  );
}
