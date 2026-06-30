import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-black text-[rgb(var(--color-accent))] heading-display mb-4">404</p>
      <h1 className="text-2xl md:text-3xl font-bold text-[rgb(var(--color-fg-primary))] mb-3">Page not found</h1>
      <p className="text-[rgb(var(--color-fg-secondary))] mb-8 max-w-md">
        The title or page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="px-6 py-3 bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent-hover))] text-white rounded-lg font-semibold transition-colors">
        Back to Home
      </Link>
    </div>
  );
}
