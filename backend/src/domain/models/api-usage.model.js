/**
 * Modelo de dominio: API Usage
 * Representa el uso de APIs (ChatGPT y Gemini)
 */
class ApiUsage {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id || data.userId;
    this.provider = data.provider; // 'chatgpt' o 'gemini'
    this.endpoint = data.endpoint; // ej: 'chat.completions', 'embeddings', etc.
    this.model = data.model; // ej: 'gpt-4o-mini', 'gemini-2.0-flash-exp'
    this.tokensPrompt = data.tokens_prompt || data.tokensPrompt || 0;
    this.tokensCompletion = data.tokens_completion || data.tokensCompletion || 0;
    this.tokensTotal = data.tokens_total || data.tokensTotal || 0;
    this.requestCount = data.request_count || data.requestCount || 1;
    this.success = data.success !== undefined ? data.success : true;
    this.errorMessage = data.error_message || data.errorMessage;
    this.createdAt = data.created_at || data.createdAt;
  }

  /**
   * Proveedores válidos
   */
  static get VALID_PROVIDERS() {
    return ['chatgpt', 'gemini', 'embeddings'];
  }

  /**
   * Convierte el modelo a un objeto plano para respuestas API
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      provider: this.provider,
      endpoint: this.endpoint,
      model: this.model,
      tokensPrompt: this.tokensPrompt,
      tokensCompletion: this.tokensCompletion,
      tokensTotal: this.tokensTotal,
      requestCount: this.requestCount,
      success: this.success,
      errorMessage: this.errorMessage,
      createdAt: this.createdAt
    };
  }

  /**
   * Convierte a formato snake_case para PostgreSQL
   */
  toDatabase() {
    return {
      id: this.id,
      user_id: this.userId,
      provider: this.provider,
      endpoint: this.endpoint,
      model: this.model,
      tokens_prompt: this.tokensPrompt,
      tokens_completion: this.tokensCompletion,
      tokens_total: this.tokensTotal,
      request_count: this.requestCount,
      success: this.success,
      error_message: this.errorMessage,
      created_at: this.createdAt
    };
  }

  /**
   * Valida que el uso de API tenga los campos requeridos
   */
  validate() {
    if (!this.userId) {
      throw new Error('User ID es requerido');
    }

    if (!this.provider) {
      throw new Error('Provider es requerido');
    }

    if (!ApiUsage.VALID_PROVIDERS.includes(this.provider)) {
      throw new Error(`Provider inválido. Debe ser uno de: ${ApiUsage.VALID_PROVIDERS.join(', ')}`);
    }

    return true;
  }
}

module.exports = ApiUsage;
