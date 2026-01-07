/**
 * Migration: Add screening_results and fase2_unlocked columns to protocols table
 * 
 * Agrega las columnas necesarias para guardar los resultados del cribado
 * y desbloquear la Fase 2 (PRISMA) después de completar el screening
 */

const { Client } = require('pg');
require('dotenv').config();

async function addScreeningColumns() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // Verificar si las columnas ya existen
    const checkQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'protocols'
        AND column_name IN ('screening_results', 'fase2_unlocked')
    `;

    const existing = await client.query(checkQuery);
    const existingColumns = existing.rows.map(r => r.column_name);

    console.log('\n📋 Columnas existentes:', existingColumns);

    // Agregar screening_results si no existe
    if (!existingColumns.includes('screening_results')) {
      console.log('\n🔧 Agregando columna screening_results...');
      
      await client.query(`
        ALTER TABLE protocols 
        ADD COLUMN screening_results JSONB DEFAULT NULL
      `);

      await client.query(`
        COMMENT ON COLUMN protocols.screening_results IS 
        'Resultados completos del cribado híbrido (Embeddings + ChatGPT) en formato JSON'
      `);

      console.log('✅ Columna screening_results agregada exitosamente');
    } else {
      console.log('ℹ️  Columna screening_results ya existe');
    }

    // Agregar fase2_unlocked si no existe
    if (!existingColumns.includes('fase2_unlocked')) {
      console.log('\n🔧 Agregando columna fase2_unlocked...');
      
      await client.query(`
        ALTER TABLE protocols 
        ADD COLUMN fase2_unlocked BOOLEAN DEFAULT FALSE
      `);

      await client.query(`
        COMMENT ON COLUMN protocols.fase2_unlocked IS 
        'Indica si la Fase 2 (PRISMA) ha sido desbloqueada después de completar el cribado'
      `);

      console.log('✅ Columna fase2_unlocked agregada exitosamente');
    } else {
      console.log('ℹ️  Columna fase2_unlocked ya existe');
    }

    // Verificar el resultado final
    console.log('\n📊 Verificando columnas...');
    const verify = await client.query(checkQuery);
    console.table(verify.rows);

    // Mostrar estadísticas
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_protocols,
        COUNT(screening_results) as with_screening_results,
        COUNT(CASE WHEN fase2_unlocked = true THEN 1 END) as fase2_unlocked_count
      FROM protocols
    `);

    console.log('\n📈 Estadísticas de protocolos:');
    console.table(stats.rows[0]);

    console.log('\n✅ Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Desconectado de la base de datos');
  }
}

// Ejecutar migración
if (require.main === module) {
  addScreeningColumns()
    .then(() => {
      console.log('\n🎉 Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { addScreeningColumns };
