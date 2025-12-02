const ReferenceRepository = require('../../infrastructure/repositories/reference.repository');
const ScopusSearchUseCase = require('../../domain/use-cases/scopus-search.use-case');
const ImportReferencesUseCase = require('../../domain/use-cases/import-references.use-case');
const ExportReferencesUseCase = require('../../domain/use-cases/export-references.use-case');
const DetectDuplicatesUseCase = require('../../domain/use-cases/detect-duplicates.use-case');

const referenceRepository = new ReferenceRepository();
const scopusSearch = new ScopusSearchUseCase(referenceRepository);
const importReferences = new ImportReferencesUseCase(referenceRepository);
const exportReferences = new ExportReferencesUseCase(referenceRepository);
const detectDuplicates = new DetectDuplicatesUseCase();

/**
 * GET /api/references/:projectId
 * Obtener referencias de un proyecto
 */
const getProjectReferences = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, year, source, limit = 100, offset = 0 } = req.query;

    const filters = {};
    if (status) filters.screeningStatus = status;
    if (year) filters.year = parseInt(year);
    if (source) filters.source = source;

    const references = await referenceRepository.findByProjectId(
      projectId, 
      filters, 
      parseInt(limit), 
      parseInt(offset)
    );

    const total = await referenceRepository.countByProject(projectId, filters);

    // Calcular estadísticas
    const stats = {
      total: await referenceRepository.countByProject(projectId),
      pending: await referenceRepository.countByProject(projectId, { screeningStatus: 'pending' }),
      included: await referenceRepository.countByProject(projectId, { screeningStatus: 'included' }),
      excluded: await referenceRepository.countByProject(projectId, { screeningStatus: 'excluded' }),
      maybe: await referenceRepository.countByProject(projectId, { screeningStatus: 'maybe' })
    };

    res.status(200).json({
      success: true,
      data: {
        references: references.map(ref => ref.toJSON()),
        stats,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + references.length < total
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo referencias:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener referencias'
    });
  }
};

/**
 * POST /api/references/:projectId
 * Crear una nueva referencia
 */
const createReference = async (req, res) => {
  try {
    const { projectId } = req.params;
    const referenceData = req.body;

    const reference = await referenceRepository.create(projectId, referenceData);

    res.status(201).json({
      success: true,
      data: reference
    });
  } catch (error) {
    console.error('Error creando referencia:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear referencia'
    });
  }
};

/**
 * POST /api/references/:projectId/batch
 * Crear múltiples referencias
 */
const createReferencesBatch = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { references } = req.body;

    if (!Array.isArray(references) || references.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array de referencias es requerido'
      });
    }

    const createdReferences = await referenceRepository.createBatch(projectId, references);

    res.status(201).json({
      success: true,
      data: createdReferences,
      count: createdReferences.length
    });
  } catch (error) {
    console.error('Error creando referencias en lote:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear referencias'
    });
  }
};

/**
 * PUT /api/references/:id/screening
 * Actualizar estado de screening
 */
const updateScreeningStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, aiData } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Estado es requerido'
      });
    }

    const updateData = {
      screeningStatus: status
    };

    // Si hay datos de IA, agregarlos
    if (aiData) {
      if (aiData.classification) updateData.aiClassification = aiData.classification;
      if (aiData.confidence) updateData.aiConfidenceScore = aiData.confidence;
      if (aiData.reasoning) updateData.aiReasoning = aiData.reasoning;
    }

    const reference = await referenceRepository.update(id, updateData);

    if (!reference) {
      return res.status(404).json({
        success: false,
        message: 'Referencia no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: reference.toJSON()
    });
  } catch (error) {
    console.error('Error actualizando referencia:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar referencia'
    });
  }
};

/**
 * PUT /api/references/batch-update
 * Actualizar múltiples referencias
 */
const updateReferencesBatch = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array de actualizaciones es requerido'
      });
    }

    const updatedReferences = await referenceRepository.updateBatch(updates);

    res.status(200).json({
      success: true,
      data: updatedReferences,
      count: updatedReferences.length
    });
  } catch (error) {
    console.error('Error actualizando referencias:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar referencias'
    });
  }
};

/**
 * GET /api/references/:projectId/stats
 * Obtener estadísticas de screening
 */
const getScreeningStats = async (req, res) => {
  try {
    const { projectId } = req.params;

    const stats = await referenceRepository.getScreeningStats(projectId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener estadísticas'
    });
  }
};

/**
 * GET /api/references/:id/duplicates
 * Buscar duplicados potenciales
 */
const findDuplicates = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId es requerido'
      });
    }

    const duplicates = await referenceRepository.findPotentialDuplicates(projectId, id);

    res.status(200).json({
      success: true,
      data: duplicates,
      count: duplicates.length
    });
  } catch (error) {
    console.error('Error buscando duplicados:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al buscar duplicados'
    });
  }
};

/**
 * POST /api/references/:projectId/detect-duplicates
 * Detectar y marcar duplicados en un proyecto
 */
const detectProjectDuplicates = async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await detectDuplicates.execute(projectId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error detectando duplicados:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al detectar duplicados'
    });
  }
};

/**
 * DELETE /api/references/:id
 * Eliminar una referencia
 */
const deleteReference = async (req, res) => {
  try {
    const { id } = req.params;

    const reference = await referenceRepository.delete(id);

    if (!reference) {
      return res.status(404).json({
        success: false,
        message: 'Referencia no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Referencia eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando referencia:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar referencia'
    });
  }
};

/**
 * GET /api/references/:projectId/year-distribution
 * Obtener distribución por año
 */
const getYearDistribution = async (req, res) => {
  try {
    const { projectId } = req.params;

    const distribution = await referenceRepository.getYearDistribution(projectId);

    res.status(200).json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Error obteniendo distribución:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener distribución'
    });
  }
};

/**
 * GET /api/references/:projectId/source-distribution
 * Obtener distribución por fuente
 */
const getSourceDistribution = async (req, res) => {
  try {
    const { projectId } = req.params;

    const distribution = await referenceRepository.getSourceDistribution(projectId);

    res.status(200).json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Error obteniendo distribución:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener distribución'
    });
  }
};

/**
 * POST /api/references/search-academic
 * Buscar referencias en Scopus (IEEE y otros requieren carga manual)
 */
const searchAcademicReferences = async (req, res) => {
  try {
    const { query, database = 'scopus', maxResultsPerSource = 50 } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'La cadena de búsqueda es requerida'
      });
    }

    // Solo soportamos búsqueda API para Scopus
    if (database !== 'scopus') {
      return res.status(400).json({
        success: false,
        message: `Búsqueda API no disponible para ${database}. Use carga manual de archivos.`
      });
    }

    // Buscar en Scopus
    const scopusApiKey = process.env.SCOPUS_API_KEY;
    if (!scopusApiKey) {
      return res.status(500).json({
        success: false,
        message: 'API key de Scopus no configurada en el servidor'
      });
    }

    const results = await scopusSearch.search({
      query,
      apiKey: scopusApiKey,
      start: 0,
      count: parseInt(maxResultsPerSource)
    });

    res.status(200).json({
      success: true,
      data: {
        scopus: results.references,
        ieee: [],
        combined: results.references,
        stats: {
          totalScopus: results.total,
          totalIEEE: 0,
          totalCombined: results.count,
          duplicatesRemoved: 0
        }
      }
    });
  } catch (error) {
    console.error('Error en búsqueda académica:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al buscar referencias académicas'
    });
  }
};

/**
 * POST /api/references/:projectId/import
 * Importar referencias desde archivos (BibTeX, RIS, CSV)
 */
const importReferencesFromFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    console.log('📥 POST /api/references/:projectId/import');
    console.log('   Project ID:', projectId);
    console.log('   Files recibidos:', req.files ? req.files.length : 0);
    
    if (req.files) {
      req.files.forEach((file, i) => {
        console.log(`   Archivo ${i + 1}:`, {
          nombre: file.originalname,
          tipo: file.mimetype,
          tamaño: file.size,
          extensión: file.originalname.split('.').pop()
        });
      });
    }
    
    if (!req.files || req.files.length === 0) {
      console.log('❌ No se proporcionaron archivos');
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron archivos para importar'
      });
    }

    console.log('🔄 Ejecutando importación...');
    const result = await importReferences.execute(projectId, req.files);
    
    console.log('✅ Importación completada:', result);

    res.status(200).json({
      success: true,
      message: `Se importaron ${result.success} referencias exitosamente`,
      data: result
    });
  } catch (error) {
    console.error('❌ Error importando referencias:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al importar referencias'
    });
  }
};

/**
 * GET /api/references/:projectId/export
 * Exportar referencias a diferentes formatos
 */
const exportReferencesToFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { format = 'bibtex', status } = req.query;

    const filters = {};
    if (status) filters.screeningStatus = status;

    const result = await exportReferences.execute(projectId, format, filters);

    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="references-${projectId}.${result.extension}"`);
    res.status(200).send(result.content);
  } catch (error) {
    console.error('Error exportando referencias:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al exportar referencias'
    });
  }
};

module.exports = {
  getProjectReferences,
  createReference,
  createReferencesBatch,
  updateScreeningStatus,
  updateReferencesBatch,
  getScreeningStats,
  findDuplicates,
  detectProjectDuplicates,
  deleteReference,
  getYearDistribution,
  getSourceDistribution,
  searchAcademicReferences,
  importReferencesFromFiles,
  exportReferencesToFile
};
