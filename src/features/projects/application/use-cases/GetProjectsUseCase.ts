/**
 * Use Case: Get Projects
 * 
 * Obtiene todos los proyectos de un usuario.
 */

import { Project } from "../../domain/entities/Project"
import { IProjectRepository } from "../../domain/repositories/IProjectRepository"

export class GetProjectsUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(userId: string): Promise<Project[]> {
    if (!userId || userId.trim() === "") {
      throw new Error("El ID del usuario es requerido")
    }

    // Obtener proyectos propios
    const ownedProjects = await this.projectRepository.findByUserId(userId)
    
    // Obtener proyectos donde es colaborador
    const collaboratedProjects = await this.projectRepository.findByCollaborator(userId)
    
    // Combinar y eliminar duplicados
    const allProjects = [...ownedProjects, ...collaboratedProjects]
    const uniqueProjects = allProjects.filter(
      (project, index, self) => self.findIndex(p => p.id === project.id) === index
    )
    
    return uniqueProjects
  }
}
