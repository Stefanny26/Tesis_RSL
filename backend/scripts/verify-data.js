/**
 * Script para verificar que los datos se guardan correctamente
 * Ejecuta: node scripts/verify-data.js
 */

const { Pool } = require('pg');

// Leer configuración de .env
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function verifyData() {
  console.log('🔍 Verificando datos en la base de datos...\n');

  try {
    // 1. Estado actual de todos los protocolos
    console.log('📋 Estado de protocolos:\n');
    const protocols = await pool.query(`
      SELECT 
        p.id,
        proj.title as project_title,
        p.search_string,
        CASE 
          WHEN p.databases::text = '[]' THEN '❌ VACÍO'
          WHEN p.databases IS NULL THEN '❌ NULL'
          ELSE '✅ CON DATOS'
        END as databases_status,
        jsonb_array_length(p.databases) as db_count,
        CASE 
          WHEN p.temporal_range::text IN ('{}', 'null') THEN '❌ VACÍO'
          WHEN p.temporal_range IS NULL THEN '❌ NULL'
          ELSE '✅ CON DATOS'
        END as temporal_range_status,
        p.created_at
      FROM protocols p
      JOIN projects proj ON p.project_id = proj.id
      ORDER BY p.updated_at DESC
    `);

    if (protocols.rows.length === 0) {
      console.log('   ⚠️  No hay protocolos en la base de datos\n');
    } else {
      protocols.rows.forEach((row, i) => {
        console.log(`${i + 1}. ${row.project_title}`);
        console.log(`   - Cadena búsqueda: ${row.search_string ? '✅ Presente' : '❌ Vacío'}`);
        console.log(`   - Bases de datos: ${row.databases_status} ${row.db_count ? `(${row.db_count} DBs)` : ''}`);
        console.log(`   - Rango temporal: ${row.temporal_range_status}`);
        console.log(`   - Fecha: ${new Date(row.created_at).toLocaleDateString()}`);
        console.log('');
      });
    }

    // 2. Estadísticas de completitud
    console.log('📊 Estadísticas de completitud:\n');
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_protocolos,
        SUM(CASE WHEN search_string IS NOT NULL AND search_string != '' THEN 1 ELSE 0 END) as con_search_string,
        SUM(CASE WHEN databases IS NOT NULL AND databases::text != '[]' THEN 1 ELSE 0 END) as con_databases,
        SUM(CASE WHEN temporal_range IS NOT NULL AND temporal_range::text NOT IN ('{}', 'null') THEN 1 ELSE 0 END) as con_temporal_range
      FROM protocols
    `);

    const s = stats.rows[0];
    console.log(`   Total protocolos: ${s.total_protocolos}`);
    console.log(`   Con cadena de búsqueda: ${s.con_search_string}/${s.total_protocolos} ${s.con_search_string > 0 ? '✅' : '❌'}`);
    console.log(`   Con bases de datos: ${s.con_databases}/${s.total_protocolos} ${s.con_databases > 0 ? '✅' : '❌'}`);
    console.log(`   Con rango temporal: ${s.con_temporal_range}/${s.total_protocolos} ${s.con_temporal_range > 0 ? '✅' : '❌'}`);
    console.log('');

    // 3. Protocolo más reciente (detalle)
    console.log('🔎 Protocolo más reciente (detalle completo):\n');
    const latest = await pool.query(`
      SELECT 
        p.id,
        proj.title,
        p.search_string,
        p.databases,
        p.temporal_range,
        p.updated_at
      FROM protocols p
      JOIN projects proj ON p.project_id = proj.id
      ORDER BY p.updated_at DESC
      LIMIT 1
    `);

    if (latest.rows.length > 0) {
      const p = latest.rows[0];
      console.log(`   Proyecto: ${p.title}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Última actualización: ${new Date(p.updated_at).toLocaleString()}`);
      console.log('');
      console.log('   Cadena de búsqueda:');
      console.log(`   ${p.search_string || '(vacío)'}`);
      console.log('');
      console.log('   Bases de datos:');
      if (p.databases && p.databases.length > 0) {
        p.databases.forEach((db, i) => console.log(`   ${i + 1}. ${db}`));
      } else {
        console.log('   (vacío)');
      }
      console.log('');
      console.log('   Rango temporal:');
      if (p.temporal_range && Object.keys(p.temporal_range).length > 0) {
        console.log(`   Inicio: ${p.temporal_range.start || 'N/A'}`);
        console.log(`   Fin: ${p.temporal_range.end || 'N/A'}`);
        console.log(`   Justificación: ${p.temporal_range.justification || 'N/A'}`);
      } else {
        console.log('   (vacío)');
      }
    }

    console.log('\n✅ Verificación completada\n');

    // Sugerencia
    if (stats.rows[0].total_protocolos === 0) {
      console.log('💡 Sugerencia: Crea un proyecto nuevo para probar que los datos se guardan\n');
    } else if (stats.rows[0].con_search_string === 0) {
      console.log('💡 Sugerencia: Los protocolos existentes están vacíos. Crea uno nuevo o edita uno existente.\n');
    } else {
      console.log('✅ Los datos se están guardando correctamente\n');
    }

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar
verifyData();
