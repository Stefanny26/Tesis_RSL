-- =====================================================
-- MIGRACIÓN: Agregar columnas faltantes a prisma_items
-- Fecha: 2026-01-07
-- Base de datos: Render Production
-- =====================================================
-- IMPORTANTE: Ejecutar este script en la base de datos de producción de Render
-- =====================================================

-- 1. Agregar columna automated_content (contenido generado por IA preservado)
ALTER TABLE prisma_items
ADD COLUMN IF NOT EXISTS automated_content TEXT;

-- 2. Agregar columna last_human_edit (fecha de última edición manual)
ALTER TABLE prisma_items
ADD COLUMN IF NOT EXISTS last_human_edit TIMESTAMP WITH TIME ZONE;

-- 3. Agregar comentarios explicativos
COMMENT ON COLUMN prisma_items.automated_content IS 
  'Contenido original generado automáticamente por IA, preservado para referencia';

COMMENT ON COLUMN prisma_items.data_source IS 
  'Fuente de donde se obtuvo el dato (ej: Protocolo: Título Propuesto)';

COMMENT ON COLUMN prisma_items.content_type IS 
  'Tipo de contenido: automated (100% IA), hybrid (IA + edición humana), manual (100% humano), pending (sin completar)';

-- 4. Verificar que las columnas se crearon correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'prisma_items'
AND column_name IN ('automated_content', 'last_human_edit', 'content_type', 'data_source')
ORDER BY column_name;

-- Resultado esperado:
-- column_name        | data_type | is_nullable | column_default
-- -------------------+-----------+-------------+---------------
-- automated_content  | text      | YES         | NULL
-- content_type       | varchar   | YES         | 'manual'
-- data_source        | text      | YES         | NULL
-- last_human_edit    | timestamp | YES         | NULL
