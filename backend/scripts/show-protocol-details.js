/**
 * Ver detalles de un protocolo específico
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function showProtocolDetails() {
  try {
    // Protocolo que SÍ tiene datos: "Express.js Framework"
    const result = await pool.query(`
      SELECT 
        p.*,
        proj.title
      FROM protocols p
      JOIN projects proj ON p.project_id = proj.id
      WHERE proj.title LIKE '%Express%'
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      const p = result.rows[0];
      console.log('✅ Protocolo con datos completos:\n');
      console.log(`Proyecto: ${p.title}\n`);
      console.log('Cadena de búsqueda:');
      console.log(p.search_string);
      console.log('\nBases de datos (JSON):');
      console.log(JSON.stringify(p.databases, null, 2));
      console.log('\nRango temporal (JSON):');
      console.log(JSON.stringify(p.temporal_range, null, 2));
    }

    // Protocolo con problemas: más reciente
    const recent = await pool.query(`
      SELECT 
        p.*,
        proj.title
      FROM protocols p
      JOIN projects proj ON p.project_id = proj.id
      ORDER BY p.updated_at DESC
      LIMIT 1
    `);

    if (recent.rows.length > 0) {
      const p = recent.rows[0];
      console.log('\n\n❌ Protocolo más reciente (con problemas):\n');
      console.log(`Proyecto: ${p.title}\n`);
      console.log('Cadena de búsqueda:');
      console.log(p.search_string || '(vacío)');
      console.log('\nBases de datos (JSON):');
      console.log(JSON.stringify(p.databases, null, 2));
      console.log('\nRango temporal (JSON):');
      console.log(JSON.stringify(p.temporal_range, null, 2));
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

showProtocolDetails();
