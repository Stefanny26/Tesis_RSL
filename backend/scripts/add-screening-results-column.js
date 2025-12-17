/**
 * Script para agregar columna screening_results a la tabla protocols
 * Ejecutar: node scripts/add-screening-results-column.js
 */

require('dotenv').config();
const { Pool } = require('pg');

async function addScreeningResultsColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Agregar columna screening_results
    console.log('📝 Agregando columna screening_results...');
    await pool.query(`
      ALTER TABLE protocols 
      ADD COLUMN IF NOT EXISTS screening_results JSONB DEFAULT '{}'::jsonb
    `);
    
    console.log('✅ Columna screening_results agregada exitosamente');
    
    // Verificar que la columna existe
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'protocols' AND column_name = 'screening_results'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verificación: Columna existe');
      console.log('   Tipo de dato:', result.rows[0].data_type);
    } else {
      console.log('⚠️  Advertencia: No se pudo verificar la columna');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addScreeningResultsColumn();
