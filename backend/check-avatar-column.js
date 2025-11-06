// Script para verificar y agregar la columna avatar_url
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

async function checkAndAddAvatarColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Verificando columna avatar_url...');
    
    // Verificar si existe la columna
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'avatar_url';
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ La columna avatar_url ya existe');
      
      // Mostrar datos actuales
      const userData = await client.query(`
        SELECT id, email, full_name, avatar_url, google_id 
        FROM users 
        WHERE google_id IS NOT NULL
        LIMIT 5;
      `);
      
      console.log('\n📋 Usuarios con Google OAuth:');
      userData.rows.forEach(user => {
        console.log(`  - ${user.full_name} (${user.email})`);
        console.log(`    Avatar: ${user.avatar_url || 'NO TIENE'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  La columna avatar_url NO existe, creándola...');
      
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN avatar_url TEXT;
      `);
      
      console.log('✅ Columna avatar_url creada exitosamente');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndAddAvatarColumn()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
