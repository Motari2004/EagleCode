import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // WebSocket proxy for development
  async rewrites() {
    return [
      {
        source: '/ws/:path*',
        destination: 'http://localhost:8000/ws/:path*',
      },
    ];
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_USE_WS_PROXY: process.env.NODE_ENV === 'development' ? 'true' : 'false',
  },
  
  // Turbopack configuration (replaces webpack)
  turbopack: {
    // No need for fallbacks - Turbopack handles this natively
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
  
  // Optional: Configure for production
  productionBrowserSourceMaps: process.env.NODE_ENV !== 'production',
  
  // Optional: Disable X-Powered-By header for security
  poweredByHeader: false,
  
  // Optional: Configure compression
  compress: true,
};

export default nextConfig;