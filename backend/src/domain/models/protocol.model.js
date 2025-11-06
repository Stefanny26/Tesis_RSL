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
    
    // Evaluación inicial
    this.evaluationInitial = data.evaluation_initial || data.evaluationInitial || {};
    
    // Matriz Es/No Es
    this.isMatrix = data.is_matrix || data.isMatrix || [];
    this.isNotMatrix = data.is_not_matrix || data.isNotMatrix || [];
    this.matrixElements = data.matrix_elements || data.matrixElements || [];
    this.refinedQuestion = data.refined_question || data.refinedQuestion;
    
    // Framework PICO
    this.population = data.population;
    this.intervention = data.intervention;
    this.comparison = data.comparison;
    this.outcomes = data.outcomes;
    
    // Preguntas de investigación
    this.researchQuestions = data.research_questions || data.researchQuestions || [];
    
    // Criterios
    this.inclusionCriteria = data.inclusion_criteria || data.inclusionCriteria || [];
    this.exclusionCriteria = data.exclusion_criteria || data.exclusionCriteria || [];
    
    // Términos clave
    this.keyTerms = data.key_terms || data.keyTerms || {};
    
    // Estrategia de búsqueda
    this.databases = data.databases || [];
    this.searchString = data.search_string || data.searchString;
    this.temporalRange = data.temporal_range || data.temporalRange || {};
    // Legacy fields
    this.dateRangeStart = data.date_range_start || data.dateRangeStart;
    this.dateRangeEnd = data.date_range_end || data.dateRangeEnd;
    
    // Cumplimiento PRISMA
    this.prismaCompliance = data.prisma_compliance || data.prismaCompliance || [];
    
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
      evaluationInitial: this.evaluationInitial,
      isMatrix: this.isMatrix,
      isNotMatrix: this.isNotMatrix,
      matrixElements: this.matrixElements,
      refinedQuestion: this.refinedQuestion,
      picoFramework: {
        population: this.population,
        intervention: this.intervention,
        comparison: this.comparison,
        outcomes: this.outcomes
      },
      researchQuestions: this.researchQuestions,
      inclusionCriteria: this.inclusionCriteria,
      exclusionCriteria: this.exclusionCriteria,
      keyTerms: this.keyTerms,
      searchStrategy: {
        databases: this.databases,
        searchString: this.searchString,
        temporalRange: this.temporalRange,
        // Legacy
        dateRangeStart: this.dateRangeStart,
        dateRangeEnd: this.dateRangeEnd
      },
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
      evaluation_initial: JSON.stringify(this.evaluationInitial),
      is_matrix: JSON.stringify(this.isMatrix),
      is_not_matrix: JSON.stringify(this.isNotMatrix),
      matrix_elements: JSON.stringify(this.matrixElements),
      refined_question: this.refinedQuestion,
      population: this.population,
      intervention: this.intervention,
      comparison: this.comparison,
      outcomes: this.outcomes,
      research_questions: JSON.stringify(this.researchQuestions),
      inclusion_criteria: JSON.stringify(this.inclusionCriteria),
      exclusion_criteria: JSON.stringify(this.exclusionCriteria),
      key_terms: JSON.stringify(this.keyTerms),
      databases: JSON.stringify(this.databases),
      search_string: this.searchString,
      temporal_range: JSON.stringify(this.temporalRange),
      date_range_start: this.dateRangeStart,
      date_range_end: this.dateRangeEnd,
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
      this.comparison && this.comparison.trim().length > 0,
      this.outcomes && this.outcomes.trim().length > 0,
      this.researchQuestions.length > 0,
      this.inclusionCriteria.length > 0,
      this.exclusionCriteria.length > 0,
      this.databases.length > 0,
      this.searchString && this.searchString.trim().length > 0
    ];

    const completedSections = sections.filter(Boolean).length;
    return Math.round((completedSections / sections.length) * 100);
  }
}

module.exports = Protocol;
