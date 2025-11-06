const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'Tesis_RSL',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function updateProjectStatus() {
  try {
    // Buscar el proyecto que tiene referencias
    const result = await pool.query(`
      SELECT p.id, p.title, p.status, COUNT(r.id) as ref_count
      FROM projects p
      LEFT JOIN "references" r ON r.project_id = p.id
      GROUP BY p.id
      HAVING COUNT(r.id) > 0
    `);

    console.log('\n📊 Proyectos con referencias:');
    result.rows.forEach(row => {
      console.log(`- ${row.title}`);
      console.log(`  ID: ${row.id}`);
      console.log(`  Estado actual: ${row.status}`);
      console.log(`  Referencias: ${row.ref_count}`);
    });

    if (result.rows.length > 0) {
      const projectToUpdate = result.rows[0];
      
      // Actualizar el estado a "screening"
      await pool.query(
        `UPDATE projects SET status = $1, updated_at = NOW() WHERE id = $2`,
        ['screening', projectToUpdate.id]
      );

      console.log(`\n✅ Proyecto actualizado a estado "screening"`);
      console.log(`   Proyecto: ${projectToUpdate.title}`);
      console.log(`   ID: ${projectToUpdate.id}`);
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

updateProjectStatus();
