-- Tabla para tracking de uso de APIs (DeepSeek, ChatGPT, Gemini, Embeddings)
CREATE TABLE IF NOT EXISTS api_usage (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('deepseek', 'chatgpt', 'gemini', 'embeddings')),
  endpoint VARCHAR(100), -- ej: 'chat.completions', 'embeddings', 'generateContent'
  model VARCHAR(100), -- ej: 'deepseek-chat', 'gpt-4o-mini', 'gemini-2.0-flash-exp'
  tokens_prompt INTEGER DEFAULT 0,
  tokens_completion INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0,
  request_count INTEGER DEFAULT 1,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_provider ON api_usage(provider);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_provider ON api_usage(user_id, provider);

-- Comentarios para documentación
COMMENT ON TABLE api_usage IS 'Registro de uso de APIs externas (DeepSeek, ChatGPT, Gemini) y locales (Embeddings)';
COMMENT ON COLUMN api_usage.provider IS 'Proveedor de la API: deepseek, chatgpt, gemini, embeddings';
COMMENT ON COLUMN api_usage.endpoint IS 'Endpoint específico llamado';
COMMENT ON COLUMN api_usage.model IS 'Modelo específico usado';
COMMENT ON COLUMN api_usage.tokens_prompt IS 'Tokens usados en el prompt/input';
COMMENT ON COLUMN api_usage.tokens_completion IS 'Tokens usados en la respuesta/output';
COMMENT ON COLUMN api_usage.tokens_total IS 'Total de tokens usados en la request';
