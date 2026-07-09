'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0B0D',
          color: '#E7E7EA',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <main>
          <h1 style={{ fontFamily: 'ui-serif, Georgia, serif', fontSize: '1.75rem', margin: 0 }}>jawatch</h1>
          <p style={{ marginTop: '1rem', color: '#9CA3AF' }}>
            Halaman sedang tidak dapat dimuat. Coba muat ulang.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#E8A33D',
              background: 'transparent',
              border: '1px solid #E8A33D',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            Muat ulang
          </button>
        </main>
      </body>
    </html>
  );
}
