import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "http",
        hostname: process.env.NEXT_DEVELOPMENT_HOST || "musicarr-backend",
      },
    ], // Add domains for youtube images
  },
  // reactStrictMode: false // Uncomment this line to disable React's strict mode and prevent double rendering, but not recommended in development
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  output: "standalone",
};

export default nextConfig;
