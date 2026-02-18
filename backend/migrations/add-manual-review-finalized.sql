-- Agregar columna para rastrear si la revisión manual fue explícitamente finalizada por el usuario

ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS manual_review_finalized BOOLEAN DEFAULT FALSE;

-- Comentario explicativo
COMMENT ON COLUMN protocols.manual_review_finalized IS 'Indica si el usuario completó y finalizó explícitamente la revisión manual de full-text (para evitar bloqueo prematuro)';
