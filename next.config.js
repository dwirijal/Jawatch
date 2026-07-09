/** @type {import('next').NextConfig} */
// ponytail: CSP keeps 'unsafe-inline' (no nonce) because Next streaming + per-route nonces aren't wired; ceiling: migrate to nonce once nonces are per-route.
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.googletagservices.com https://pagead2.googlesyndication.com https://*.doubleclick.net https://va.jawatch.web.id; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http: https://www.googletagmanager.com https://www.google-analytics.com https://*.doubleclick.net https://pagead2.googlesyndication.com https://*.gstatic.com; media-src 'self' https: http:; frame-src https: http: https://*.doubleclick.net https://pagead2.googlesyndication.com; connect-src 'self' https://www.google-analytics.com https://*.analytics.google.com https://*.googlesyndication.com https://pagead2.googlesyndication.com https://va.jawatch.web.id; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig = {
  // Removed output: 'standalone' to fix Vercel missing module errors
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
    ];
  },
}

module.exports = nextConfig
