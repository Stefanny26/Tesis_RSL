-- Crear tabla screening_records para evaluaciones de texto completo
-- Sistema de 7 criterios (0-12 puntos) para Phase 3

CREATE TABLE IF NOT EXISTS screening_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id UUID NOT NULL REFERENCES "references"(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Etapa de screening
  stage VARCHAR(50) NOT NULL DEFAULT 'fulltext', -- 'embeddings', 'manual', 'fulltext'
  
  -- Puntajes de los 7 criterios (JSON)
  scores JSONB NOT NULL,
  -- Estructura esperada:
  -- {
  --   "relevance": 0-2,
  --   "interventionPresent": 0-2,
  --   "methodValidity": 0-2,
  --   "dataReported": 0-2,
  --   "textAccessible": 0-1,
  --   "dateRange": 0-1,
  --   "methodQuality": 0-2
  -- }
  
  -- Puntaje total calculado (0-12)
  total_score INTEGER NOT NULL,
  
  -- Umbral de decisión (default: 7)
  threshold INTEGER NOT NULL DEFAULT 7,
  
  -- Decisión final
  decision VARCHAR(20) NOT NULL CHECK (decision IN ('include', 'exclude')),
  
  -- Motivos de exclusión (array JSON)
  exclusion_reasons JSONB,
  -- Ejemplo: ["low_relevance", "no_intervention", "weak_methodology"]
  
  -- Comentarios del evaluador
  comment TEXT,
  
  -- Timestamps
  reviewed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Índices
  CONSTRAINT screening_records_total_score_check CHECK (total_score >= 0 AND total_score <= 12)
);

-- Índices para optimizar consultas
CREATE INDEX idx_screening_records_reference ON screening_records(reference_id);
CREATE INDEX idx_screening_records_project ON screening_records(project_id);
CREATE INDEX idx_screening_records_user ON screening_records(user_id);
CREATE INDEX idx_screening_records_stage ON screening_records(stage);
CREATE INDEX idx_screening_records_decision ON screening_records(decision);
CREATE INDEX idx_screening_records_reviewed_at ON screening_records(reviewed_at DESC);

-- Índice GIN para búsquedas en scores JSONB
CREATE INDEX idx_screening_records_scores ON screening_records USING GIN (scores);

-- Índice GIN para búsquedas en exclusion_reasons JSONB
CREATE INDEX idx_screening_records_exclusion_reasons ON screening_records USING GIN (exclusion_reasons);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_screening_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_screening_records_updated_at
  BEFORE UPDATE ON screening_records
  FOR EACH ROW
  EXECUTE FUNCTION update_screening_records_updated_at();

-- Comentarios en la tabla
COMMENT ON TABLE screening_records IS 'Evaluaciones de texto completo con sistema de 7 criterios (0-12 puntos)';
COMMENT ON COLUMN screening_records.stage IS 'Etapa de screening: embeddings, manual, fulltext';
COMMENT ON COLUMN screening_records.scores IS 'JSON con 7 criterios: relevance, interventionPresent, methodValidity, dataReported, textAccessible, dateRange, methodQuality';
COMMENT ON COLUMN screening_records.total_score IS 'Suma de todos los criterios (0-12 puntos)';
COMMENT ON COLUMN screening_records.threshold IS 'Umbral para decisión: >= threshold = include, < threshold = exclude';
COMMENT ON COLUMN screening_records.decision IS 'Decisión final: include o exclude';
COMMENT ON COLUMN screening_records.exclusion_reasons IS 'Array JSON de motivos de exclusión identificados automáticamente';
