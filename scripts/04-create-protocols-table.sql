-- Tabla de protocolos de revisión
CREATE TABLE IF NOT EXISTS protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Matriz Es/No Es
  is_matrix JSONB DEFAULT '[]'::jsonb,
  is_not_matrix JSONB DEFAULT '[]'::jsonb,
  
  -- Framework PICO
  population TEXT,
  intervention TEXT,
  comparison TEXT,
  outcomes TEXT,
  
  -- Preguntas de investigación
  research_questions JSONB DEFAULT '[]'::jsonb,
  
  -- Criterios de inclusión/exclusión
  inclusion_criteria JSONB DEFAULT '[]'::jsonb,
  exclusion_criteria JSONB DEFAULT '[]'::jsonb,
  
  -- Estrategia de búsqueda
  databases JSONB DEFAULT '[]'::jsonb,
  search_string TEXT,
  date_range_start DATE,
  date_range_end DATE,
  
  -- Metadatos
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_protocols_project ON protocols(project_id);

-- RLS Policies
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver protocolos de sus proyectos
CREATE POLICY "Users can view own project protocols"
  ON protocols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = protocols.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Los usuarios pueden crear/actualizar protocolos de sus proyectos
CREATE POLICY "Users can manage own project protocols"
  ON protocols FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = protocols.project_id 
      AND projects.owner_id = auth.uid()
    )
  );
