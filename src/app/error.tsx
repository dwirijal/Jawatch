'use client';

import { useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { EmptyState } from '@/components/sections/EmptyState';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Route error boundary caught:', error);
  }, [error]);

  return (
    <Container y="80px">
      <EmptyState
        eyebrow="Sedang dimuat ulang"
        title="Sebagian konten belum tersedia"
        description="Sumber media sedang tidak dapat dijangkau. Coba muat ulang halaman ini."
        href="/"
        actionLabel="Muat ulang"
      />
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={reset}
          className="font-mono text-micro uppercase text-accent hover:text-primary transition-colors min-h-[48px]"
        >
          Coba lagi
        </button>
      </div>
    </Container>
  );
}
