const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'Tesis_RSL',
  user: 'postgres',
  password: 'root'
});

async function migrate() {
  const client = await pool.connect();
  try {
    const sqlPath = path.join(__dirname, '..', 'scripts', '10-add-protocol-ai-fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🚀 Ejecutando migración...');
    await client.query(sql);
    console.log('✅ Migración completada exitosamente!');
    
    // Verificar las nuevas columnas
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'protocols' 
      AND column_name IN ('proposed_title', 'evaluation_initial', 'matrix_elements', 'refined_question', 'key_terms', 'temporal_range', 'prisma_compliance')
      ORDER BY column_name;
    `);
    
    console.log('\n📋 Nuevas columnas agregadas:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
