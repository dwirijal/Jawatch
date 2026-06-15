import { SkeletonText } from '@/components/Skeleton';

export default function ReadLoading() {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Header Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[rgb(var(--color-bg-primary))]/95 border-b border-[rgba(var(--color-fg-primary),0.1)]">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="h-6 w-16 bg-[rgb(var(--color-bg-elevated))] rounded" />
          <div className="h-6 w-48 bg-[rgb(var(--color-bg-elevated))] rounded" />
          <div className="h-6 w-16 bg-[rgb(var(--color-bg-elevated))] rounded" />
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="relative h-[50vh] min-h-[400px] mb-8 mt-20">
        <div className="absolute inset-0 bg-[rgb(var(--color-bg-secondary))] animate-pulse" />
        <div className="relative h-full flex flex-col justify-end px-8 pb-8">
          <div className="max-w-4xl mx-auto w-full space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-[rgb(var(--color-bg-elevated))] rounded" />
              <div className="h-6 w-24 bg-[rgb(var(--color-bg-elevated))] rounded" />
            </div>
            <div className="h-12 bg-[rgb(var(--color-bg-elevated))] rounded w-3/4" />
            <SkeletonText lines={3} />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-4xl mx-auto px-8 pb-16 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-[rgb(var(--color-bg-secondary))] rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-full bg-[rgb(var(--color-bg-secondary))] animate-pulse" style={{ height: `${400 + (i % 3) * 200}px` }} />
          ))}
        </div>
      </div>
    </div>
  );
}