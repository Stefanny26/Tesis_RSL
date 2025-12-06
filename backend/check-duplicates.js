const database = require('./src/config/database');

async function checkDuplicates() {
  try {
    // Conectar a la base de datos
    await database.connect();
    console.log('✅ Conectado a la base de datos');

    // Buscar proyectos duplicados
    const duplicatesQuery = `
      SELECT id, title, owner_id, COUNT(*) as count 
      FROM projects 
      GROUP BY id, title, owner_id 
      HAVING COUNT(*) > 1
    `;
    
    const duplicates = await database.query(duplicatesQuery);
    console.log('\n📊 Proyectos duplicados en BD:', duplicates.rows.length);
    if (duplicates.rows.length > 0) {
      console.log(duplicates.rows);
    }

    // Contar total de proyectos
    const totalQuery = 'SELECT COUNT(*) as total FROM projects';
    const total = await database.query(totalQuery);
    console.log('\n📚 Total de proyectos:', total.rows[0].total);

    // Contar proyectos únicos por ID
    const uniqueQuery = 'SELECT COUNT(DISTINCT id) as unique_count FROM projects';
    const unique = await database.query(uniqueQuery);
    console.log('🔑 IDs únicos:', unique.rows[0].unique_count);

    // Listar todos los proyectos con su info básica
    const allProjectsQuery = `
      SELECT id, title, status, created_at, 
             (SELECT COUNT(*) FROM references WHERE project_id = projects.id) as ref_count
      FROM projects 
      ORDER BY created_at DESC
    `;
    const allProjects = await database.query(allProjectsQuery);
    console.log('\n📋 Lista de todos los proyectos:');
    allProjects.rows.forEach((p, i) => {
      console.log(`${i + 1}. [${p.id}] ${p.title.substring(0, 50)}... - Status: ${p.status} - Refs: ${p.ref_count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDuplicates();
