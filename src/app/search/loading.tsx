export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-[1160px] px-4 py-12 sm:px-8">
      <div className="mb-8 space-y-3">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-10 w-72 animate-pulse rounded bg-muted" />
      </div>
      <div className="mb-8 h-12 animate-pulse rounded-2xl bg-card" />
      <div className="grid grid-cols-2 gap-[2px] sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="aspect-[2/3] animate-pulse bg-card" />
        ))}
      </div>
    </div>
  );
}
