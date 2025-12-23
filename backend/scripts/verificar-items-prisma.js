require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function verificarItemsPRISMA() {
  try {
    const projectId = 'aa5158f0-428c-4e75-a0ca-711c98fd7614';
    
    console.log('🔍 Verificando ítems PRISMA en la base de datos...\n');
    
    // 1. Verificar protocolo
    const protocolResult = await pool.query(`
      SELECT 
        id,
        project_id,
        prisma_compliance,
        prisma_locked,
        prisma_completed_at,
        updated_at
      FROM protocols
      WHERE project_id = $1
    `, [projectId]);
    
    if (protocolResult.rows.length === 0) {
      console.log('❌ No se encontró protocolo para este proyecto');
      return;
    }
    
    const protocol = protocolResult.rows[0];
    console.log('✅ Protocolo encontrado:');
    console.log(`   - ID: ${protocol.id}`);
    console.log(`   - Proyecto: ${protocol.project_id}`);
    console.log(`   - PRISMA Bloqueado: ${protocol.prisma_locked}`);
    console.log(`   - Completado en: ${protocol.prisma_completed_at}`);
    console.log(`   - Última actualización: ${protocol.updated_at}`);
    
    // 2. Verificar prismaCompliance
    const prismaCompliance = protocol.prisma_compliance;
    
    if (!prismaCompliance || !Array.isArray(prismaCompliance)) {
      console.log('\n⚠️  prisma_compliance no es un array o está vacío');
      console.log('   Tipo:', typeof prismaCompliance);
      console.log('   Valor:', JSON.stringify(prismaCompliance, null, 2));
      return;
    }
    
    console.log(`\n📋 prisma_compliance contiene ${prismaCompliance.length} ítems:\n`);
    
    // Ordenar por número de ítem
    const sortedItems = prismaCompliance.sort((a, b) => {
      const numA = a.itemNumber || a.item_number || a.number || 0;
      const numB = b.itemNumber || b.item_number || b.number || 0;
      return numA - numB;
    });
    
    sortedItems.forEach((item, index) => {
      const itemNum = item.itemNumber || item.item_number || item.number || '?';
      const section = item.section || '?';
      const contentPreview = (item.content || item.evidence || item.text || '').substring(0, 80);
      const source = item.dataSource || item.data_source || '?';
      
      console.log(`${index + 1}. Ítem ${itemNum} (${section})`);
      console.log(`   Contenido: ${contentPreview}...`);
      console.log(`   Fuente: ${source}`);
      console.log('');
    });
    
    // 3. Verificar si hay ítems en la tabla prisma_items
    const itemsTableResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM prisma_items
      WHERE project_id = $1
    `, [projectId]);
    
    console.log(`\n📊 Tabla prisma_items: ${itemsTableResult.rows[0].count} registros`);
    
    if (parseInt(itemsTableResult.rows[0].count) > 0) {
      const itemsResult = await pool.query(`
        SELECT item_number, section, content_type, completed
        FROM prisma_items
        WHERE project_id = $1
        ORDER BY item_number
      `, [projectId]);
      
      console.log('\nÍtems en tabla prisma_items:');
      itemsResult.rows.forEach(item => {
        console.log(`  - Ítem ${item.item_number} (${item.section}): ${item.content_type}, completado: ${item.completed}`);
      });
    }
    
    // 4. Análisis de discrepancia
    console.log('\n\n🔍 ANÁLISIS:');
    console.log(`   - prisma_compliance tiene: ${prismaCompliance.length} ítems`);
    console.log(`   - Frontend debería ver: ${prismaCompliance.length} ítems`);
    console.log(`   - Logs del backend dicen: 18/27 ítems`);
    
    if (prismaCompliance.length < 18) {
      console.log('\n⚠️  PROBLEMA: Los ítems generados NO se están guardando en prisma_compliance');
      console.log('   Posibles causas:');
      console.log('   1. Error en el método update() del repository');
      console.log('   2. Error en la serialización del array');
      console.log('   3. La transacción se está revertiendo');
    }
    
    // 5. Mostrar los ítems que DEBERÍAN estar (16, 17, 23, 24, 26, 27)
    console.log('\n\n📝 Ítems que deberían haberse generado:');
    const expectedItems = [16, 17, 23, 24, 26, 27];
    expectedItems.forEach(num => {
      const exists = sortedItems.some(item => {
        const itemNum = item.itemNumber || item.item_number || item.number;
        return itemNum === num;
      });
      console.log(`   Ítem ${num}: ${exists ? '✅ EXISTE' : '❌ FALTA'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

verificarItemsPRISMA();
