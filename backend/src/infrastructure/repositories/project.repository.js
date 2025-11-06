const database = require('../../config/database');
const Project = require('../../domain/models/project.model');

/**
 * Repositorio para operaciones de Proyecto en PostgreSQL
 */
class ProjectRepository {
  /**
   * Buscar proyecto por ID
   */
  async findById(id) {
    const query = 'SELECT * FROM projects WHERE id = $1';
    const result = await database.query(query, [id]);
    return result.rows[0] ? new Project(result.rows[0]) : null;
  }

  /**
   * Listar proyectos de un usuario
   */
  async findByOwnerId(ownerId, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM projects
      WHERE owner_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await database.query(query, [ownerId, limit, offset]);
    return result.rows.map(row => new Project(row));
  }

  /**
   * Crear nuevo proyecto
   */
  async create(projectData) {
    const project = new Project(projectData);
    project.validate();

    const query = `
      INSERT INTO projects (
        title, description, status, owner_id, deadline
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      project.title,
      project.description,
      project.status,
      project.ownerId,
      project.deadline
    ];

    const result = await database.query(query, values);
    return new Project(result.rows[0]);
  }

  /**
   * Actualizar proyecto
   */
  async update(id, projectData) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (projectData.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(projectData.title);
    }
    if (projectData.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(projectData.description);
    }
    if (projectData.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(projectData.status);
    }
    if (projectData.deadline !== undefined) {
      updates.push(`deadline = $${paramCount++}`);
      values.push(projectData.deadline);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE projects
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await database.query(query, values);
    return result.rows[0] ? new Project(result.rows[0]) : null;
  }

  /**
   * Actualizar estadísticas del proyecto
   */
  async updateStatistics(id, stats) {
    const query = `
      UPDATE projects
      SET
        total_references = COALESCE($1, total_references),
        screened_references = COALESCE($2, screened_references),
        included_references = COALESCE($3, included_references),
        excluded_references = COALESCE($4, excluded_references),
        prisma_compliance_percentage = COALESCE($5, prisma_compliance_percentage),
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;

    const values = [
      stats.totalReferences,
      stats.screenedReferences,
      stats.includedReferences,
      stats.excludedReferences,
      stats.prismaCompliancePercentage,
      id
    ];

    const result = await database.query(query, values);
    return result.rows[0] ? new Project(result.rows[0]) : null;
  }

  /**
   * Eliminar proyecto
   */
  async delete(id) {
    const query = 'DELETE FROM projects WHERE id = $1';
    await database.query(query, [id]);
    return true;
  }

  /**
   * Verificar si el usuario es dueño del proyecto
   */
  async isOwner(projectId, userId) {
    const query = 'SELECT owner_id FROM projects WHERE id = $1';
    const result = await database.query(query, [projectId]);
    if (result.rows.length === 0) return false;
    return result.rows[0].owner_id === userId;
  }

  /**
   * Contar proyectos de un usuario
   */
  async countByOwner(ownerId) {
    const query = 'SELECT COUNT(*) as total FROM projects WHERE owner_id = $1';
    const result = await database.query(query, [ownerId]);
    return parseInt(result.rows[0].total);
  }

  /**
   * Obtener estadísticas globales de un usuario
   */
  async getOwnerStatistics(ownerId) {
    const query = `
      SELECT
        COUNT(*) as total_projects,
        SUM(total_references) as total_references,
        SUM(screened_references) as screened_references,
        AVG(prisma_compliance_percentage) as avg_prisma_compliance
      FROM projects
      WHERE owner_id = $1
    `;
    const result = await database.query(query, [ownerId]);
    return result.rows[0];
  }
}

module.exports = ProjectRepository;
