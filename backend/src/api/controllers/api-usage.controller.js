const ApiUsageRepository = require('../../infrastructure/repositories/api-usage.repository');
const GetApiUsageStatsUseCase = require('../../domain/use-cases/get-api-usage-stats.use-case');

/**
 * Controlador de API Usage
 */
class ApiUsageController {
  constructor() {
    this.apiUsageRepository = new ApiUsageRepository();
  }

  /**
   * GET /api/usage/stats
   * Obtener estadísticas de uso de APIs del usuario
   */
  async getStats(req, res) {
    try {
      const getStatsUseCase = new GetApiUsageStatsUseCase();
      const stats = await getStatsUseCase.execute(req.userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas de uso:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas de uso'
      });
    }
  }

  /**
   * POST /api/usage/track
   * Registrar uso de API (llamado automáticamente desde use-cases)
   */
  async track(req, res) {
    try {
      const {
        provider,
        endpoint,
        model,
        tokensPrompt,
        tokensCompletion,
        tokensTotal,
        success,
        errorMessage
      } = req.body;

      const usage = await this.apiUsageRepository.create({
        userId: req.userId,
        provider,
        endpoint,
        model,
        tokensPrompt,
        tokensCompletion,
        tokensTotal,
        success,
        errorMessage
      });

      res.status(201).json({
        success: true,
        data: usage.toJSON()
      });
    } catch (error) {
      console.error('Error registrando uso de API:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar uso'
      });
    }
  }

  /**
   * GET /api/usage/recent
   * Obtener uso reciente (últimos N días)
   */
  async getRecent(req, res) {
    try {
      const { days = 30 } = req.query;
      const usage = await this.apiUsageRepository.getRecentUsage(
        req.userId,
        parseInt(days)
      );

      res.status(200).json({
        success: true,
        data: usage
      });
    } catch (error) {
      console.error('Error obteniendo uso reciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener uso reciente'
      });
    }
  }
}

module.exports = ApiUsageController;
