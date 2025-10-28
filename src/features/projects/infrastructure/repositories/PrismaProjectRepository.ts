/**
 * Infrastructure: Prisma Project Repository
 * 
 * Implementación del repositorio de proyectos usando Prisma ORM y PostgreSQL.
 */

import { Project as DomainProject } from "../../domain/entities/Project"
import { 
  IProjectRepository, 
  CreateProjectData, 
  UpdateProjectData 
} from "../../domain/repositories/IProjectRepository"
import prisma from "@/lib/prisma"
// Note: Avoid deep Prisma type dependencies here to keep repository portable
import type { Prisma } from "@prisma/client"

export class PrismaProjectRepository implements IProjectRepository {
  
  async create(data: CreateProjectData): Promise<DomainProject> {
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        ownerId: data.ownerId,
        status: "Configuracion", // Estado inicial
      }
    })

    return this.toDomain(project)
  }

  async findById(id: string): Promise<DomainProject | null> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
        members: {
          include: {
            user: true
          }
        }
      }
    })

    if (!project) return null
    return this.toDomain(project)
  }

  async findByUserId(userId: string): Promise<DomainProject[]> {
    const projects = await prisma.project.findMany({
      where: { ownerId: userId },
      include: {
        owner: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return projects.map((p: any) => this.toDomain(p))
  }

  async findByCollaborator(userId: string): Promise<DomainProject[]> {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        owner: true,
        members: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return projects.map((p: any) => this.toDomain(p))
  }

  async update(id: string, data: UpdateProjectData): Promise<DomainProject> {
    const updateData: any = {}

    if (data.title) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.status) updateData.status = this.mapStatusToPrisma(data.status)
    
    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        owner: true
      }
    })

    return this.toDomain(project)
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({
      where: { id }
    })
  }

  async findAll(): Promise<DomainProject[]> {
    const projects = await prisma.project.findMany({
      include: {
        owner: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return projects.map((p: any) => this.toDomain(p))
  }

  // Métodos auxiliares

  private toDomain(
    prismaProject: any
  ): DomainProject {
    return new DomainProject({
      id: prismaProject.id,
      title: prismaProject.title,
      description: prismaProject.description || "",
      status: this.mapStatusFromPrisma(prismaProject.status),
      ownerId: prismaProject.ownerId,
      ownerName: prismaProject.owner?.fullName || "Unknown",
      collaborators:
        Array.isArray(prismaProject.members)
          ? prismaProject.members.map((m: any) => m.user?.fullName || m.userId)
          : [],
      references: {
        total: prismaProject.totalReferences || 0,
        screened: prismaProject.screenedReferences || 0,
        included: prismaProject.includedReferences || 0,
        excluded: prismaProject.excludedReferences || 0,
      },
      prismaCompliance: Number(prismaProject.prismaCompliancePercentage) || 0,
      createdAt: prismaProject.createdAt,
      updatedAt: prismaProject.updatedAt,
    })
  }

  private mapStatusToPrisma(status: string): string {
    const statusMap: Record<string, string> = {
      "draft": "Configuracion",
      "in-progress": "EnProgreso",
      "screening": "Revision",
      "analysis": "Revision",
      "completed": "Completado",
    }
    return statusMap[status] || "Configuracion"
  }

  private mapStatusFromPrisma(prismaStatus: string): "draft" | "in-progress" | "screening" | "analysis" | "completed" {
    const statusMap: Record<string, "draft" | "in-progress" | "screening" | "analysis" | "completed"> = {
      Configuracion: "draft",
      EnProgreso: "in-progress",
      Revision: "screening",
      Completado: "completed",
    }
    return statusMap[prismaStatus] || "draft"
  }

  // Métodos adicionales específicos de Prisma

  async addCollaborator(projectId: string, userId: string, role: "Colaborador" | "Revisor" = "Colaborador"): Promise<void> {
    await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role,
      }
    })
  }

  async removeCollaborator(projectId: string, userId: string): Promise<void> {
    await prisma.projectMember.deleteMany({
      where: {
        projectId,
        userId,
      }
    })
  }

  async updateStatistics(projectId: string, statistics: {
    total?: number
    screened?: number
    included?: number
    excluded?: number
    prismaCompliance?: number
  }): Promise<void> {
    const updateData: any = {}
    
    if (statistics.total !== undefined) updateData.totalReferences = statistics.total
    if (statistics.screened !== undefined) updateData.screenedReferences = statistics.screened
    if (statistics.included !== undefined) updateData.includedReferences = statistics.included
    if (statistics.excluded !== undefined) updateData.excludedReferences = statistics.excluded
    if (statistics.prismaCompliance !== undefined) {
      updateData.prismaCompliancePercentage = statistics.prismaCompliance
    }

    await prisma.project.update({
      where: { id: projectId },
      data: updateData
    })
  }
}
