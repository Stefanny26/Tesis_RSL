/**
 * Agregar columna fase2_unlocked a protocols
 * Ejecutar: node scripts/add-fase2-column.js
 */

require('dotenv').config();
const { Pool } = require('pg');

async function addFase2Column() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔄 Agregando columna fase2_unlocked a protocols...');
    
    await pool.query(`
      ALTER TABLE protocols 
      ADD COLUMN IF NOT EXISTS fase2_unlocked BOOLEAN DEFAULT FALSE
    `);
    
    console.log('✅ Columna fase2_unlocked agregada exitosamente');
    
    // Verificar
    const result = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'protocols' AND column_name = 'fase2_unlocked'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verificación: Columna existe');
      console.log('   Tipo:', result.rows[0].data_type);
      console.log('   Default:', result.rows[0].column_default);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addFase2Column();
