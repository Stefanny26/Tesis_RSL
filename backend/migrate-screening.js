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
    const sqlPath = path.join(__dirname, '..', 'scripts', '11-enhance-references-screening.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🚀 Ejecutando migración de screening colaborativo...');
    await client.query(sql);
    console.log('✅ Migración completada exitosamente!');
    
    // Verificar las nuevas tablas y columnas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('reference_reviews', 'screening_conflicts')
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Nuevas tablas creadas:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'references' 
      AND column_name IN ('screening_score', 'exclusion_reason', 'full_text_available', 'bibtex_entry')
      ORDER BY column_name;
    `);
    
    console.log('\n📊 Nuevas columnas en references:');
    columnsResult.rows.forEach(row => {
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
