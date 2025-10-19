import type { NextConfig } from "next";

// @ts-ignore - next-pwa doesn't have TypeScript definitions
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
});

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
    ],
  },
};

export default withPWA(nextConfig);
