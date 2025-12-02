const database = require('../../config/database');
const ApiUsage = require('../../domain/models/api-usage.model');

/**
 * Repositorio para operaciones de API Usage en PostgreSQL
 */
class ApiUsageRepository {
  /**
   * Registrar uso de API
   */
  async create(usageData) {
    const usage = new ApiUsage(usageData);
    usage.validate();

    const query = `
      INSERT INTO api_usage (
        user_id, provider, endpoint, model,
        tokens_prompt, tokens_completion, tokens_total,
        request_count, success, error_message
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      usage.userId,
      usage.provider,
      usage.endpoint,
      usage.model,
      usage.tokensPrompt,
      usage.tokensCompletion,
      usage.tokensTotal,
      usage.requestCount,
      usage.success,
      usage.errorMessage
    ];

    const result = await database.query(query, values);
    return new ApiUsage(result.rows[0]);
  }

  /**
   * Obtener estadísticas de uso por usuario
   */
  async getStatsByUser(userId) {
    const query = `
      SELECT 
        provider,
        COUNT(*) as total_requests,
        SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_requests,
        SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_requests,
        SUM(tokens_prompt) as total_tokens_prompt,
        SUM(tokens_completion) as total_tokens_completion,
        SUM(tokens_total) as total_tokens,
        MAX(created_at) as last_used
      FROM api_usage
      WHERE user_id = $1
      GROUP BY provider
      ORDER BY provider
    `;

    const result = await database.query(query, [userId]);
    return result.rows;
  }

  /**
   * Obtener estadísticas detalladas por modelo
   */
  async getDetailedStatsByUser(userId) {
    const query = `
      SELECT 
        provider,
        model,
        COUNT(*) as total_requests,
        SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_requests,
        SUM(tokens_total) as total_tokens,
        AVG(tokens_total) as avg_tokens_per_request,
        MAX(created_at) as last_used
      FROM api_usage
      WHERE user_id = $1
      GROUP BY provider, model
      ORDER BY provider, model
    `;

    const result = await database.query(query, [userId]);
    return result.rows;
  }

  /**
   * Obtener uso reciente (últimos 30 días)
   */
  async getRecentUsage(userId, days = 30) {
    const query = `
      SELECT 
        DATE(created_at) as date,
        provider,
        COUNT(*) as requests,
        SUM(tokens_total) as tokens
      FROM api_usage
      WHERE user_id = $1 
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at), provider
      ORDER BY date DESC, provider
    `;

    const result = await database.query(query, [userId]);
    return result.rows;
  }

  /**
   * Contar requests de un usuario en las últimas 24 horas
   */
  async countRecentRequests(userId, provider = null) {
    let query = `
      SELECT COUNT(*) as count
      FROM api_usage
      WHERE user_id = $1 
        AND created_at >= NOW() - INTERVAL '24 hours'
    `;

    const values = [userId];

    if (provider) {
      query += ` AND provider = $2`;
      values.push(provider);
    }

    const result = await database.query(query, values);
    return parseInt(result.rows[0].count);
  }

  /**
   * Obtener uso por rango de fechas
   */
  async getUsageByDateRange(userId, startDate, endDate) {
    const query = `
      SELECT 
        id,
        user_id,
        provider,
        endpoint,
        model,
        tokens_prompt,
        tokens_completion,
        tokens_total,
        request_count,
        success,
        error_message,
        created_at
      FROM api_usage
      WHERE user_id = $1 
        AND created_at >= $2
        AND created_at <= $3
      ORDER BY created_at DESC
    `;

    const result = await database.query(query, [userId, startDate, endDate]);
    return result.rows.map(row => new ApiUsage(row));
  }

  /**
   * Obtener estadísticas globales (todos los usuarios)
   */
  async getGlobalStats() {
    const query = `
      SELECT 
        provider,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) as total_requests,
        SUM(tokens_total) as total_tokens
      FROM api_usage
      GROUP BY provider
      ORDER BY provider
    `;

    const result = await database.query(query);
    return result.rows;
  }
}

module.exports = ApiUsageRepository;
