/**
 * Script para verificar los protocolos guardados en la base de datos
 */
const database = require('./src/config/database');

async function checkProtocols() {
  try {
    console.log('🔍 Verificando protocolos en la base de datos...\n');
    
    const result = await database.query(`
      SELECT 
        p.id, 
        p.project_id,
        proj.title as project_title,
        p.inclusion_criteria,
        p.exclusion_criteria,
        p.databases,
        p.created_at
      FROM protocols p
      JOIN projects proj ON p.project_id = proj.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No se encontraron protocolos');
      return;
    }
    
    console.log(`✅ Encontrados ${result.rows.length} protocolos:\n`);
    
    result.rows.forEach((row, index) => {
      console.log(`\n📋 Protocolo ${index + 1}:`);
      console.log(`   ID: ${row.id}`);
      console.log(`   Proyecto: ${row.project_title}`);
      console.log(`   Fecha: ${row.created_at}`);
      
      // Parse JSON fields
      const inclusion = typeof row.inclusion_criteria === 'string' 
        ? JSON.parse(row.inclusion_criteria) 
        : row.inclusion_criteria;
      const exclusion = typeof row.exclusion_criteria === 'string'
        ? JSON.parse(row.exclusion_criteria)
        : row.exclusion_criteria;
      const databases = typeof row.databases === 'string'
        ? JSON.parse(row.databases)
        : row.databases;
      
      console.log(`   📊 Criterios de Inclusión: ${inclusion?.length || 0}`);
      if (inclusion && inclusion.length > 0) {
        console.log(`      Ejemplo: "${inclusion[0].substring(0, 60)}..."`);
      }
      
      console.log(`   📊 Criterios de Exclusión: ${exclusion?.length || 0}`);
      if (exclusion && exclusion.length > 0) {
        console.log(`      Ejemplo: "${exclusion[0].substring(0, 60)}..."`);
      }
      
      console.log(`   📊 Bases de Datos: ${databases?.length || 0}`);
      if (databases && databases.length > 0) {
        console.log(`      ${databases.join(', ')}`);
      }
    });
    
    console.log('\n✅ Verificación completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkProtocols();
