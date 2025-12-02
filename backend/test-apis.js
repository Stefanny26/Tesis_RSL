/**
 * Script para verificar el estado de las API keys de Gemini y ChatGPT
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

async function testGemini() {
  console.log('\n🔍 Probando Gemini API...');
  console.log(`API Key: ${process.env.GEMINI_API_KEY?.substring(0, 20)}...`);
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const result = await model.generateContent('Di "Hola" en una palabra');
    const text = result.response.text();
    
    console.log('✅ Gemini FUNCIONANDO');
    console.log(`   Respuesta: ${text}`);
    return true;
  } catch (error) {
    console.log('❌ Gemini FALLANDO');
    console.log(`   Error: ${error.message}`);
    
    // Extraer el tiempo de espera si está disponible
    if (error.message.includes('retry in')) {
      const match = error.message.match(/retry in ([\d.]+)s/);
      if (match) {
        console.log(`   ⏱️  Reintenta en: ${Math.ceil(parseFloat(match[1]))} segundos`);
      }
    }
    return false;
  }
}

async function testChatGPT() {
  console.log('\n🔍 Probando ChatGPT API...');
  console.log(`API Key: ${process.env.OPENAI_API_KEY?.substring(0, 20)}...`);
  
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Di "Hola" en una palabra' }],
      max_tokens: 10
    });
    
    const text = response.choices[0].message.content;
    
    console.log('✅ ChatGPT FUNCIONANDO');
    console.log(`   Respuesta: ${text}`);
    console.log(`   Uso: ${response.usage.total_tokens} tokens`);
    return true;
  } catch (error) {
    console.log('❌ ChatGPT FALLANDO');
    console.log(`   Error: ${error.message}`);
    
    if (error.status === 429) {
      console.log(`   💰 Necesitas agregar créditos en: https://platform.openai.com/account/billing`);
      console.log(`   💵 Mínimo: $5 USD`);
    }
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 PRUEBA DE APIS - GEMINI Y CHATGPT');
  console.log('═══════════════════════════════════════════════════════');
  
  const geminiOk = await testGemini();
  const chatgptOk = await testChatGPT();
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 RESUMEN:');
  console.log(`   Gemini:  ${geminiOk ? '✅ OK' : '❌ FALLA'}`);
  console.log(`   ChatGPT: ${chatgptOk ? '✅ OK' : '❌ FALLA'}`);
  console.log('═══════════════════════════════════════════════════════');
  
  if (!geminiOk && !chatgptOk) {
    console.log('\n⚠️  AMBAS APIs ESTÁN FALLANDO');
    console.log('');
    console.log('📝 SOLUCIONES:');
    console.log('');
    console.log('1️⃣  GEMINI (más rápido):');
    console.log('    - Si dice "retry in Xs": Espera esos segundos y vuelve a probar');
    console.log('    - Si dice "quota exceeded": Crea nueva API key en https://aistudio.google.com/app/apikey');
    console.log('');
    console.log('2️⃣  CHATGPT:');
    console.log('    - Agrega $5 USD en: https://platform.openai.com/account/billing');
    console.log('    - Verificar uso actual en: https://platform.openai.com/usage');
    console.log('');
  } else if (!geminiOk) {
    console.log('\n⚠️  Solo Gemini está fallando, ChatGPT funcionará como fallback');
  } else if (!chatgptOk) {
    console.log('\n⚠️  Solo ChatGPT está fallando, Gemini funcionará como primario');
  } else {
    console.log('\n🎉 ¡AMBAS APIs FUNCIONANDO! El sistema está listo.');
  }
  
  console.log('');
}

main();
