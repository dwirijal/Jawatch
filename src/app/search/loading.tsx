import { Skeleton, SkeletonGrid } from '@/components/ui';

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-4 w-24" rounded="sm" />
        <Skeleton className="h-10 w-72" rounded="sm" />
      </div>
      <Skeleton className="mb-8 h-12 w-full" rounded="card" />
      <SkeletonGrid count={10} />
    </div>
  );
}
