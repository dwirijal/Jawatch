export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] bg-gray-900 rounded-lg mb-3"></div>
      <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-800 rounded w-1/2"></div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-800 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonImage() {
  return (
    <div className="animate-pulse bg-gray-900 rounded-lg w-full h-64"></div>
  );
}

export function SkeletonRow({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto px-8 md:px-16 lg:px-24">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[280px] md:w-[320px] animate-pulse">
          <div className="aspect-video bg-gray-900 rounded-lg mb-3"></div>
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-800 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative h-[85vh] min-h-[600px] animate-pulse">
      <div className="absolute inset-0 bg-gray-900"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      <div className="relative h-full flex items-center px-8 md:px-16 lg:px-24">
        <div className="max-w-2xl space-y-6">
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-800 rounded"></div>
            <div className="h-6 w-24 bg-gray-800 rounded"></div>
          </div>
          <div className="h-16 bg-gray-800 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-800 rounded w-full"></div>
            <div className="h-6 bg-gray-800 rounded w-2/3"></div>
            <div className="h-6 bg-gray-800 rounded w-1/3"></div>
          </div>
          <div className="flex gap-4">
            <div className="h-12 w-32 bg-gray-700 rounded-lg"></div>
            <div className="h-12 w-32 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}