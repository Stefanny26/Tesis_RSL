const express = require('express');
const router = express.Router();
const {
  evaluateFullTextReference,
  reevaluateFullTextReference,
  getEvaluationHistory,
  getLatestEvaluation,
  deleteEvaluation,
  getProjectScreeningRecords,
  getScreeningStatistics
} = require('../controllers/screening.controller');
const { authMiddleware } = require('../../infrastructure/middlewares/auth.middleware');

/**
 * @route   POST /api/projects/:projectId/references/:referenceId/evaluate-fulltext
 * @desc    Evalúa el texto completo de una referencia (7 criterios, 0-12 puntos)
 * @access  Private
 * @body    { scores: { relevance, interventionPresent, methodValidity, dataReported, textAccessible, dateRange, methodQuality }, threshold?, comment? }
 */
router.post(
  '/projects/:projectId/references/:referenceId/evaluate-fulltext',
  authMiddleware,
  evaluateFullTextReference
);

/**
 * @route   PUT /api/projects/:projectId/references/:referenceId/evaluate-fulltext/:recordId
 * @desc    Re-evalúa una evaluación existente (actualiza puntajes)
 * @access  Private
 * @body    { scores: {...}, threshold?, comment? }
 */
router.put(
  '/projects/:projectId/references/:referenceId/evaluate-fulltext/:recordId',
  authMiddleware,
  reevaluateFullTextReference
);

/**
 * @route   GET /api/projects/:projectId/references/:referenceId/evaluation-history
 * @desc    Obtiene el historial completo de evaluaciones de una referencia
 * @access  Private
 */
router.get(
  '/projects/:projectId/references/:referenceId/evaluation-history',
  authMiddleware,
  getEvaluationHistory
);

/**
 * @route   GET /api/projects/:projectId/references/:referenceId/latest-evaluation
 * @desc    Obtiene la última evaluación de una referencia
 * @access  Private
 */
router.get(
  '/projects/:projectId/references/:referenceId/latest-evaluation',
  authMiddleware,
  getLatestEvaluation
);

/**
 * @route   DELETE /api/projects/:projectId/references/:referenceId/evaluate-fulltext/:recordId
 * @desc    Elimina una evaluación de texto completo
 * @access  Private
 */
router.delete(
  '/projects/:projectId/references/:referenceId/evaluate-fulltext/:recordId',
  authMiddleware,
  deleteEvaluation
);

/**
 * @route   GET /api/projects/:projectId/screening-records
 * @desc    Obtiene todos los screening records de un proyecto
 * @access  Private
 * @query   stage?, decision?, userId?
 */
router.get(
  '/projects/:projectId/screening-records',
  authMiddleware,
  getProjectScreeningRecords
);

/**
 * @route   GET /api/projects/:projectId/screening-statistics
 * @desc    Obtiene estadísticas de screening (puntajes, distribución, motivos exclusión)
 * @access  Private
 * @query   stage? (default: fulltext)
 */
router.get(
  '/projects/:projectId/screening-statistics',
  authMiddleware,
  getScreeningStatistics
);

module.exports = router;
