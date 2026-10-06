/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  // The API lives on its own host (Render); nothing is proxied through Next in production.
  async headers() {
    const privateRoutes = [
      '/dashboard',
      '/onboarding',
      '/bills',
      '/roof',
      '/sizing/:path*',
      '/quotes/:path*',
      '/projects/:path*',
      '/documents',
      '/profile',
      '/login',
      '/register',
    ];

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      ...privateRoutes.map((source) => ({
        source,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      })),
    ];
  },
};

export default nextConfig;
