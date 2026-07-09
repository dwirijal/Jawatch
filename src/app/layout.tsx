import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { siteUrl } from '@/lib/site-url';
import { SearchBar } from '@/components/sections/SearchBar';
import { MobileNav } from '@/components/sections/MobileNav';
import { BackToTop } from '@/components/sections/BackToTop';
import { VercelAnalytics } from '@/components/analytics/VercelAnalytics';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { GoogleAds } from '@/components/ads/GoogleAds';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { BottomNav } from '@/components/sections/BottomNav';

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
    apple: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: 'black-translucent',
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
        {/* Skip link — WCAG 2.4.1 bypass blocks */}
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-background focus:px-4 focus:py-2 focus:rounded-page focus:font-mono focus:text-micro">Skip to content</a>
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
            <nav aria-label="Main" className="hidden md:flex items-center gap-5 font-mono text-micro uppercase">
              <Link href="/discover" className="p-2 min-h-[48px] flex items-center text-muted-foreground hover:text-foreground transition-colors">Discover</Link>
              <Link href="/trending" className="p-2 min-h-[48px] flex items-center text-muted-foreground hover:text-foreground transition-colors">Trending</Link>
              <Link href="/popular" className="p-2 min-h-[48px] flex items-center text-muted-foreground hover:text-foreground transition-colors">Popular</Link>
              <Link href="/latest" className="p-2 min-h-[48px] flex items-center text-muted-foreground hover:text-foreground transition-colors">Latest</Link>
              <Link href="/random" aria-label="Random title" className="p-2 min-h-[48px] flex items-center text-muted-foreground hover:text-primary transition-colors"><span aria-hidden="true">🎲</span></Link>
              <Link href="/login" className="p-2 min-h-[48px] flex items-center text-muted-foreground hover:text-foreground transition-colors">Login</Link>
              <Link href="/register" className="p-2 min-h-[48px] flex items-center text-primary hover:text-primary/80 transition-colors">Register</Link>
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
        <ToastProvider>
          <main id="main" className="flex-1">{children}</main>
        </ToastProvider>

        {/* Back to top */}
        <BackToTop />

        {/* Footer */}
        <footer className="border-t border-border mt-20">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-mono text-micro text-muted-foreground">
              jawatch &copy; {new Date().getFullYear()}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-micro">
              <Link href="/sitemap.xml" className="text-muted-foreground hover:text-foreground transition-colors">Sitemap</Link>
              <Link href="/discover" className="text-muted-foreground hover:text-foreground transition-colors">Browse</Link>
              <Link href="/library" className="text-muted-foreground hover:text-foreground transition-colors">Library</Link>
              {/* Follow-creator CTA — filled-on-hover pill in always-present footer slot (non-intrusive per retention research) */}
              <a
                href="https://x.com/Anvxxr"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Ikuti kreator di X (buka tab baru)"
                className="group inline-flex items-center gap-1.5 rounded-pill border border-border bg-card/60 px-3 py-1.5 uppercase text-foreground transition-all duration-200 hover:border-primary/60 hover:bg-primary hover:text-void motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95 motion-reduce:active:scale-100"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="h-3 w-3 motion-safe:transition-transform motion-safe:group-hover:scale-110">
                  <path d="M12.6 1.5h2.3l-5 5.7 5.9 7.8h-4.6l-3.6-4.7-4.1 4.7H1.1l5.4-6.1L0.8 1.5h4.7l3.3 4.3zm-.8 12.9h1.3L4.3 2.8H2.9z" />
                </svg>
                Follow @Anvxxr
              </a>
            </div>
          </div>
        </footer>

        {/* Mobile thumb-zone tab bar (hidden md+); spacer keeps footer clear of it */}
        <div className="h-14 md:hidden" aria-hidden="true" />
        <BottomNav />

        {/* Analytics + ad loader — env-gated, render nothing if IDs unset */}
        <VercelAnalytics />
        <GoogleAnalytics />
        <GoogleAds />
      </body>
    </html>
  );
}
