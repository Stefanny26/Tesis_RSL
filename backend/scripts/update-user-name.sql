-- Script para actualizar el nombre del usuario Stefanny Hernández
-- Base de datos: thesis_rsl
-- NOTA: Verifica primero si tu columna se llama 'name' o 'full_name'

-- Si tu columna se llama 'name' (según schema original):
UPDATE users 
SET name = 'Stefanny Hernández'
WHERE email = 'smhernandez2@espe.edu.ec';

-- Si tu columna se llama 'full_name' (descomenta esta línea):
-- UPDATE users 
-- SET full_name = 'Stefanny Hernández'
-- WHERE email = 'smhernandez2@espe.edu.ec';

-- Verificar el cambio (ajusta el nombre de columna según tu esquema)
SELECT id, email, name, avatar_url, created_at 
FROM users 
WHERE email = 'smhernandez2@espe.edu.ec';
