/**
 * Migration: Reset incorrect duplicate flags
 * 
 * Purpose: Desmarcar todas las referencias marcadas incorrectamente como duplicadas
 * 
 * Este script desmarca todas las referencias que fueron marcadas como is_duplicate = true
 * pero que en realidad no son duplicados.
 * 
 * Usage: node migrations/reset-duplicate-flags.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function resetDuplicateFlags() {
  console.log('🔧 Iniciando reset de marcas de duplicados...\n');
  
  const client = await pool.connect();
  
  try {
    // 1. Contar referencias marcadas como duplicadas ANTES
    console.log('📊 Estado ANTES de la corrección:');
    const beforeStats = await client.query(`
      SELECT 
        COUNT(*) as referencias_marcadas_como_duplicadas,
        COUNT(DISTINCT project_id) as proyectos_afectados
      FROM "references" 
      WHERE is_duplicate = true
    `);
    
    console.log(`   - Referencias marcadas como duplicadas: ${beforeStats.rows[0].referencias_marcadas_como_duplicadas}`);
    console.log(`   - Proyectos afectados: ${beforeStats.rows[0].proyectos_afectados}\n`);
    
    if (parseInt(beforeStats.rows[0].referencias_marcadas_como_duplicadas) === 0) {
      console.log('✅ No hay referencias marcadas como duplicadas. No se requiere corrección.');
      return;
    }
    
    // 2. Mostrar algunas referencias que serán desmarcadas
    console.log('📋 Muestra de referencias que serán desmarcadas:');
    const sampleRefs = await client.query(`
      SELECT 
        id,
        project_id,
        LEFT(title, 60) as title_preview,
        source,
        is_duplicate
      FROM "references" 
      WHERE is_duplicate = true
      LIMIT 10
    `);
    
    sampleRefs.rows.forEach((ref, idx) => {
      console.log(`   ${idx + 1}. [${ref.source || 'N/A'}] ${ref.title_preview}...`);
    });
    console.log('');
    
    // 3. Ejecutar la corrección
    console.log('🔄 Desmarcando referencias como NO duplicadas...');
    const updateResult = await client.query(`
      UPDATE "references"
      SET is_duplicate = false
      WHERE is_duplicate = true
    `);
    
    console.log(`✅ ${updateResult.rowCount} referencias actualizadas correctamente.\n`);
    
    // 4. Verificar que se aplicó correctamente
    console.log('📊 Estado DESPUÉS de la corrección:');
    const afterStats = await client.query(`
      SELECT 
        COUNT(*) as referencias_aun_marcadas_como_duplicadas
      FROM "references" 
      WHERE is_duplicate = true
    `);
    
    console.log(`   - Referencias aún marcadas como duplicadas: ${afterStats.rows[0].referencias_aun_marcadas_como_duplicadas}\n`);
    
    // 5. Mostrar estadísticas finales por proyecto
    console.log('📈 Estadísticas finales por proyecto:');
    const projectStats = await client.query(`
      SELECT 
        project_id,
        COUNT(*) as total_referencias,
        COUNT(*) FILTER (WHERE is_duplicate = true) as duplicadas,
        COUNT(*) FILTER (WHERE is_duplicate = false) as no_duplicadas
      FROM "references"
      GROUP BY project_id
      ORDER BY project_id
    `);
    
    projectStats.rows.forEach((proj) => {
      console.log(`   Proyecto ${proj.project_id}:`);
      console.log(`      - Total: ${proj.total_referencias} referencias`);
      console.log(`      - Duplicadas: ${proj.duplicadas}`);
      console.log(`      - No duplicadas: ${proj.no_duplicadas}`);
    });
    
    console.log('\n✅ Migración completada exitosamente.');
    console.log('💡 Reinicia el servidor backend para aplicar los cambios.');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar migración
resetDuplicateFlags()
  .then(() => {
    console.log('\n🎉 Script finalizado correctamente.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
