const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function addPrismaLockedColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Agregando columna prisma_locked a tabla protocols...\n');

    // 1. Agregar columna prisma_locked (BOOLEAN)
    await client.query(`
      ALTER TABLE "protocols" 
      ADD COLUMN IF NOT EXISTS prisma_locked BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ Columna prisma_locked agregada');

    // 2. Agregar columna prisma_completed_at (TIMESTAMP)
    await client.query(`
      ALTER TABLE "protocols" 
      ADD COLUMN IF NOT EXISTS prisma_completed_at TIMESTAMP;
    `);
    console.log('✅ Columna prisma_completed_at agregada');

    // 3. Crear índice en prisma_locked
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_protocols_prisma_locked 
      ON "protocols"(prisma_locked);
    `);
    console.log('✅ Índice idx_protocols_prisma_locked creado');

    // 4. Actualizar automáticamente los protocolos que ya tienen 27 ítems
    const updateResult = await client.query(`
      UPDATE "protocols" 
      SET prisma_locked = TRUE, 
          prisma_completed_at = NOW()
      WHERE jsonb_array_length(COALESCE(prisma_compliance, '[]'::jsonb)) >= 27
        AND prisma_locked IS NOT TRUE;
    `);
    
    if (updateResult.rowCount > 0) {
      console.log(`✅ ${updateResult.rowCount} protocolo(s) marcado(s) como PRISMA completo automáticamente`);
    }

    console.log('\n✅ Columnas de bloqueo PRISMA agregadas exitosamente');

    // Verificar
    console.log('\n📊 Verificando columnas agregadas...');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'protocols'
        AND column_name IN ('prisma_locked', 'prisma_completed_at')
      ORDER BY column_name;
    `);

    console.table(result.rows);

    // Mostrar estadísticas
    console.log('\n📊 Estadísticas de protocolos:');
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE prisma_locked = TRUE) as locked,
        COUNT(*) FILTER (WHERE prisma_locked = FALSE OR prisma_locked IS NULL) as unlocked
      FROM "protocols";
    `);

    console.table(stats.rows);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addPrismaLockedColumn();
