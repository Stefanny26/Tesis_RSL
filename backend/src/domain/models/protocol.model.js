/**
 * Modelo de dominio: Protocolo
 * Representa el protocolo de revisión sistemática de un proyecto
 */
class Protocol {
  constructor(data) {
    this.id = data.id;
    this.projectId = data.project_id || data.projectId;
    
    // Título propuesto por IA
    this.proposedTitle = data.proposed_title || data.proposedTitle;
    
    // Matriz Es/No Es
    this.isMatrix = data.is_matrix || data.isMatrix || [];
    this.isNotMatrix = data.is_not_matrix || data.isNotMatrix || [];
    this.refinedQuestion = data.refined_question || data.refinedQuestion;
    
    // Framework PICO
    this.population = data.population;
    this.intervention = data.intervention;
    this.comparison = data.comparison;
    this.outcomes = data.outcomes;
    
    // Criterios
    this.inclusionCriteria = data.inclusion_criteria || data.inclusionCriteria || [];
    this.exclusionCriteria = data.exclusion_criteria || data.exclusionCriteria || [];
    
    // Estrategia de búsqueda
    this.databases = data.databases || [];
    this.searchString = data.search_string || data.searchString;
    this.searchQueries = data.search_queries || data.searchQueries || [];
    this.temporalRange = data.temporal_range || data.temporalRange || {};
    this.keyTerms = data.key_terms || data.keyTerms || {};
    
    // Cumplimiento PRISMA
    this.prismaCompliance = data.prisma_compliance || data.prismaCompliance || [];
    
    // Resultados de cribado (embeddings + ChatGPT)
    this.screeningResults = data.screening_results || data.screeningResults || null;
    
    // Metadatos
    this.completed = data.completed || false;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  /**
   * Convierte el modelo a un objeto plano para respuestas API
   */
  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      proposedTitle: this.proposedTitle,
      isMatrix: this.isMatrix,
      isNotMatrix: this.isNotMatrix,
      refinedQuestion: this.refinedQuestion,
      picoFramework: {
        population: this.population,
        intervention: this.intervention,
        comparison: this.comparison,
        outcomes: this.outcomes
      },
      inclusionCriteria: this.inclusionCriteria,
      exclusionCriteria: this.exclusionCriteria,
      searchStrategy: {
        databases: this.databases,
        searchString: this.searchString,
        searchQueries: this.searchQueries,
        temporalRange: this.temporalRange
      },
      keyTerms: this.keyTerms,
      prismaCompliance: this.prismaCompliance,
      completed: this.completed,
      createdAt: this.createdAt,
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
      proposed_title: this.proposedTitle,
      is_matrix: JSON.stringify(this.isMatrix),
      is_not_matrix: JSON.stringify(this.isNotMatrix),
      refined_question: this.refinedQuestion,
      population: this.population,
      intervention: this.intervention,
      comparison: this.comparison,
      outcomes: this.outcomes,
      inclusion_criteria: JSON.stringify(this.inclusionCriteria),
      exclusion_criteria: JSON.stringify(this.exclusionCriteria),
      databases: JSON.stringify(this.databases),
      search_string: this.searchString,
      search_queries: JSON.stringify(this.searchQueries),
      temporal_range: JSON.stringify(this.temporalRange),
      key_terms: JSON.stringify(this.keyTerms),
      prisma_compliance: JSON.stringify(this.prismaCompliance),
      completed: this.completed,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  /**
   * Valida que el protocolo tenga los campos requeridos
   */
  validate() {
    if (!this.projectId) {
      throw new Error('Project ID es requerido');
    }

    return true;
  }

  /**
   * Calcula el porcentaje de completitud del protocolo
   */
  getCompletionPercentage() {
    const sections = [
      this.isMatrix.length > 0,
      this.isNotMatrix.length > 0,
      this.population && this.population.trim().length > 0,
      this.intervention && this.intervention.trim().length > 0,
      this.outcomes && this.outcomes.trim().length > 0,
      this.inclusionCriteria.length > 0,
      this.exclusionCriteria.length > 0,
      this.databases.length > 0,
      this.searchString && this.searchString.trim().length > 0,
      this.temporalRange && this.temporalRange.start && this.temporalRange.end
    ];

    const completedSections = sections.filter(Boolean).length;
    return Math.round((completedSections / sections.length) * 100);
  }
}

module.exports = Protocol;
