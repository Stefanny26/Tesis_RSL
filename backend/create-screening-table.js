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

async function createScreeningRecordsTable() {
  try {
    console.log('📊 Creando tabla screening_records...');
    
    const sqlPath = path.join(__dirname, '..', 'scripts', '14-create-screening-records-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Tabla screening_records creada exitosamente');
    
    // Verificar que la tabla existe
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'screening_records'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verificación exitosa: tabla screening_records existe');
    } else {
      console.log('❌ Error: tabla no encontrada después de crear');
    }
    
  } catch (error) {
    console.error('❌ Error creando tabla:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createScreeningRecordsTable();
