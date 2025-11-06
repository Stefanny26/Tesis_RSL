/**
 * Modelo de dominio: Proyecto
 * Representa un proyecto de revisión sistemática
 */
class Project {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.status = data.status || 'draft'; // Cambiado de 'Configuración' a 'draft'
    this.ownerId = data.owner_id || data.ownerId;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
    this.deadline = data.deadline;
    
    // Estadísticas
    this.totalReferences = data.total_references || data.totalReferences || 0;
    this.screenedReferences = data.screened_references || data.screenedReferences || 0;
    this.includedReferences = data.included_references || data.includedReferences || 0;
    this.excludedReferences = data.excluded_references || data.excludedReferences || 0;
    this.prismaCompliancePercentage = data.prisma_compliance_percentage || data.prismaCompliancePercentage || 0;
  }

  /**
   * Estados válidos del proyecto (según constraint de BD)
   */
  static get VALID_STATUSES() {
    return ['draft', 'in-progress', 'screening', 'analysis', 'completed'];
  }

  /**
   * Mapeo de estados a español para UI
   */
  static get STATUS_LABELS() {
    return {
      'draft': 'Borrador',
      'in-progress': 'En Progreso',
      'screening': 'Cribado',
      'analysis': 'Análisis',
      'completed': 'Completado'
    };
  }

  /**
   * Convierte el modelo a un objeto plano para respuestas API
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deadline: this.deadline,
      statistics: {
        totalReferences: this.totalReferences,
        screenedReferences: this.screenedReferences,
        includedReferences: this.includedReferences,
        excludedReferences: this.excludedReferences,
        prismaCompliancePercentage: this.prismaCompliancePercentage
      }
    };
  }

  /**
   * Convierte a formato snake_case para PostgreSQL
   */
  toDatabase() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      owner_id: this.ownerId,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
      deadline: this.deadline,
      total_references: this.totalReferences,
      screened_references: this.screenedReferences,
      included_references: this.includedReferences,
      excluded_references: this.excludedReferences,
      prisma_compliance_percentage: this.prismaCompliancePercentage
    };
  }

  /**
   * Valida que el proyecto tenga los campos requeridos
   */
  validate() {
    if (!this.title || this.title.trim().length === 0) {
      throw new Error('Título es requerido');
    }

    if (this.title.length > 500) {
      throw new Error('Título no puede exceder 500 caracteres');
    }

    if (!Project.VALID_STATUSES.includes(this.status)) {
      throw new Error(`Estado debe ser uno de: ${Project.VALID_STATUSES.join(', ')}`);
    }

    if (!this.ownerId) {
      throw new Error('Owner ID es requerido');
    }

    return true;
  }

  /**
   * Calcula el progreso del proyecto basado en referencias cribadas
   */
  getProgress() {
    if (this.totalReferences === 0) return 0;
    return Math.round((this.screenedReferences / this.totalReferences) * 100);
  }
}

module.exports = Project;
