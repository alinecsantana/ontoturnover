import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "graph.microsoft.com" },
      { protocol: "https", hostname: "*.microsoftonline.com" },
    ],
  },
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
