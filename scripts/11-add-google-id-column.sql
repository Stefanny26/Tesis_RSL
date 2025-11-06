-- Agregar columna google_id a la tabla users
-- Esta columna almacena el ID único de Google para autenticación OAuth

-- Agregar la columna si no existe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Crear índice para búsquedas rápidas por google_id
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Comentario para documentación
COMMENT ON COLUMN users.google_id IS 'ID único de Google OAuth 2.0 para el usuario';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'google_id';
