import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.0.190',
    '192.168.0.190:3000',
    '192.168.*',
    '192.168.*:*',
    '10.*',
    '10.*:*',
    '172.16.*',
    '172.16.*:*',
    'localhost',
    'localhost:3000',
    '*.trycloudflare.com',
    '*.trycloudflare.com:*',
    '*.workers.dev',
    '*.workers.dev:*',
    '*.pages.dev',
    '*.pages.dev:*',
    '*.cloudflare.com',
    '*.cloudflare.com:*',
    '*.r2.cloudflarestorage.com',
    '*.r2.dev',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '**.workers.dev',
      },
      {
        protocol: 'https',
        hostname: '**.pages.dev',
      },
      {
        protocol: 'https',
        hostname: '**.cloudflare.com',
      },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.API_URL || 'http://localhost:8787'
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig


