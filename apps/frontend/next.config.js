//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  output: 'standalone',
  nx: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    // Nest API (must not be the same port as this Next dev server; use 4200 for frontend)
    const apiOrigin = (
      process.env.API_PROXY_URL || 'http://localhost:3000'
    ).replace(/\/$/, '');
    const devPort = process.env.PORT || '3000';
    if (process.env.NODE_ENV !== 'production' && devPort === '3000') {
      console.warn(
        `[next] WARNING: frontend dev server is on port ${devPort} but /api proxies to ${apiOrigin}. ` +
          'Start the API on :3000 and the frontend on :4200 (see apps/frontend/.env.development).',
      );
    }
    console.log(`[next] /api/* → ${apiOrigin}/api/* (dev PORT=${devPort})`);
    return [
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
