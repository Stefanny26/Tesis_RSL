# Instrucciones para Aplicar Migraciones en Render

## Problema Detectado
El backend en producción está fallando con estos errores:
- ❌ `column "tokens_prompt" of relation "api_usage" does not exist`
- ❌ `column "deadline" of relation "projects" does not exist`
- ❌ `column "change_description" of relation "article_versions" does not exist`
- ❌ `column "declarations" of relation "article_versions" does not exist`
- ❌ `column "created_at" does not exist` (en tabla references)

## Solución
Aplicar el script de migración que agrega las columnas faltantes.

## Pasos para Aplicar

### Opción 1: Usando Shell de Render (Recomendado)

1. **Ir a Render Dashboard**
   - https://dashboard.render.com
   - Selecciona tu base de datos PostgreSQL

2. **Abrir Shell**
   - Click en la pestaña "Shell" o "Connect"
   - Te dará un comando como: `psql postgresql://user:password@host/database`

3. **Conectar y Ejecutar**
   ```bash
   # Copiar el comando de conexión que Render te muestra
   psql postgresql://...
   
   # Pegar el contenido del archivo de migración
   \i scripts/fix-missing-columns-production.sql
   ```

### Opción 2: Desde tu computadora

1. **Obtener URL de Conexión**
   - En Render Dashboard → tu base de datos → "Info"
   - Copiar "External Database URL"

2. **Ejecutar Migración**
   ```bash
   # Desde la raíz del proyecto
   psql "TU_DATABASE_URL" -f scripts/fix-missing-columns-production.sql
   ```

### Opción 3: Copiar y Pegar SQL Directamente

Si prefieres, puedes copiar y pegar este SQL directamente en el Shell de Render:

```sql
-- 1. Actualizar tabla api_usage
ALTER TABLE api_usage DROP COLUMN IF EXISTS tokens_used;
ALTER TABLE api_usage DROP COLUMN IF EXISTS cost_usd;
ALTER TABLE api_usage DROP COLUMN IF EXISTS request_metadata;

ALTER TABLE api_usage ADD COLUMN IF NOT EXISTS tokens_prompt INTEGER DEFAULT 0;
ALTER TABLE api_usage ADD COLUMN IF NOT EXISTS tokens_completion INTEGER DEFAULT 0;
ALTER TABLE api_usage ADD COLUMN IF NOT EXISTS tokens_total INTEGER DEFAULT 0;
ALTER TABLE api_usage ADD COLUMN IF NOT EXISTS request_count INTEGER DEFAULT 1;
ALTER TABLE api_usage ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true;
ALTER TABLE api_usage ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 2. Actualizar tabla projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;

-- 3. Actualizar tabla article_versions
ALTER TABLE article_versions ADD COLUMN IF NOT EXISTS declarations TEXT;
ALTER TABLE article_versions ADD COLUMN IF NOT EXISTS change_description TEXT;

-- 4. Actualizar tabla references
ALTER TABLE "references" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
UPDATE "references" SET created_at = imported_at WHERE created_at IS NULL AND imported_at IS NOT NULL;
```

## Verificación

Después de aplicar la migración, verifica que las columnas existen:

```sql
-- Verificar api_usage
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'api_usage'
ORDER BY ordinal_position;

-- Verificar projects
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects'
ORDER BY ordinal_position;
```

## Resultado Esperado

Deberías ver:
- En `api_usage`: tokens_prompt, tokens_completion, tokens_total, request_count, success, error_message
- En `projects`: deadline
- En `article_versions`: declarations, change_description
- En `references`: created_at

## Siguiente Paso

Una vez aplicada la migración:
1. El backend en Render se reiniciará automáticamente (o reinícialo manualmente)
2. Los errores deberían desaparecer
3. Podrás crear proyectos sin problemas

## Notas Adicionales

- La migración también incluye la columna `declarations` en `article_versions` (ya creada anteriormente)
- Las operaciones son seguras: usan `IF NOT EXISTS` para evitar errores si ya existen
- No se pierden datos existentes
