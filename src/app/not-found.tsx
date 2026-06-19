import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-[var(--ja-purple)] mb-4 drop-shadow-lg">404</h1>
      <h2 className="text-xl text-white mb-2">Page Not Found</h2>
      <p className="text-[var(--ja-text-secondary)] mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or the anime might not be available yet.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-[var(--ja-r-md)] bg-[var(--ja-purple)] hover:bg-[var(--ja-purple-hover)] text-white font-medium transition-all hover:scale-105 shadow-[var(--ja-shadow-glow)]"
      >
        Back to Home
      </Link>
    </div>
  );
}
