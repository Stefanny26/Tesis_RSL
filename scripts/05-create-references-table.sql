-- Tabla de referencias bibliográficas
CREATE TABLE IF NOT EXISTS references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Información bibliográfica
  title TEXT NOT NULL,
  authors TEXT,
  year INTEGER,
  journal VARCHAR(500),
  doi VARCHAR(255),
  abstract TEXT,
  keywords TEXT,
  url TEXT,
  
  -- Estado de cribado
  screening_status VARCHAR(50) DEFAULT 'Pendiente' 
    CHECK (screening_status IN ('Pendiente', 'En Revisión', 'Incluida', 'Excluida', 'Duplicada')),
  
  -- IA y clasificación automática
  ai_classification VARCHAR(50),
  ai_confidence_score DECIMAL(5,4),
  ai_reasoning TEXT,
  embedding_vector vector(384), -- Para MiniLM embeddings
  
  -- Revisión manual
  manual_review_status VARCHAR(50),
  manual_review_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadatos
  source VARCHAR(100), -- Base de datos de origen
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_references_project ON references(project_id);
CREATE INDEX idx_references_status ON references(screening_status);
CREATE INDEX idx_references_ai_classification ON references(ai_classification);
CREATE INDEX idx_references_year ON references(year);

-- Índice para búsqueda por similitud de embeddings
CREATE INDEX idx_references_embedding ON references 
  USING ivfflat (embedding_vector vector_cosine_ops)
  WITH (lists = 100);

-- RLS Policies
ALTER TABLE references ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver referencias de sus proyectos
CREATE POLICY "Users can view project references"
  ON references FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = references.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- Los usuarios pueden gestionar referencias de sus proyectos
CREATE POLICY "Users can manage project references"
  ON references FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = references.project_id 
      AND projects.owner_id = auth.uid()
    )
  );
