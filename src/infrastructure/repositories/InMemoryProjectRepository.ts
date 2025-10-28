/**
 * Infrastructure: InMemory Project Repository
 * 
 * Implementación del repositorio de proyectos en memoria.
 * Usa los datos mock existentes para mantener compatibilidad.
 */

import { Project } from "@domain/entities"
import { 
  IProjectRepository, 
  CreateProjectData, 
  UpdateProjectData 
} from "@domain/repositories"
import { mockProjects } from "@/lib/mock-data"

export class InMemoryProjectRepository implements IProjectRepository {
  private projects: Project[]

  constructor() {
    // Convertir mock data a entidades del dominio
    this.projects = mockProjects.map(p => Project.fromJSON(p))
  }

  async create(data: CreateProjectData): Promise<Project> {
    const project = new Project({
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      status: "draft",
      ownerId: data.ownerId,
      ownerName: data.ownerName,
      collaborators: data.collaborators || [],
    })

    this.projects.push(project)
    return project
  }

  async findById(id: string): Promise<Project | null> {
    const project = this.projects.find(p => p.id === id)
    return project || null
  }

  async findByUserId(userId: string): Promise<Project[]> {
    return this.projects.filter(p => p.ownerId === userId)
  }

  async findByCollaborator(userId: string): Promise<Project[]> {
    return this.projects.filter(p => p.collaborators.includes(userId))
  }

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    const index = this.projects.findIndex(p => p.id === id)
    
    if (index === -1) {
      throw new Error("Proyecto no encontrado")
    }

    const existingProject = this.projects[index]
    const updatedProject = new Project({
      ...existingProject.toJSON(),
      ...data,
      updatedAt: new Date(),
    })

    this.projects[index] = updatedProject
    return updatedProject
  }

  async delete(id: string): Promise<void> {
    const index = this.projects.findIndex(p => p.id === id)
    
    if (index === -1) {
      throw new Error("Proyecto no encontrado")
    }

    this.projects.splice(index, 1)
  }

  async findAll(): Promise<Project[]> {
    return [...this.projects]
  }
}
