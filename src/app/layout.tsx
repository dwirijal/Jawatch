import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ServiceWorker } from "@/components/ServiceWorker";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Jawatch — Nonton Anime & Baca Manga Gratis",
    template: "%s | Jawatch",
  },
  description: "Nonton anime subtitle Indonesia & baca manga/manhwa gratis, kualitas HD. Streaming & reading dari Samehadaku, Anichin, Komiku, dan sumber lainnya.",
  keywords: ["anime", "manga", "manhwa", "manhua", "streaming anime", "baca manga", "nonton anime gratis", "anime subtitle Indonesia", "donghua", "comic"],
  authors: [{ name: "Jawatch" }],
  creator: "Jawatch",
  publisher: "Jawatch",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "https://jawatch.vercel.app" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://jawatch.vercel.app",
    siteName: "Jawatch",
    title: "Jawatch — Nonton Anime & Baca Manga Gratis",
    description: "Streaming anime & baca manga gratis, subtitle Indonesia, kualitas HD.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Jawatch" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jawatch — Nonton Anime & Baca Manga Gratis",
    description: "Streaming anime & baca manga gratis, subtitle Indonesia, kualitas HD.",
    images: ["/og-default.png"],
  },
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jawatch",
  },
  category: "entertainment",
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--ja-bg)] text-[var(--ja-text)]">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-[var(--ja-purple)] focus:text-white focus:rounded-[var(--ja-r-sm)]">
          Skip to content
        </a>
        <Nav />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <ServiceWorker />
      </body>
    </html>
  );
}