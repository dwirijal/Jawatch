export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-[var(--ja-surface)] via-[var(--ja-surface-hover)] to-[var(--ja-surface)] bg-[length:200%_100%] rounded-[var(--ja-r-md)] ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[3/4] w-full rounded-[var(--ja-r-lg)]" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <section className="w-full h-[75vh] min-h-[500px] max-h-[700px] bg-[var(--ja-surface)]">
      <div className="max-w-[var(--ja-content-max)] mx-auto px-4 h-full flex flex-col justify-end pb-20">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-12 w-96 max-w-full mb-3" />
        <Skeleton className="h-5 w-64 mb-6" />
        <div className="flex gap-3">
          <Skeleton className="h-12 w-36 rounded-[var(--ja-r-md)]" />
          <Skeleton className="h-12 w-36 rounded-[var(--ja-r-md)]" />
        </div>
      </div>
    </section>
  );
}
