const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://postgres:root@localhost:5432/Tesis_RSL'
});

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, '../../scripts/migrate-prisma-1-10.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🔄 Ejecutando migración...\n');
    await pool.query(sql);
    console.log('✅ Migración completada\n');
    
    const result = await pool.query(
      'SELECT item_number, section, completed, ai_validated, LEFT(content, 100) as preview FROM prisma_items WHERE project_id = $1 ORDER BY item_number',
      ['343a31e4-1094-4090-a1c9-fedb3c43aea4']
    );
    
    console.log('📊 Total ítems PRISMA:', result.rows.length);
    console.log('\n✨ Ítems 1-10:');
    result.rows
      .filter(i => i.item_number <= 10)
      .forEach(i => console.log(`  ${i.item_number}. [${i.section}] ✓${i.completed ? 'Completado' : 'Pendiente'} - ${i.preview}...`));
    
    console.log('\n✨ Ítems 11-27:');
    result.rows
      .filter(i => i.item_number >= 11)
      .forEach(i => console.log(`  ${i.item_number}. [${i.section}] ✓${i.completed ? 'Completado' : 'Pendiente'} - ${i.preview}...`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();
