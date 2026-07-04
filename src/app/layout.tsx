import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'jawatch',
  description: 'Cinematic media streaming & reading platform',
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
      <body className="bg-void text-paper font-sans antialiased min-h-screen flex flex-col">
        <header className="border-b border-hairline bg-void/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-[1160px] mx-auto px-8 h-16 flex items-center justify-between">
            <Link href="/" className="font-serif text-xl font-bold tracking-tight text-amber hover:opacity-80 transition-opacity">
              jawatch
            </Link>
            <nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-wider">
              <Link href="/discover" className="text-muted hover:text-paper transition-colors">Discover</Link>
              <Link href="/trending" className="text-muted hover:text-paper transition-colors">Trending</Link>
              <Link href="/popular" className="text-muted hover:text-paper transition-colors">Popular</Link>
              <Link href="/latest" className="text-muted hover:text-paper transition-colors">Latest</Link>
              <Link href="/library" className="text-muted hover:text-paper transition-colors">Library</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-hairline py-8 bg-surface mt-auto">
          <div className="max-w-[1160px] mx-auto px-8 flex justify-between items-center font-mono text-[10px] text-muted">
            <div>© {new Date().getFullYear()} JAWATCH. ALL RIGHTS RESERVED.</div>
            <div className="flex gap-4">
              <Link href="/genres" className="hover:text-paper transition-colors">GENRES</Link>
              <Link href="/random" className="hover:text-paper transition-colors">RANDOM</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
