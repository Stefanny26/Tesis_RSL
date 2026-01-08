/**
 * Modelo: RQS Entry (Research Question Schema)
 * 
 * Representa la extracción estructurada de datos de un estudio incluido,
 * siguiendo el esquema RQS recomendado para revisiones sistemáticas en ingeniería.
 */
class RQSEntry {
  constructor({
    id,
    projectId,
    referenceId,
    
    // Identificación
    author,
    year,
    title,
    source,
    
    // Clasificación
    studyType,        // 'empirical', 'case_study', 'experiment', 'simulation', 'review'
    technology,       // Tecnología principal evaluada
    context,          // 'industrial', 'enterprise', 'academic', 'experimental'
    
    // Evidencia clave
    keyEvidence,      // Resultados/hallazgos principales reportados
    metrics,          // Métricas específicas (JSON: {latency, throughput, efficiency, etc.})
    
    // Relación con RQs
    rq1Relation,      // 'yes', 'no', 'partial'
    rq2Relation,      // 'yes', 'no', 'partial'
    rq3Relation,      // 'yes', 'no', 'partial'
    rqNotes,          // Notas sobre relación con RQs
    
    // Calidad y limitaciones
    limitations,      // Limitaciones declaradas por autores
    qualityScore,     // 'high', 'medium', 'low' (opcional)
    
    // Metadata
    extractionMethod, // 'ai_assisted', 'manual', 'hybrid'
    extractedBy,      // user_id
    extractedAt,
    validated,
    validatedBy,
    validatedAt,
    
    // Control
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.projectId = projectId;
    this.referenceId = referenceId;
    
    this.author = author;
    this.year = year;
    this.title = title;
    this.source = source;
    
    this.studyType = studyType;
    this.technology = technology;
    this.context = context;
    
    this.keyEvidence = keyEvidence;
    this.metrics = metrics;
    
    this.rq1Relation = rq1Relation;
    this.rq2Relation = rq2Relation;
    this.rq3Relation = rq3Relation;
    this.rqNotes = rqNotes;
    
    this.limitations = limitations;
    this.qualityScore = qualityScore;
    
    this.extractionMethod = extractionMethod;
    this.extractedBy = extractedBy;
    this.extractedAt = extractedAt;
    this.validated = validated || false;
    this.validatedBy = validatedBy;
    this.validatedAt = validatedAt;
    
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Validar que los campos obligatorios están presentes
   */
  validate() {
    if (!this.projectId) throw new Error('projectId es obligatorio');
    if (!this.referenceId) throw new Error('referenceId es obligatorio');
    if (!this.author) throw new Error('author es obligatorio');
    if (!this.year) throw new Error('year es obligatorio');
    
    return true;
  }

  /**
   * Convertir a JSON para BD
   */
  toJSON() {
    return {
      id: this.id,
      project_id: this.projectId,
      reference_id: this.referenceId,
      
      author: this.author,
      year: this.year,
      title: this.title,
      source: this.source,
      
      study_type: this.studyType,
      technology: this.technology,
      context: this.context,
      
      key_evidence: this.keyEvidence,
      metrics: JSON.stringify(this.metrics || {}),
      
      rq1_relation: this.rq1Relation,
      rq2_relation: this.rq2Relation,
      rq3_relation: this.rq3Relation,
      rq_notes: this.rqNotes,
      
      limitations: this.limitations,
      quality_score: this.qualityScore,
      
      extraction_method: this.extractionMethod,
      extracted_by: this.extractedBy,
      extracted_at: this.extractedAt,
      validated: this.validated,
      validated_by: this.validatedBy,
      validated_at: this.validatedAt,
      
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }

  /**
   * Crear desde row de BD
   */
  static fromDatabase(row) {
    if (!row) return null;

    // Helper para parsear metrics de forma segura
    let parsedMetrics = {};
    if (row.metrics) {
      if (typeof row.metrics === 'string') {
        try {
          parsedMetrics = JSON.parse(row.metrics);
        } catch (e) {
          console.warn('Error parseando metrics:', e);
          parsedMetrics = {};
        }
      } else if (typeof row.metrics === 'object') {
        // Ya es un objeto (PostgreSQL JSONB lo parsea automáticamente)
        parsedMetrics = row.metrics;
      }
    }

    return new RQSEntry({
      id: row.id,
      projectId: row.project_id,
      referenceId: row.reference_id,
      
      author: row.author,
      year: row.year,
      title: row.title,
      source: row.source,
      
      studyType: row.study_type,
      technology: row.technology,
      context: row.context,
      
      keyEvidence: row.key_evidence,
      metrics: parsedMetrics,
      
      rq1Relation: row.rq1_relation,
      rq2Relation: row.rq2_relation,
      rq3Relation: row.rq3_relation,
      rqNotes: row.rq_notes,
      
      limitations: row.limitations,
      qualityScore: row.quality_score,
      
      extractionMethod: row.extraction_method,
      extractedBy: row.extracted_by,
      extractedAt: row.extracted_at,
      validated: row.validated,
      validatedBy: row.validated_by,
      validatedAt: row.validated_at,
      
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
}

module.exports = RQSEntry;
