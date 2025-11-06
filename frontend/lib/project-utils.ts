/**
 * Utilidades para estados de proyectos
 */

// Estados válidos (deben coincidir con la constraint de BD)
export const PROJECT_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in-progress',
  SCREENING: 'screening',
  ANALYSIS: 'analysis',
  COMPLETED: 'completed'
} as const;

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];

// Etiquetas en español para la UI
export const STATUS_LABELS: Record<ProjectStatus, string> = {
  [PROJECT_STATUS.DRAFT]: 'Borrador',
  [PROJECT_STATUS.IN_PROGRESS]: 'En Progreso',
  [PROJECT_STATUS.SCREENING]: 'Cribado',
  [PROJECT_STATUS.ANALYSIS]: 'Análisis',
  [PROJECT_STATUS.COMPLETED]: 'Completado'
};

// Colores para badges de estado
export const STATUS_COLORS: Record<ProjectStatus, string> = {
  [PROJECT_STATUS.DRAFT]: 'bg-gray-500',
  [PROJECT_STATUS.IN_PROGRESS]: 'bg-blue-500',
  [PROJECT_STATUS.SCREENING]: 'bg-yellow-500',
  [PROJECT_STATUS.ANALYSIS]: 'bg-purple-500',
  [PROJECT_STATUS.COMPLETED]: 'bg-green-500'
};

/**
 * Obtiene la etiqueta en español para un estado
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status as ProjectStatus] || status;
}

/**
 * Obtiene el color para un estado
 */
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status as ProjectStatus] || 'bg-gray-500';
}
