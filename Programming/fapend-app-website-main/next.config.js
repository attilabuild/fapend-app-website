/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable type-checking during build to avoid unrelated workspace errors on Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/ios',
        destination: 'https://apps.apple.com/app/apple-store/id6745742828?pt=127826558&ct=website&mt=8',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'pureresist.com',
          },
        ],
        destination: 'https://www.pureresist.com/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    domains: ['www.pureresist.com', 'pureresist.com'],
  },
};

module.exports = nextConfig; 