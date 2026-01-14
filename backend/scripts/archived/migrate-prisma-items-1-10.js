/**
 * Script para migrar ítems PRISMA 1-10 desde protocolo a prisma_items
 * 
 * PROBLEMA: Los ítems 1-10 están en `protocols.prisma_compliance` pero no en `prisma_items`
 * SOLUCIÓN: Crear registros en prisma_items para cada ítem del 1 al 10
 */

const database = require('../src/config/database');

async function migratePrismaItems() {
  const projectId = '343a31e4-1094-4090-a1c9-fedb3c43aea4';
  
  try {
    console.log('🔄 Iniciando migración de ítems PRISMA 1-10...');
    
    // 1. Obtener el protocolo con prisma_compliance
    const protocolQuery = 'SELECT prisma_compliance FROM protocols WHERE project_id = $1';
    const protocolResult = await database.query(protocolQuery, [projectId]);
    
    if (!protocolResult.rows[0]) {
      console.error('❌ No se encontró el protocolo');
      return;
    }
    
    const prismaCompliance = protocolResult.rows[0].prisma_compliance;
    console.log(`✅ Protocolo encontrado con ${prismaCompliance.length} ítems en prisma_compliance`);
    
    // 2. Filtrar ítems del 1 al 10
    const items1to10 = prismaCompliance.filter(item => item.number >= 1 && item.number <= 10);
    console.log(`📋 Encontrados ${items1to10.length} ítems entre 1 y 10`);
    
    // 3. Insertar cada ítem en prisma_items
    for (const item of items1to10) {
      const insertQuery = `
        INSERT INTO prisma_items (
          project_id,
          item_number,
          section,
          topic,
          content,
          complies,
          evidence,
          ai_validated,
          ai_decision,
          ai_score,
          ai_reasoning,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        ON CONFLICT (project_id, item_number) DO UPDATE SET
          content = EXCLUDED.content,
          complies = EXCLUDED.complies,
          evidence = EXCLUDED.evidence,
          updated_at = NOW()
      `;
      
      // Mapear sección según número de ítem
      const section = item.number === 1 ? 'TITLE' :
                     item.number === 2 ? 'ABSTRACT' :
                     [3, 4].includes(item.number) ? 'INTRODUCTION' :
                     [5, 6, 7, 8, 9, 10].includes(item.number) ? 'METHODS' : 'OTHER';
      
      await database.query(insertQuery, [
        projectId,
        item.number,
        section,
        item.item, // topic
        item.evidence || '', // content
        item.complies === 'yes' ? 'yes' : 'no',
        item.evidence || '',
        true, // ai_validated
        'APROBADO', // ai_decision
        100, // ai_score
        'Generado automáticamente desde protocolo', // ai_reasoning
      ]);
      
      console.log(`✅ Ítem ${item.number} migrado a prisma_items`);
    }
    
    console.log('✅ Migración completada exitosamente');
    
    // 4. Verificar
    const countQuery = 'SELECT COUNT(*) FROM prisma_items WHERE project_id = $1';
    const countResult = await database.query(countQuery, [projectId]);
    console.log(`📊 Total ítems en prisma_items: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await database.end();
    process.exit(0);
  }
}

migratePrismaItems();
