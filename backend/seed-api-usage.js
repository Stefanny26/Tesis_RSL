// Script para poblar datos de uso de API de prueba
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'Tesis_RSL',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root'
});

async function seedApiUsage() {
  try {
    console.log('🔍 Buscando usuario smhernandez2@espe.edu.ec...');
    const userResult = await pool.query(
      "SELECT id, full_name FROM users WHERE email = 'smhernandez2@espe.edu.ec'"
    );
    
    if (userResult.rows.length === 0) {
      console.error('❌ Usuario smhernandez2@espe.edu.ec no encontrado en la base de datos');
      process.exit(1);
    }
    
    const userId = userResult.rows[0].id;
    console.log(`✅ Usuario encontrado: ${userResult.rows[0].full_name} (ID ${userId})`);
    
    console.log('📝 Insertando registros de uso de API...');
    
    const records = [
      // ChatGPT - últimos 7 días
      [userId, 'chatgpt', '/api/ai/generate-titles', 'gpt-4o-mini', 1200, 800, 2000, 1, true, 'NOW() - INTERVAL \'1 hour\''],
      [userId, 'chatgpt', '/api/ai/protocol-analysis', 'gpt-4o-mini', 1500, 1000, 2500, 1, true, 'NOW() - INTERVAL \'3 hours\''],
      [userId, 'chatgpt', '/api/ai/generate-protocol-terms', 'gpt-4o-mini', 1100, 900, 2000, 1, true, 'NOW() - INTERVAL \'5 hours\''],
      [userId, 'chatgpt', '/api/ai/generate-inclusion-exclusion-criteria', 'gpt-4o-mini', 1300, 1100, 2400, 1, true, 'NOW() - INTERVAL \'6 hours\''],
      [userId, 'chatgpt', '/api/ai/generate-search-queries', 'gpt-4o-mini', 1400, 1200, 2600, 1, true, 'NOW() - INTERVAL \'8 hours\''],
      [userId, 'chatgpt', '/api/ai/screen-reference', 'gpt-4o-mini', 800, 600, 1400, 1, true, 'NOW() - INTERVAL \'10 hours\''],
      [userId, 'chatgpt', '/api/ai/generate-titles', 'gpt-4o-mini', 1250, 850, 2100, 1, true, 'NOW() - INTERVAL \'1 day\''],
      [userId, 'chatgpt', '/api/ai/protocol-analysis', 'gpt-4o-mini', 1550, 1050, 2600, 1, true, 'NOW() - INTERVAL \'2 days\''],
      [userId, 'chatgpt', '/api/ai/generate-protocol-terms', 'gpt-4o-mini', 1150, 950, 2100, 1, true, 'NOW() - INTERVAL \'3 days\''],
      [userId, 'chatgpt', '/api/ai/generate-search-queries', 'gpt-4o-mini', 1450, 1250, 2700, 1, true, 'NOW() - INTERVAL \'4 days\''],
      [userId, 'chatgpt', '/api/ai/screen-reference', 'gpt-4o-mini', 850, 650, 1500, 1, true, 'NOW() - INTERVAL \'5 days\''],
      [userId, 'chatgpt', '/api/ai/generate-titles', 'gpt-4o-mini', 1280, 880, 2160, 1, true, 'NOW() - INTERVAL \'6 days\''],
      
      // Gemini - últimos 7 días
      [userId, 'gemini', '/api/ai/generate-titles', 'gemini-2.0-flash-exp', 1300, 900, 2200, 1, true, 'NOW() - INTERVAL \'2 hours\''],
      [userId, 'gemini', '/api/ai/protocol-analysis', 'gemini-2.0-flash-exp', 1600, 1100, 2700, 1, true, 'NOW() - INTERVAL \'4 hours\''],
      [userId, 'gemini', '/api/ai/generate-protocol-terms', 'gemini-2.0-flash-exp', 1200, 1000, 2200, 1, true, 'NOW() - INTERVAL \'7 hours\''],
      [userId, 'gemini', '/api/ai/generate-inclusion-exclusion-criteria', 'gemini-2.0-flash-exp', 1400, 1200, 2600, 1, true, 'NOW() - INTERVAL \'9 hours\''],
      [userId, 'gemini', '/api/ai/generate-search-queries', 'gemini-2.0-flash-exp', 1500, 1300, 2800, 1, true, 'NOW() - INTERVAL \'11 hours\''],
      [userId, 'gemini', '/api/ai/screen-reference', 'gemini-2.0-flash-exp', 900, 700, 1600, 1, true, 'NOW() - INTERVAL \'1 day\''],
      [userId, 'gemini', '/api/ai/generate-titles', 'gemini-2.0-flash-exp', 1350, 950, 2300, 1, true, 'NOW() - INTERVAL \'2 days\''],
      [userId, 'gemini', '/api/ai/protocol-analysis', 'gemini-2.0-flash-exp', 1650, 1150, 2800, 1, true, 'NOW() - INTERVAL \'3 days\''],
      [userId, 'gemini', '/api/ai/generate-protocol-terms', 'gemini-2.0-flash-exp', 1250, 1050, 2300, 1, true, 'NOW() - INTERVAL \'4 days\''],
      [userId, 'gemini', '/api/ai/generate-search-queries', 'gemini-2.0-flash-exp', 1550, 1350, 2900, 1, true, 'NOW() - INTERVAL \'5 days\''],
      [userId, 'gemini', '/api/ai/screen-reference', 'gemini-2.0-flash-exp', 950, 750, 1700, 1, true, 'NOW() - INTERVAL \'6 days\''],
      [userId, 'gemini', '/api/ai/generate-titles', 'gemini-2.0-flash-exp', 1380, 980, 2360, 1, true, 'NOW() - INTERVAL \'7 days\''],
      
      // Errores (rate limits)
      [userId, 'gemini', '/api/ai/generate-titles', 'gemini-2.0-flash-exp', 0, 0, 0, 1, false, 'NOW() - INTERVAL \'30 minutes\''],
      [userId, 'chatgpt', '/api/ai/protocol-analysis', 'gpt-4o-mini', 0, 0, 0, 1, false, 'NOW() - INTERVAL \'45 minutes\'']
    ];
    
    for (const record of records) {
      const query = `
        INSERT INTO api_usage (
          user_id, provider, endpoint, model,
          tokens_prompt, tokens_completion, tokens_total,
          request_count, success, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ${record[9]})
      `;
      
      await pool.query(query, record.slice(0, 9));
    }
    
    console.log(`✅ Se insertaron ${records.length} registros exitosamente`);
    
    // Verificar
    console.log('\n📊 Verificando datos insertados:');
    const statsResult = await pool.query(`
      SELECT 
        provider,
        COUNT(*) as total_requests,
        SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_requests,
        SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_requests,
        SUM(tokens_total) as total_tokens
      FROM api_usage
      WHERE user_id = $1
      GROUP BY provider
      ORDER BY provider
    `, [userId]);
    
    console.table(statsResult.rows);
    
    await pool.end();
    console.log('\n✅ Proceso completado');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

seedApiUsage();
