import { supabase } from '../lib/supabase'

async function createTables() {
  console.log('🚀 Creando tablas en Supabase...')

  try {
    // Crear tabla de usuarios
    const { data: usersData, error: usersError } = await supabase.rpc('create_users_table')
    
    if (usersError) {
      console.log('📝 Creando tabla users usando SQL...')
      
      // Ejecutar SQL directamente para crear la tabla users
      const { data, error } = await supabase.from('users').select('id').limit(1)
      
      if (error && error.message.includes('does not exist')) {
        console.log('❗ Tabla users no existe. Necesitamos crearla mediante el panel de Supabase.')
        console.log(`
        Para crear las tablas, ve al SQL Editor de Supabase y ejecuta este código:

        -- Crear tabla users (sin campo institution)
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
        `)
      } else {
        console.log('✅ Tabla users ya existe')
      }
    }

    // Insertar datos de ejemplo
    console.log('📝 Insertando datos de ejemplo...')
    
    // Verificar si ya existen usuarios
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (!existingUsers || existingUsers.length === 0) {
      // Insertar usuario de ejemplo
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            email: 'investigador@ejemplo.com',
            full_name: 'Dr. Investigador Principal',
          }
        ])
        .select()

      if (userError) {
        console.error('❌ Error al insertar usuario:', userError)
      } else {
        console.log('✅ Usuario de ejemplo creado:', userData)
      }
    } else {
      console.log('✅ Ya existen usuarios en la base de datos')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Ejecutar el script
createTables().then(() => {
  console.log('🎉 Script completado')
  process.exit(0)
})