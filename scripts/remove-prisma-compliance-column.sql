-- ========================================================
-- MIGRACIÓN: Eliminar columna prisma_compliance de tabla protocols
-- ========================================================
-- RAZÓN: Campo JSONB redundante y obsoleto. Ahora se usa tabla prisma_items
-- IMPACTO: Mejora de arquitectura - centraliza datos PRISMA en prisma_items
-- SEGURIDAD: Antes de ejecutar, verificar que todos los ítems estén migrados
-- ========================================================

-- PASO 1: Verificar que todos los proyectos tienen ítems en prisma_items
SELECT 
    p.id AS project_id,
    p.title AS project_title,
    COUNT(pi.id) AS items_count,
    CASE 
        WHEN COUNT(pi.id) >= 27 THEN '✅ OK' 
        ELSE '⚠️  FALTAN ITEMS'
    END AS status
FROM projects p
LEFT JOIN prisma_items pi ON pi.project_id = p.id
GROUP BY p.id, p.title
ORDER BY items_count ASC;

-- PASO 2: Verificar si la columna existe antes de eliminarla
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'protocols' 
        AND column_name = 'prisma_compliance'
    ) THEN
        RAISE NOTICE '📋 Columna prisma_compliance existe - será eliminada';
    ELSE
        RAISE NOTICE '✅ Columna prisma_compliance ya fue eliminada';
    END IF;
END $$;

-- PASO 3: Backup de datos antes de eliminar (opcional)
-- Descomentar si quieres guardar un respaldo
-- CREATE TABLE IF NOT EXISTS protocols_prisma_compliance_backup AS
-- SELECT project_id, prisma_compliance, updated_at
-- FROM protocols
-- WHERE prisma_compliance IS NOT NULL AND prisma_compliance::text != '[]';

-- PASO 4: Eliminar la columna prisma_compliance
ALTER TABLE protocols 
DROP COLUMN IF EXISTS prisma_compliance;

-- PASO 5: Verificar que la columna fue eliminada
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'protocols' 
  AND column_name = 'prisma_compliance';

-- Si no retorna filas, la columna fue eliminada exitosamente ✅

-- PASO 6: Verificar integridad de la tabla protocols
SELECT 
    COUNT(*) AS total_protocols,
    COUNT(DISTINCT project_id) AS unique_projects
FROM protocols;

-- ========================================================
-- RESULTADO ESPERADO
-- ========================================================
-- ✅ Todos los proyectos tienen >= 27 ítems en prisma_items
-- ✅ Columna prisma_compliance eliminada de protocols
-- ✅ No hay errores en consultas SELECT a protocols
-- ✅ Sistema usa exclusivamente tabla prisma_items
-- ========================================================
