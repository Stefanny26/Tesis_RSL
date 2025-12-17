-- =====================================================
-- Script completo para arreglar columnas en producción
-- =====================================================
-- Fecha: 2025-12-17
-- Descripción: Agrega/renombra columnas faltantes en references y protocols
-- =====================================================

-- 1. TABLA REFERENCES - Agregar columna journal
ALTER TABLE "references" 
ADD COLUMN IF NOT EXISTS journal VARCHAR(500);

-- 2. TABLA REFERENCES - Renombrar status a screening_status (si es necesario)
-- Primero verificar si existe screening_status, si no, renombrar status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='references' AND column_name='screening_status') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='references' AND column_name='status') THEN
            ALTER TABLE "references" RENAME COLUMN status TO screening_status;
        ELSE
            ALTER TABLE "references" ADD COLUMN screening_status VARCHAR(50) DEFAULT 'pending';
        END IF;
    END IF;
END $$;

-- 3. TABLA REFERENCES - Agregar created_at si no existe (alias de imported_at)
ALTER TABLE "references" 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Si imported_at tiene datos y created_at no, copiar
UPDATE "references" SET created_at = imported_at WHERE created_at IS NULL AND imported_at IS NOT NULL;

-- 4. TABLA PROTOCOLS - Agregar screening_results
ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS screening_results JSONB DEFAULT '{}'::jsonb;

-- 5. Crear índices
CREATE INDEX IF NOT EXISTS idx_references_journal ON "references"(journal);
CREATE INDEX IF NOT EXISTS idx_references_screening_status ON "references"(screening_status);
CREATE INDEX IF NOT EXISTS idx_references_created_at ON "references"(created_at);

-- 6. Comentarios
COMMENT ON COLUMN "references".journal IS 'Nombre de la revista, conferencia o medio de publicación';
COMMENT ON COLUMN "references".screening_status IS 'Estado del cribado: pending, included, excluded, duplicate, maybe';
COMMENT ON COLUMN "references".created_at IS 'Fecha de creación (alias de imported_at para compatibilidad)';
COMMENT ON COLUMN protocols.screening_results IS 'Resultados del cribado híbrido (embeddings + LLM)';

-- Verificar cambios
SELECT 'references' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'references' 
AND column_name IN ('journal', 'screening_status', 'created_at', 'status')
UNION ALL
SELECT 'protocols' as tabla, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'protocols' 
AND column_name = 'screening_results';
