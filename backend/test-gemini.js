// Test para listar modelos disponibles en Gemini
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY no encontrada en .env');
    return;
  }
  
  console.log('✅ API Key encontrada:', apiKey.substring(0, 15) + '...\n');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Intentar listar modelos disponibles
    console.log('📋 Listando modelos disponibles...\n');
    
    // Probar con fetch directo a la API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Modelos disponibles:');
      data.models?.forEach((model) => {
        console.log(`\n   📦 ${model.name}`);
        console.log(`      Versión: ${model.version || 'N/A'}`);
        console.log(`      Display: ${model.displayName || 'N/A'}`);
        console.log(`      Métodos: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      });
    } else {
      console.log('❌ Error al listar modelos:', response.statusText);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n\n🧪 Probando modelos específicos...\n');
  
  // Probar modelos comunes
  const modelsToTry = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'models/gemini-pro',
    'models/gemini-1.5-pro',
    'models/gemini-1.5-flash',
    'models/gemini-1.5-pro-latest'
  ];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`\n🔍 Probando: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent('Responde solo: OK');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ¡FUNCIONA! Modelo: ${modelName}`);
      console.log(`   Respuesta: ${text}`);
      console.log('\n⭐ USA ESTE MODELO EN TU CÓDIGO ⭐\n');
      break;
    } catch (error) {
      console.log(`❌ Error con ${modelName}`);
      console.log(`   ${error.message.substring(0, 100)}...`);
    }
  }
}

listAvailableModels();
