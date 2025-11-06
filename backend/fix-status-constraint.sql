-- Script para corregir la restricción de status en la tabla projects
-- Ejecutar con: psql -U postgres -d Tesis_RSL -f fix-status-constraint.sql

-- 1. Eliminar la restricción actual
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- 2. Crear la nueva restricción con los valores correctos
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('Configuración', 'En Progreso', 'Revisión', 'Completado'));

-- 3. Verificar que se creó correctamente
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint 
WHERE conname = 'projects_status_check';
