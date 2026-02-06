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
      {
        protocol: "http",
        hostname: "localhost",
        port: "8081",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8081",
      },
    ],
  },
};

export default nextConfig;
