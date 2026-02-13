import type { NextConfig } from "next";

const shouldUseStandaloneOutput =
  process.env.NEXT_STANDALONE_OUTPUT === 'true';
const configuredApiBase = process.env.NEXT_PUBLIC_API_URL;
const backendApiOrigin = process.env.BACKEND_API_ORIGIN ?? (() => {
  if (!configuredApiBase) return undefined;
  try {
    return new URL(configuredApiBase).origin;
  } catch {
    return undefined;
  }
})();

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
  async rewrites() {
    if (!backendApiOrigin) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendApiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
