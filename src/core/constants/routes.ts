/**
 * Constantes de rutas de la aplicación
 * Define todas las rutas utilizadas en el sistema RSL
 */

export const ROUTES = {
  // Rutas públicas
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Rutas privadas - Dashboard
  DASHBOARD: '/dashboard',
  
  // Proyectos
  PROJECTS: '/projects',
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,
  PROJECT_NEW: '/projects/new',
  PROJECT_EDIT: (id: string) => `/projects/${id}/edit`,
  
  // Protocolo
  PROTOCOL: (projectId: string) => `/projects/${projectId}/protocol`,
  
  // Referencias
  REFERENCES: (projectId: string) => `/projects/${projectId}/references`,
  REFERENCES_IMPORT: (projectId: string) => `/projects/${projectId}/references/import`,
  
  // Screening
  SCREENING: (projectId: string) => `/projects/${projectId}/screening`,
  SCREENING_TITLE: (projectId: string) => `/projects/${projectId}/screening/title`,
  SCREENING_ABSTRACT: (projectId: string) => `/projects/${projectId}/screening/abstract`,
  SCREENING_FULLTEXT: (projectId: string) => `/projects/${projectId}/screening/fulltext`,
  
  // PRISMA
  PRISMA: (projectId: string) => `/projects/${projectId}/prisma`,
  
  // Artículos
  ARTICLES: (projectId: string) => `/projects/${projectId}/articles`,
  
  // Configuración
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_SECURITY: '/settings/security',
  
  // Exportación
  EXPORT: (projectId: string) => `/projects/${projectId}/export`,
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
] as const;

export const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
};
