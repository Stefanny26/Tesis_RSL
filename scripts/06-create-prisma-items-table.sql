-- Tabla de ítems PRISMA completados
CREATE TABLE IF NOT EXISTS prisma_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item_number INTEGER NOT NULL,
  section VARCHAR(100) NOT NULL,
  
  -- Estado y contenido
  completed BOOLEAN DEFAULT FALSE,
  content TEXT,
  
  -- Validación con IA
  ai_validated BOOLEAN DEFAULT FALSE,
  ai_suggestions TEXT,
  ai_issues JSONB DEFAULT '[]'::jsonb,
  
  -- Metadatos
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, item_number)
);

-- Índices
CREATE INDEX idx_prisma_items_project ON prisma_items(project_id);
CREATE INDEX idx_prisma_items_completed ON prisma_items(completed);
CREATE INDEX idx_prisma_items_section ON prisma_items(section);

-- RLS Policies
ALTER TABLE prisma_items ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver ítems PRISMA de sus proyectos
CREATE POLICY "Users can view project prisma items"
  ON prisma_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = prisma_items.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Los usuarios pueden gestionar ítems PRISMA de sus proyectos
CREATE POLICY "Users can manage project prisma items"
  ON prisma_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = prisma_items.project_id 
      AND projects.owner_id = auth.uid()
    )
  );
