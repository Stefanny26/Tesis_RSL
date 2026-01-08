/**
 * Modelo de dominio: ArticleVersion
 * Representa una versión del artículo de revisión sistemática
 */
class ArticleVersion {
  constructor(data) {
    this.id = data.id;
    this.projectId = data.project_id || data.projectId;
    this.versionNumber = data.version_number || data.versionNumber;
    
    // Contenido del artículo por secciones
    this.title = data.title;
    this.abstract = data.abstract;
    this.introduction = data.introduction;
    this.methods = data.methods;
    this.results = data.results;
    this.discussion = data.discussion;
    this.conclusions = data.conclusions;
    this.referencesSection = data.references_section || data.referencesSection;
    this.declarations = data.declarations;
    
    // Metadatos de versión
    this.description = data.description;
    this.isCurrent = data.is_current || data.isCurrent || false;
    this.wordCount = data.word_count || data.wordCount || 0;
    
    // Generación con IA
    this.aiGeneratedSections = data.ai_generated_sections || data.aiGeneratedSections || [];
    
    // Autoría
    this.createdBy = data.created_by || data.createdBy;
    this.createdAt = data.created_at || data.createdAt;
  }

  /**
   * Secciones del artículo
   */
  static get SECTIONS() {
    return [
      'title',
      'abstract',
      'introduction',
      'methods',
      'results',
      'discussion',
      'conclusions',
      'references'
    ];
  }

  /**
   * Convierte el modelo a un objeto plano para respuestas API
   */
  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      version: this.versionNumber,
      versionNumber: this.versionNumber,
      title: this.title,
      content: {
        title: this.title,
        abstract: this.abstract,
        introduction: this.introduction,
        methods: this.methods,
        results: this.results,
        discussion: this.discussion,
        conclusions: this.conclusions,
        references: this.referencesSection,
        declarations: this.declarations || ''
      },
      description: this.description,
      changeDescription: this.description,
      isCurrent: this.isCurrent,
      wordCount: this.wordCount,
      aiGeneratedSections: this.aiGeneratedSections,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      isPublished: false
    };
  }

  /**
   * Convierte a formato snake_case para PostgreSQL
   */
  toDatabase() {
    return {
      id: this.id,
      project_id: this.projectId,
      version_number: this.versionNumber,
      title: this.title,
      abstract: this.abstract,
      introduction: this.introduction,
      methods: this.methods,
      results: this.results,
      discussion: this.discussion,
      conclusions: this.conclusions,
      references_section: this.referencesSection,
      description: this.description,
      is_current: this.isCurrent,
      word_count: this.wordCount,
      ai_generated_sections: JSON.stringify(this.aiGeneratedSections),
      created_by: this.createdBy,
      created_at: this.createdAt
    };
  }

  /**
   * Valida que la versión tenga los campos requeridos
   */
  validate() {
    if (!this.projectId) {
      throw new Error('Project ID es requerido');
    }

    if (!this.versionNumber || this.versionNumber < 1) {
      throw new Error('Version Number debe ser mayor a 0');
    }

    return true;
  }

  /**
   * Calcula el conteo de palabras de todas las secciones
   */
  calculateWordCount() {
    const sections = [
      this.title,
      this.abstract,
      this.introduction,
      this.methods,
      this.results,
      this.discussion,
      this.conclusions,
      this.referencesSection
    ];

    let totalWords = 0;
    sections.forEach(section => {
      if (section) {
        // Contar palabras (separadas por espacios)
        totalWords += section.trim().split(/\s+/).length;
      }
    });

    this.wordCount = totalWords;
    return totalWords;
  }

  /**
   * Obtiene el porcentaje de completitud del artículo
   */
  getCompletionPercentage() {
    const sections = ArticleVersion.SECTIONS;
    let completedSections = 0;

    sections.forEach(section => {
      const content = this[section === 'references' ? 'referencesSection' : section];
      if (content && content.trim().length > 0) {
        completedSections++;
      }
    });

    return Math.round((completedSections / sections.length) * 100);
  }

  /**
   * Verifica si una sección fue generada con IA
   */
  isAIGenerated(sectionName) {
    return this.aiGeneratedSections.includes(sectionName);
  }

  /**
   * Crea instancia desde registro de base de datos
   */
  static fromDatabase(row) {
    if (!row) return null;

    return new ArticleVersion({
      id: row.id,
      project_id: row.project_id,
      version_number: row.version_number,
      title: row.title,
      abstract: row.abstract,
      introduction: row.introduction,
      methods: row.methods,
      results: row.results,
      discussion: row.discussion,
      conclusions: row.conclusions,
      references_section: row.references_section,
      declarations: row.declarations,
      description: row.change_description,
      is_current: row.is_current,
      word_count: row.word_count,
      ai_generated_sections: row.ai_generated_sections || [],
      created_by: row.created_by,
      created_at: row.created_at
    });
  }
}

module.exports = ArticleVersion;
