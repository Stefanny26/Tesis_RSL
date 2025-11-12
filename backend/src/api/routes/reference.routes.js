const express = require('express');
const router = express.Router();
const {
  getProjectReferences,
  createReference,
  createReferencesBatch,
  updateScreeningStatus,
  updateReferencesBatch,
  getScreeningStats,
  findDuplicates,
  deleteReference,
  getYearDistribution,
  getSourceDistribution,
  searchAcademicReferences
} = require('../controllers/reference.controller');
const { authMiddleware } = require('../../infrastructure/middlewares/auth.middleware');

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

module.exports = router;
