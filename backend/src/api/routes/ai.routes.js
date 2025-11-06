const express = require('express');
const router = express.Router();
const { 
  generateProtocolAnalysis,
  generateTitle,
  screenReference,
  screenReferencesBatch,
  refineSearchString
} = require('../controllers/ai.controller');
const { authMiddleware } = require('../../infrastructure/middlewares/auth.middleware');

/**
 * @route   POST /api/ai/protocol-analysis
 * @desc    Generar análisis completo de protocolo con IA (PICO, Matriz Es/No Es, Cochrane, etc.)
 * @access  Private (requiere JWT)
 */
router.post(
  '/protocol-analysis',
  authMiddleware,
  generateProtocolAnalysis
);

/**
 * @route   POST /api/ai/generate-title
 * @desc    Generar título académico basado en pregunta de investigación
 * @access  Private (requiere JWT)
 */
router.post(
  '/generate-title',
  authMiddleware,
  generateTitle
);

/**
 * @route   POST /api/ai/screen-reference
 * @desc    Analizar una referencia individual con IA (inclusión/exclusión)
 * @access  Private (requiere JWT)
 */
router.post(
  '/screen-reference',
  authMiddleware,
  screenReference
);

/**
 * @route   POST /api/ai/screen-references-batch
 * @desc    Analizar múltiples referencias en lote con IA
 * @access  Private (requiere JWT)
 */
router.post(
  '/screen-references-batch',
  authMiddleware,
  screenReferencesBatch
);

/**
 * @route   POST /api/ai/refine-search-string
 * @desc    Refinar cadena de búsqueda basándose en resultados iniciales
 * @access  Private (requiere JWT)
 */
router.post(
  '/refine-search-string',
  authMiddleware,
  refineSearchString
);

module.exports = router;
