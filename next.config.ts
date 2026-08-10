import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',

  // Images from the API and fallbacks
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'raiyan.cc' },
      { protocol: 'http', hostname: 'portal.lobby-care.raiyan.cc' },
      { protocol: 'https', hostname: 'portal.lobby-care.raiyan.cc' },

      { protocol: 'https', hostname: 'i.imgur.com' },
    ],
    unoptimized: true, // keep <img> tags working without Next/Image wrapper
  },

  // Redirect legacy Vite/React Router paths
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/privacy', destination: '/terms-privacy', permanent: true },
      { source: '/terms', destination: '/terms-privacy', permanent: true },
      { source: '/terms-policies', destination: '/terms-privacy', permanent: true },
    ];
  },
};

export default nextConfig;
