/**
 * Migración: Agregar columnas faltantes a prisma_items
 * Fecha: 2026-01-07
 * Descripción: Agrega automated_content y last_human_edit a tabla prisma_items
 */

require('dotenv').config();
const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // 1. Agregar columna automated_content
    console.log('\n📝 Agregando columna automated_content...');
    await client.query(`
      ALTER TABLE prisma_items
      ADD COLUMN IF NOT EXISTS automated_content TEXT;
    `);
    console.log('✅ Columna automated_content agregada');

    // 2. Agregar columna last_human_edit
    console.log('\n📝 Agregando columna last_human_edit...');
    await client.query(`
      ALTER TABLE prisma_items
      ADD COLUMN IF NOT EXISTS last_human_edit TIMESTAMP WITH TIME ZONE;
    `);
    console.log('✅ Columna last_human_edit agregada');

    // 3. Agregar comentarios explicativos
    console.log('\n📝 Agregando comentarios...');
    await client.query(`
      COMMENT ON COLUMN prisma_items.automated_content IS 
        'Contenido original generado automáticamente por IA, preservado para referencia';
    `);
    await client.query(`
      COMMENT ON COLUMN prisma_items.data_source IS 
        'Fuente de donde se obtuvo el dato (ej: Protocolo: Título Propuesto)';
    `);
    await client.query(`
      COMMENT ON COLUMN prisma_items.content_type IS 
        'Tipo de contenido: automated (100% IA), hybrid (IA + edición humana), manual (100% humano), pending (sin completar)';
    `);
    console.log('✅ Comentarios agregados');

    // 4. Verificar que las columnas existen
    console.log('\n🔍 Verificando columnas agregadas...');
    const checkQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'prisma_items'
      AND column_name IN ('automated_content', 'last_human_edit', 'content_type', 'data_source')
      ORDER BY column_name;
    `;
    const result = await client.query(checkQuery);

    console.log('\n📊 Columnas encontradas:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.column_name}: ${row.data_type}, nullable: ${row.is_nullable}, default: ${row.column_default || 'NULL'}`);
    });

    // 5. Mostrar estadísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total_items,
        COUNT(automated_content) as with_automated,
        COUNT(last_human_edit) as with_edits,
        COUNT(CASE WHEN content_type = 'automated' THEN 1 END) as automated_count,
        COUNT(CASE WHEN content_type = 'hybrid' THEN 1 END) as hybrid_count,
        COUNT(CASE WHEN content_type = 'manual' THEN 1 END) as manual_count
      FROM prisma_items;
    `;
    const stats = await client.query(statsQuery);
    console.log('\n📈 Estadísticas de PRISMA items:');
    console.log(`   Total items: ${stats.rows[0].total_items}`);
    console.log(`   Con contenido automatizado: ${stats.rows[0].with_automated}`);
    console.log(`   Con ediciones humanas: ${stats.rows[0].with_edits}`);
    console.log(`   Tipo automated: ${stats.rows[0].automated_count}`);
    console.log(`   Tipo hybrid: ${stats.rows[0].hybrid_count}`);
    console.log(`   Tipo manual: ${stats.rows[0].manual_count}`);

    console.log('\n✅ Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar migración
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('\n🎉 ¡Migración ejecutada correctamente!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = migrate;
