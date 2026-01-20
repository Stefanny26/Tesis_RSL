-- Agregar campos para persistir estado del screening
-- Ejecutar con: psql -U usuario -d tesis_db -f migrations/add-screening-persistence-fields.sql

-- Referencias seleccionadas para revisión de texto completo
ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS selected_for_full_text JSONB DEFAULT '[]'::jsonb;

-- Indica si el screening ha sido finalizado
ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS screening_finalized BOOLEAN DEFAULT FALSE;

-- Indica si PRISMA está desbloqueado
ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS prisma_unlocked BOOLEAN DEFAULT FALSE;

-- Comentarios para documentación
COMMENT ON COLUMN protocols.selected_for_full_text IS 'Array de IDs de referencias seleccionadas para revisión de texto completo';
COMMENT ON COLUMN protocols.screening_finalized IS 'Indica si el proceso de screening ha sido finalizado y bloqueado';
COMMENT ON COLUMN protocols.prisma_unlocked IS 'Indica si la fase PRISMA ha sido desbloqueada';
