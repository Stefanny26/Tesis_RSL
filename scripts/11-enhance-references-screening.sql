-- Agregar campos adicionales para screening colaborativo y PRISMA
ALTER TABLE "references" 
  ADD COLUMN IF NOT EXISTS screening_score DECIMAL(5,4);
  
ALTER TABLE "references" 
  ADD COLUMN IF NOT EXISTS exclusion_reason TEXT;
  
ALTER TABLE "references" 
  ADD COLUMN IF NOT EXISTS full_text_available BOOLEAN DEFAULT false;
  
ALTER TABLE "references" 
  ADD COLUMN IF NOT EXISTS full_text_url TEXT;
  
ALTER TABLE "references" 
  ADD COLUMN IF NOT EXISTS bibtex_entry TEXT;
  
ALTER TABLE "references" 
  ADD COLUMN IF NOT EXISTS citation_key VARCHAR(255);

-- Tabla para screening colaborativo (múltiples revisores)
CREATE TABLE IF NOT EXISTS reference_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id UUID NOT NULL REFERENCES "references"(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Decisión del revisor
  decision VARCHAR(50) NOT NULL CHECK (decision IN ('include', 'exclude', 'maybe', 'conflict')),
  confidence VARCHAR(50) CHECK (confidence IN ('low', 'medium', 'high')),
  notes TEXT,
  exclusion_criteria TEXT[], -- Array de criterios de exclusión aplicados
  
  -- Metadatos
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  review_duration_seconds INTEGER, -- Tiempo que tomó revisar
  
  UNIQUE(reference_id, reviewer_id)
);

-- Tabla para conflictos en screening
CREATE TABLE IF NOT EXISTS screening_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id UUID NOT NULL REFERENCES "references"(id) ON DELETE CASCADE,
  
  -- Revisores en conflicto
  reviewer1_id UUID NOT NULL REFERENCES users(id),
  reviewer2_id UUID NOT NULL REFERENCES users(id),
  reviewer1_decision VARCHAR(50),
  reviewer2_decision VARCHAR(50),
  
  -- Resolución
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES users(id),
  final_decision VARCHAR(50) CHECK (final_decision IN ('include', 'exclude', 'maybe')),
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_reference_reviews_reference ON reference_reviews(reference_id);
CREATE INDEX idx_reference_reviews_reviewer ON reference_reviews(reviewer_id);
CREATE INDEX idx_screening_conflicts_reference ON screening_conflicts(reference_id);
CREATE INDEX idx_screening_conflicts_resolved ON screening_conflicts(resolved);

-- Comentarios
COMMENT ON COLUMN "references".screening_score IS 'Score de similitud semántica con criterios PICO (0-1)';
COMMENT ON COLUMN "references".exclusion_reason IS 'Razón principal de exclusión';
COMMENT ON TABLE reference_reviews IS 'Revisiones individuales de cada revisor para screening colaborativo';
COMMENT ON TABLE screening_conflicts IS 'Conflictos entre revisores que requieren resolución';
