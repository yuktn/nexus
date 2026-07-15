import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['100.83.1.6'],

  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://127.0.0.1:4000/api/:path*',
      },
    ]
  },
}

export default nextConfig