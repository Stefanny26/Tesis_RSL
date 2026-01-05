const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function addFullTextDataColumns() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Agregando columnas para almacenar datos extraídos de PDFs...\n');

    // 1. Agregar columna full_text_data (JSONB)
    await client.query(`
      ALTER TABLE "references" 
      ADD COLUMN IF NOT EXISTS full_text_data JSONB;
    `);
    console.log('✅ Columna full_text_data agregada');

    // 2. Agregar columna full_text_extracted (BOOLEAN)
    await client.query(`
      ALTER TABLE "references" 
      ADD COLUMN IF NOT EXISTS full_text_extracted BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ Columna full_text_extracted agregada');

    // 3. Agregar columna full_text_extracted_at (TIMESTAMP)
    await client.query(`
      ALTER TABLE "references" 
      ADD COLUMN IF NOT EXISTS full_text_extracted_at TIMESTAMP;
    `);
    console.log('✅ Columna full_text_extracted_at agregada');

    // 4. Crear índice en full_text_extracted
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_references_full_text_extracted 
      ON "references"(full_text_extracted);
    `);
    console.log('✅ Índice idx_references_full_text_extracted creado');

    // 5. Crear índice GIN en full_text_data (JSONB)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_references_full_text_data_gin 
      ON "references" USING GIN(full_text_data);
    `);
    console.log('✅ Índice GIN idx_references_full_text_data_gin creado');

    console.log('\n✅ Todas las columnas para datos de PDFs agregadas exitosamente');

    // Verificar
    console.log('\n📊 Verificando columnas agregadas...');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'references'
        AND column_name IN ('full_text_data', 'full_text_extracted', 'full_text_extracted_at')
      ORDER BY column_name;
    `);

    console.table(result.rows);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addFullTextDataColumns();
