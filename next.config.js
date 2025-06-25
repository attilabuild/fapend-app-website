/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
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