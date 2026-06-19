"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="bg-[var(--ja-bg)] text-white">
        <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-6">
          <h1 className="text-4xl font-bold">Jawatch</h1>
          <div className="p-4 rounded-full bg-[var(--ja-surface)]">
            <svg className="w-12 h-12 text-[var(--ja-purple)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Terjadi Kesalahan</h2>
          <p className="text-gray-400 max-w-md">Aplikasi mengalami error yang tidak terduga.</p>
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-lg bg-[var(--ja-purple)] text-white font-medium hover:bg-[var(--ja-purple-hover)] transition-colors"
          >
            Muat Ulang
          </button>
        </main>
      </body>
    </html>
  );
}