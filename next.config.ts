import type { NextConfig } from "next";

const shouldUseStandaloneOutput =
  process.env.NEXT_STANDALONE_OUTPUT === 'true';

const nextConfig: NextConfig = {
  ...(shouldUseStandaloneOutput ? { output: 'standalone' } : {}),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
