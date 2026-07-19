'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { toggleBookmarkAction } from '@/app/[type]/[slug]/actions';
import { useToast } from '@/components/ui/ToastProvider';
import type { BookmarkInput } from '@/lib/library';
import { COPY } from '@/lib/copy';

// Optimistic bookmark toggle. Signed-out -> action returns null -> redirect to login.
export function BookmarkButton({ media, initial }: { media: BookmarkInput; initial: boolean }) {
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  function onClick() {
    startTransition(async () => {
      const next = await toggleBookmarkAction(media);
      if (next === null) {
        router.push('/login');
        return;
      }
      setSaved(next);
      toast(next ? COPY.library.bookmarkSaved : COPY.library.bookmarkRemoved);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? 'Remove bookmark' : 'Add bookmark'}
      className="mt-8 inline-flex items-center gap-2 rounded-page border border-border bg-card/75 px-5 py-3 font-mono text-xs uppercase tracking-tag text-foreground transition-[color,border-color,transform] hover:border-amber/60 hover:text-primary active:scale-95 disabled:opacity-50 motion-reduce:transition-colors motion-reduce:active:scale-100"
    >
      <Bookmark className={`h-4 w-4 transition-transform motion-reduce:transition-none ${saved ? 'scale-110 fill-primary text-primary' : ''} ${pending ? 'motion-safe:animate-pulse' : ''}`} aria-hidden="true" />
      {saved ? 'Saved' : 'Bookmark'}
    </button>
  );
}
