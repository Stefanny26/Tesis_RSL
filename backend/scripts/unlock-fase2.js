/**
 * Script temporal para desbloquear Fase 2 manualmente
 * Ejecutar: node backend/scripts/unlock-fase2.js <PROJECT_ID>
 */

require('dotenv').config();
const { Pool } = require('pg');

const projectId = process.argv[2];

if (!projectId) {
  console.error('❌ Usage: node scripts/unlock-fase2.js <PROJECT_ID>');
  process.exit(1);
}

async function unlockFase2() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log(`🔓 Desbloqueando Fase 2 para proyecto: ${projectId}`);
    
    const result = await pool.query(`
      UPDATE protocols 
      SET fase2_unlocked = true
      WHERE project_id = $1
      RETURNING *
    `, [projectId]);
    
    if (result.rows.length > 0) {
      console.log('✅ Fase 2 desbloqueada exitosamente');
      console.log('   fase2_unlocked:', result.rows[0].fase2_unlocked);
    } else {
      console.log('⚠️  No se encontró el protocolo para este proyecto');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

unlockFase2();
