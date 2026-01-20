-- ============================================================
-- MIGRACIÓN PARA PRODUCCIÓN: Campos de Screening
-- ============================================================
-- Agregar todos los campos necesarios para el sistema de cribado
-- Ejecutar con: psql -U usuario -d nombre_db -f init-production-screening-fields.sql

-- 1. Campo para desbloquear Fase 2 (Revisión Manual)
ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS fase2_unlocked BOOLEAN DEFAULT FALSE;

-- 2. Referencias seleccionadas para revisión de texto completo
ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS selected_for_full_text JSONB DEFAULT '[]'::jsonb;

-- 3. Indica si el screening ha sido finalizado
ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS screening_finalized BOOLEAN DEFAULT FALSE;

-- 4. Indica si PRISMA está desbloqueado
ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS prisma_unlocked BOOLEAN DEFAULT FALSE;

-- Comentarios para documentación
COMMENT ON COLUMN protocols.fase2_unlocked IS 'Indica si la Fase 2 (Revisión Manual) está desbloqueada después de completar la clasificación IA';
COMMENT ON COLUMN protocols.selected_for_full_text IS 'Array de IDs de referencias seleccionadas para revisión de texto completo';
COMMENT ON COLUMN protocols.screening_finalized IS 'Indica si el proceso de screening ha sido finalizado y bloqueado';
COMMENT ON COLUMN protocols.prisma_unlocked IS 'Indica si la fase PRISMA ha sido desbloqueada';

-- Verificar que se crearon correctamente
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'protocols' 
    AND column_name IN (
        'fase2_unlocked', 
        'selected_for_full_text', 
        'screening_finalized', 
        'prisma_unlocked'
    )
ORDER BY column_name;
