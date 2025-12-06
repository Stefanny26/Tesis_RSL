const database = require('./src/config/database');

async function removeDuplicateProjects() {
  try {
    await database.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Encontrar proyectos duplicados por título y owner
    const duplicatesQuery = `
      WITH duplicates AS (
        SELECT 
          id, 
          title, 
          owner_id, 
          created_at, 
          updated_at,
          ROW_NUMBER() OVER (
            PARTITION BY title, owner_id 
            ORDER BY updated_at DESC, created_at DESC
          ) as row_num
        FROM projects
      )
      SELECT * FROM duplicates WHERE row_num > 1
    `;
    
    const duplicates = await database.query(duplicatesQuery);
    console.log(`📊 Proyectos duplicados encontrados: ${duplicates.rows.length}\n`);

    if (duplicates.rows.length === 0) {
      console.log('✅ No hay proyectos duplicados que eliminar');
      process.exit(0);
    }

    // Mostrar duplicados
    console.log('🗑️  Proyectos que serán eliminados (versiones antiguas):\n');
    duplicates.rows.forEach((p, i) => {
      console.log(`${i + 1}. [${p.id}]`);
      console.log(`   Título: ${p.title.substring(0, 60)}...`);
      console.log(`   Creado: ${p.created_at}`);
      console.log(`   Actualizado: ${p.updated_at}\n`);
    });

    // Confirmar antes de eliminar
    console.log('⚠️  IMPORTANTE: Esta operación eliminará los proyectos duplicados más antiguos.');
    console.log('   Se conservará la versión más reciente de cada proyecto.\n');

    // Eliminar duplicados (versiones antiguas)
    const deleteIds = duplicates.rows.map(p => p.id);
    
    if (deleteIds.length > 0) {
      // Primero eliminar referencias asociadas
      const deleteReferencesQuery = `
        DELETE FROM references 
        WHERE project_id = ANY($1)
      `;
      const deletedRefs = await database.query(deleteReferencesQuery, [deleteIds]);
      console.log(`✅ Referencias eliminadas: ${deletedRefs.rowCount}`);

      // Luego eliminar protocolos asociados
      const deleteProtocolsQuery = `
        DELETE FROM protocols 
        WHERE project_id = ANY($1)
      `;
      const deletedProtocols = await database.query(deleteProtocolsQuery, [deleteIds]);
      console.log(`✅ Protocolos eliminados: ${deletedProtocols.rowCount}`);

      // Finalmente eliminar proyectos duplicados
      const deleteProjectsQuery = `
        DELETE FROM projects 
        WHERE id = ANY($1)
      `;
      const deletedProjects = await database.query(deleteProjectsQuery, [deleteIds]);
      console.log(`✅ Proyectos duplicados eliminados: ${deletedProjects.rowCount}\n`);
    }

    // Verificar resultado
    const finalCountQuery = 'SELECT COUNT(*) as total FROM projects';
    const finalCount = await database.query(finalCountQuery);
    console.log(`📚 Total de proyectos después de limpieza: ${finalCount.rows[0].total}`);

    // Verificar duplicados restantes
    const remainingDuplicatesQuery = `
      SELECT title, owner_id, COUNT(*) as count
      FROM projects
      GROUP BY title, owner_id
      HAVING COUNT(*) > 1
    `;
    const remainingDuplicates = await database.query(remainingDuplicatesQuery);
    
    if (remainingDuplicates.rows.length > 0) {
      console.log('\n⚠️  Aún quedan duplicados:');
      remainingDuplicates.rows.forEach(d => {
        console.log(`   - "${d.title.substring(0, 50)}..." (${d.count} copias)`);
      });
    } else {
      console.log('\n✅ No quedan duplicados en la base de datos');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeDuplicateProjects();
