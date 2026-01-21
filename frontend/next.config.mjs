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
      {
        // Permitir imágenes del backend en Render (wildcards para diferentes despliegues)
        protocol: 'https',
        hostname: '*.onrender.com',
        pathname: '/uploads/**',
      },
      {
        // Backend local
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
  // Deshabilitar Vercel Analytics para evitar error 404
  analyticsId: process.env.VERCEL_ANALYTICS_ID || '',
  async rewrites() {
    // En producción, NO hacer rewrite porque las URLs ya son absolutas del backend
    // En desarrollo, redirigir /uploads al backend local
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    
    return [
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/:path*`,
      },
    ]
  },
}

export default nextConfig
