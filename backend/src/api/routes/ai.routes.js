const express = require('express');
const router = express.Router();
const { 
  generateProtocolAnalysis,
  generateTitle,
  screenReference,
  screenReferencesBatch,
  refineSearchString,
  generateTitles,
  generateSearchStrategies,
  screenReferenceEmbeddings,
  screenReferencesBatchEmbeddings,
  generateRankingEmbeddings,
  analyzeSimilarityDistribution,
  generateProtocolTerms,
  generateInclusionExclusionCriteria,
  runProjectScreeningEmbeddings,
  runProjectScreeningLLM,
  analyzeScreeningResults,
  generateSearchQueries,
  scopusCount,
  scopusSearch,
  scopusValidate,
  getSupportedDatabases,
  scopusFetch,
  getDatabasesByResearchArea,
  detectArea,
  googleScholarCount
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

/**
 * @route   POST /api/ai/generate-titles
 * @desc    Generar 5 opciones de títulos con validación Cochrane
 * @access  Private (requiere JWT)
 */
router.post(
  '/generate-titles',
  authMiddleware,
  generateTitles
);

/**
 * @route   POST /api/ai/generate-search-strategies
 * @desc    Generar estrategias de búsqueda específicas por base de datos
 * @access  Private (requiere JWT)
 */
router.post(
  '/generate-search-strategies',
  authMiddleware,
  generateSearchStrategies
);

/**
 * @route   POST /api/ai/screen-reference-embeddings
 * @desc    Analizar una referencia individual con embeddings (similitud de coseno)
 * @access  Private (requiere JWT)
 */
router.post(
  '/screen-reference-embeddings',
  authMiddleware,
  screenReferenceEmbeddings
);

/**
 * @route   POST /api/ai/screen-references-batch-embeddings
 * @desc    Analizar múltiples referencias en lote con embeddings
 * @access  Private (requiere JWT)
 */
router.post(
  '/screen-references-batch-embeddings',
  authMiddleware,
  screenReferencesBatchEmbeddings
);

/**
 * @route   POST /api/ai/ranking-embeddings
 * @desc    Generar ranking de referencias por similitud usando embeddings
 * @access  Private (requiere JWT)
 */
router.post(
  '/ranking-embeddings',
  authMiddleware,
  generateRankingEmbeddings
);

/**
 * @route   POST /api/ai/analyze-similarity-distribution
 * @desc    Analizar distribución de similitudes y recomendar punto de corte (Elbow Analysis)
 * @access  Private (requiere JWT)
 */
router.post(
  '/analyze-similarity-distribution',
  authMiddleware,
  analyzeSimilarityDistribution
);

/**
 * @route   POST /api/ai/generate-protocol-terms
 * @desc    Generar términos del protocolo basados en el contexto del proyecto
 * @access  Private (requiere JWT)
 */
router.post(
  '/generate-protocol-terms',
  authMiddleware,
  generateProtocolTerms
);

/**
 * @route   POST /api/ai/generate-inclusion-exclusion-criteria
 * @desc    Generar criterios de inclusión/exclusión basados en términos del protocolo confirmados
 * @access  Private (requiere JWT)
 */
router.post(
  '/generate-inclusion-exclusion-criteria',
  authMiddleware,
  generateInclusionExclusionCriteria
);

/**
 * @route   POST /api/ai/run-project-screening-embeddings
 * @desc    Ejecutar cribado completo del proyecto con embeddings
 * @access  Private (requiere JWT)
 */
router.post(
  '/run-project-screening-embeddings',
  authMiddleware,
  runProjectScreeningEmbeddings
);

/**
 * @route   POST /api/ai/run-project-screening-llm
 * @desc    Ejecutar cribado completo del proyecto con LLM (Gemini/ChatGPT)
 * @access  Private (requiere JWT)
 */
router.post(
  '/run-project-screening-llm',
  authMiddleware,
  runProjectScreeningLLM
);

/**
 * @route   GET /api/ai/analyze-screening-results/:projectId
 * @desc    Analizar resultados de screening y obtener estadísticas y recomendaciones
 * @access  Private (requiere JWT)
 */
router.get(
  '/analyze-screening-results/:projectId',
  authMiddleware,
  analyzeScreeningResults
);

/**
 * @route   POST /api/ai/generate-search-queries
 * @desc    Generar cadenas de búsqueda optimizadas por base de datos
 * @access  Private (requiere JWT)
 */
router.post(
  '/generate-search-queries',
  authMiddleware,
  generateSearchQueries
);

/**
 * @route   POST /api/ai/scopus-count
 * @desc    Contar resultados en Scopus usando API
 * @access  Private (requiere JWT)
 */
router.post(
  '/scopus-count',
  authMiddleware,
  scopusCount
);

/**
 * @route   POST /api/ai/scopus-search
 * @desc    Buscar artículos en Scopus con paginación
 * @access  Private (requiere JWT)
 */
router.post(
  '/scopus-search',
  authMiddleware,
  scopusSearch
);

/**
 * @route   GET /api/ai/scopus-validate
 * @desc    Validar API Key de Scopus (desde .env)
 * @access  Private (requiere JWT)
 */
router.get(
  '/scopus-validate',
  authMiddleware,
  scopusValidate
);

/**
 * @route   GET /api/ai/supported-databases
 * @desc    Obtener lista de bases de datos soportadas
 * @access  Private (requiere JWT)
 */
router.get(
  '/supported-databases',
  authMiddleware,
  getSupportedDatabases
);

/**
 * @route   POST /api/ai/scopus-fetch
 * @desc    Buscar artículos en Scopus y guardarlos automáticamente en BD del proyecto
 * @access  Private (requiere JWT)
 */
router.post(
  '/scopus-fetch',
  authMiddleware,
  scopusFetch
);

/**
 * @route   GET /api/ai/databases-by-area?area=ingenieria-tecnologia
 * @desc    Obtener bases de datos filtradas por área de investigación
 * @access  Private (requiere JWT)
 */
router.get(
  '/databases-by-area',
  authMiddleware,
  getDatabasesByResearchArea
);

/**
 * @route   POST /api/ai/detect-research-area
 * @desc    Detectar automáticamente el área de investigación basado en descripción
 * @access  Private (requiere JWT)
 */
router.post(
  '/detect-research-area',
  authMiddleware,
  detectArea
);

/**
 * @route   POST /api/ai/google-scholar-count
 * @desc    Contar artículos en Google Scholar
 * @access  Private (requiere JWT)
 */
router.post(
  '/google-scholar-count',
  // authMiddleware, // Si quieres proteger la ruta
  googleScholarCount
);

module.exports = router;
