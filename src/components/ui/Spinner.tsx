// Loading ring — unifies the 3 inline copies. motion-safe so reduced-motion users
// get a static ring instead of spin.
const SIZES = { sm: 'h-3 w-3', md: 'h-8 w-8', lg: 'h-10 w-10' } as const;

export function Spinner({
  size = 'md',
  className = '',
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Memuat"
      className={`inline-block ${SIZES[size]} rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin ${className}`}
    />
  );
}
