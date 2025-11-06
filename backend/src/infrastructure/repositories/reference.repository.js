const database = require('../../config/database');
const Reference = require('../../domain/models/reference.model');

/**
 * Repositorio para operaciones de Referencias en PostgreSQL
 */
class ReferenceRepository {
  async findById(id) {
    const query = 'SELECT * FROM "references" WHERE id = $1';
    const result = await database.query(query, [id]);
    return result.rows[0] ? new Reference(result.rows[0]) : null;
  }

  async findByProjectId(projectId, filters = {}, limit = 100, offset = 0) {
    let query = 'SELECT * FROM "references" WHERE project_id = $1';
    const values = [projectId];
    let paramCount = 2;

    // Filtros opcionales
    if (filters.screeningStatus) {
      query += ` AND screening_status = $${paramCount++}`;
      values.push(filters.screeningStatus);
    }

    if (filters.year) {
      query += ` AND year = $${paramCount++}`;
      values.push(filters.year);
    }

    if (filters.source) {
      query += ` AND source = $${paramCount++}`;
      values.push(filters.source);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);

    const result = await database.query(query, values);
    return result.rows.map(row => new Reference(row));
  }

  async create(referenceData) {
    const reference = new Reference(referenceData);
    reference.validate();

    const query = `
      INSERT INTO "references" (
        project_id, title, authors, year, journal, doi, abstract,
        keywords, url, screening_status, source
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      reference.projectId, reference.title, reference.authors,
      reference.year, reference.journal, reference.doi, reference.abstract,
      reference.keywords, reference.url, reference.screeningStatus, reference.source
    ];

    const result = await database.query(query, values);
    return new Reference(result.rows[0]);
  }

  async update(id, referenceData) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'title', 'authors', 'year', 'journal', 'doi', 'abstract', 'keywords', 'url',
      'screeningStatus', 'aiClassification', 'aiConfidenceScore', 'aiReasoning',
      'manualReviewStatus', 'manualReviewNotes', 'reviewedBy'
    ];

    const fieldMap = {
      screeningStatus: 'screening_status',
      aiClassification: 'ai_classification',
      aiConfidenceScore: 'ai_confidence_score',
      aiReasoning: 'ai_reasoning',
      manualReviewStatus: 'manual_review_status',
      manualReviewNotes: 'manual_review_notes',
      reviewedBy: 'reviewed_by'
    };

    for (const field of allowedFields) {
      if (referenceData[field] !== undefined) {
        const dbField = fieldMap[field] || field;
        updates.push(`${dbField} = $${paramCount++}`);
        values.push(referenceData[field]);
      }
    }

    if (referenceData.reviewedBy) {
      updates.push(`reviewed_at = NOW()`);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE "references"
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await database.query(query, values);
    return result.rows[0] ? new Reference(result.rows[0]) : null;
  }

  async delete(id) {
    await database.query('DELETE FROM "references" WHERE id = $1', [id]);
    return true;
  }

  async countByProject(projectId, filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM "references" WHERE project_id = $1';
    const values = [projectId];
    let paramCount = 2;

    if (filters.screeningStatus) {
      query += ` AND screening_status = $${paramCount++}`;
      values.push(filters.screeningStatus);
    }

    const result = await database.query(query, values);
    return Number.parseInt(result.rows[0].total);
  }

  async bulkCreate(references) {
    const client = await database.getPool().connect();
    try {
      await client.query('BEGIN');
      const created = [];

      for (const refData of references) {
        const reference = new Reference(refData);
        const query = `
          INSERT INTO "references" (
            project_id, title, authors, year, journal, doi, abstract,
            keywords, url, screening_status, source
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `;

        const values = [
          reference.projectId, reference.title, reference.authors,
          reference.year, reference.journal, reference.doi, reference.abstract,
          reference.keywords, reference.url, reference.screeningStatus, reference.source
        ];

        const result = await client.query(query, values);
        created.push(new Reference(result.rows[0]));
      }

      await client.query('COMMIT');
      return created;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = ReferenceRepository;
