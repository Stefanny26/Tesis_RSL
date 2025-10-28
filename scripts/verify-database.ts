import { supabase } from '../lib/supabase'

async function testSupabaseConnection() {
  console.log('🔍 Verificando conexión con Supabase...')
  
  try {
    // Test básico de conexión
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (error) {
      if (error.message.includes('does not exist') || error.code === 'PGRST205') {
        console.log('❌ Las tablas no existen en Supabase')
        console.log('📋 Ve al SQL Editor de Supabase y ejecuta el siguiente código:')
        console.log(`
-- Crear tabla users (SIN campo institution)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'planning',
  owner_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla project_members (sin campo role)
CREATE TABLE IF NOT EXISTS project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Insertar datos de ejemplo
INSERT INTO users (email, full_name) VALUES 
('investigador@ejemplo.com', 'Dr. Investigador Principal'),
('investigador2@universidad.edu', 'Dra. María García'),
('investigador3@instituto.org', 'Dr. Juan Pérez')
ON CONFLICT (email) DO NOTHING;
        `)
        
        console.log('\n🌐 Después de ejecutar el SQL, las tablas estarán listas para usar.')
        return false
      } else {
        console.error('❌ Error de conexión:', error)
        return false
      }
    } else {
      console.log('✅ Conexión exitosa con Supabase')
      console.log('✅ Tabla users existe y tiene datos:', data?.length || 0, 'registros')
      
      // Verificar proyectos
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .limit(1)
      
      if (projects) {
        console.log('✅ Tabla projects existe y tiene:', projects.length, 'registros')
      }
      
      return true
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error)
    return false
  }
}

async function createSampleProject() {
  console.log('\n📋 Creando proyecto de ejemplo...')
  
  try {
    // Obtener un usuario existente
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (!users || users.length === 0) {
      console.log('❌ No hay usuarios disponibles para crear el proyecto')
      return
    }
    
    const userId = users[0].id
    
    // Crear proyecto de ejemplo
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([
        {
          title: 'Revisión Sistemática de IA en Educación',
          description: 'Una revisión sistemática sobre el uso de inteligencia artificial en procesos educativos',
          status: 'planning',
          owner_id: userId
        }
      ])
      .select()
      .single()
    
    if (projectError) {
      console.error('❌ Error al crear proyecto:', projectError)
    } else {
      console.log('✅ Proyecto de ejemplo creado:', project.title)
      console.log('   📊 ID:', project.id)
      console.log('   📝 Estado:', project.status)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Ejecutar verificaciones
async function main() {
  const isConnected = await testSupabaseConnection()
  
  if (isConnected) {
    await createSampleProject()
    
    console.log('\n🎉 ¡Base de datos lista para usar!')
    console.log('📱 Puedes ejecutar: npm run dev')
  }
}

main().catch(console.error)