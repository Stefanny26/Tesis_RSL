/**
 * Repositorio: RQS Entries
 * 
 * Gestiona la persistencia de entradas RQS (Research Question Schema)
 * para extracción estructurada de datos de estudios incluidos.
 */
const database = require('../../config/database');
const RQSEntry = require('../../domain/models/rqs-entry.model');

class RQSEntryRepository {
  /**
   * Crear nueva entrada RQS
   */
  async create(rqsEntry) {
    rqsEntry.validate();

    const query = `
      INSERT INTO rqs_entries (
        project_id, reference_id,
        author, year, title, source,
        study_type, technology, context,
        key_evidence, metrics,
        rq1_relation, rq2_relation, rq3_relation, rq_notes,
        limitations, quality_score,
        extraction_method, extracted_by, extracted_at,
        validated, validated_by, validated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      ) RETURNING *
    `;

    const values = [
      rqsEntry.projectId,
      rqsEntry.referenceId,
      rqsEntry.author,
      rqsEntry.year,
      rqsEntry.title,
      rqsEntry.source,
      rqsEntry.studyType,
      rqsEntry.technology,
      rqsEntry.context,
      rqsEntry.keyEvidence,
      JSON.stringify(rqsEntry.metrics || {}),
      rqsEntry.rq1Relation,
      rqsEntry.rq2Relation,
      rqsEntry.rq3Relation,
      rqsEntry.rqNotes,
      rqsEntry.limitations,
      rqsEntry.qualityScore,
      rqsEntry.extractionMethod,
      rqsEntry.extractedBy,
      rqsEntry.extractedAt || new Date(),
      rqsEntry.validated || false,
      rqsEntry.validatedBy,
      rqsEntry.validatedAt
    ];

    const pool = database.getPool();
    const result = await pool.query(query, values);
    
    return RQSEntry.fromDatabase(result.rows[0]);
  }

  /**
   * Obtener todas las entradas RQS de un proyecto
   */
  async findByProject(projectId) {
    const query = `
      SELECT * FROM rqs_entries 
      WHERE project_id = $1
      ORDER BY year DESC, author ASC
    `;

    const pool = database.getPool();
    const result = await pool.query(query, [projectId]);
    
    return result.rows.map(row => RQSEntry.fromDatabase(row));
  }

  /**
   * Obtener entrada RQS por referencia
   */
  async findByReference(referenceId) {
    const query = `
      SELECT * FROM rqs_entries 
      WHERE reference_id = $1
      LIMIT 1
    `;

    const pool = database.getPool();
    const result = await pool.query(query, [referenceId]);
    
    return result.rows.length > 0 ? RQSEntry.fromDatabase(result.rows[0]) : null;
  }

  /**
   * Actualizar entrada RQS
   */
  async update(id, updates) {
    const allowedFields = [
      'author', 'year', 'title', 'source',
      'study_type', 'technology', 'context',
      'key_evidence', 'metrics',
      'rq1_relation', 'rq2_relation', 'rq3_relation', 'rq_notes',
      'limitations', 'quality_score',
      'validated', 'validated_by', 'validated_at'
    ];

    const setClauses = [];
    const values = [];
    let valueIndex = 1;

    Object.keys(updates).forEach(key => {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbKey)) {
        setClauses.push(`${dbKey} = $${valueIndex}`);
        
        // Serializar metrics si es objeto
        if (dbKey === 'metrics' && typeof updates[key] === 'object') {
          values.push(JSON.stringify(updates[key]));
        } else {
          values.push(updates[key]);
        }
        valueIndex++;
      }
    });

    if (setClauses.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    // Agregar updated_at
    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(id);

    const query = `
      UPDATE rqs_entries 
      SET ${setClauses.join(', ')}
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    const pool = database.getPool();
    const result = await pool.query(query, values);
    
    return result.rows.length > 0 ? RQSEntry.fromDatabase(result.rows[0]) : null;
  }

  /**
   * Eliminar entrada RQS
   */
  async delete(id) {
    const query = 'DELETE FROM rqs_entries WHERE id = $1';
    
    const pool = database.getPool();
    await pool.query(query, [id]);
    
    return true;
  }

  /**
   * Verificar si existe entrada para una referencia
   */
  async existsForReference(referenceId) {
    const query = 'SELECT COUNT(*) as count FROM rqs_entries WHERE reference_id = $1';
    
    const pool = database.getPool();
    const result = await pool.query(query, [referenceId]);
    
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Obtener estadísticas RQS de un proyecto
   */
  async getStats(projectId) {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN validated = true THEN 1 END) as validated,
        COUNT(CASE WHEN extraction_method = 'ai_assisted' THEN 1 END) as ai_extracted,
        COUNT(CASE WHEN extraction_method = 'manual' THEN 1 END) as manual_extracted,
        COUNT(CASE WHEN study_type = 'empirical' THEN 1 END) as empirical,
        COUNT(CASE WHEN study_type = 'case_study' THEN 1 END) as case_studies,
        COUNT(CASE WHEN study_type = 'experiment' THEN 1 END) as experiments
      FROM rqs_entries 
      WHERE project_id = $1
    `;

    const pool = database.getPool();
    const result = await pool.query(query, [projectId]);
    
    return result.rows[0];
  }

  /**
   * Batch insert (para extracción masiva)
   */
  async createBatch(rqsEntries) {
    if (!rqsEntries || rqsEntries.length === 0) {
      return [];
    }

    const pool = database.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const inserted = [];
      for (const entry of rqsEntries) {
        entry.validate();

        const query = `
          INSERT INTO rqs_entries (
            project_id, reference_id,
            author, year, title, source,
            study_type, technology, context,
            key_evidence, metrics,
            rq1_relation, rq2_relation, rq3_relation, rq_notes,
            limitations, quality_score,
            extraction_method, extracted_by, extracted_at,
            validated
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
          ) RETURNING *
        `;

        const values = [
          entry.projectId,
          entry.referenceId,
          entry.author,
          entry.year,
          entry.title,
          entry.source,
          entry.studyType,
          entry.technology,
          entry.context,
          entry.keyEvidence,
          JSON.stringify(entry.metrics || {}),
          entry.rq1Relation,
          entry.rq2Relation,
          entry.rq3Relation,
          entry.rqNotes,
          entry.limitations,
          entry.qualityScore,
          entry.extractionMethod,
          entry.extractedBy,
          entry.extractedAt || new Date(),
          entry.validated || false
        ];

        const result = await client.query(query, values);
        inserted.push(RQSEntry.fromDatabase(result.rows[0]));
      }

      await client.query('COMMIT');
      return inserted;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = RQSEntryRepository;
