/**
 * Script para limpiar la base de datos
 * Ejecuta: node scripts/cleanup-db.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Leer configuración de .env
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runCleanup() {
  console.log('🧹 Iniciando limpieza de base de datos...\n');

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '..', '..', 'scripts', 'cleanup-database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Separar en statements individuales (eliminar comentarios y líneas vacías)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt.length > 0 && 
        !stmt.startsWith('--') && 
        stmt !== 'COMMIT'
      );

    console.log(`📝 Encontrados ${statements.length} comandos SQL\n`);

    // Ejecutar cada statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      // Saltar comentarios de múltiples líneas
      if (stmt.includes('/*') || stmt.includes('*/')) continue;
      
      // Saltar SELECTs de verificación (los ejecutamos después)
      if (stmt.toUpperCase().startsWith('SELECT') && !stmt.includes('DROP')) {
        continue;
      }

      try {
        console.log(`⚙️  Ejecutando (${i + 1}/${statements.length})...`);
        await pool.query(stmt + ';');
        successCount++;
      } catch (error) {
        // Ignorar errores de "no existe" (ya fue eliminado)
        if (error.message.includes('does not exist') || 
            error.message.includes('no existe') ||
            error.message.includes('already exists')) {
          console.log(`   ℹ️  Info: ${error.message.split('\n')[0]}`);
          successCount++;
        } else {
          console.error(`   ❌ Error: ${error.message.split('\n')[0]}`);
          errorCount++;
        }
      }
    }

    console.log(`\n✅ Limpieza completada:`);
    console.log(`   - Exitosos: ${successCount}`);
    console.log(`   - Errores: ${errorCount}\n`);

    // Ahora ejecutar verificaciones
    console.log('🔍 Verificando estructura final...\n');

    // Listar tablas
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('📊 Tablas en la base de datos:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Verificar campos de protocols
    console.log('\n🔍 Campos críticos en tabla protocols:');
    const fields = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'protocols'
        AND column_name IN ('search_string', 'databases', 'temporal_range')
      ORDER BY ordinal_position
    `);

    fields.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? '✓ nullable' : '✗ not null'}`);
    });

    // Contar registros
    console.log('\n📈 Registros por tabla:');
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
      console.log(`   - ${row.table_name}: ${row.count} registros`);
    });

    console.log('\n✅ Limpieza exitosa. Base de datos optimizada.\n');

  } catch (error) {
    console.error('\n❌ Error durante la limpieza:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar
runCleanup();
