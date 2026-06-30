import { SkeletonCard } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="h-[55vh] min-h-[420px] w-full animate-pulse bg-[rgb(var(--color-bg-secondary))]" />
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    </div>
  );
}
