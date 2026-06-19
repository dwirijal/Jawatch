import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--ja-border)] mt-16">
      <div className="max-w-[var(--ja-content-max)] mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--ja-text-muted)]">
        <div className="flex items-center gap-1">
          <span className="text-[var(--ja-purple)] font-bold">JA</span>
          <span className="text-white font-bold">WATCH</span>
          <span className="ml-2">&mdash; Streaming Anime Gratis Sub Indo</span>
        </div>
        <div className="flex gap-6">
          <Link href="/browse" className="hover:text-[var(--ja-purple)] transition-colors">Browse</Link>
          <a href="https://api.dwizzy.my.id/docs" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--ja-purple)] transition-colors">API</a>
          <Link href="/" className="hover:text-[var(--ja-purple)] transition-colors">Home</Link>
        </div>
      </div>
    </footer>
  );
}
