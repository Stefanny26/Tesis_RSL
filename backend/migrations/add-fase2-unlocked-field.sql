-- Agregar campo para controlar el desbloqueo de Fase 2 (Revisión Manual)
-- Ejecutar con: node -e "..." en la raíz del backend

-- Indica si la Fase 2 (Revisión Manual) está desbloqueada
ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS fase2_unlocked BOOLEAN DEFAULT FALSE;

-- Comentario para documentación
COMMENT ON COLUMN protocols.fase2_unlocked IS 'Indica si la Fase 2 (Revisión Manual) está desbloqueada después de completar la clasificación IA';
