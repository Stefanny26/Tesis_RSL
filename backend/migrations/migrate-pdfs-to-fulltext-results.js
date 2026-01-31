/**
 * Migración: Mover archivos de uploads/pdfs a uploads/fulltext-results
 * 
 * Este script:
 * 1. Crea la nueva carpeta uploads/fulltext-results si no existe
 * 2. Mueve todos los archivos de uploads/pdfs a uploads/fulltext-results
 * 3. Actualiza las URLs en la base de datos
 * 4. Mantiene la carpeta uploads/pdfs vacía para compatibilidad
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

const OLD_DIR = path.join(__dirname, '../uploads/pdfs');
const NEW_DIR = path.join(__dirname, '../uploads/fulltext-results');

async function migrate() {
  console.log('🔄 Iniciando migración de archivos de texto completo...\n');

  try {
    // 1. Crear nueva carpeta si no existe
    if (!fs.existsSync(NEW_DIR)) {
      fs.mkdirSync(NEW_DIR, { recursive: true });
      console.log('✅ Carpeta creada: uploads/fulltext-results');
    } else {
      console.log('ℹ️  Carpeta ya existe: uploads/fulltext-results');
    }

    // 2. Verificar si la carpeta antigua existe
    if (!fs.existsSync(OLD_DIR)) {
      console.log('ℹ️  No hay carpeta uploads/pdfs para migrar');
      return;
    }

    // 3. Obtener lista de archivos en la carpeta antigua
    const files = fs.readdirSync(OLD_DIR).filter(f => 
      f !== '.gitkeep' && f !== '.gitignore'
    );

    if (files.length === 0) {
      console.log('ℹ️  No hay archivos para migrar');
      return;
    }

    console.log(`📁 Encontrados ${files.length} archivos para migrar\n`);

    // 4. Mover cada archivo
    let movedCount = 0;
    for (const file of files) {
      const oldPath = path.join(OLD_DIR, file);
      const newPath = path.join(NEW_DIR, file);

      try {
        fs.renameSync(oldPath, newPath);
        movedCount++;
        console.log(`  ✓ Movido: ${file}`);
      } catch (error) {
        console.error(`  ✗ Error moviendo ${file}:`, error.message);
      }
    }

    console.log(`\n✅ ${movedCount} archivos movidos exitosamente\n`);

    // 5. Actualizar URLs en la base de datos
    console.log('🔄 Actualizando URLs en la base de datos...');

    const updateQuery = `
      UPDATE references 
      SET full_text_url = REPLACE(full_text_url, '/uploads/pdfs/', '/uploads/fulltext-results/')
      WHERE full_text_url LIKE '%/uploads/pdfs/%'
    `;

    const result = await pool.query(updateQuery);
    console.log(`✅ ${result.rowCount} registros actualizados en la base de datos\n`);

    console.log('✅ Migración completada exitosamente!');
    console.log('\nPróximos pasos:');
    console.log('1. La carpeta uploads/pdfs se mantiene vacía para compatibilidad');
    console.log('2. Todos los nuevos archivos se guardarán en uploads/fulltext-results');
    console.log('3. Puedes eliminar manualmente uploads/pdfs si lo deseas\n');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar migración
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Proceso finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { migrate };
