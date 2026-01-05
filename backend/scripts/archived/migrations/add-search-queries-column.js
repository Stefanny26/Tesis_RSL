/**
 * Script para agregar columna search_queries a la tabla protocols
 * Esta columna guardará todas las queries específicas por base de datos
 * Ejecuta: node scripts/add-search-queries-column.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function addSearchQueriesColumn() {
  console.log('📊 Agregando columna search_queries a protocols...\n');

  try {
    // 1. Verificar si la columna ya existe
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'protocols' 
        AND column_name = 'search_queries'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('⚠️  La columna search_queries ya existe\n');
      return;
    }

    // 2. Agregar columna
    console.log('➕ Agregando columna search_queries (JSONB)...');
    await pool.query(`
      ALTER TABLE protocols 
      ADD COLUMN search_queries JSONB DEFAULT '[]'::jsonb
    `);
    console.log('✅ Columna agregada exitosamente\n');

    // 3. Verificar estructura
    console.log('📋 Estructura actualizada de protocols:\n');
    const columns = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'protocols'
      ORDER BY ordinal_position
    `);

    columns.rows.forEach((col, i) => {
      const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(not null)';
      const highlight = col.column_name === 'search_queries' ? ' 🆕' : '';
      console.log(`   ${(i + 1).toString().padStart(2)}. ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}${highlight}`);
    });

    // 4. Mostrar información sobre el uso
    console.log('\n📚 INFORMACIÓN:');
    console.log('   - search_queries guardará un array de objetos con:');
    console.log('     {');
    console.log('       database: "IEEE Xplore",');
    console.log('       databaseId: "ieee",');
    console.log('       query: "cadena específica para IEEE",');
    console.log('       baseQuery: "query base sin adaptaciones",');
    console.log('       hasAPI: true,');
    console.log('       apiRequired: false,');
    console.log('       status: "pending",');
    console.log('       resultsCount: 0');
    console.log('     }');
    console.log('\n   - search_string seguirá existiendo como query genérica');
    console.log('   - Útil para generar evidencias PRISMA específicas por base de datos\n');

    console.log('✅ Migración completada exitosamente\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar
addSearchQueriesColumn();
