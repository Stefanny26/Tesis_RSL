/**
 * Use Case: Create Project
 * 
 * Crea un nuevo proyecto de revisión sistemática.
 */

import { Project } from "../../domain/entities/Project"
import { IProjectRepository, CreateProjectData } from "../../domain/repositories/IProjectRepository"

export class CreateProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(data: CreateProjectData): Promise<Project> {
    // Validaciones de negocio
    if (!data.title || data.title.trim() === "") {
      throw new Error("El título del proyecto es requerido")
    }

    if (data.title.length < 10) {
      throw new Error("El título debe tener al menos 10 caracteres")
    }

    if (!data.description || data.description.trim() === "") {
      throw new Error("La descripción del proyecto es requerida")
    }

    if (data.description.length < 20) {
      throw new Error("La descripción debe tener al menos 20 caracteres")
    }

    if (!data.ownerId || data.ownerId.trim() === "") {
      throw new Error("El ID del propietario es requerido")
    }

    // Crear proyecto usando el repositorio
    const project = await this.projectRepository.create(data)
    return project
  }
}
