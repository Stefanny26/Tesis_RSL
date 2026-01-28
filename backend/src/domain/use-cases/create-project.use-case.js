const ProjectRepository = require('../../infrastructure/repositories/project.repository');
const ProtocolRepository = require('../../infrastructure/repositories/protocol.repository');

/**
 * Caso de uso: Crear proyecto
 */
class CreateProjectUseCase {
  constructor() {
    this.projectRepository = new ProjectRepository();
    this.protocolRepository = new ProtocolRepository();
  }

  async execute(projectData, userId) {
    const { title, description, deadline, protocol } = projectData;

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

    // Si viene protocolo estructurado desde el wizard, crearlo automáticamente
    if (protocol) {
      try {
        console.log('Creando protocolo con criterios:', {
          inclusionCount: protocol.inclusionCriteria?.length || 0,
          exclusionCount: protocol.exclusionCriteria?.length || 0,
          inclusionSample: protocol.inclusionCriteria?.[0],
          exclusionSample: protocol.exclusionCriteria?.[0]
        });
        
        await this.protocolRepository.create({
          projectId: project.id,
          proposedTitle: protocol.proposedTitle,
          // PICO Framework
          population: protocol.population,
          intervention: protocol.intervention,
          comparison: protocol.comparison,
          outcomes: protocol.outcomes,
          // Matriz Es/No Es
          isMatrix: protocol.isMatrix,
          isNotMatrix: protocol.isNotMatrix,
          // Criterios
          inclusionCriteria: protocol.inclusionCriteria,
          exclusionCriteria: protocol.exclusionCriteria,
          // Búsqueda
          databases: protocol.databases,
          searchString: protocol.searchString,
          temporalRange: protocol.temporalRange,
          // Términos clave
          keyTerms: protocol.keyTerms,
          // PRISMA
          prismaCompliance: protocol.prismaCompliance,
          // Estado
          completed: false
        });
      } catch (protocolError) {
        console.error('Error creating protocol:', protocolError);
        // No lanzar error, el proyecto ya fue creado
      }
    }

    return project.toJSON();
  }
}

module.exports = CreateProjectUseCase;

