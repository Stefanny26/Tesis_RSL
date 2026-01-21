#!/usr/bin/env node

/**
 * Script de post-instalación para Railway
 * Se ejecuta automáticamente después de npm install
 */

console.log('\n🚀 Configurando aplicación para Railway...\n');

// Verificar que las variables de entorno necesarias estén presentes
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SESSION_SECRET',
  'OPENAI_API_KEY'
];

const missing = requiredEnvVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.warn('⚠️  Variables de entorno faltantes:');
  missing.forEach(varName => console.warn(`   - ${varName}`));
  console.warn('\n📝 Configúralas en Railway Dashboard → Variables\n');
}

// Verificar conexión a base de datos
if (process.env.DATABASE_URL) {
  console.log('✅ DATABASE_URL configurada');
  console.log('ℹ️  Recuerda ejecutar las migraciones SQL');
  console.log('   Ver: DEPLOYMENT.md sección 2.5\n');
} else {
  console.warn('❌ DATABASE_URL no encontrada');
  console.warn('   Agrega PostgreSQL desde Railway Dashboard\n');
}

// Instalar dependencias de Python si está disponible
console.log('🐍 Verificando dependencias de Python...');
const { exec } = require('child_process');
const fs = require('fs');

if (fs.existsSync('requirements.txt')) {
  exec('pip3 --version', (error, stdout, stderr) => {
    if (error) {
      console.warn('⚠️  pip3 no encontrado, saltando instalación de dependencias Python');
      console.warn('   Las funciones de gráficos pueden no estar disponibles');
    } else {
      console.log('✅ pip3 encontrado');
      console.log('📦 Instalando dependencias Python...');
      exec('pip3 install -r requirements.txt', (error, stdout, stderr) => {
        if (error) {
          console.warn('⚠️  Error instalando dependencias Python:', error.message);
        } else {
          console.log('✅ Dependencias Python instaladas correctamente');
        }
      });
    }
  });
} else {
  console.warn('⚠️  requirements.txt no encontrado');
}

console.log('✅ Setup completado\n');
