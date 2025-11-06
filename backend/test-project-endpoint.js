const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
const PROJECT_ID = '80349723-e4aa-4ac7-baf9-0ab821c1a27d';

async function testGetProject() {
  try {
    // Primero necesitamos obtener un token válido
    console.log('🔍 Obteniendo proyecto con ID:', PROJECT_ID);
    
    // Nota: Necesitas un token JWT válido. Puedes obtenerlo de las cookies del navegador
    // o de localStorage después de hacer login
    
    const response = await axios.get(`${API_URL}/projects/${PROJECT_ID}`, {
      headers: {
        'Authorization': 'Bearer TU_TOKEN_AQUI' // Reemplaza con un token real
      }
    });
    
    console.log('\n✅ Proyecto obtenido:');
    console.log('Título:', response.data.data.project.title);
    console.log('Descripción:', response.data.data.project.description);
    
    if (response.data.data.project.protocol) {
      console.log('\n📋 Protocolo encontrado:');
      console.log('- Título propuesto:', response.data.data.project.protocol.proposedTitle || 'No definido');
      console.log('- Evaluación inicial:', response.data.data.project.protocol.evaluationInitial ? 'Sí' : 'No');
      console.log('- Marco PICO:', response.data.data.project.protocol.picoFramework ? 'Sí' : 'No');
      console.log('- Términos clave:', response.data.data.project.protocol.keyTerms ? 'Sí' : 'No');
      console.log('- Criterios:', (response.data.data.project.protocol.inclusionCriteria?.length || 0) + (response.data.data.project.protocol.exclusionCriteria?.length || 0) + ' total');
      console.log('- Estrategia de búsqueda:', response.data.data.project.protocol.searchStrategy ? 'Sí' : 'No');
      console.log('- PRISMA compliance:', response.data.data.project.protocol.prismaCompliance?.length || 0, 'items');
    } else {
      console.log('\n⚠️ No se encontró protocolo asociado');
    }
    
    console.log('\n📊 Respuesta completa (JSON):');
    console.log(JSON.stringify(response.data.data.project.protocol, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

console.log('🚀 Probando endpoint GET /api/projects/:id\n');
console.log('⚠️ IMPORTANTE: Debes reemplazar TU_TOKEN_AQUI con un token JWT válido');
console.log('   Puedes obtenerlo de las cookies del navegador después de hacer login\n');

// testGetProject();

console.log('\n💡 Para usar este script:');
console.log('1. Abre las DevTools en el navegador (F12)');
console.log('2. Ve a Application > Cookies > localhost:3000');
console.log('3. Copia el valor de "token"');
console.log('4. Reemplaza "TU_TOKEN_AQUI" en línea 14 con ese token');
console.log('5. Descomenta la línea 48 (testGetProject())');
console.log('6. Ejecuta: node test-project-endpoint.js\n');
