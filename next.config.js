/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dwizzy.my.id' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'cdn.myanimelist.net' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 1080], // ponytail: removed 1920, mobile-first app
    imageSizes: [64, 96, 128, 192, 256],
    minimumCacheTTL: 86400, // ponytail: 24h image CDN cache, stable media assets
  },
}

module.exports = nextConfig
