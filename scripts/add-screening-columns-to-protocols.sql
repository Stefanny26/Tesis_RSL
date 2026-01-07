-- ================================================
-- ADD SCREENING COLUMNS TO PROTOCOLS TABLE
-- ================================================
-- Este script agrega las columnas necesarias para guardar
-- los resultados del cribado y desbloquear la Fase 2 (PRISMA)
-- ================================================

-- Agregar columna screening_results si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'protocols' 
        AND column_name = 'screening_results'
    ) THEN
        ALTER TABLE protocols 
        ADD COLUMN screening_results JSONB DEFAULT NULL;
        
        COMMENT ON COLUMN protocols.screening_results IS 
        'Resultados completos del cribado híbrido (Embeddings + ChatGPT) en formato JSON';
        
        RAISE NOTICE 'Columna screening_results agregada exitosamente';
    ELSE
        RAISE NOTICE 'Columna screening_results ya existe';
    END IF;
END $$;

-- Agregar columna fase2_unlocked si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'protocols' 
        AND column_name = 'fase2_unlocked'
    ) THEN
        ALTER TABLE protocols 
        ADD COLUMN fase2_unlocked BOOLEAN DEFAULT FALSE;
        
        COMMENT ON COLUMN protocols.fase2_unlocked IS 
        'Indica si la Fase 2 (PRISMA) ha sido desbloqueada después de completar el cribado';
        
        RAISE NOTICE 'Columna fase2_unlocked agregada exitosamente';
    ELSE
        RAISE NOTICE 'Columna fase2_unlocked ya existe';
    END IF;
END $$;

-- ================================================
-- VERIFICACIÓN
-- ================================================
-- Verificar que las columnas existan
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    col_description(table_name::regclass, ordinal_position) as description
FROM information_schema.columns
WHERE table_name = 'protocols'
  AND column_name IN ('screening_results', 'fase2_unlocked')
ORDER BY ordinal_position;

-- Mostrar resumen de protocolos
SELECT 
    COUNT(*) as total_protocols,
    COUNT(screening_results) as with_screening_results,
    COUNT(CASE WHEN fase2_unlocked = true THEN 1 END) as fase2_unlocked_count
FROM protocols;
