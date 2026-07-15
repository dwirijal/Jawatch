'use client';

import { useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { EmptyState } from '@/components/sections/EmptyState';
import { COPY } from '@/lib/copy';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Route error boundary caught:', error);
  }, [error]);

  return (
    <Container y="80px">
      <EmptyState
        as="h1"
        eyebrow={COPY.error.eyebrow}
        title={COPY.error.title}
        description={COPY.error.desc}
        href="/"
        actionLabel={COPY.error.reload}
      />
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={reset}
          className="font-mono text-micro uppercase text-accent hover:text-primary transition-colors min-h-[48px]"
        >
          {COPY.error.retry}
        </button>
      </div>
    </Container>
  );
}
