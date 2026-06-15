import { SkeletonImage, SkeletonText } from '@/components/Skeleton';

export default function WatchLoading() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header Skeleton */}
      <div className="bg-gray-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="h-4 bg-gray-800 rounded w-32 mb-6" />
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-48 md:w-64">
              <SkeletonImage />
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-12 bg-gray-800 rounded w-3/4" />
              <div className="h-6 bg-gray-800 rounded w-1/4" />
              <SkeletonText lines={4} />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-16 bg-gray-900 rounded" />
            <div className="h-32 bg-gray-900 rounded" />
          </div>
          <div className="lg:col-span-1">
            <div className="h-96 bg-gray-900 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}