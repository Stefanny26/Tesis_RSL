const ProjectRepository = require('../../infrastructure/repositories/project.repository');

/**
 * Caso de uso: Crear proyecto
 */
class CreateProjectUseCase {
  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  async execute(projectData, userId) {
    const { title, description, deadline } = projectData;

    // Validaciones
    if (!title || title.trim().length === 0) {
      throw new Error('Título es requerido');
    }

    // Crear proyecto
    const project = await this.projectRepository.create({
      title,
      description,
      deadline,
      ownerId: userId,
      status: 'draft' // Cambiado de 'Configuración' a 'draft' para coincidir con la constraint de BD
    });

    return project.toJSON();
  }
}

module.exports = CreateProjectUseCase;
