import type { MetadataRoute } from 'next';

// PWA manifest — enables Android/iOS add-to-homescreen (mobile-first retention).
// SVG icon serves all sizes ("any"); no service worker (installability needs manifest, not offline).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'jawatch',
    short_name: 'jawatch',
    description: 'Streaming anime, donghua, movie, manga, comic, and novel Indonesia.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0B0D',
    theme_color: '#0B0B0D',
    orientation: 'portrait-primary',
    categories: ['entertainment'],
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
