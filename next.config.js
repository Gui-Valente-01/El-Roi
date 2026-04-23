/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        headers: securityHeaders,
        source: '/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: 'images.unsplash.com',
        pathname: '**',
        protocol: 'https',
      },
      {
        hostname: '**.supabase.co',
        pathname: '**',
        protocol: 'https',
      },
    ],
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
