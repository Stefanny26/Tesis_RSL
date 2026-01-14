-- =====================================================
-- MIGRACIÓN: Actualizar schema para api_usage y projects
-- Fecha: 2026-01-07
-- Descripción: Agregar columnas faltantes que el código espera
-- =====================================================

-- 1. Actualizar tabla api_usage
-- =====================================================
-- El código espera columnas específicas de tokens y control de errores

-- Eliminar columnas antiguas que no se usan
ALTER TABLE api_usage DROP COLUMN IF EXISTS tokens_used;
ALTER TABLE api_usage DROP COLUMN IF EXISTS cost_usd;
ALTER TABLE api_usage DROP COLUMN IF EXISTS request_metadata;

-- Agregar columnas que el código necesita
ALTER TABLE api_usage ADD COLUMN IF NOT EXISTS tokens_prompt INTEGER DEFAULT 0;
ALTER TABLE api_usage ADD COLUMN IF NOT EXISTS tokens_completion INTEGER DEFAULT 0;
ALTER TABLE api_usage ADD COLUMN IF NOT EXISTS tokens_total INTEGER DEFAULT 0;
ALTER TABLE api_usage ADD COLUMN IF NOT EXISTS request_count INTEGER DEFAULT 1;
ALTER TABLE api_usage ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true;
ALTER TABLE api_usage ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Comentarios de las columnas
COMMENT ON COLUMN api_usage.tokens_prompt IS 'Tokens usados en el prompt (entrada)';
COMMENT ON COLUMN api_usage.tokens_completion IS 'Tokens usados en la respuesta (salida)';
COMMENT ON COLUMN api_usage.tokens_total IS 'Total de tokens usados (prompt + completion)';
COMMENT ON COLUMN api_usage.request_count IS 'Número de solicitudes realizadas';
COMMENT ON COLUMN api_usage.success IS 'Si la solicitud fue exitosa';
COMMENT ON COLUMN api_usage.error_message IS 'Mensaje de error si la solicitud falló';

-- 2. Actualizar tabla projects
-- =====================================================
-- Agregar columna deadline que el código espera

ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN projects.deadline IS 'Fecha límite opcional del proyecto';

-- 3. Actualizar tabla article_versions
-- =====================================================
-- Agregar columnas que el código espera

ALTER TABLE article_versions ADD COLUMN IF NOT EXISTS declarations TEXT;
ALTER TABLE article_versions ADD COLUMN IF NOT EXISTS change_description TEXT;

COMMENT ON COLUMN article_versions.declarations IS 'Sección de declaraciones del artículo';
COMMENT ON COLUMN article_versions.change_description IS 'Descripción de cambios en la versión';

-- 4. Actualizar tabla references
-- =====================================================
-- Agregar columna created_at que el código espera

ALTER TABLE "references" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

COMMENT ON COLUMN "references".created_at IS 'Fecha de creación del registro';

-- Si imported_at tiene valor pero created_at no, copiar el valor
UPDATE "references" SET created_at = imported_at WHERE created_at IS NULL AND imported_at IS NOT NULL;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Para verificar que las columnas se crearon correctamente:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'api_usage';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'projects';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'article_versions';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'references';
