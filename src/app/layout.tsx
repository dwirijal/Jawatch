import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Jawatch - Stream & Read',
  description: 'Cinematic media streaming and reading experience',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <body className="min-h-screen bg-[rgb(var(--color-bg-primary))] text-[rgb(var(--color-fg-primary))] antialiased font-sans">
        {/* Premium Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[rgb(var(--color-bg-primary))] via-[rgba(var(--color-bg-primary),0.95)] to-transparent backdrop-blur-sm border-b border-[rgba(var(--color-fg-primary),0.1)]">
          <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4 md:gap-8">
              <h1 className="text-xl md:text-2xl font-black text-[rgb(var(--color-accent))] tracking-tight">
                JAWATCH
              </h1>
              <nav className="hidden md:flex gap-6">
                <a href="/" className="text-sm font-semibold text-[rgb(var(--color-fg-secondary))] hover:text-[rgb(var(--color-fg-primary))] transition-colors">
                  Home
                </a>
                <a href="/watch" className="text-sm font-semibold text-[rgb(var(--color-fg-secondary))] hover:text-[rgb(var(--color-fg-primary))] transition-colors">
                  Watch
                </a>
                <a href="/read" className="text-sm font-semibold text-[rgb(var(--color-fg-secondary))] hover:text-[rgb(var(--color-fg-primary))] transition-colors">
                  Read
                </a>
              </nav>
            </div>

            {/* Desktop Search */}
            <form action="/search" method="GET" className="hidden md:flex items-center gap-2 px-4 py-2 bg-[rgba(var(--color-fg-primary),0.05)] rounded-lg border border-[rgba(var(--color-fg-primary),0.1)] focus-within:border-[rgba(var(--color-accent),0.5)] transition-colors">
              <svg className="w-4 h-4 text-[rgb(var(--color-fg-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="q"
                placeholder="Search titles..."
                className="bg-transparent text-sm text-[rgb(var(--color-fg-primary))] placeholder-[rgb(var(--color-fg-subtle))] outline-none w-32 focus:w-48 transition-all"
              />
            </form>

            {/* Mobile Menu Toggle (CSS-only, no JS) */}
            <input type="checkbox" id="mobile-menu-toggle" className="hidden peer/menu" />
            <label htmlFor="mobile-menu-toggle" className="md:hidden p-2 text-[rgb(var(--color-fg-secondary))] hover:text-[rgb(var(--color-fg-primary))] transition-colors cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
          </div>

          {/* Mobile Menu (shown when checkbox is checked) */}
          <div className="hidden peer-checked/menu:block md:hidden border-t border-[rgba(var(--color-fg-primary),0.1)] bg-[rgb(var(--color-bg-primary))]/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <form action="/search" method="GET" className="flex items-center gap-2 px-4 py-2 bg-[rgba(var(--color-fg-primary),0.05)] rounded-lg border border-[rgba(var(--color-fg-primary),0.1)]">
                <svg className="w-4 h-4 text-[rgb(var(--color-fg-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  name="q"
                  placeholder="Search titles..."
                  className="flex-1 bg-transparent text-sm text-[rgb(var(--color-fg-primary))] placeholder-[rgb(var(--color-fg-subtle))] outline-none"
                />
              </form>
              <nav className="flex flex-col gap-3">
                <a href="/" className="text-base font-semibold text-[rgb(var(--color-fg-secondary))] hover:text-[rgb(var(--color-fg-primary))] transition-colors py-2 border-b border-[rgba(var(--color-fg-primary),0.05)]">Home</a>
                <a href="/watch" className="text-base font-semibold text-[rgb(var(--color-fg-secondary))] hover:text-[rgb(var(--color-fg-primary))] transition-colors py-2 border-b border-[rgba(var(--color-fg-primary),0.05)]">Watch</a>
                <a href="/read" className="text-base font-semibold text-[rgb(var(--color-fg-secondary))] hover:text-[rgb(var(--color-fg-primary))] transition-colors py-2 border-b border-[rgba(var(--color-fg-primary),0.05)]">Read</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-20">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <footer className="border-t border-[rgba(var(--color-fg-primary),0.1)] bg-[rgb(var(--color-bg-primary))] mt-20">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-xl font-black text-[rgb(var(--color-accent))] mb-2">JAWATCH</h2>
                <p className="text-sm text-[rgb(var(--color-fg-subtle))]">
                  Cinematic streaming and reading experience
                </p>
              </div>
              <div className="flex gap-6 text-sm text-[rgb(var(--color-fg-muted))]">
                <a href="/" className="hover:text-[rgb(var(--color-fg-primary))] transition-colors">Home</a>
                <a href="/watch" className="hover:text-[rgb(var(--color-fg-primary))] transition-colors">Watch</a>
                <a href="/read" className="hover:text-[rgb(var(--color-fg-primary))] transition-colors">Read</a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-[rgba(var(--color-fg-primary),0.1)] text-center text-sm text-[rgb(var(--color-fg-muted))]">
              <p>© 2026 Jawatch. Powered by Sloane Scraper.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
