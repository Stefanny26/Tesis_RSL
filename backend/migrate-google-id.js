// Script para agregar la columna google_id a la tabla users
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

async function addGoogleIdColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migración: agregar columna google_id...');
    
    // Agregar la columna google_id
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
    `);
    console.log('✅ Columna google_id agregada');
    
    // Crear índice
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    `);
    console.log('✅ Índice creado en google_id');
    
    // Agregar comentario
    await client.query(`
      COMMENT ON COLUMN users.google_id IS 'ID único de Google OAuth 2.0 para el usuario';
    `);
    console.log('✅ Comentario agregado');
    
    // Verificar
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'google_id';
    `);
    
    console.log('\n📋 Verificación:');
    console.log(result.rows);
    
    console.log('\n✅ Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addGoogleIdColumn()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
