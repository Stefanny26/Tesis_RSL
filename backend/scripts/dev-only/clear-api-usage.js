require('dotenv').config();
const { Pool } = require('pg');

async function clearApiUsage() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'Tesis_RSL',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root'
  });

  try {
    console.log('🗑️  Limpiando registros de api_usage...');
    
    const result = await pool.query('DELETE FROM api_usage');
    
    console.log(`✅ Eliminados ${result.rowCount} registros de prueba`);
    console.log('');
    console.log('📊 Ahora los datos mostrados serán SOLO los requests reales.');
    console.log('💡 Intenta usar el sistema (generar títulos, términos, etc.) y verás los contadores aumentar en tiempo real.');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

clearApiUsage();
