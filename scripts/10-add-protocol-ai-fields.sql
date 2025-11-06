-- Agregar campos generados por IA al protocolo
-- Script de migración para agregar columnas necesarias

ALTER TABLE protocols 
  ADD COLUMN IF NOT EXISTS proposed_title TEXT,
  ADD COLUMN IF NOT EXISTS evaluation_initial JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS matrix_elements JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS refined_question TEXT,
  ADD COLUMN IF NOT EXISTS key_terms JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS temporal_range JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS prisma_compliance JSONB DEFAULT '[]'::jsonb;

-- Comentarios explicativos
COMMENT ON COLUMN protocols.proposed_title IS 'Título refinado propuesto por la IA';
COMMENT ON COLUMN protocols.evaluation_initial IS 'Evaluación inicial de viabilidad (themeClear, delimitation, viability, comment)';
COMMENT ON COLUMN protocols.matrix_elements IS 'Elementos de la matriz Es/No Es con preguntas y justificaciones';
COMMENT ON COLUMN protocols.refined_question IS 'Pregunta de investigación refinada';
COMMENT ON COLUMN protocols.key_terms IS 'Términos clave por categorías (technology, domain, studyType, themes)';
COMMENT ON COLUMN protocols.temporal_range IS 'Rango temporal de búsqueda (start, end, justification)';
COMMENT ON COLUMN protocols.prisma_compliance IS 'Lista de items PRISMA evaluados con cumplimiento';

-- Actualizar timestamp
UPDATE protocols SET updated_at = NOW();
