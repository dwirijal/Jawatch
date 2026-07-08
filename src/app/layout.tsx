import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { siteUrl } from '@/lib/site-url';
import { SearchBar } from '@/components/sections/SearchBar';
import { MobileNav } from '@/components/sections/MobileNav';
import { BackToTop } from '@/components/sections/BackToTop';

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
  icons: {
    icon: '/favicon.svg',
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
            <SearchBar />

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-5 font-mono text-micro uppercase">
              <Link href="/discover" className="p-2 min-h-[48px] flex items-center text-muted-foreground hover:text-foreground transition-colors">Discover</Link>
              <Link href="/trending" className="p-2 min-h-[48px] flex items-center text-muted-foreground hover:text-foreground transition-colors">Trending</Link>
              <Link href="/popular" className="p-2 min-h-[48px] flex items-center text-muted-foreground hover:text-foreground transition-colors">Popular</Link>
              <Link href="/latest" className="p-2 min-h-[48px] flex items-center text-muted-foreground hover:text-foreground transition-colors">Latest</Link>
              <Link href="/random" className="p-2 min-h-[48px] flex items-center text-muted-foreground hover:text-primary transition-colors">🎲</Link>
            </nav>

            {/* Mobile hamburger placeholder */}
            <div className="md:hidden">
              <Link href="/discover" className="font-mono text-tag uppercase text-accent-bright hover:text-primary transition-colors">
                Browse
              </Link>
            </div>
          </div>
          <MobileNav />
        </header>

        {/* Main */}
        <main className="flex-1">{children}</main>

        {/* Back to top */}
        <BackToTop />

        {/* Footer */}
        <footer className="border-t border-border mt-20">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-mono text-micro text-muted-foreground">
              jawatch &copy; {new Date().getFullYear()}
            </div>
            <div className="flex gap-6 font-mono text-micro">
              <Link href="/sitemap.xml" className="text-muted-foreground hover:text-foreground transition-colors">Sitemap</Link>
              <Link href="/discover" className="text-muted-foreground hover:text-foreground transition-colors">Browse</Link>
              <Link href="/library" className="text-muted-foreground hover:text-foreground transition-colors">Library</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
