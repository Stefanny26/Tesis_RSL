/**
 * Script para corregir la restricción de status en PostgreSQL
 */
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:root@localhost:5432/Tesis_RSL'
});

async function fixStatusConstraint() {
  try {
    console.log('🔧 Corrigiendo restricción projects_status_check...\n');

    // 1. Ver la restricción actual
    console.log('📋 Restricción actual:');
    const current = await pool.query(`
      SELECT pg_get_constraintdef(oid) as definition 
      FROM pg_constraint 
      WHERE conname = 'projects_status_check'
    `);
    console.log(current.rows[0]?.definition || 'No existe\n');

    // 2. Eliminar restricción antigua
    console.log('❌ Eliminando restricción antigua...');
    await pool.query('ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check');
    console.log('✅ Restricción eliminada\n');

    // 3. Crear nueva restricción
    console.log('➕ Creando nueva restricción con valores correctos...');
    await pool.query(`
      ALTER TABLE projects ADD CONSTRAINT projects_status_check 
        CHECK (status IN ('Configuración', 'En Progreso', 'Revisión', 'Completado'))
    `);
    console.log('✅ Nueva restricción creada\n');

    // 4. Verificar
    console.log('✔️  Verificación final:');
    const newConstraint = await pool.query(`
      SELECT pg_get_constraintdef(oid) as definition 
      FROM pg_constraint 
      WHERE conname = 'projects_status_check'
    `);
    console.log(newConstraint.rows[0]?.definition);

    console.log('\n✅ ¡Restricción corregida exitosamente!');
    console.log('\n📌 Valores permitidos:');
    console.log('   - Configuración');
    console.log('   - En Progreso');
    console.log('   - Revisión');
    console.log('   - Completado\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixStatusConstraint();
