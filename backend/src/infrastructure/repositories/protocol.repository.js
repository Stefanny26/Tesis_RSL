const database = require('../../config/database');
const Protocol = require('../../domain/models/protocol.model');

/**
 * Repositorio para operaciones de Protocolo en PostgreSQL
 */
class ProtocolRepository {
  async findByProjectId(projectId) {
    const query = 'SELECT * FROM protocols WHERE project_id = $1';
    const result = await database.query(query, [projectId]);
    if (!result.rows[0]) return null;
    
    // Parsear campos JSONB
    const row = result.rows[0];
    const jsonbFields = [
      'is_matrix', 'is_not_matrix', 'research_questions', 'inclusion_criteria',
      'exclusion_criteria', 'databases', 'evaluation_initial', 'matrix_elements',
      'key_terms', 'temporal_range', 'prisma_compliance'
    ];
    
    jsonbFields.forEach(field => {
      if (row[field] && typeof row[field] === 'string') {
        row[field] = JSON.parse(row[field]);
      }
    });
    
    return new Protocol(row);
  }

  async create(protocolData) {
    const protocol = new Protocol(protocolData);
    protocol.validate();

    const query = `
      INSERT INTO protocols (
        project_id, is_matrix, is_not_matrix, population, intervention,
        comparison, outcomes, research_questions, inclusion_criteria,
        exclusion_criteria, databases, search_string, date_range_start,
        date_range_end, completed
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const db = protocol.toDatabase();
    const values = [
      db.project_id, db.is_matrix, db.is_not_matrix, db.population,
      db.intervention, db.comparison, db.outcomes, db.research_questions,
      db.inclusion_criteria, db.exclusion_criteria, db.databases,
      db.search_string, db.date_range_start, db.date_range_end, db.completed
    ];

    const result = await database.query(query, values);
    return this.findByProjectId(protocol.projectId);
  }

  async update(projectId, protocolData) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    const fieldMap = {
      // Título propuesto por IA
      proposedTitle: 'proposed_title',
      
      // Evaluación inicial
      evaluationInitial: 'evaluation_initial',
      
      // Matriz Es/No Es
      isMatrix: 'is_matrix',
      isNotMatrix: 'is_not_matrix',
      matrixElements: 'matrix_elements',
      refinedQuestion: 'refined_question',
      
      // Marco PICO
      population: 'population',
      intervention: 'intervention',
      comparison: 'comparison',
      outcomes: 'outcomes',
      
      // Preguntas de investigación
      researchQuestions: 'research_questions',
      
      // Criterios
      inclusionCriteria: 'inclusion_criteria',
      exclusionCriteria: 'exclusion_criteria',
      
      // Términos clave
      keyTerms: 'key_terms',
      
      // Estrategia de búsqueda
      databases: 'databases',
      searchString: 'search_string',
      temporalRange: 'temporal_range',
      
      // Fechas (legacy, se usa temporalRange ahora)
      dateRangeStart: 'date_range_start',
      dateRangeEnd: 'date_range_end',
      
      // Cumplimiento PRISMA
      prismaCompliance: 'prisma_compliance',
      
      // Estado
      completed: 'completed'
    };

    // Lista de campos que deben ser JSON
    const jsonFields = [
      'evaluationInitial', 'isMatrix', 'isNotMatrix', 'matrixElements',
      'researchQuestions', 'inclusionCriteria', 'exclusionCriteria',
      'databases', 'keyTerms', 'temporalRange', 'prismaCompliance'
    ];

    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
      if (protocolData[jsKey] !== undefined) {
        const value = jsonFields.includes(jsKey)
          ? JSON.stringify(protocolData[jsKey])
          : protocolData[jsKey];
        
        updates.push(`${dbKey} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return this.findByProjectId(projectId);
    }

    updates.push(`updated_at = NOW()`);
    values.push(projectId);

    const query = `
      UPDATE protocols
      SET ${updates.join(', ')}
      WHERE project_id = $${paramCount}
      RETURNING *
    `;

    await database.query(query, values);
    return this.findByProjectId(projectId);
  }

  async delete(projectId) {
    await database.query('DELETE FROM protocols WHERE project_id = $1', [projectId]);
    return true;
  }
}

module.exports = ProtocolRepository;
