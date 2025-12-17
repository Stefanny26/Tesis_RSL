-- =====================================================
-- Agregar columna screening_results a la tabla protocols
-- =====================================================
-- Fecha: 2025-12-17
-- Descripción: Agrega columna screening_results para almacenar
--              los resultados del cribado híbrido (embeddings + LLM)
-- =====================================================

-- Agregar columna screening_results si no existe
ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS screening_results JSONB DEFAULT '{}'::jsonb;

-- Comentario descriptivo
COMMENT ON COLUMN protocols.screening_results IS 'Resultados del cribado híbrido (embeddings + LLM)';
