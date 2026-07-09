import { Skeleton } from './Skeleton';

// Loading placeholder mirroring MediaGrid's layout (cols/gap/radius) so the
// swap to real cards causes no layout shift (CLS).
export function SkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-px overflow-hidden rounded-page border border-border bg-hairline sm:grid-cols-3 md:grid-cols-5"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-[2/3] w-full" rounded="sm" />
      ))}
    </div>
  );
}
