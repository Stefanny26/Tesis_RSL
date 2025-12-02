require('dotenv').config();
const { Pool } = require('pg');

async function getUserId() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'Tesis_RSL',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root'
  });

  try {
    // Obtener todos los usuarios
    const usersResult = await pool.query(`
      SELECT id, email, full_name, role, created_at 
      FROM users 
      ORDER BY created_at ASC
    `);

    console.log('\n👥 USUARIOS EN LA BASE DE DATOS:\n');
    console.log('='.repeat(100));
    usersResult.rows.forEach((user, index) => {
      console.log(`\n${index + 1}. Usuario:`);
      console.log(`   ID:     ${user.id}`);
      console.log(`   Email:  ${user.email}`);
      console.log(`   Nombre: ${user.full_name}`);
      console.log(`   Rol:    ${user.role}`);
      console.log(`   Creado: ${user.created_at}`);
    });
    console.log('\n' + '='.repeat(100));

    // Verificar datos en api_usage
    const usageResult = await pool.query(`
      SELECT user_id, COUNT(*) as total
      FROM api_usage
      GROUP BY user_id
    `);

    console.log('\n📊 DATOS EN API_USAGE POR USER_ID:\n');
    usageResult.rows.forEach(row => {
      console.log(`User ID: ${row.user_id} - Total registros: ${row.total}`);
    });

    // Buscar usuario específico
    const targetUser = await pool.query(`
      SELECT id, email, full_name 
      FROM users 
      WHERE email = 'smhernandez2@espe.edu.ec'
    `);

    if (targetUser.rows.length > 0) {
      console.log('\n✅ USUARIO AUTENTICADO ENCONTRADO:');
      console.log(`   ID:     ${targetUser.rows[0].id}`);
      console.log(`   Email:  ${targetUser.rows[0].email}`);
      console.log(`   Nombre: ${targetUser.rows[0].full_name}`);
    } else {
      console.log('\n⚠️  Usuario smhernandez2@espe.edu.ec NO encontrado');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

getUserId();
