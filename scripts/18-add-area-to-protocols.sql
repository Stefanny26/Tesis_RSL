-- Agregar columna 'area' a la tabla protocols
-- Esta columna almacena el área de conocimiento del protocolo (ej: Informática, Medicina, Ingeniería)

ALTER TABLE protocols
ADD COLUMN IF NOT EXISTS area VARCHAR(200);

-- Comentario descriptivo
COMMENT ON COLUMN protocols.area IS 'Área de conocimiento del protocolo de revisión sistemática';
