-- Tabla de proyectos de revisión sistemática
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Configuración' 
    CHECK (status IN ('Configuración', 'En Progreso', 'Revisión', 'Completado')),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deadline DATE,
  
  -- Estadísticas calculadas
  total_references INTEGER DEFAULT 0,
  screened_references INTEGER DEFAULT 0,
  included_references INTEGER DEFAULT 0,
  excluded_references INTEGER DEFAULT 0,
  prisma_compliance_percentage DECIMAL(5,2) DEFAULT 0.00
);

-- Índices
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- RLS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propios proyectos
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (owner_id = auth.uid());

-- Los usuarios pueden crear proyectos
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Los usuarios pueden actualizar sus propios proyectos
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (owner_id = auth.uid());

-- Los usuarios pueden eliminar sus propios proyectos
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (owner_id = auth.uid());
