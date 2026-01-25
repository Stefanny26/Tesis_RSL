const ApiUsageRepository = require('../../infrastructure/repositories/api-usage.repository');

/**
 * Caso de uso para obtener estadísticas de uso de APIs de IA
 */
class GetApiUsageStatsUseCase {
  constructor() {
    this.apiUsageRepository = new ApiUsageRepository();
  }

  async execute(userId) {
    try {
      console.log(`📊 Obteniendo estadísticas de uso para usuario: ${userId}`);
      
      // Obtener uso de las últimas 24 horas
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);

      const usage = await this.apiUsageRepository.getUsageByDateRange(
        userId,
        last24Hours,
        new Date()
      );

      console.log(`📊 Registros encontrados en las últimas 24h: ${usage.length}`);

      // Límites de las APIs
      const limits = {
        chatgpt: {
          dailyRequestLimit: 500,
          dailyTokenLimit: 200000,
          model: 'GPT-4o-mini'
        },
        gemini: {
          dailyRequestLimit: 1500,
          dailyTokenLimit: 1000000,
          model: 'gemini-2.0-flash-exp'
        },
        embeddings: {
          model: 'all-MiniLM-L6-v2'
        }
      };

      // Calcular uso por proveedor
      const chatgptUsage = usage.filter(u => u.provider === 'chatgpt');
      const geminiUsage = usage.filter(u => u.provider === 'gemini');
      const embeddingsUsage = usage.filter(u => u.provider === 'embeddings');

      const buildProviderStats = (providerUsage, providerLimits, providerName) => {
        const totalRequests = providerUsage.length;
        const successfulRequests = providerUsage.filter(u => u.success).length;
        const failedRequests = totalRequests - successfulRequests;
        const totalTokens = providerUsage.reduce((sum, u) => sum + (u.tokens_total || 0), 0);
        const dailyLimit = providerLimits.dailyRequestLimit || 0;
        const remaining = dailyLimit > 0 ? Math.max(0, dailyLimit - totalRequests) : 0;
        const percentUsed = dailyLimit > 0 ? Math.min(100, (totalRequests / dailyLimit) * 100) : 0;

        return {
          provider: providerName,
          model: providerLimits.model,
          dailyRequestLimit: dailyLimit,
          dailyTokenLimit: providerLimits.dailyTokenLimit || 0,
          status: percentUsed >= 90 ? 'Crítico' : percentUsed >= 70 ? 'Advertencia' : 'Óptimo',
          usage: {
            totalRequests,
            successfulRequests,
            failedRequests,
            totalTokens,
            recentRequests24h: totalRequests
          },
          remaining: {
            dailyRequests: remaining,
            dailyTokens: providerLimits.dailyTokenLimit ? Math.max(0, providerLimits.dailyTokenLimit - totalTokens) : 0,
            percentUsed: Math.round(percentUsed)
          },
          lastUsed: providerUsage.length > 0 ? providerUsage[providerUsage.length - 1].created_at : null
        };
      };

      const summary = {
        chatgpt: buildProviderStats(chatgptUsage, limits.chatgpt, 'ChatGPT'),
        gemini: buildProviderStats(geminiUsage, limits.gemini, 'Gemini'),
        embeddings: {
          provider: 'Embeddings',
          model: limits.embeddings.model,
          dailyRequestLimit: 0,
          dailyTokenLimit: 0,
          status: 'Ilimitado',
          usage: {
            totalRequests: embeddingsUsage.length,
            successfulRequests: embeddingsUsage.filter(u => u.success).length,
            failedRequests: embeddingsUsage.filter(u => !u.success).length,
            totalTokens: 0,
            recentRequests24h: embeddingsUsage.length
          },
          remaining: {
            dailyRequests: 0,
            dailyTokens: 0,
            percentUsed: 0
          },
          lastUsed: embeddingsUsage.length > 0 ? embeddingsUsage[embeddingsUsage.length - 1].created_at : null
        }
      };

      return { summary };
    } catch (error) {
      console.error('Error al obtener estadísticas de API:', error);
      throw error;
    }
  }
}

module.exports = GetApiUsageStatsUseCase;



