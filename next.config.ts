import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com',
      'localhost',
      'files.stripe.com',
      'placehold.it',
      'tailwindui.com',
    ]
  }
};

export default nextConfig;
