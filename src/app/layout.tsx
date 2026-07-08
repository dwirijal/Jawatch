import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { siteUrl } from '@/lib/site-url';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const siteName = 'jawatch';
const description = 'Streaming anime, donghua, movie, manga, comic, and novel Indonesia with a cinema-first watch and read experience.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description,
  applicationName: siteName,
  openGraph: {
    type: 'website',
    siteName,
    title: siteName,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0B0D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable}`}>
      <body className="bg-background text-foreground font-sans antialiased min-h-screen flex flex-col">
        {/* Sticky Nav */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="font-serif text-xl font-bold tracking-tight text-primary hover:opacity-80 transition-opacity shrink-0">
              <span className="hidden sm:inline">jawatch</span>
              <span className="sm:hidden text-base">jw</span>
            </Link>

            {/* Search bar */}
            <form action="/search" className="flex-1 max-w-[420px] relative">
              <input
                name="q"
                type="search"
                placeholder="Search titles..."
                className="w-full bg-card border border-border rounded-[4px] px-3.5 py-2 text-[13px] font-mono text-foreground placeholder:text-muted/50 focus:outline-none focus:border-amber/50 focus:ring-1 focus:ring-amber/20 transition-all"
              />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-5 font-mono text-[11px] uppercase tracking-[.08em]">
              <Link href="/discover" className="p-2 min-h-[44px] flex items-center text-muted hover:text-foreground transition-colors">Discover</Link>
              <Link href="/trending" className="p-2 min-h-[44px] flex items-center text-muted hover:text-foreground transition-colors">Trending</Link>
              <Link href="/popular" className="p-2 min-h-[44px] flex items-center text-muted hover:text-foreground transition-colors">Popular</Link>
              <Link href="/latest" className="p-2 min-h-[44px] flex items-center text-muted hover:text-foreground transition-colors">Latest</Link>
              <Link href="/random" className="p-2 min-h-[44px] flex items-center text-muted hover:text-primary transition-colors">🎲</Link>
            </nav>

            {/* Mobile hamburger placeholder */}
            <div className="md:hidden">
              <Link href="/discover" className="font-mono text-[10px] uppercase tracking-[.08em] text-accent-bright hover:text-primary transition-colors">
                Browse
              </Link>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border mt-20">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-mono text-[11px] text-muted">
              jawatch &copy; {new Date().getFullYear()}
            </div>
            <div className="flex gap-6 font-mono text-[11px]">
              <Link href="/sitemap.xml" className="text-muted hover:text-foreground transition-colors">Sitemap</Link>
              <Link href="/discover" className="text-muted hover:text-foreground transition-colors">Browse</Link>
              <Link href="/library" className="text-muted hover:text-foreground transition-colors">Library</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
