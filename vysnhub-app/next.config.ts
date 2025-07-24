import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vysninstructionmanuals.web.app',
        port: '',
        pathname: '/products/**',
      },
      {
        protocol: 'https',
        hostname: 'vysninstructionmanuals.web.app',
        port: '',
        pathname: '/energylabels/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
