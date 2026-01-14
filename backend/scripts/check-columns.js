const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:root@localhost:5432/Tesis_RSL'
});

async function checkColumns() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'prisma_items' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Columnas de prisma_items:\n');
    result.rows.forEach(c => {
      console.log(`  ${c.column_name.padEnd(25)} ${c.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkColumns();
