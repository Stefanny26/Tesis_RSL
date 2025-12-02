/**
 * Utilidades para determinar el estado efectivo de un proyecto
 * basándose en su contenido real, no solo en el campo status
 */

import type { Project } from "./types"

export type EffectiveStatus = 'draft' | 'in-progress' | 'screening' | 'analysis' | 'completed'

/**
 * Detecta el estado efectivo de un proyecto basándose en:
 * - Referencias totales
 * - Referencias screened
 * - Status declarado
 * 
 * SOLO considera en screening si está explícitamente marcado o en análisis
 */
export function getEffectiveProjectStatus(project: Project): EffectiveStatus {
  // Si está marcado como completado, respetarlo siempre
  if (project.status === 'completed') {
    return 'completed'
  }
  
  // Respetar el status del proyecto - NO inferir automáticamente
  // Solo los proyectos que el usuario marcó como screening/analysis
  if (project.status === 'screening' || project.status === 'analysis') {
    return project.status
  }
  
  // Si está en in-progress, respetarlo
  if (project.status === 'in-progress') {
    return 'in-progress'
  }
  
  // Para drafts: solo considerar screening si tiene referencias Y screenings
  if (project.status === 'draft') {
    const hasScreening = project.references && project.references.screened > 0
    if (hasScreening) {
      return 'screening'
    }
    return 'draft'
  }
  
  // Por defecto, respetar el status
  return project.status as EffectiveStatus
}

/**
 * Determina si un proyecto está activo (no completado y no en draft puro)
 */
export function isProjectActive(project: Project): boolean {
  const effectiveStatus = getEffectiveProjectStatus(project)
  return effectiveStatus !== 'completed' && effectiveStatus !== 'draft'
}

/**
 * Cuenta proyectos activos en una lista
 */
export function countActiveProjects(projects: Project[]): number {
  return projects.filter(p => {
    const status = getEffectiveProjectStatus(p)
    return status === 'in-progress' || status === 'screening' || status === 'analysis'
  }).length
}

/**
 * Filtra proyectos que están en fase de cribado (screening o analysis)
 */
export function getScreeningProjects(projects: Project[]): Project[] {
  return projects.filter(p => {
    const status = getEffectiveProjectStatus(p)
    return status === 'screening' || status === 'analysis'
  })
}

/**
 * Mapeo de status efectivo a labels en español
 */
export const statusLabels: Record<EffectiveStatus, string> = {
  draft: 'Borrador',
  'in-progress': 'En Progreso',
  screening: 'Cribado',
  analysis: 'Análisis',
  completed: 'Completado'
}

/**
 * Mapeo de status efectivo a variantes de Badge
 */
export const statusVariants: Record<EffectiveStatus, 'default' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  'in-progress': 'default',
  screening: 'default',
  analysis: 'default',
  completed: 'outline'
}
