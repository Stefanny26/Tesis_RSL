/**
 * Modelo de dominio: PrismaItem
 * Representa un ítem de la guía PRISMA
 */
class PrismaItem {
  constructor(data) {
    this.id = data.id;
    this.projectId = data.project_id || data.projectId;
    this.itemNumber = data.item_number || data.itemNumber;
    this.section = data.section;
    
    // Estado y contenido
    this.completed = data.completed || false;
    this.content = data.content;
    
    // Validación con IA
    this.aiValidated = data.ai_validated || data.aiValidated || false;
    this.aiSuggestions = data.ai_suggestions || data.aiSuggestions;
    this.aiIssues = data.ai_issues || data.aiIssues || [];
    
    // Metadatos
    this.completedAt = data.completed_at || data.completedAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  /**
   * Secciones válidas de PRISMA
   */
  static get VALID_SECTIONS() {
    return [
      'Title',
      'Abstract',
      'Introduction',
      'Methods',
      'Results',
      'Discussion',
      'Funding'
    ];
  }

  /**
   * Convierte el modelo a un objeto plano para respuestas API
   */
  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      itemNumber: this.itemNumber,
      section: this.section,
      completed: this.completed,
      content: this.content,
      aiValidation: {
        validated: this.aiValidated,
        suggestions: this.aiSuggestions,
        issues: this.aiIssues
      },
      completedAt: this.completedAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Convierte a formato snake_case para PostgreSQL
   */
  toDatabase() {
    return {
      id: this.id,
      project_id: this.projectId,
      item_number: this.itemNumber,
      section: this.section,
      completed: this.completed,
      content: this.content,
      ai_validated: this.aiValidated,
      ai_suggestions: this.aiSuggestions,
      ai_issues: JSON.stringify(this.aiIssues),
      completed_at: this.completedAt,
      updated_at: this.updatedAt
    };
  }

  /**
   * Valida que el ítem PRISMA tenga los campos requeridos
   */
  validate() {
    if (!this.projectId) {
      throw new Error('Project ID es requerido');
    }

    if (!this.itemNumber || this.itemNumber < 1 || this.itemNumber > 27) {
      throw new Error('Item Number debe estar entre 1 y 27');
    }

    if (!this.section || !PrismaItem.VALID_SECTIONS.includes(this.section)) {
      throw new Error(`Section debe ser una de: ${PrismaItem.VALID_SECTIONS.join(', ')}`);
    }

    return true;
  }

  /**
   * Marca el ítem como completado
   */
  markAsCompleted() {
    this.completed = true;
    this.completedAt = new Date();
  }

  /**
   * Verifica si el contenido tiene la longitud mínima requerida
   */
  hasMinimumContent() {
    if (!this.content) return false;
    return this.content.trim().length >= 50; // Al menos 50 caracteres
  }
}

module.exports = PrismaItem;
