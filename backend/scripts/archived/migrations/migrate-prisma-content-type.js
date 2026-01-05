/**
 * Script de migración para añadir campos de content_type a prisma_items
 * Ejecutar con: node scripts/migrate-prisma-content-type.js
 */

require('dotenv').config();
const database = require('../src/config/database');

async function runMigration() {
  let connected = false;
  
  try {
    console.log('🔄 Iniciando migración de prisma_items...\n');

    // Conectar a la base de datos primero
    console.log('🔌 Conectando a la base de datos...');
    await database.connect();
    connected = true;
    console.log('✅ Conectado\n');

    // 1. Añadir columna content_type
    console.log('📝 Añadiendo columna content_type...');
    await database.query(`
      ALTER TABLE prisma_items
      ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) DEFAULT 'pending';
    `);
    console.log('✅ content_type añadida\n');

    // 2. Añadir columna data_source
    console.log('📝 Añadiendo columna data_source...');
    await database.query(`
      ALTER TABLE prisma_items
      ADD COLUMN IF NOT EXISTS data_source VARCHAR(255);
    `);
    console.log('✅ data_source añadida\n');

    // 3. Añadir columna automated_content
    console.log('📝 Añadiendo columna automated_content...');
    await database.query(`
      ALTER TABLE prisma_items
      ADD COLUMN IF NOT EXISTS automated_content TEXT;
    `);
    console.log('✅ automated_content añadida\n');

    // 4. Añadir columna last_human_edit
    console.log('📝 Añadiendo columna last_human_edit...');
    await database.query(`
      ALTER TABLE prisma_items
      ADD COLUMN IF NOT EXISTS last_human_edit TIMESTAMP WITH TIME ZONE;
    `);
    console.log('✅ last_human_edit añadida\n');

    // 5. Añadir índice
    console.log('📝 Creando índice en content_type...');
    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_prisma_items_content_type 
      ON prisma_items(content_type);
    `);
    console.log('✅ Índice creado\n');

    // 6. Añadir comentarios
    console.log('📝 Añadiendo comentarios de documentación...');
    await database.query(`
      COMMENT ON COLUMN prisma_items.content_type IS 
      'Tipo de contenido: automated (generado por sistema), human (escrito manualmente), hybrid (automatizado y editado), pending (sin completar)';
    `);
    await database.query(`
      COMMENT ON COLUMN prisma_items.data_source IS 
      'Fuente de datos del sistema: protocol.pico, screening.results, etc. o manual si fue escrito por usuario';
    `);
    await database.query(`
      COMMENT ON COLUMN prisma_items.automated_content IS 
      'Contenido original generado automáticamente, preservado incluso después de edición humana';
    `);
    await database.query(`
      COMMENT ON COLUMN prisma_items.last_human_edit IS 
      'Timestamp de la última vez que un humano editó este ítem';
    `);
    console.log('✅ Comentarios añadidos\n');

    // 7. Migración de datos existentes
    console.log('📝 Migrando datos existentes...');
    const result = await database.query(`
      UPDATE prisma_items
      SET content_type = CASE 
        WHEN completed = TRUE AND content IS NOT NULL AND content != '' THEN 'human'
        WHEN completed = FALSE THEN 'pending'
        ELSE 'pending'
      END
      WHERE content_type = 'pending'
      RETURNING project_id, item_number, content_type;
    `);
    console.log(`✅ ${result.rowCount} ítems actualizados\n`);

    // 8. Verificar estructura
    console.log('📊 Verificando estructura de tabla...');
    const columns = await database.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'prisma_items'
      AND column_name IN ('content_type', 'data_source', 'automated_content', 'last_human_edit')
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Columnas añadidas:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    console.log('\n✅ ¡Migración completada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log('  - 4 columnas nuevas añadidas');
    console.log('  - 1 índice creado');
    console.log('  - Comentarios de documentación añadidos');
    console.log(`  - ${result.rowCount} registros migrados`);

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    throw error;
  } finally {
    if (connected) {
      const pool = database.getPool();
      await pool.end();
      console.log('🔌 Desconectado de la base de datos');
    }
  }
}

// Ejecutar migración
runMigration()
  .then(() => {
    console.log('\n✨ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Proceso fallido:', error.message);
    process.exit(1);
  });
