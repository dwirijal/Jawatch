export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] bg-[rgb(var(--color-bg-secondary))] rounded-lg mb-3"></div>
      <div className="h-4 bg-[rgb(var(--color-bg-elevated))] rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-[rgb(var(--color-bg-elevated))] rounded w-1/2"></div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-[rgb(var(--color-bg-elevated))] rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonImage() {
  return (
    <div className="animate-pulse bg-[rgb(var(--color-bg-secondary))] rounded-lg w-full h-64"></div>
  );
}

export function SkeletonRow({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto px-8 md:px-16 lg:px-24">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[280px] md:w-[320px] animate-pulse">
          <div className="aspect-video bg-[rgb(var(--color-bg-secondary))] rounded-lg mb-3"></div>
          <div className="h-4 bg-[rgb(var(--color-bg-elevated))] rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-[rgb(var(--color-bg-elevated))] rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative h-[85vh] min-h-[600px] animate-pulse">
      <div className="absolute inset-0 bg-[rgb(var(--color-bg-secondary))]"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(var(--color-bg-primary),0.95)] via-[rgba(var(--color-bg-primary),0.7)] to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--color-bg-primary))] via-[rgba(var(--color-bg-primary),0.5)] to-transparent"></div>
      <div className="relative h-full flex items-center px-8 md:px-16 lg:px-24">
        <div className="max-w-2xl space-y-6">
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-[rgb(var(--color-bg-elevated))] rounded"></div>
            <div className="h-6 w-24 bg-[rgb(var(--color-bg-elevated))] rounded"></div>
          </div>
          <div className="h-16 bg-[rgb(var(--color-bg-elevated))] rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-6 bg-[rgb(var(--color-bg-elevated))] rounded w-full"></div>
            <div className="h-6 bg-[rgb(var(--color-bg-elevated))] rounded w-2/3"></div>
            <div className="h-6 bg-[rgb(var(--color-bg-elevated))] rounded w-1/3"></div>
          </div>
          <div className="flex gap-4">
            <div className="h-12 w-32 bg-[rgba(var(--color-fg-primary),0.1)] rounded-lg"></div>
            <div className="h-12 w-32 bg-[rgb(var(--color-bg-elevated))] rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}