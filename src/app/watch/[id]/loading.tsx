import { SkeletonImage, SkeletonText } from '@/components/Skeleton';

export default function WatchLoading() {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Header Skeleton */}
      <div className="bg-[rgb(var(--color-bg-secondary))] border-b border-[rgba(var(--color-fg-primary),0.1)]">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="h-4 bg-[rgb(var(--color-bg-elevated))] rounded w-32 mb-6" />
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-48 md:w-64">
              <SkeletonImage />
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-12 bg-[rgb(var(--color-bg-elevated))] rounded w-3/4" />
              <div className="h-6 bg-[rgb(var(--color-bg-elevated))] rounded w-1/4" />
              <SkeletonText lines={4} />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-16 bg-[rgb(var(--color-bg-secondary))] rounded" />
            <div className="h-32 bg-[rgb(var(--color-bg-secondary))] rounded" />
          </div>
          <div className="lg:col-span-1">
            <div className="h-96 bg-[rgb(var(--color-bg-secondary))] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}