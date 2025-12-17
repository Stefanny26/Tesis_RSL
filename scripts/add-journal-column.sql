-- =====================================================
-- Agregar columna journal a la tabla references
-- =====================================================
-- Fecha: 2025-12-17
-- Descripción: Agrega columna journal para almacenar el nombre
--              de la revista/conferencia donde se publicó el artículo
-- =====================================================

-- Agregar columna journal si no existe
ALTER TABLE references 
ADD COLUMN IF NOT EXISTS journal VARCHAR(500);

-- Crear índice para búsquedas por journal
CREATE INDEX IF NOT EXISTS idx_references_journal ON references(journal);

-- Comentario descriptivo
COMMENT ON COLUMN references.journal IS 'Nombre de la revista, conferencia o medio de publicación';

-- Migrar datos de source a journal si es necesario (OPCIONAL)
-- UPDATE references SET journal = source WHERE journal IS NULL AND source IS NOT NULL;
