import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8081";

const nextConfig: NextConfig = {
  // Same origin in development: the session cookie travels with every /api call.
  // WebSocket cannot go through rewrites; it uses NEXT_PUBLIC_WS_URL.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
};

export default nextConfig;
