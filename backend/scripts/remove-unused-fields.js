/**
 * Script Node.js para eliminar columnas no usadas de la tabla protocols
 * Ejecuta: node scripts/remove-unused-fields.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function removeUnusedFields() {
  console.log('🗑️  Eliminando campos no usados de la tabla protocols...\n');
  console.log('⚠️  NOTA: key_terms SÍ se usa en el screening, NO se eliminará\n');

  try {
    // 1. Verificar datos antes de borrar
    console.log('📊 Verificando datos en campos a eliminar:\n');
    
    const checks = await pool.query(`
      SELECT 
        'research_questions' as campo,
        COUNT(*) as total,
        COUNT(CASE WHEN research_questions IS NOT NULL AND research_questions::text != '[]' THEN 1 END) as con_datos
      FROM protocols
      UNION ALL
      SELECT 
        'evaluation_initial',
        COUNT(*),
        COUNT(CASE WHEN evaluation_initial IS NOT NULL AND evaluation_initial::text != '{}' THEN 1 END)
      FROM protocols
      UNION ALL
      SELECT 
        'matrix_elements',
        COUNT(*),
        COUNT(CASE WHEN matrix_elements IS NOT NULL AND matrix_elements::text != '[]' THEN 1 END)
      FROM protocols
      UNION ALL
      SELECT 
        'key_terms',
        COUNT(*),
        COUNT(CASE WHEN key_terms IS NOT NULL AND key_terms::text != '{}' THEN 1 END)
      FROM protocols
      UNION ALL
      SELECT 
        'date_range_start',
        COUNT(*),
        COUNT(CASE WHEN date_range_start IS NOT NULL THEN 1 END)
      FROM protocols
      UNION ALL
      SELECT 
        'date_range_end',
        COUNT(*),
        COUNT(CASE WHEN date_range_end IS NOT NULL THEN 1 END)
      FROM protocols
    `);

    checks.rows.forEach(row => {
      const status = row.con_datos > 0 ? '⚠️  TIENE DATOS' : '✅ VACÍO';
      console.log(`   ${row.campo.padEnd(25)} : ${row.con_datos}/${row.total} registros ${status}`);
    });

    console.log('\n🔍 Estado de temporal_range (campo que SÍ se usa):');
    const temporal = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN temporal_range IS NOT NULL AND temporal_range::text NOT IN ('{}', 'null') THEN 1 END) as con_datos
      FROM protocols
    `);
    console.log(`   temporal_range: ${temporal.rows[0].con_datos}/${temporal.rows[0].total} registros con datos ✅\n`);

    // 2. Eliminar columnas
    console.log('🗑️  Eliminando columnas...\n');

    const columnsToRemove = [
      'research_questions',
      'date_range_start',
      'date_range_end',
      'evaluation_initial',
      'matrix_elements'
    ];

    for (const column of columnsToRemove) {
      try {
        await pool.query(`ALTER TABLE protocols DROP COLUMN IF EXISTS ${column}`);
        console.log(`   ✅ ${column} eliminada`);
      } catch (error) {
        console.log(`   ❌ Error al eliminar ${column}: ${error.message}`);
      }
    }

    // 3. Verificar estructura final
    console.log('\n📋 Estructura final de la tabla protocols:\n');
    const columns = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'protocols'
      ORDER BY ordinal_position
    `);

    columns.rows.forEach((col, i) => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(not null)';
      console.log(`   ${(i + 1).toString().padStart(2)}. ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}`);
    });

    console.log('\n✅ Limpieza completada exitosamente\n');
    console.log('📊 Campos eliminados: 5');
    console.log('📊 Campos restantes: ' + columns.rows.length);
    console.log('✅ key_terms conservado (se usa en screening)');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar
removeUnusedFields();
