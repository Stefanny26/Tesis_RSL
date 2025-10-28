/**
 * Constantes generales de la aplicación
 */

export const APP_CONFIG = {
  NAME: 'RSL System',
  DESCRIPTION: 'Sistema de Revisión Sistemática de Literatura',
  VERSION: '1.0.0',
  AUTHOR: 'Tesis Project',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 segundos
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
} as const;

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  PROJECT_TITLE_MIN_LENGTH: 3,
  PROJECT_TITLE_MAX_LENGTH: 200,
} as const;
