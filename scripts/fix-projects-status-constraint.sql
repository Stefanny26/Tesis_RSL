-- =====================================================
-- Script para corregir el constraint de status del proyecto
-- =====================================================
-- Problema: El constraint projects_status_check tenía valores antiguos
-- que no coincidían con los definidos en el código
-- Solución: Recrear el constraint con los valores correctos
-- =====================================================

-- 1. Eliminar constraint antiguo si existe
ALTER TABLE projects
DROP CONSTRAINT IF EXISTS projects_status_check;

-- 2. Crear el constraint correcto con los valores válidos
-- Valores válidos según el modelo: 'draft', 'in-progress', 'screening', 'analysis', 'completed'
ALTER TABLE projects
ADD CONSTRAINT projects_status_check
CHECK (status IN ('draft', 'in-progress', 'screening', 'analysis', 'completed'));

-- 3. Actualizar proyectos existentes con status inválidos a 'draft'
UPDATE projects
SET status = 'draft'
WHERE status NOT IN ('draft', 'in-progress', 'screening', 'analysis', 'completed');

-- 4. Verificar que todo esté correcto
SELECT 
  status, 
  COUNT(*) as count
FROM projects
GROUP BY status
ORDER BY status;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Para verificar que el constraint se creó correctamente:
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'projects'
  AND con.contype = 'c'
  AND con.conname = 'projects_status_check';
