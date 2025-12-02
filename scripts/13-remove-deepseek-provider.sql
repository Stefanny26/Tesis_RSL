-- Migración: Eliminar DeepSeek como proveedor válido
-- Solo mantener ChatGPT, Gemini y Embeddings

-- Eliminar constraint existente
ALTER TABLE api_usage DROP CONSTRAINT IF EXISTS api_usage_provider_check;

-- Agregar nuevo constraint sin DeepSeek
ALTER TABLE api_usage ADD CONSTRAINT api_usage_provider_check 
CHECK (provider IN ('chatgpt', 'gemini', 'embeddings'));

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Migración completada: DeepSeek eliminado de proveedores válidos';
  RAISE NOTICE 'Proveedores permitidos: chatgpt, gemini, embeddings';
END $$;
