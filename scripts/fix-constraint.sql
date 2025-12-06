-- Quitar constraint restrictivo y agregar uno flexible
ALTER TABLE "references" DROP CONSTRAINT IF EXISTS references_screening_status_check;

ALTER TABLE "references" 
ADD CONSTRAINT references_screening_status_check 
CHECK (screening_status IN (
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
));
