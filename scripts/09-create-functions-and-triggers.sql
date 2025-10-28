-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protocols_updated_at
  BEFORE UPDATE ON protocols
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_references_updated_at
  BEFORE UPDATE ON references
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prisma_items_updated_at
  BEFORE UPDATE ON prisma_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar estadísticas del proyecto
CREATE OR REPLACE FUNCTION update_project_statistics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET 
    total_references = (
      SELECT COUNT(*) FROM references WHERE project_id = NEW.project_id
    ),
    screened_references = (
      SELECT COUNT(*) FROM references 
      WHERE project_id = NEW.project_id 
      AND screening_status IN ('Incluida', 'Excluida')
    ),
    included_references = (
      SELECT COUNT(*) FROM references 
      WHERE project_id = NEW.project_id 
      AND screening_status = 'Incluida'
    ),
    excluded_references = (
      SELECT COUNT(*) FROM references 
      WHERE project_id = NEW.project_id 
      AND screening_status = 'Excluida'
    )
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas cuando cambian referencias
CREATE TRIGGER update_project_stats_on_reference_change
  AFTER INSERT OR UPDATE OR DELETE ON references
  FOR EACH ROW
  EXECUTE FUNCTION update_project_statistics();

-- Función para actualizar porcentaje de cumplimiento PRISMA
CREATE OR REPLACE FUNCTION update_prisma_compliance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects
  SET prisma_compliance_percentage = (
    SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE (COUNT(*) FILTER (WHERE completed = TRUE)::DECIMAL / 27 * 100)
      END
    FROM prisma_items
    WHERE project_id = NEW.project_id
  )
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar cumplimiento PRISMA
CREATE TRIGGER update_prisma_compliance_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON prisma_items
  FOR EACH ROW
  EXECUTE FUNCTION update_prisma_compliance();
