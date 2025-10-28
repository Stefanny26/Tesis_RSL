/**
 * Configuración central de la aplicación
 */

export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'RSL System',
    env: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
  },
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  auth: {
    sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
    tokenExpiry: 24 * 60 * 60, // 24 horas en segundos
  },
  
  features: {
    enableGoogleAuth: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === 'true',
    enableExport: true,
    enablePrisma: true,
    enableCollaboration: true,
  },
} as const;
