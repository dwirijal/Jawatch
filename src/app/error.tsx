"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-6">
      <div className="p-6 rounded-full bg-[var(--ja-surface)]">
        <svg className="w-12 h-12 text-[var(--ja-purple)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white">Gagal Memuat</h2>
      <p className="text-gray-400 max-w-md">
        Terjadi kesalahan saat memuat halaman. Silakan coba lagi.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 rounded-lg bg-[var(--ja-purple)] text-white font-medium hover:bg-[var(--ja-purple-hover)] transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );
}