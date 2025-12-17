// Script para verificar datos en la base de datos
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'thesis_rsl_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin'
});

async function checkData() {
  try {
    console.log('🔍 Verificando datos de API usage...\n');
    
    // Obtener todos los registros
    const allRecords = await pool.query('SELECT * FROM api_usage ORDER BY created_at DESC LIMIT 10');
    console.log(`Total de registros encontrados: ${allRecords.rows.length}\n`);
    
    if (allRecords.rows.length > 0) {
      console.log('📊 Últimos 10 registros:');
      console.table(allRecords.rows.map(r => ({
        provider: r.provider,
        model: r.model,
        endpoint: r.endpoint,
        tokens_total: r.tokens_total,
        success: r.success,
        created_at: r.created_at
      })));
    } else {
      console.log('⚠️ No hay registros en la tabla api_usage');
    }
    
    // Verificar el user_id que se está usando
    console.log('\n👤 Verificando usuarios:');
    const users = await pool.query('SELECT id, email, full_name FROM users');
    console.table(users.rows);
    
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkData();
