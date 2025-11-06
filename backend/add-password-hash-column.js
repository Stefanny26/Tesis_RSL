// Script para agregar la columna password_hash a la tabla users (NULLABLE para OAuth)
const { Pool } = require('pg');
require('dotenv').config();

async function addPasswordHashColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Verificando columna password_hash...');

    // Verificar si la columna existe
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'password_hash';
    `;
    const checkResult = await pool.query(checkQuery);

    if (checkResult.rows.length === 0) {
      console.log('➕ Agregando columna password_hash...');
      
      // Agregar la columna password_hash (NULLABLE para usuarios OAuth)
      const addColumnQuery = `
        ALTER TABLE users 
        ADD COLUMN password_hash VARCHAR(255);
      `;
      await pool.query(addColumnQuery);
      console.log('✅ Columna password_hash agregada (NULLABLE para OAuth)');

      // Agregar comentario
      const commentQuery = `
        COMMENT ON COLUMN users.password_hash IS 'Hash de contraseña para autenticación local (NULL para OAuth)';
      `;
      await pool.query(commentQuery);
      console.log('✅ Comentario agregado');
    } else {
      console.log('✅ La columna password_hash ya existe');
    }

    console.log('\n🎉 Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addPasswordHashColumn();
