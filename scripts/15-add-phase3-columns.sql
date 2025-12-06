-- Agregar columnas para Phase 3 (Full-text evaluation)
-- Estas columnas almacenan el resultado final de la evaluación de texto completo

ALTER TABLE "references" 
ADD COLUMN IF NOT EXISTS screening_score INTEGER,
ADD COLUMN IF NOT EXISTS ai_decision VARCHAR(20),
ADD COLUMN IF NOT EXISTS exclusion_reason TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN "references".screening_score IS 'Puntaje total de la evaluación de texto completo (0-12 puntos)';
COMMENT ON COLUMN "references".ai_decision IS 'Decisión final: include o exclude';
COMMENT ON COLUMN "references".exclusion_reason IS 'Razón principal de exclusión en Phase 3';

-- Actualizar el CHECK constraint para incluir los nuevos estados de Phase 3
-- Primero eliminamos el constraint existente
ALTER TABLE "references" DROP CONSTRAINT IF EXISTS references_screening_status_check;

-- Verificar y corregir valores inválidos antes de agregar el nuevo constraint
-- (Si hay valores fuera de los permitidos, los convertimos a 'pending')
UPDATE "references"
SET screening_status = 'pending'
WHERE screening_status NOT IN (
  'pending',
  'included',
  'excluded',
  'duplicate',
  'maybe',
  'Pendiente', 
  'En Revisión', 
  'Incluida', 
  'Excluida', 
  'Duplicada',
  'fulltext_included',
  'fulltext_excluded',
  'phase1_included',
  'phase1_excluded',
  'phase2_included',
  'phase2_excluded'
);

-- Ahora agregamos el nuevo constraint que acepta TODOS los valores posibles
ALTER TABLE "references" 
ADD CONSTRAINT references_screening_status_check 
CHECK (screening_status IN (
  -- Valores en inglés (usados por el código)
  'pending',
  'included',
  'excluded',
  'duplicate',
  'maybe',
  -- Valores en español (usados en algunos lugares)
  'Pendiente', 
  'En Revisión', 
  'Incluida', 
  'Excluida', 
  'Duplicada',
  -- Valores de Phase 3
  'fulltext_included',
  'fulltext_excluded',
  -- Valores de Phase 1 y 2
  'phase1_included',
  'phase1_excluded',
  'phase2_included',
  'phase2_excluded'
));

-- Crear índices para mejorar el rendimiento de las consultas de Phase 3
CREATE INDEX IF NOT EXISTS idx_references_screening_score ON "references"(screening_score);
CREATE INDEX IF NOT EXISTS idx_references_ai_decision ON "references"(ai_decision);
