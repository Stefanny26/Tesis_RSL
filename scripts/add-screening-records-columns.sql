-- ============================================================
-- MIGRACIÓN: Agregar columnas faltantes en screening_records
-- ============================================================
-- Esta migración agrega las columnas necesarias para el sistema
-- de scoring y screening avanzado

-- Agregar columnas de scoring
ALTER TABLE screening_records 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE screening_records 
ADD COLUMN IF NOT EXISTS stage VARCHAR(50);

ALTER TABLE screening_records 
ADD COLUMN IF NOT EXISTS scores JSONB DEFAULT '{}'::jsonb;

ALTER TABLE screening_records 
ADD COLUMN IF NOT EXISTS total_score DECIMAL(5,2);

ALTER TABLE screening_records 
ADD COLUMN IF NOT EXISTS threshold DECIMAL(5,2);

ALTER TABLE screening_records 
ADD COLUMN IF NOT EXISTS exclusion_reasons JSONB DEFAULT '[]'::jsonb;

ALTER TABLE screening_records 
ADD COLUMN IF NOT EXISTS comment TEXT;

ALTER TABLE screening_records 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_screening_records_stage ON screening_records(stage);
CREATE INDEX IF NOT EXISTS idx_screening_records_total_score ON screening_records(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_screening_records_user ON screening_records(user_id);

-- Comentarios para documentación
COMMENT ON COLUMN screening_records.user_id IS 'Usuario que realizó el screening';
COMMENT ON COLUMN screening_records.stage IS 'Etapa del screening (title_abstract, full_text)';
COMMENT ON COLUMN screening_records.scores IS 'Desglose de scores por criterio';
COMMENT ON COLUMN screening_records.total_score IS 'Score total calculado';
COMMENT ON COLUMN screening_records.threshold IS 'Umbral de decisión aplicado';
COMMENT ON COLUMN screening_records.exclusion_reasons IS 'Razones de exclusión si aplica';
COMMENT ON COLUMN screening_records.comment IS 'Comentarios del revisor';
COMMENT ON COLUMN screening_records.reviewed_at IS 'Fecha de revisión';

-- Verificar columnas creadas
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'screening_records' 
ORDER BY ordinal_position;
