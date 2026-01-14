-- Agregar columnas declarations y change_description a article_versions
-- Estas columnas almacenan la sección de declaraciones y descripción de cambios del artículo científico

ALTER TABLE article_versions 
ADD COLUMN IF NOT EXISTS declarations TEXT,
ADD COLUMN IF NOT EXISTS change_description TEXT;

-- Comentarios de las columnas
COMMENT ON COLUMN article_versions.declarations IS 'Sección de declaraciones del artículo (funding, conflicts, data availability, AI usage, etc.)';
COMMENT ON COLUMN article_versions.change_description IS 'Descripción de los cambios realizados en esta versión';
