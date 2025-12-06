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

console.log('✅ Setup completado\n');
