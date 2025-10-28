/**
 * Repository Interface: IProjectRepository
 * 
 * Define el contrato para operaciones con proyectos.
 */

import { Project } from "../entities/Project"

export interface CreateProjectData {
  title: string
  description: string
  ownerId: string
  ownerName: string
  collaborators?: string[]
}

export interface UpdateProjectData {
  title?: string
  description?: string
  status?: "draft" | "in-progress" | "screening" | "analysis" | "completed"
  collaborators?: string[]
  protocol?: any
  references?: any
  prismaCompliance?: number
}

export interface IProjectRepository {
  /**
   * Crea un nuevo proyecto
   */
  create(data: CreateProjectData): Promise<Project>

  /**
   * Obtiene un proyecto por su ID
   */
  findById(id: string): Promise<Project | null>

  /**
   * Obtiene todos los proyectos de un usuario
   */
  findByUserId(userId: string): Promise<Project[]>

  /**
   * Obtiene todos los proyectos donde el usuario es colaborador
   */
  findByCollaborator(userId: string): Promise<Project[]>

  /**
   * Actualiza un proyecto existente
   */
  update(id: string, data: UpdateProjectData): Promise<Project>

  /**
   * Elimina un proyecto
   */
  delete(id: string): Promise<void>

  /**
   * Obtiene todos los proyectos (útil para admin)
   */
  findAll(): Promise<Project[]>
}
