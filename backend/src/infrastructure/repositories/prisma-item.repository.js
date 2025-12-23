const database = require('../../config/database');
const PrismaItem = require('../../domain/models/prisma-item.model');

/**
 * Repositorio para operaciones de ítems PRISMA en PostgreSQL
 */
class PrismaItemRepository {
  /**
   * Buscar ítem PRISMA por ID
   */
  async findById(id) {
    const query = 'SELECT * FROM prisma_items WHERE id = $1';
    const result = await database.query(query, [id]);
    return result.rows[0] ? new PrismaItem(result.rows[0]) : null;
  }

  /**
   * Buscar ítem PRISMA por proyecto y número
   */
  async findByProjectAndNumber(projectId, itemNumber) {
    const query = 'SELECT * FROM prisma_items WHERE project_id = $1 AND item_number = $2';
    const result = await database.query(query, [projectId, itemNumber]);
    return result.rows[0] ? new PrismaItem(result.rows[0]) : null;
  }

  /**
   * Obtener todos los ítems PRISMA de un proyecto
   */
  async findAllByProject(projectId) {
    const query = `
      SELECT * FROM prisma_items 
      WHERE project_id = $1 
      ORDER BY item_number ASC
    `;
    const result = await database.query(query, [projectId]);
    return result.rows.map(row => new PrismaItem(row));
  }

  /**
   * Obtener ítems PRISMA por sección
   */
  async findBySection(projectId, section) {
    const query = `
      SELECT * FROM prisma_items 
      WHERE project_id = $1 AND section = $2
      ORDER BY item_number ASC
    `;
    const result = await database.query(query, [projectId, section]);
    return result.rows.map(row => new PrismaItem(row));
  }

  /**
   * Obtener estadísticas de cumplimiento PRISMA
   */
  async getComplianceStats(projectId) {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE completed = true) as completed,
        COUNT(*) FILTER (WHERE content_type = 'automated') as automated,
        COUNT(*) FILTER (WHERE content_type = 'human') as human,
        COUNT(*) FILTER (WHERE content_type = 'hybrid') as hybrid,
        COUNT(*) FILTER (WHERE content_type = 'pending') as pending,
        COUNT(*) FILTER (WHERE ai_validated = true) as ai_validated
      FROM prisma_items
      WHERE project_id = $1
    `;
    const result = await database.query(query, [projectId]);
    return result.rows[0];
  }

  /**
   * Crear o actualizar ítem PRISMA (upsert)
   */
  async upsert(prismaItemData) {
    const item = new PrismaItem(prismaItemData);
    item.validate();

    const query = `
      INSERT INTO prisma_items (
        project_id, item_number, section, completed, content,
        content_type, data_source, automated_content, last_human_edit,
        ai_validated, ai_suggestions, ai_issues, completed_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (project_id, item_number)
      DO UPDATE SET
        section = EXCLUDED.section,
        completed = EXCLUDED.completed,
        content = EXCLUDED.content,
        content_type = EXCLUDED.content_type,
        data_source = EXCLUDED.data_source,
        automated_content = EXCLUDED.automated_content,
        last_human_edit = EXCLUDED.last_human_edit,
        ai_validated = EXCLUDED.ai_validated,
        ai_suggestions = EXCLUDED.ai_suggestions,
        ai_issues = EXCLUDED.ai_issues,
        completed_at = EXCLUDED.completed_at,
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      item.projectId,
      item.itemNumber,
      item.section,
      item.completed,
      item.content,
      item.contentType,
      item.dataSource,
      item.automatedContent,
      item.lastHumanEdit,
      item.aiValidated,
      item.aiSuggestions,
      JSON.stringify(item.aiIssues),
      item.completedAt
    ];

    const result = await database.query(query, values);
    return new PrismaItem(result.rows[0]);
  }

  /**
   * Crear o actualizar múltiples ítems PRISMA en batch
   */
  async upsertBatch(prismaItems) {
    const pool = database.getPool();
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const results = [];
      for (const itemData of prismaItems) {
        const item = new PrismaItem(itemData);
        item.validate();

        const query = `
          INSERT INTO prisma_items (
            project_id, item_number, section, completed, content,
            content_type, data_source, automated_content, last_human_edit,
            ai_validated, ai_suggestions, ai_issues, completed_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
          ON CONFLICT (project_id, item_number)
          DO UPDATE SET
            section = EXCLUDED.section,
            completed = EXCLUDED.completed,
            content = EXCLUDED.content,
            content_type = EXCLUDED.content_type,
            data_source = EXCLUDED.data_source,
            automated_content = COALESCE(EXCLUDED.automated_content, prisma_items.automated_content),
            last_human_edit = EXCLUDED.last_human_edit,
            ai_validated = EXCLUDED.ai_validated,
            ai_suggestions = EXCLUDED.ai_suggestions,
            ai_issues = EXCLUDED.ai_issues,
            completed_at = EXCLUDED.completed_at,
            updated_at = NOW()
          RETURNING *
        `;

        const values = [
          item.projectId,
          item.itemNumber,
          item.section,
          item.completed,
          item.content,
          item.contentType,
          item.dataSource,
          item.automatedContent,
          item.lastHumanEdit,
          item.aiValidated,
          item.aiSuggestions,
          JSON.stringify(item.aiIssues),
          item.completedAt
        ];

        const result = await client.query(query, values);
        results.push(new PrismaItem(result.rows[0]));
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualizar contenido de ítem (marca como editado por humano si es necesario)
   */
  async updateContent(projectId, itemNumber, content, markAsHumanEdited = true) {
    // Obtener el ítem actual
    const currentItem = await this.findByProjectAndNumber(projectId, itemNumber);
    if (!currentItem) {
      throw new Error(`Ítem PRISMA ${itemNumber} no encontrado`);
    }

    // Determinar nuevo content_type
    let newContentType = currentItem.contentType;
    let lastHumanEdit = currentItem.lastHumanEdit;

    if (markAsHumanEdited && content !== currentItem.content) {
      if (currentItem.contentType === 'automated') {
        newContentType = 'hybrid';
      } else if (currentItem.contentType === 'pending') {
        newContentType = 'human';
      }
      lastHumanEdit = new Date();
    }

    const query = `
      UPDATE prisma_items
      SET 
        content = $1,
        content_type = $2,
        last_human_edit = $3,
        completed = true,
        completed_at = COALESCE(completed_at, NOW()),
        updated_at = NOW()
      WHERE project_id = $4 AND item_number = $5
      RETURNING *
    `;

    const values = [content, newContentType, lastHumanEdit, projectId, itemNumber];
    const result = await database.query(query, values);
    
    return result.rows[0] ? new PrismaItem(result.rows[0]) : null;
  }

  /**
   * Marcar ítem como completado
   */
  async markAsCompleted(projectId, itemNumber) {
    const query = `
      UPDATE prisma_items
      SET 
        completed = true,
        completed_at = COALESCE(completed_at, NOW()),
        updated_at = NOW()
      WHERE project_id = $1 AND item_number = $2
      RETURNING *
    `;

    const result = await database.query(query, [projectId, itemNumber]);
    return result.rows[0] ? new PrismaItem(result.rows[0]) : null;
  }

  /**
   * Actualizar validación con IA
   */
  async updateAIValidation(projectId, itemNumber, aiValidation) {
    const query = `
      UPDATE prisma_items
      SET 
        ai_validated = $1,
        ai_suggestions = $2,
        ai_issues = $3,
        updated_at = NOW()
      WHERE project_id = $4 AND item_number = $5
      RETURNING *
    `;

    const values = [
      aiValidation.validated || false,
      aiValidation.suggestions || null,
      JSON.stringify(aiValidation.issues || []),
      projectId,
      itemNumber
    ];

    const result = await database.query(query, values);
    return result.rows[0] ? new PrismaItem(result.rows[0]) : null;
  }

  /**
   * Eliminar todos los ítems PRISMA de un proyecto
   */
  async deleteAllByProject(projectId) {
    const query = 'DELETE FROM prisma_items WHERE project_id = $1';
    const result = await database.query(query, [projectId]);
    return result.rowCount;
  }

  /**
   * Obtener ítems pendientes de completar
   */
  async findPendingItems(projectId) {
    const query = `
      SELECT * FROM prisma_items 
      WHERE project_id = $1 AND (completed = false OR content_type = 'pending')
      ORDER BY item_number ASC
    `;
    const result = await database.query(query, [projectId]);
    return result.rows.map(row => new PrismaItem(row));
  }
}

module.exports = PrismaItemRepository;
