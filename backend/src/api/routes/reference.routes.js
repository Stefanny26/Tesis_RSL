const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
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
} = require('../controllers/reference.controller');
const { authMiddleware } = require('../../infrastructure/middlewares/auth.middleware');

// Configurar multer para subida de archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.bib', '.ris', '.csv', '.txt', '.nbib', '.ciw'];
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Formato no soportado: ${ext}. Use BibTeX, RIS o CSV`));
    }
  }
});

/**
 * @route   POST /api/references/search-academic
 * @desc    Buscar referencias en bases de datos académicas (Scopus, IEEE)
 * @access  Private
 * @important Esta ruta debe estar ANTES de /:projectId para evitar conflictos
 */
router.post(
  '/search-academic',
  authMiddleware,
  searchAcademicReferences
);

/**
 * @route   GET /api/references/:projectId
 * @desc    Obtener referencias de un proyecto
 * @access  Private
 */
router.get(
  '/:projectId',
  authMiddleware,
  getProjectReferences
);

/**
 * @route   POST /api/references/:projectId
 * @desc    Crear una nueva referencia
 * @access  Private
 */
router.post(
  '/:projectId',
  authMiddleware,
  createReference
);

/**
 * @route   POST /api/references/:projectId/batch
 * @desc    Crear múltiples referencias en lote
 * @access  Private
 */
router.post(
  '/:projectId/batch',
  authMiddleware,
  createReferencesBatch
);

/**
 * @route   PUT /api/references/:id/screening
 * @desc    Actualizar estado de screening de una referencia
 * @access  Private
 */
router.put(
  '/:id/screening',
  authMiddleware,
  updateScreeningStatus
);

/**
 * @route   PUT /api/references/batch-update
 * @desc    Actualizar múltiples referencias
 * @access  Private
 */
router.put(
  '/batch-update',
  authMiddleware,
  updateReferencesBatch
);

/**
 * @route   GET /api/references/:projectId/stats
 * @desc    Obtener estadísticas de screening
 * @access  Private
 */
router.get(
  '/:projectId/stats',
  authMiddleware,
  getScreeningStats
);

/**
 * @route   POST /api/references/:projectId/detect-duplicates
 * @desc    Detectar y marcar duplicados en el proyecto
 * @access  Private
 */
router.post(
  '/:projectId/detect-duplicates',
  authMiddleware,
  detectProjectDuplicates
);

/**
 * @route   GET /api/references/:id/duplicates
 * @desc    Buscar duplicados potenciales
 * @access  Private
 */
router.get(
  '/:id/duplicates',
  authMiddleware,
  findDuplicates
);

/**
 * @route   DELETE /api/references/:id
 * @desc    Eliminar una referencia
 * @access  Private
 */
router.delete(
  '/:id',
  authMiddleware,
  deleteReference
);

/**
 * @route   GET /api/references/:projectId/year-distribution
 * @desc    Obtener distribución de referencias por año
 * @access  Private
 */
router.get(
  '/:projectId/year-distribution',
  authMiddleware,
  getYearDistribution
);

/**
 * @route   GET /api/references/:projectId/source-distribution
 * @desc    Obtener distribución de referencias por fuente
 * @access  Private
 */
router.get(
  '/:projectId/source-distribution',
  authMiddleware,
  getSourceDistribution
);

/**
 * @route   POST /api/references/:projectId/import
 * @desc    Importar referencias desde archivos (BibTeX, RIS, CSV)
 * @access  Private
 */
router.post(
  '/:projectId/import',
  authMiddleware,
  upload.array('files', 10), // Máximo 10 archivos
  importReferencesFromFiles
);

/**
 * @route   GET /api/references/:projectId/export
 * @desc    Exportar referencias a diferentes formatos
 * @access  Private
 */
router.get(
  '/:projectId/export',
  authMiddleware,
  exportReferencesToFile
);

module.exports = router;
