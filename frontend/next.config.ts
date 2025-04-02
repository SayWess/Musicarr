import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ], // Add domains for youtube images
  },
  // reactStrictMode: false // Uncomment this line to disable React's strict mode and prevent double rendering, but not recommended in development
};

export default nextConfig;
