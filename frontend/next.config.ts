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
  ],
  async rewrites() {
    const apiUrl = process.env.API_URL
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig

