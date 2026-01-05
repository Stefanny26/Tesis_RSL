/**
 * Script para eliminar tablas no usadas
 * Ejecuta: node scripts/drop-unused-tables.js
 */

const { Pool } = require('pg');

// Leer configuración de .env
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function dropUnusedTables() {
  console.log('🗑️  Eliminando tablas no usadas...\n');

  try {
    // 1. Verificar qué tablas existen
    console.log('📋 Tablas actuales:');
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tableNames = tables.rows.map(r => r.table_name);
    tableNames.forEach(name => console.log(`   - ${name}`));
    console.log('');

    // 2. Eliminar project_members si existe
    if (tableNames.includes('project_members')) {
      console.log('🗑️  Eliminando tabla: project_members');
      await pool.query('DROP TABLE IF EXISTS project_members CASCADE');
      console.log('   ✅ project_members eliminada\n');
    } else {
      console.log('   ℹ️  project_members no existe\n');
    }

    // 3. Eliminar screening_overview si existe
    if (tableNames.includes('screening_overview')) {
      console.log('🗑️  Eliminando tabla: screening_overview');
      await pool.query('DROP TABLE IF EXISTS screening_overview CASCADE');
      console.log('   ✅ screening_overview eliminada\n');
    } else {
      console.log('   ℹ️  screening_overview no existe\n');
    }

    // 4. Agregar índices faltantes
    console.log('📊 Agregando índices...\n');

    const indexes = [
      {
        name: 'idx_projects_user_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)'
      },
      {
        name: 'idx_screening_records_project_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_screening_records_project_id ON screening_records(project_id)'
      },
      {
        name: 'idx_screening_records_screening_decision',
        sql: 'CREATE INDEX IF NOT EXISTS idx_screening_records_screening_decision ON screening_records(screening_decision)'
      },
      {
        name: 'idx_api_usage_user_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id)'
      },
      {
        name: 'idx_api_usage_used_at',
        sql: 'CREATE INDEX IF NOT EXISTS idx_api_usage_used_at ON api_usage(used_at DESC)'
      }
    ];

    for (const idx of indexes) {
      try {
        await pool.query(idx.sql);
        console.log(`   ✅ ${idx.name}`);
      } catch (error) {
        console.log(`   ℹ️  ${idx.name} (ya existe o error: ${error.message.split('\n')[0]})`);
      }
    }

    // 5. Verificar estructura final
    console.log('\n✅ Estructura final de la base de datos:\n');
    
    const finalTables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    finalTables.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.table_name}`);
    });

    // 6. Contar registros
    console.log('\n📈 Registros por tabla:\n');
    
    const counts = await pool.query(`
      SELECT 'users' as table_name, COUNT(*) as count FROM users
      UNION ALL
      SELECT 'projects', COUNT(*) FROM projects
      UNION ALL
      SELECT 'protocols', COUNT(*) FROM protocols
      UNION ALL
      SELECT 'screening_records', COUNT(*) FROM screening_records
      UNION ALL
      SELECT 'prisma_items', COUNT(*) FROM prisma_items
      UNION ALL
      SELECT 'api_usage', COUNT(*) FROM api_usage
      UNION ALL
      SELECT 'article_versions', COUNT(*) FROM article_versions
      ORDER BY table_name
    `);

    counts.rows.forEach(row => {
      console.log(`   - ${row.table_name.padEnd(20)} : ${row.count} registros`);
    });

    console.log('\n✅ Limpieza completada exitosamente\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar
dropUnusedTables();
