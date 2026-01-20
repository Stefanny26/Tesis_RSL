/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
    ],
  },
  // Deshabilitar Vercel Analytics para evitar error 404
  analyticsId: process.env.VERCEL_ANALYTICS_ID || '',
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/uploads/:path*',
      },
    ]
  },
}

export default nextConfig
