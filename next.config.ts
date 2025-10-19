import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * 
 * PWA Support:
 * To enable full PWA support with next-pwa, install the dependency:
 *   npm install next-pwa
 * or
 *   pnpm add next-pwa
 * 
 * Then uncomment the next-pwa configuration below.
 * 
 * Note: The app already includes:
 * - Service worker (public/sw.js)
 * - Offline fallback (public/offline.html)
 * - Manifest (public/manifest.json)
 * - PWA registration component (components/pwa-register.tsx)
 * 
 * Example next-pwa configuration:
 * 
 * import withPWA from 'next-pwa';
 * 
 * const nextConfig: NextConfig = {
 *   experimental: {
 *     ppr: true,
 *   },
 *   images: {
 *     remotePatterns: [
 *       {
 *         hostname: "avatar.vercel.sh",
 *       },
 *     ],
 *   },
 * };
 * 
 * export default withPWA({
 *   dest: 'public',
 *   disable: process.env.NODE_ENV === 'development',
 *   register: true,
 *   skipWaiting: true,
 * })(nextConfig);
 */

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

export default nextConfig;
