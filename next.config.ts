import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    if (!process.env.BACKEND_ORIGIN) {
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
