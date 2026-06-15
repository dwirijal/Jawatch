export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-fg-primary))]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[rgb(var(--color-bg-primary))]/95 backdrop-blur-sm border-b border-[rgba(var(--color-fg-primary),0.1)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-24 bg-[rgb(var(--color-bg-elevated))] rounded animate-pulse" />
            <div className="flex-1 max-w-2xl">
              <div className="h-10 bg-[rgb(var(--color-bg-secondary))] rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <div className="h-9 bg-[rgb(var(--color-bg-elevated))] rounded w-72 animate-pulse" />
          <div className="h-5 bg-[rgb(var(--color-bg-elevated))] rounded w-24 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-[rgb(var(--color-bg-secondary))] rounded-lg mb-3" />
              <div className="h-4 bg-[rgb(var(--color-bg-elevated))] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[rgb(var(--color-bg-elevated))] rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}