import type { NextConfig } from "next";

// Read at build time: rewrites are compiled into the routes manifest.
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8081";

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image (node server.js, no node_modules).
  output: "standalone",
  // Same origin in development: the session cookie travels with every /api call.
  // WebSocket cannot go through rewrites; it uses NEXT_PUBLIC_WS_URL or a reverse proxy.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
};

export default nextConfig;
