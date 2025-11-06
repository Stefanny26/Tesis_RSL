const ProjectRepository = require('../../infrastructure/repositories/project.repository');

/**
 * Caso de uso: Obtener proyectos del usuario
 */
class GetUserProjectsUseCase {
  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  async execute(userId, pagination = {}) {
    const { limit = 50, offset = 0 } = pagination;

    const projects = await this.projectRepository.findByOwnerId(userId, limit, offset);
    const total = await this.projectRepository.countByOwner(userId);

    return {
      projects: projects.map(p => p.toJSON()),
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
