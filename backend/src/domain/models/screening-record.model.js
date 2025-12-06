/**
 * Modelo de dominio: Screening Record
 * Representa una evaluación de texto completo de una referencia
 * con puntuación detallada según criterios metodológicos
 */
class ScreeningRecord {
  constructor(data) {
    this.id = data.id || data._id;
    this.referenceId = data.reference_id || data.referenceId;
    this.projectId = data.project_id || data.projectId;
    this.userId = data.user_id || data.userId;
    
    // Etapa de evaluación
    this.stage = data.stage || 'fulltext'; // 'title_abstract' | 'fulltext'
    
    // Puntajes individuales (cada criterio tiene su rango)
    this.scores = {
      relevance: data.scores?.relevance || 0,              // 0-2: Relevancia temática
      interventionPresent: data.scores?.interventionPresent || 0,  // 0-2: Intervención presente
      methodValidity: data.scores?.methodValidity || 0,    // 0-2: Metodología válida
      dataReported: data.scores?.dataReported || 0,        // 0-2: Datos reportados
      textAccessible: data.scores?.textAccessible || 0,    // 0-1: Texto accesible
      dateRange: data.scores?.dateRange || 0,              // 0-1: Fecha en rango
      methodQuality: data.scores?.methodQuality || 0       // 0-2: Calidad metodológica
    };
    
    // Puntaje total y umbral
    this.totalScore = data.total_score || data.totalScore || 0;
    this.threshold = data.threshold || 7; // Umbral por defecto: 7/12
    
    // Decisión final
    this.decision = data.decision; // 'include' | 'exclude'
    
    // Motivos de exclusión (si aplica)
    this.exclusionReasons = data.exclusion_reasons || data.exclusionReasons || [];
    
    // Comentarios adicionales
    this.comment = data.comment || '';
    
    // Metadatos
    this.reviewedAt = data.reviewed_at || data.reviewedAt || new Date();
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  /**
   * Calcula el puntaje total sumando todos los scores
   */
  calculateTotalScore() {
    const { relevance, interventionPresent, methodValidity, dataReported, textAccessible, dateRange, methodQuality } = this.scores;
    return relevance + interventionPresent + methodValidity + dataReported + textAccessible + dateRange + methodQuality;
  }

  /**
   * Determina la decisión basada en el threshold
   */
  determineDecision() {
    return this.totalScore >= this.threshold ? 'include' : 'exclude';
  }

  /**
   * Identifica los motivos principales de exclusión basados en scores bajos
   */
  identifyExclusionReasons() {
    const reasons = [];
    
    if (this.scores.relevance < 1) {
      reasons.push('Tema no relacionado con la pregunta de investigación');
    }
    
    if (this.scores.interventionPresent < 1) {
      reasons.push('Intervención o comparación no presente o no clara');
    }
    
    if (this.scores.methodValidity < 1) {
      reasons.push('Metodología no válida o no descrita adecuadamente');
    }
    
    if (this.scores.dataReported < 1) {
      reasons.push('No reporta datos empíricos o resultados');
    }
    
    if (this.scores.textAccessible === 0) {
      reasons.push('Texto completo no accesible o no disponible');
    }
    
    if (this.scores.dateRange === 0) {
      reasons.push('Publicación fuera del rango temporal establecido');
    }
    
    if (this.scores.methodQuality < 1) {
      reasons.push('Calidad metodológica insuficiente (diseño, muestra, validez)');
    }
    
    return reasons;
  }

  /**
   * Valida que el record tenga los campos requeridos
   */
  validate() {
    if (!this.referenceId) {
      throw new Error('Reference ID es requerido');
    }
    
    if (!this.projectId) {
      throw new Error('Project ID es requerido');
    }
    
    if (!this.userId) {
      throw new Error('User ID es requerido');
    }
    
    if (!this.decision || !['include', 'exclude'].includes(this.decision)) {
      throw new Error('Decisión debe ser "include" o "exclude"');
    }
    
    // Validar rangos de puntajes
    const { relevance, interventionPresent, methodValidity, dataReported, textAccessible, dateRange, methodQuality } = this.scores;
    
    if (relevance < 0 || relevance > 2) throw new Error('Relevance debe estar entre 0 y 2');
    if (interventionPresent < 0 || interventionPresent > 2) throw new Error('InterventionPresent debe estar entre 0 y 2');
    if (methodValidity < 0 || methodValidity > 2) throw new Error('MethodValidity debe estar entre 0 y 2');
    if (dataReported < 0 || dataReported > 2) throw new Error('DataReported debe estar entre 0 y 2');
    if (textAccessible < 0 || textAccessible > 1) throw new Error('TextAccessible debe estar entre 0 y 1');
    if (dateRange < 0 || dateRange > 1) throw new Error('DateRange debe estar entre 0 y 1');
    if (methodQuality < 0 || methodQuality > 2) throw new Error('MethodQuality debe estar entre 0 y 2');
    
    return true;
  }

  /**
   * Convierte el modelo a un objeto plano para respuestas API
   */
  toJSON() {
    return {
      id: this.id,
      referenceId: this.referenceId,
      projectId: this.projectId,
      userId: this.userId,
      stage: this.stage,
      scores: this.scores,
      totalScore: this.totalScore,
      threshold: this.threshold,
      decision: this.decision,
      exclusionReasons: this.exclusionReasons,
      comment: this.comment,
      reviewedAt: this.reviewedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Convierte a formato snake_case para base de datos
   */
  toDatabase() {
    return {
      reference_id: this.referenceId,
      project_id: this.projectId,
      user_id: this.userId,
      stage: this.stage,
      scores: this.scores,
      total_score: this.totalScore,
      threshold: this.threshold,
      decision: this.decision,
      exclusion_reasons: this.exclusionReasons,
      comment: this.comment,
      reviewed_at: this.reviewedAt,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}

module.exports = ScreeningRecord;
