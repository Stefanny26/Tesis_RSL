#!/usr/bin/env node

/**
 * Generador de Secrets Seguros para Producción
 * Ejecutar: node generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generando secrets seguros para producción...\n');
console.log('═'.repeat(60));

// Generar JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('\n📝 JWT_SECRET:');
console.log(jwtSecret);

// Generar Session Secret
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('\n📝 SESSION_SECRET:');
console.log(sessionSecret);

console.log('\n' + '═'.repeat(60));
console.log('\n✅ Secrets generados exitosamente!');
console.log('\n📋 Copia estos valores a Railway Dashboard:');
console.log('   Variables → Add Variable\n');

console.log('⚠️  IMPORTANTE:');
console.log('   - NO compartas estos valores');
console.log('   - NO los subas a GitHub');
console.log('   - Guárdalos en un lugar seguro\n');
