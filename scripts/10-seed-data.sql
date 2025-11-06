-- Datos de ejemplo para desarrollo (OPCIONAL)

-- Insertar usuario de prueba
INSERT INTO users (id, email, full_name, role, institution)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'investigador@espe.edu.ec', 'Dr. Juan Pérez', 'Investigador', 'Universidad de las Fuerzas Armadas ESPE'),
  ('00000000-0000-0000-0000-000000000002', 'admin@espe.edu.ec', 'Dra. María González', 'Administrador', 'Universidad de las Fuerzas Armadas ESPE'),
  ('00000000-0000-0000-0000-000000000003', 'revisor@espe.edu.ec', 'Ing. Carlos Rodríguez', 'Revisor', 'Universidad de las Fuerzas Armadas ESPE')
ON CONFLICT (email) DO NOTHING;

-- Insertar proyecto de ejemplo
INSERT INTO projects (id, title, description, status, owner_id)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'Inteligencia Artificial en Educación Superior',
  'Revisión sistemática sobre el impacto de la IA en la educación universitaria',
  'En Progreso',
  '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT DO NOTHING;

-- Insertar protocolo de ejemplo
INSERT INTO protocols (project_id, population, intervention, comparison, outcomes)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'Estudiantes universitarios',
  'Herramientas de IA educativa',
  'Métodos tradicionales de enseñanza',
  'Rendimiento académico y satisfacción estudiantil'
)
ON CONFLICT DO NOTHING;
