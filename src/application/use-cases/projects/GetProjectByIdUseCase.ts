/**
 * Use Case: Get Project By ID
 * 
 * Obtiene un proyecto específico por su ID.
 */

import { Project } from "@domain/entities"
import { IProjectRepository } from "@domain/repositories/IProjectRepository"

export class GetProjectByIdUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(projectId: string, userId: string): Promise<Project> {
    if (!projectId || projectId.trim() === "") {
      throw new Error("El ID del proyecto es requerido")
    }

    if (!userId || userId.trim() === "") {
      throw new Error("El ID del usuario es requerido")
    }

    const project = await this.projectRepository.findById(projectId)
    
    if (!project) {
      throw new Error("Proyecto no encontrado")
    }

    // Verificar que el usuario tiene acceso al proyecto
    if (!project.canEdit(userId)) {
      throw new Error("No tienes permisos para acceder a este proyecto")
    }

    return project
  }
}
