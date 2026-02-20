const ProjectRepository = require('../../infrastructure/repositories/project.repository');
const PrismaItemRepository = require('../../infrastructure/repositories/prisma-item.repository');

/**
 * Caso de uso: Obtener proyectos del usuario
 * Enriquece cada proyecto con estadísticas PRISMA calculadas en tiempo real
 */
class GetUserProjectsUseCase {
  constructor() {
    this.projectRepository = new ProjectRepository();
    this.prismaItemRepository = new PrismaItemRepository();
  }

  async execute(userId, pagination = {}) {
    const { limit = 50, offset = 0 } = pagination;

    const projects = await this.projectRepository.findByOwnerId(userId, limit, offset);
    const total = await this.projectRepository.countByOwner(userId);

    // Obtener estadísticas PRISMA para todos los proyectos en batch
    const projectIds = projects.map(p => p.id);
    const prismaStatsMap = await this.prismaItemRepository.getComplianceStatsBatch(projectIds);

    // Enriquecer cada proyecto con su porcentaje PRISMA real
    const enrichedProjects = projects.map(p => {
      const json = p.toJSON();
      const prismaStats = prismaStatsMap[p.id];
      if (prismaStats) {
        json.statistics.prismaCompliancePercentage = prismaStats.percentage;
        json.prismaCompliancePercentage = prismaStats.percentage;
      } else {
        json.statistics.prismaCompliancePercentage = 0;
        json.prismaCompliancePercentage = 0;
      }
      return json;
    });

    return {
      projects: enrichedProjects,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + projects.length < total
      }
    };
  }
}

module.exports = GetUserProjectsUseCase;

