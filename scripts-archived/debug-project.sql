-- Script para verificar el estado del proyecto y diagnosticar errores

-- 1. Ver referencias (usando comillas porque references es palabra reservada)
SELECT COUNT(*) as total_referencias 
FROM "references" 
WHERE project_id = 'ae0103da-0072-458f-90e6-d0aeac1f51cc';

-- 2. Ver las primeras referencias si existen
SELECT id, title, status, imported_at
FROM "references"
WHERE project_id = 'ae0103da-0072-458f-90e6-d0aeac1f51cc'
LIMIT 5;

-- 3. Verificar que la tabla protocols tiene todas las columnas necesarias
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'protocols'
ORDER BY ordinal_position;

-- 4. Crear un protocolo vacío para el proyecto si no existe
INSERT INTO protocols (project_id)
VALUES ('ae0103da-0072-458f-90e6-d0aeac1f51cc')
ON CONFLICT (project_id) DO NOTHING
RETURNING *;

-- 5. Verificar que se creó
SELECT * FROM protocols WHERE project_id = 'ae0103da-0072-458f-90e6-d0aeac1f51cc';
