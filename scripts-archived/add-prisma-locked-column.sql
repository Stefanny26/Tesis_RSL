-- =====================================================
-- MIGRACIÓN: Agregar columnas prisma_locked y prisma_completed_at
-- Fecha: 2026-01-07
-- Base de datos: Render Production
-- =====================================================
-- IMPORTANTE: Ejecutar este script en la base de datos de producción de Render
-- =====================================================

-- 1. Agregar columna prisma_locked
ALTER TABLE protocols
ADD COLUMN IF NOT EXISTS prisma_locked BOOLEAN DEFAULT FALSE;

-- 2. Agregar columna prisma_completed_at
ALTER TABLE protocols
ADD COLUMN IF NOT EXISTS prisma_completed_at TIMESTAMP WITH TIME ZONE;

-- 3. Verificar que las columnas se crearon correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'protocols'
AND column_name IN ('prisma_locked', 'prisma_completed_at')
ORDER BY column_name;

-- Resultado esperado:
-- column_name          | data_type | is_nullable | column_default
-- ---------------------+-----------+-------------+---------------
-- prisma_completed_at  | timestamp | YES         | NULL
-- prisma_locked        | boolean   | YES         | false
