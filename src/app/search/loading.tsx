export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-24 bg-gray-800 rounded animate-pulse" />
            <div className="flex-1 max-w-2xl">
              <div className="h-10 bg-gray-900 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <div className="h-9 bg-gray-800 rounded w-72 animate-pulse" />
          <div className="h-5 bg-gray-800 rounded w-24 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-gray-900 rounded-lg mb-3" />
              <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}