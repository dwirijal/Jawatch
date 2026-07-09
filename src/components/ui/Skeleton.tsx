// Shaped placeholder for loading states — beats a bare spinner (perceived-latency).
// motion-safe pulse only; reduced-motion users get a static block.
export function Skeleton({
  className = '',
  rounded = 'card',
}: {
  className?: string;
  rounded?: 'sm' | 'chip' | 'card' | 'pill' | 'full';
}) {
  // static map — Tailwind can't see interpolated class names
  const radius = {
    sm: 'rounded-sm',
    chip: 'rounded-chip',
    card: 'rounded-card',
    pill: 'rounded-pill',
    full: 'rounded-full',
  }[rounded];
  return (
    <div
      aria-hidden="true"
      className={`${radius} bg-muted/60 motion-safe:animate-pulse ${className}`}
    />
  );
}

// Poster-card skeleton matching Card's 2:3 aspect + label rhythm.
export function SkeletonCard() {
  return (
    <div className="space-y-2" aria-hidden="true">
      <Skeleton className="aspect-[2/3] w-full" rounded="sm" />
      <Skeleton className="h-2.5 w-1/3" rounded="sm" />
      <Skeleton className="h-3 w-4/5" rounded="sm" />
    </div>
  );
}
