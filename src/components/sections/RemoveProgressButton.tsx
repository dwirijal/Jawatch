'use client';
import { useTransition } from 'react';
import { removeProgressAction } from '@/app/[type]/[slug]/actions';
import { COPY } from '@/lib/copy';

export function RemoveProgressButton({ mediaRef, label }: { mediaRef: string; label?: string }) {
  const [pending, startTransition] = useTransition();
  const aria = label ?? COPY.library.removeFromList;
  return (
    <button
      type="button"
      aria-label={aria}
      title={aria}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(() => removeProgressAction(mediaRef));
      }}
      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-muted-foreground transition-colors motion-safe:transition-opacity hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
    >
      <span aria-hidden className={pending ? 'opacity-50' : ''}>×</span>
    </button>
  );
}
