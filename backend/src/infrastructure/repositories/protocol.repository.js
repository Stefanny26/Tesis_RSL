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
      'key_terms', 'search_queries', 'temporal_range', 'prisma_compliance'
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
        project_id, proposed_title, is_matrix, is_not_matrix, refined_question,
        population, intervention, comparison, outcomes, 
        inclusion_criteria, exclusion_criteria, 
        databases, search_string, search_queries, key_terms, temporal_range,
        prisma_compliance, completed
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;

    const db = protocol.toDatabase();
    const values = [
      db.project_id, 
      db.proposed_title,
      db.is_matrix, 
      db.is_not_matrix,
      db.refined_question,
      db.population,
      db.intervention, 
      db.comparison, 
      db.outcomes,
      db.inclusion_criteria, 
      db.exclusion_criteria, 
      db.databases,
      db.search_string,
      db.search_queries,
      db.key_terms, 
      db.temporal_range,
      db.prisma_compliance,
      db.completed
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
      
      // Matriz Es/No Es
      isMatrix: 'is_matrix',
      isNotMatrix: 'is_not_matrix',
      refinedQuestion: 'refined_question',
      
      // Marco PICO
      population: 'population',
      intervention: 'intervention',
      comparison: 'comparison',
      outcomes: 'outcomes',
      
      // Criterios
      inclusionCriteria: 'inclusion_criteria',
      exclusionCriteria: 'exclusion_criteria',
      
      // Estrategia de búsqueda
      databases: 'databases',
      searchQueries: 'search_queries',
      searchString: 'search_string',
      keyTerms: 'key_terms',
      temporalRange: 'temporal_range',
      
      // Cumplimiento PRISMA
      prismaCompliance: 'prisma_compliance',
      
      // Resultados del screening
      screeningResults: 'screening_results',
      
      // Estado
      completed: 'completed'
    };

    // Usar el modelo Protocol para manejar la serialización correctamente
    const Protocol = require('../../domain/models/protocol.model');
    
    // Crear instancia del modelo con los datos recibidos
    const protocolInstance = new Protocol({
      ...protocolData,
      projectId: projectId
    });
    
    // Obtener datos serializados correctamente
    const dbData = protocolInstance.toDatabase();
    
    // Mapear los campos del modelo a la base de datos
    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
      // Convertir camelCase a snake_case para buscar en dbData
      const snakeKey = dbKey;
      
      if (dbData[snakeKey] !== undefined && protocolData[jsKey] !== undefined) {
        console.log(`   📦 Campo ${jsKey} (${snakeKey}):`, 
          typeof dbData[snakeKey] === 'string' 
            ? dbData[snakeKey].substring(0, 100) 
            : dbData[snakeKey]);
        
        updates.push(`${dbKey} = $${paramCount++}`);
        values.push(dbData[snakeKey]);
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
