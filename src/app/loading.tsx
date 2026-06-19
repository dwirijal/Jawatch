import { HeroSkeleton, CardSkeleton } from "@/components/atoms/Skeleton";

export default function Loading() {
  return (
    <>
      <HeroSkeleton />
      <div className="max-w-[var(--ja-content-max)] mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 py-8">
          <CardSkeleton />
        </div>
      </div>
    </>
  );
}