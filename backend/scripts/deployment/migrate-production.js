const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrateProduction() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando migración de producción...\n');

    // ===========================================
    // 1. PROTOCOLS TABLE - Agregar columnas PRISMA
    // ===========================================
    
    console.log('📋 Migrando tabla PROTOCOLS...');
    
    // 1.1. Agregar prisma_locked
    await client.query(`
      ALTER TABLE "protocols" 
      ADD COLUMN IF NOT EXISTS prisma_locked BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ Columna prisma_locked agregada');

    // 1.2. Agregar prisma_completed_at
    await client.query(`
      ALTER TABLE "protocols" 
      ADD COLUMN IF NOT EXISTS prisma_completed_at TIMESTAMP;
    `);
    console.log('✅ Columna prisma_completed_at agregada');

    // 1.3. Crear índice en prisma_locked
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_protocols_prisma_locked 
      ON "protocols"(prisma_locked);
    `);
    console.log('✅ Índice idx_protocols_prisma_locked creado');

    // ===========================================
    // 2. PRISMA_ITEMS TABLE - Agregar columnas de contenido automatizado
    // ===========================================
    
    console.log('\n📝 Migrando tabla PRISMA_ITEMS...');
    
    // 2.1. Agregar content_type
    await client.query(`
      ALTER TABLE "prisma_items" 
      ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'mixed' 
      CHECK (content_type IN ('human', 'ai', 'mixed'));
    `);
    console.log('✅ Columna content_type agregada');

    // 2.2. Agregar data_source
    await client.query(`
      ALTER TABLE "prisma_items" 
      ADD COLUMN IF NOT EXISTS data_source VARCHAR(50) DEFAULT 'user';
    `);
    console.log('✅ Columna data_source agregada');

    // 2.3. Agregar automated_content (LA CLAVE)
    await client.query(`
      ALTER TABLE "prisma_items" 
      ADD COLUMN IF NOT EXISTS automated_content TEXT;
    `);
    console.log('✅ Columna automated_content agregada');

    // 2.4. Agregar last_human_edit
    await client.query(`
      ALTER TABLE "prisma_items" 
      ADD COLUMN IF NOT EXISTS last_human_edit TIMESTAMP;
    `);
    console.log('✅ Columna last_human_edit agregada');

    // ===========================================
    // 3. USERS TABLE - Agregar name si falta
    // ===========================================
    
    console.log('\n👤 Migrando tabla USERS...');
    
    await client.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS name VARCHAR(255);
    `);
    console.log('✅ Columna name agregada a users');

    // ===========================================
    // 4. COMENTARIOS Y ÍNDICES ADICIONALES
    // ===========================================
    
    console.log('\n📖 Agregando comentarios...');
    
    // Comentarios para prisma_items
    await client.query(`
      COMMENT ON COLUMN prisma_items.content_type IS 
      'Tipo de contenido: human (solo humano), ai (solo IA), mixed (combinado)';
    `);
    
    await client.query(`
      COMMENT ON COLUMN prisma_items.automated_content IS 
      'Contenido generado automáticamente por IA para este ítem PRISMA';
    `);
    
    await client.query(`
      COMMENT ON COLUMN prisma_items.last_human_edit IS 
      'Timestamp de la última edición manual del contenido';
    `);
    
    console.log('✅ Comentarios agregados');

    // Índices para rendimiento
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_prisma_items_content_type 
      ON "prisma_items"(content_type);
    `);
    console.log('✅ Índice idx_prisma_items_content_type creado');

    // ===========================================
    // 5. VERIFICACIÓN FINAL
    // ===========================================
    
    console.log('\n🔍 Verificando migración...');
    
    // Verificar protocols
    const protocolsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'protocols' 
      AND column_name IN ('prisma_locked', 'prisma_completed_at')
      ORDER BY column_name;
    `);
    console.log(`✅ Protocols: ${protocolsCheck.rows.length}/2 columnas encontradas`);

    // Verificar prisma_items
    const prismaItemsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'prisma_items' 
      AND column_name IN ('content_type', 'data_source', 'automated_content', 'last_human_edit')
      ORDER BY column_name;
    `);
    console.log(`✅ Prisma Items: ${prismaItemsCheck.rows.length}/4 columnas encontradas`);

    // Verificar users
    const usersCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'name';
    `);
    console.log(`✅ Users: ${usersCheck.rows.length}/1 columna encontrada`);

    console.log('\n🎉 ¡MIGRACIÓN DE PRODUCCIÓN COMPLETADA EXITOSAMENTE!');
    console.log('\n📊 Resumen de cambios:');
    console.log('   • protocols: +2 columnas (prisma_locked, prisma_completed_at)');
    console.log('   • prisma_items: +4 columnas (content_type, data_source, automated_content, last_human_edit)');
    console.log('   • users: +1 columna (name)');
    console.log('   • Índices y comentarios agregados');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  migrateProduction()
    .then(() => {
      console.log('\n✅ Script de migración terminado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error ejecutando migración:', error);
      process.exit(1);
    });
}

module.exports = { migrateProduction };