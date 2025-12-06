const express = require('express');
const database = require('../../config/database');

const router = express.Router();

/**
 * DELETE /api/admin/remove-duplicates
 * Eliminar proyectos duplicados (mantener el más reciente)
 */
router.delete('/remove-duplicates', async (req, res) => {
  try {
    // Encontrar proyectos duplicados por título y owner
    const duplicatesQuery = `
      WITH duplicates AS (
        SELECT 
          id, 
          title, 
          owner_id, 
          created_at, 
          updated_at,
          ROW_NUMBER() OVER (
            PARTITION BY title, owner_id 
            ORDER BY updated_at DESC, created_at DESC
          ) as row_num
        FROM projects
      )
      SELECT * FROM duplicates WHERE row_num > 1
    `;
    
    const duplicates = await database.query(duplicatesQuery);
    const deleteIds = duplicates.rows.map(p => p.id);

    if (deleteIds.length === 0) {
      return res.json({
        success: true,
        message: 'No hay proyectos duplicados',
        deleted: 0
      });
    }

    // Eliminar referencias asociadas
    await database.query('DELETE FROM references WHERE project_id = ANY($1)', [deleteIds]);
    
    // Eliminar protocolos asociados
    await database.query('DELETE FROM protocols WHERE project_id = ANY($1)', [deleteIds]);
    
    // Eliminar proyectos duplicados
    const result = await database.query('DELETE FROM projects WHERE id = ANY($1)', [deleteIds]);

    res.json({
      success: true,
      message: `Se eliminaron ${result.rowCount} proyectos duplicados`,
      deleted: result.rowCount,
      deletedProjects: duplicates.rows.map(p => ({
        id: p.id,
        title: p.title,
        updatedAt: p.updated_at
      }))
    });
  } catch (error) {
    console.error('Error eliminando duplicados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar duplicados',
      error: error.message
    });
  }
});

module.exports = router;
