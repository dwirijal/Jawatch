export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] bg-slate-800 rounded-lg mb-3"></div>
      <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-slate-800 rounded w-1/2"></div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-slate-800 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonImage() {
  return (
    <div className="animate-pulse bg-slate-800 rounded-lg w-full h-64"></div>
  );
}