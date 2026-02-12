-- Migración: Agregar campo research_area a tabla protocols
-- Descripción: Este campo almacena el área de investigación seleccionada en el wizard
--              para poder restaurarla cuando se continúa un borrador

-- Agregar columna research_area a la tabla protocols
ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS research_area VARCHAR(100);

-- Comentario descriptivo
COMMENT ON COLUMN protocols.research_area IS 'Área de investigación seleccionada (ej: ingenieria-tecnologia, ciencias-salud)';
