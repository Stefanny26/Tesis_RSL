-- Migración: Agregar 'deepseek' como proveedor válido en api_usage
-- Fecha: 2025-12-01
-- Descripción: Actualiza la restricción CHECK para permitir 'deepseek' como proveedor de IA

-- Eliminar la restricción antigua
ALTER TABLE api_usage DROP CONSTRAINT IF EXISTS api_usage_provider_check;

-- Agregar la nueva restricción con 'deepseek' incluido
ALTER TABLE api_usage 
  ADD CONSTRAINT api_usage_provider_check 
  CHECK (provider IN ('deepseek', 'chatgpt', 'gemini', 'embeddings'));

-- Actualizar el comentario de la columna
COMMENT ON COLUMN api_usage.provider IS 'Proveedor de la API: deepseek, chatgpt, gemini, embeddings';

-- Verificar que la migración fue exitosa
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'api_usage_provider_check';
