/**
 * 📊 SCRIPT PARA EJECUTAR TODAS LAS PRUEBAS DE RENDIMIENTO
 * Genera reporte completo de métricas del sistema
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PerformanceTestRunner {
  constructor() {
    this.results = {};
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🚀 INICIANDO SUITE COMPLETA DE PRUEBAS DE RENDIMIENTO\n');
    
    try {
      // 1. Tests de Prompts IA
      console.log('📝 Ejecutando: Pruebas de Prompts IA...');
      await this.runTest('prompts-ai.test.js');
      
      // 2. Tests de Carga
      console.log('📊 Ejecutando: Pruebas de Carga...');
      await this.runTest('load-testing.test.js');
      
      // 3. Tests de Integración (existentes)
      console.log('🔄 Ejecutando: Pruebas de Integración...');
      await this.runTest('../integration/full-flow.test.js');
      
      // Generar reporte
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Error en las pruebas:', error.message);
      process.exit(1);
    }
  }

  async runTest(testFile) {
    try {
      const command = `npm test -- ${testFile} --verbose --detectOpenHandles`;
      const output = execSync(command, { 
        cwd: path.join(__dirname, '../..'),
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      this.results[testFile] = {
        status: 'PASSED',
        output: output,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ ${testFile} - COMPLETADO\n`);
    } catch (error) {
      this.results[testFile] = {
        status: 'FAILED',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      console.log(`❌ ${testFile} - FALLÓ\n`);
    }
  }

  generateReport() {
    const endTime = Date.now();
    const totalDuration = (endTime - this.startTime) / 1000;
    
    const report = {
      metadata: {
        timestamp: new Date().toISOString(),
        duration_seconds: totalDuration,
        node_version: process.version,
        platform: process.platform,
        memory_usage: process.memoryUsage()
      },
      summary: {
        total_tests: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r.status === 'PASSED').length,
        failed: Object.values(this.results).filter(r => r.status === 'FAILED').length
      },
      results: this.results,
      performance_metrics: this.extractMetrics()
    };

    // Guardar reporte
    const reportPath = path.join(__dirname, `../reports/performance-report-${Date.now()}.json`);
    
    // Crear directorio si no existe
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Mostrar resumen en consola
    this.printSummary(report);
    
    console.log(`\n📄 Reporte completo guardado en: ${reportPath}`);
  }

  extractMetrics() {
    // Extraer métricas específicas del output de los tests
    const metrics = {};
    
    Object.entries(this.results).forEach(([testFile, result]) => {
      if (result.status === 'PASSED' && result.output) {
        // Buscar patrones de métricas en el output
        const patterns = {
          response_time: /📊.*?(\d+\.?\d*)[ms|s]/g,
          throughput: /(\d+\.?\d*)\s*refs\/(?:segundo|minuto)/g,
          cost: /\$(\d+\.?\d*)/g,
          memory: /(\d+\.?\d*)MB/g
        };
        
        Object.entries(patterns).forEach(([metric, pattern]) => {
          const matches = [...result.output.matchAll(pattern)];
          if (matches.length > 0) {
            metrics[`${testFile}_${metric}`] = matches.map(m => parseFloat(m[1]));
          }
        });
      }
    });
    
    return metrics;
  }

  printSummary(report) {
    console.log('\n📊 RESUMEN DE PRUEBAS DE RENDIMIENTO');
    console.log('═'.repeat(50));
    console.log(`🕒 Duración total: ${report.metadata.duration_seconds.toFixed(2)}s`);
    console.log(`✅ Tests exitosos: ${report.summary.passed}/${report.summary.total_tests}`);
    console.log(`❌ Tests fallidos: ${report.summary.failed}/${report.summary.total_tests}`);
    
    if (report.summary.failed === 0) {
      console.log('\n🎉 TODOS LOS TESTS DE RENDIMIENTO PASARON');
    } else {
      console.log(`\n⚠️  ${report.summary.failed} tests fallaron - Revisar detalles`);
    }
    
    // Mostrar métricas clave si están disponibles
    if (Object.keys(report.performance_metrics).length > 0) {
      console.log('\n📈 MÉTRICAS DESTACADAS:');
      Object.entries(report.performance_metrics).forEach(([metric, values]) => {
        if (values.length > 0) {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          console.log(`   ${metric}: ${avg.toFixed(2)} (promedio)`);
        }
      });
    }
    
    console.log('\n💾 Uso de memoria:');
    const mem = report.metadata.memory_usage;
    console.log(`   RSS: ${(mem.rss / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   Heap usado: ${(mem.heapUsed / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   Heap total: ${(mem.heapTotal / 1024 / 1024).toFixed(1)}MB`);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const runner = new PerformanceTestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = PerformanceTestRunner;