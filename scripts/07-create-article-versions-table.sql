-- Tabla de versiones de artículos
CREATE TABLE IF NOT EXISTS article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  
  -- Contenido del artículo por secciones
  title TEXT,
  abstract TEXT,
  introduction TEXT,
  methods TEXT,
  results TEXT,
  discussion TEXT,
  conclusions TEXT,
  references_section TEXT,
  
  -- Metadatos de versión
  description TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  word_count INTEGER DEFAULT 0,
  
  -- Generación con IA
  ai_generated_sections JSONB DEFAULT '[]'::jsonb,
  
  -- Autoría
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, version_number)
);

-- Índices
CREATE INDEX idx_article_versions_project ON article_versions(project_id);
CREATE INDEX idx_article_versions_current ON article_versions(is_current);
CREATE INDEX idx_article_versions_created_at ON article_versions(created_at DESC);

-- RLS Policies
ALTER TABLE article_versions ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver versiones de artículos de sus proyectos
CREATE POLICY "Users can view project article versions"
  ON article_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = article_versions.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Los usuarios pueden gestionar versiones de artículos de sus proyectos
CREATE POLICY "Users can manage project article versions"
  ON article_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = article_versions.project_id 
      AND projects.owner_id = auth.uid()
    )
  );
