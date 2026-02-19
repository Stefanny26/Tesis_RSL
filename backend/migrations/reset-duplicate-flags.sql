-- Migration: Reset incorrect duplicate flags
-- Purpose: Unmarcar todas las referencias marcadas incorrectamente como duplicadas
-- Fecha: 2024
-- 
-- Este script desmarca todas las referencias que fueron marcadas como is_duplicate = true
-- pero que en realidad no son duplicados.
-- 
-- IMPORTANTE: Ejecutar este script solo si has verificado que las referencias
-- marcadas como duplicadas no lo son realmente.

BEGIN;

-- 1. Contar cuántas referencias están marcadas como duplicadas ANTES de la corrección
SELECT 
    COUNT(*) as referencias_marcadas_como_duplicadas,
    COUNT(DISTINCT project_id) as proyectos_afectados
FROM "references" 
WHERE is_duplicate = true;

-- 2. Mostrar referencias que serán desmarcadas (para verificación)
SELECT 
    id,
    project_id,
    title,
    source,
    is_duplicate
FROM "references" 
WHERE is_duplicate = true
LIMIT 10;

-- 3. Desmarcar todas las referencias como NO duplicadas
UPDATE "references"
SET is_duplicate = false
WHERE is_duplicate = true;

-- 4. Verificar que se hayan actualizado correctamente
SELECT 
    COUNT(*) as referencias_aun_marcadas_como_duplicadas
FROM "references" 
WHERE is_duplicate = true;

-- 5. Mostrar estadísticas finales por proyecto
SELECT 
    project_id,
    COUNT(*) as total_referencias,
    COUNT(*) FILTER (WHERE is_duplicate = true) as duplicadas,
    COUNT(*) FILTER (WHERE is_duplicate = false) as no_duplicadas
FROM "references"
GROUP BY project_id
ORDER BY project_id;

COMMIT;

-- Para revertir esta migración (RE-marcar referencias como duplicadas):
-- ROLLBACK;
-- Nota: No se recomienda revertir a menos que sea absolutamente necesario
