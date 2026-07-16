/** @type {import('next').NextConfig} */
// ponytail: allow LAN HMR so 192.168.x.x clients can hot-reload during dev.
const allowedDevOrigins = ['192.168.100.6'];
// 'unsafe-eval' is dev-only (Next HMR needs it); prod drops it — GA/AdSense/Next-prod don't use eval, so it's pure XSS surface in prod.
const scriptSrc = process.env.NODE_ENV === 'production'
  ? "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.googletagservices.com https://pagead2.googlesyndication.com https://*.doubleclick.net https://va.jawatch.web.id"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.googletagservices.com https://pagead2.googlesyndication.com https://*.doubleclick.net https://va.jawatch.web.id";
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http: https://www.googletagmanager.com https://www.google-analytics.com https://*.doubleclick.net https://pagead2.googlesyndication.com https://*.gstatic.com; media-src 'self' https: http:; frame-src https: http: https://*.doubleclick.net https://pagead2.googlesyndication.com; connect-src 'self' https://www.google-analytics.com https://*.analytics.google.com https://*.googlesyndication.com https://pagead2.googlesyndication.com https://va.jawatch.web.id; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`,
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400, // 31d — cover art is immutable; slashes Vercel image-optimization re-transforms

    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
  allowedDevOrigins,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/watch/:slug',
        destination: '/media/:slug',
        permanent: true,
      },
      {
        source: '/read/:slug',
        destination: '/media/:slug',
        permanent: true,
      },
      {
        // Next 16's `generateSitemaps` pattern serves child chunks at
        // `/sitemap/<id>.xml` but does not auto-generate a `/sitemap.xml`
        // index. A `sitemap.xml/route.ts` collides with Next's reserved
        // metadata filename, so we serve the index from a normal route
        // and rewrite the expected public path.
        source: '/sitemap.xml',
        destination: '/sitemap-index',
        permanent: false,
      },
    ];
  },
}

module.exports = nextConfig
