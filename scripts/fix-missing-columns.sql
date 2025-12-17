-- =====================================================
-- Script para agregar columnas faltantes
-- =====================================================
-- Problema: El código espera columnas que no existen en la BD
-- =====================================================

-- 1. Agregar columna deadline a projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;

-- 2. Modificar tabla api_usage para coincidir con el código
-- Primero eliminar las columnas que no se usan
ALTER TABLE api_usage 
DROP COLUMN IF EXISTS tokens_used,
DROP COLUMN IF EXISTS cost_usd,
DROP COLUMN IF EXISTS project_id;

-- Agregar las columnas que el código espera
ALTER TABLE api_usage 
ADD COLUMN IF NOT EXISTS tokens_prompt INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tokens_completion INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tokens_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS request_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 3. Verificar que todo esté correcto
-- Ver estructura de projects
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- Ver estructura de api_usage
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'api_usage'
ORDER BY ordinal_position;

-- =====================================================
-- FIN
-- =====================================================
