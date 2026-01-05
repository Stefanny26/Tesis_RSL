/**
 * Script para agregar columnas de AI a references
 * Ejecutar: node scripts/add-ai-columns.js
 */

require('dotenv').config();
const { Pool } = require('pg');

async function addAIColumns() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔄 Agregando columnas de AI a references...');
    
    await pool.query(`
      ALTER TABLE "references"
      ADD COLUMN IF NOT EXISTS ai_classification VARCHAR(50),
      ADD COLUMN IF NOT EXISTS ai_confidence_score DECIMAL(5,4),
      ADD COLUMN IF NOT EXISTS screening_score DECIMAL(5,4)
    `);
    
    console.log('✅ Columnas de AI agregadas exitosamente');
    
    // Crear índices
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_references_ai_classification ON "references"(ai_classification);
      CREATE INDEX IF NOT EXISTS idx_references_screening_score ON "references"(screening_score);
    `);
    
    console.log('✅ Índices creados exitosamente');
    
    // Verificar
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'references' 
      AND column_name IN ('ai_classification', 'ai_confidence_score', 'screening_score')
      ORDER BY column_name
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verificación: Columnas agregadas');
      result.rows.forEach(row => {
        console.log(`   ${row.column_name}: ${row.data_type}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addAIColumns();
