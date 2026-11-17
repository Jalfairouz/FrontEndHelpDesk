import type { NextConfig } from "next";

const GATEWAY_URL = process.env.GATEWAY_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.devtunnels.ms"],

  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${GATEWAY_URL}/api/:path*` },
      { source: "/hubs/:path*", destination: `${GATEWAY_URL}/hubs/:path*` },
    ];
  },
};

export default nextConfig;