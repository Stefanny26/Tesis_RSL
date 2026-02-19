const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'references' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Columnas de la tabla "references":\n');
    result.rows.forEach((col) => {
      console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? '[NOT NULL]' : ''}`);
    });
    
    // Buscar específicamente columnas relacionadas con duplicados
    console.log('\n🔍 Columnas relacionadas con duplicados:');
    const duplicateCols = result.rows.filter(col => 
      col.column_name.toLowerCase().includes('duplicate')
    );
    
    if (duplicateCols.length > 0) {
      duplicateCols.forEach(col => {
        console.log(`   ✓ ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('   ⚠️  No se encontraron columnas de duplicados');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
