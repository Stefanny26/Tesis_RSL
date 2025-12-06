const ScreeningRecordRepository = require('../../infrastructure/repositories/screening-record.repository');
const ReferenceRepository = require('../../infrastructure/repositories/reference.repository');
const EvaluateFullTextUseCase = require('../../domain/use-cases/evaluate-fulltext.use-case');

const screeningRecordRepository = new ScreeningRecordRepository();
const referenceRepository = new ReferenceRepository();
const evaluateFullText = new EvaluateFullTextUseCase({ 
  screeningRecordRepository, 
  referenceRepository 
});

/**
 * POST /api/projects/:projectId/references/:referenceId/evaluate-fulltext
 * Evalúa el texto completo de una referencia
 */
const evaluateFullTextReference = async (req, res) => {
  try {
    const { projectId, referenceId } = req.params;
    const { scores, threshold, comment } = req.body;
    const userId = req.user.id;

    // Validar que se recibieron los scores
    if (!scores || typeof scores !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el objeto scores con los 7 criterios de evaluación'
      });
    }

    // Validar que todos los criterios están presentes
    const requiredCriteria = [
      'relevance', 'interventionPresent', 'methodValidity', 
      'dataReported', 'textAccessible', 'dateRange', 'methodQuality'
    ];

    const missingCriteria = requiredCriteria.filter(c => scores[c] === undefined);
    if (missingCriteria.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Faltan los siguientes criterios: ${missingCriteria.join(', ')}`
      });
    }

    // Ejecutar caso de uso
    const result = await evaluateFullText.execute({
      referenceId,
      projectId,
      userId,
      scores,
      threshold,
      comment
    });

    res.status(201).json(result);

  } catch (error) {
    console.error('❌ Error evaluando texto completo:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al evaluar el texto completo'
    });
  }
};

/**
 * PUT /api/projects/:projectId/references/:referenceId/evaluate-fulltext/:recordId
 * Re-evalúa el texto completo (actualiza evaluación existente)
 */
const reevaluateFullTextReference = async (req, res) => {
  try {
    const { projectId, referenceId, recordId } = req.params;
    const { scores, threshold, comment } = req.body;

    if (!scores || typeof scores !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el objeto scores con los 7 criterios de evaluación'
      });
    }

    const result = await evaluateFullText.reevaluate({
      recordId,
      referenceId,
      projectId,
      scores,
      threshold,
      comment
    });

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error re-evaluando texto completo:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al re-evaluar el texto completo'
    });
  }
};

/**
 * GET /api/projects/:projectId/references/:referenceId/evaluation-history
 * Obtiene el historial de evaluaciones de una referencia
 */
const getEvaluationHistory = async (req, res) => {
  try {
    const { referenceId } = req.params;

    const result = await evaluateFullText.getEvaluationHistory(referenceId);

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener el historial de evaluaciones'
    });
  }
};

/**
 * GET /api/projects/:projectId/references/:referenceId/latest-evaluation
 * Obtiene la última evaluación de una referencia
 */
const getLatestEvaluation = async (req, res) => {
  try {
    const { referenceId } = req.params;

    const result = await evaluateFullText.getLatestEvaluation(referenceId);

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error obteniendo última evaluación:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener la última evaluación'
    });
  }
};

/**
 * DELETE /api/projects/:projectId/references/:referenceId/evaluate-fulltext/:recordId
 * Elimina una evaluación de texto completo
 */
const deleteEvaluation = async (req, res) => {
  try {
    const { referenceId, recordId } = req.params;

    const result = await evaluateFullText.deleteEvaluation(recordId, referenceId);

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error eliminando evaluación:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al eliminar la evaluación'
    });
  }
};

/**
 * GET /api/projects/:projectId/screening-records
 * Obtiene todos los screening records de un proyecto
 */
const getProjectScreeningRecords = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { stage, decision, userId } = req.query;

    const filters = {};
    if (stage) filters.stage = stage;
    if (decision) filters.decision = decision;
    if (userId) filters.userId = userId;

    const records = await screeningRecordRepository.findByProject(projectId, filters);

    res.status(200).json({
      success: true,
      count: records.length,
      records: records.map(r => r.toJSON())
    });

  } catch (error) {
    console.error('❌ Error obteniendo screening records:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener los screening records'
    });
  }
};

/**
 * GET /api/projects/:projectId/screening-statistics
 * Obtiene estadísticas de screening del proyecto
 */
const getScreeningStatistics = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { stage = 'fulltext' } = req.query;

    // Obtener estadísticas de puntajes
    const scoreStats = await screeningRecordRepository.getScoreStatistics(projectId, stage);

    // Obtener distribución de motivos de exclusión
    const exclusionReasons = await screeningRecordRepository.getExclusionReasonsDistribution(
      projectId, 
      stage
    );

    // Contar por decisión
    const included = await screeningRecordRepository.countByProject(projectId, {
      stage,
      decision: 'include'
    });

    const excluded = await screeningRecordRepository.countByProject(projectId, {
      stage,
      decision: 'exclude'
    });

    res.status(200).json({
      success: true,
      stage,
      statistics: {
        total: Number.parseInt(scoreStats.total_records, 10),
        included,
        excluded,
        scores: {
          mean: Number.parseFloat(scoreStats.mean_score),
          median: Number.parseFloat(scoreStats.median_score),
          min: Number.parseFloat(scoreStats.min_score),
          max: Number.parseFloat(scoreStats.max_score),
          p25: Number.parseFloat(scoreStats.p25_score),
          p75: Number.parseFloat(scoreStats.p75_score),
          stdDev: Number.parseFloat(scoreStats.std_dev)
        },
        exclusionReasons
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener las estadísticas'
    });
  }
};

module.exports = {
  evaluateFullTextReference,
  reevaluateFullTextReference,
  getEvaluationHistory,
  getLatestEvaluation,
  deleteEvaluation,
  getProjectScreeningRecords,
  getScreeningStatistics
};
