-- =====================================================
-- MIGRACIÓN COMPLETA BASE DE DATOS RSL SYSTEM
-- =====================================================
-- Versión: 1.0
-- Fecha: 2025-12-17
-- Descripción: Script completo con todas las tablas y cambios aplicados
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. TABLA USERS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- =====================================================
-- 2. TABLA PROJECTS
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- =====================================================
-- 3. TABLA PROJECT_MEMBERS
-- =====================================================
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'viewer',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

-- =====================================================
-- 4. TABLA PROTOCOLS
-- =====================================================
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
  
  -- Criterios de inclusión/exclusión
  inclusion_criteria JSONB DEFAULT '[]'::jsonb,
  exclusion_criteria JSONB DEFAULT '[]'::jsonb,
  
  -- Estrategia de búsqueda
  databases JSONB DEFAULT '[]'::jsonb,
  search_string TEXT,
  search_queries JSONB DEFAULT '[]'::jsonb, -- Array de objetos con queries específicas por BD
  
  -- Campos generados por IA
  proposed_title TEXT,
  selected_title TEXT,
  refined_question TEXT,
  key_terms JSONB DEFAULT '{}'::jsonb,
  temporal_range JSONB DEFAULT '{}'::jsonb,
  prisma_compliance JSONB DEFAULT '[]'::jsonb,
  area VARCHAR(200),
  
  -- Plan de búsqueda
  search_plan JSONB DEFAULT '{}'::jsonb,
  
  -- Resultados del screening
  screening_results JSONB DEFAULT '{}'::jsonb,
  fase2_unlocked BOOLEAN DEFAULT FALSE,
  
  -- Metadatos
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_protocols_project ON protocols(project_id);

-- Comentarios
COMMENT ON COLUMN protocols.proposed_title IS 'Título refinado propuesto por la IA';
COMMENT ON COLUMN protocols.key_terms IS 'Términos clave por categorías (technology, domain, studyType, themes)';
COMMENT ON COLUMN protocols.temporal_range IS 'Rango temporal de búsqueda (start, end, justification)';
COMMENT ON COLUMN protocols.prisma_compliance IS 'Lista de items PRISMA evaluados con cumplimiento';
COMMENT ON COLUMN protocols.search_queries IS 'Array de queries específicas por base de datos con sintaxis adaptada';
COMMENT ON COLUMN protocols.search_plan IS 'Plan de búsqueda con detalles de cada base de datos';
COMMENT ON COLUMN protocols.screening_results IS 'Resultados del cribado híbrido (embeddings + LLM)';
COMMENT ON COLUMN protocols.area IS 'Área de conocimiento del protocolo';

-- =====================================================
-- 5. TABLA REFERENCES
-- =====================================================
CREATE TABLE IF NOT EXISTS references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Metadatos básicos
  title TEXT NOT NULL,
  authors TEXT,
  year INTEGER,
  source VARCHAR(255),
  doi VARCHAR(255),
  abstract TEXT,
  keywords TEXT,
  url TEXT,
  
  -- Screening
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  classification_method VARCHAR(50),
  ai_reasoning TEXT,
  exclusion_reason TEXT,
  matched_criteria JSONB DEFAULT '[]'::jsonb,
  
  -- Priorización (embeddings)
  priority_score DECIMAL(5,4),
  similarity_score DECIMAL(5,4),
  priority_level VARCHAR(20),
  phase VARCHAR(20),
  
  -- Full text (fase 3)
  full_text_path TEXT,
  full_text_status VARCHAR(50) DEFAULT 'not_uploaded',
  full_text_evaluation JSONB DEFAULT '{}'::jsonb,
  
  -- Duplicados
  is_duplicate BOOLEAN DEFAULT FALSE,
  duplicate_of UUID REFERENCES references(id) ON DELETE SET NULL,
  
  -- Metadatos
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_references_project ON references(project_id);
CREATE INDEX IF NOT EXISTS idx_references_status ON references(status);
CREATE INDEX IF NOT EXISTS idx_references_year ON references(year);
CREATE INDEX IF NOT EXISTS idx_references_doi ON references(doi);
CREATE INDEX IF NOT EXISTS idx_references_priority ON references(priority_level);
CREATE INDEX IF NOT EXISTS idx_references_phase ON references(phase);
CREATE INDEX IF NOT EXISTS idx_references_duplicate ON references(is_duplicate);

-- =====================================================
-- 6. TABLA PRISMA_ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS prisma_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item_number INTEGER NOT NULL,
  section VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(50) DEFAULT 'manual',
  data_source TEXT,
  completed BOOLEAN DEFAULT FALSE,
  ai_validated BOOLEAN DEFAULT FALSE,
  validation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, item_number)
);

CREATE INDEX IF NOT EXISTS idx_prisma_items_project ON prisma_items(project_id);
CREATE INDEX IF NOT EXISTS idx_prisma_items_section ON prisma_items(section);
CREATE INDEX IF NOT EXISTS idx_prisma_items_completed ON prisma_items(completed);

COMMENT ON COLUMN prisma_items.content_type IS 'Tipo de contenido: automated, hybrid, manual, pending';
COMMENT ON COLUMN prisma_items.data_source IS 'Fuente del dato (ej: Protocolo: Título Propuesto)';

-- =====================================================
-- 7. TABLA ARTICLE_VERSIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT,
  abstract TEXT,
  introduction TEXT,
  methods TEXT,
  results TEXT,
  discussion TEXT,
  conclusions TEXT,
  references_section TEXT,
  word_count INTEGER DEFAULT 0,
  change_description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_article_versions_project ON article_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_article_versions_number ON article_versions(version_number DESC);

-- =====================================================
-- 8. TABLA ACTIVITY_LOG (Auditoría)
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Detalles de la actividad
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_project ON activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- =====================================================
-- 9. TABLA API_USAGE (Tracking de uso de APIs)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100),
  endpoint VARCHAR(255),
  tokens_used INTEGER,
  cost_usd DECIMAL(10,6),
  request_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_project ON api_usage(project_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_provider ON api_usage(provider);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at DESC);

-- Seed data inicial para providers
INSERT INTO api_usage (provider, model, tokens_used, cost_usd, request_metadata) VALUES
  ('gemini', 'gemini-1.5-flash', 0, 0, '{"status": "configured"}'::jsonb),
  ('chatgpt', 'gpt-4o-mini', 0, 0, '{"status": "configured"}'::jsonb)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 10. TABLA SCREENING_RECORDS
-- =====================================================
CREATE TABLE IF NOT EXISTS screening_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reference_id UUID NOT NULL REFERENCES references(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Decisión
  decision VARCHAR(50) NOT NULL,
  confidence_score DECIMAL(5,4),
  reasoning TEXT,
  
  -- Método
  screening_method VARCHAR(50),
  phase VARCHAR(20),
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screening_records_project ON screening_records(project_id);
CREATE INDEX IF NOT EXISTS idx_screening_records_reference ON screening_records(reference_id);
CREATE INDEX IF NOT EXISTS idx_screening_records_decision ON screening_records(decision);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a tablas relevantes
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_protocols_updated_at ON protocols;
CREATE TRIGGER update_protocols_updated_at 
  BEFORE UPDATE ON protocols 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_references_updated_at ON references;
CREATE TRIGGER update_references_updated_at 
  BEFORE UPDATE ON references 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prisma_items_updated_at ON prisma_items;
CREATE TRIGGER update_prisma_items_updated_at 
  BEFORE UPDATE ON prisma_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_screening_records_updated_at ON screening_records;
CREATE TRIGGER update_screening_records_updated_at 
  BEFORE UPDATE ON screening_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- USERS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- PROJECTS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (owner_id = auth.uid());

-- PROTOCOLS
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own project protocols" ON protocols
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = protocols.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own project protocols" ON protocols
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = protocols.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- REFERENCES
ALTER TABLE references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project references" ON references
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = references.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage project references" ON references
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = references.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- ACTIVITY LOG
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view project activity log" ON activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = activity_log.project_id 
      AND projects.owner_id = auth.uid()
    )
  );

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Listar todas las tablas creadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar índices importantes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================

-- Para aplicar este script:
-- 1. Hacer backup de la base de datos existente
-- 2. Ejecutar: psql -U postgres -d rsl_database -f complete-migration-v1.sql
-- 3. Verificar que todas las tablas se crearon correctamente
-- 4. Verificar políticas RLS con: \dp en psql

COMMENT ON DATABASE CURRENT_DATABASE() IS 'RSL System - Systematic Literature Review Management Platform - v1.0';
