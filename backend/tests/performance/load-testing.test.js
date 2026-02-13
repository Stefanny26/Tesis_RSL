/**
 * 📊 PRUEBAS DE CARGA - VOLUMEN Y ESCALABILIDAD
 * Simula cargas reales de trabajo con múltiples proyectos simultáneos
 */

const { performance } = require('perf_hooks');
const request = require('supertest');
const app = require('../../src/server');

describe('📊 Load Testing - Escalabilidad', () => {

  describe('🚀 Carga Concurrente - Múltiples Usuarios', () => {
    test('Debe soportar 10 usuarios concurrentes creando proyectos', async () => {
      const concurrentUsers = 10;
      const projects = Array.from({ length: concurrentUsers }, (_, i) => ({
        title: `Concurrent Project ${i + 1}`,
        description: `Load test project ${i + 1}`,
        type: 'systematic_review'
      }));

      const startTime = performance.now();

      // Simular autenticación para cada usuario
      const authPromises = projects.map(async (_, i) => {
        const authRes = await request(app)
          .post('/api/auth/register')
          .send({
            name: `LoadTest User ${i + 1}`,
            email: `loadtest${i + 1}@test.com`,
            password: 'LoadTest123!'
          });
        return authRes.body.token;
      });

      const tokens = await Promise.all(authPromises);

      // Crear proyectos concurrentemente
      const projectPromises = projects.map(async (project, i) => {
        const res = await request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${tokens[i]}`)
          .send(project);
        return res;
      });

      const results = await Promise.all(projectPromises);
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;

      // Validaciones
      expect(results.every(res => res.status === 201)).toBe(true);
      expect(duration).toBeLessThan(15); // Menos de 15 segundos para 10 usuarios

      console.log(`📊 10 usuarios concurrentes: ${duration.toFixed(2)}s`);
      console.log(`⚡ Promedio por usuario: ${(duration / concurrentUsers).toFixed(2)}s`);
    });
  });

  describe('📈 Volumen de Referencias - Cribado Masivo', () => {
    test('Debe procesar 100 referencias en <5 minutos', async () => {
      // Generar 100 referencias sintéticas
      const references = Array.from({ length: 100 }, (_, i) => ({
        title: `Reference ${i + 1}: Performance Analysis of System X`,
        abstract: `This study No. ${i + 1} presents a comprehensive analysis of performance metrics in distributed systems. The research methodology includes experimental evaluation and statistical analysis of throughput, latency, and scalability factors.`,
        authors: `Author${i + 1}, A., Author${i + 2}, B.`,
        year: 2020 + (i % 5),
        source: `Journal${i % 10 + 1}`,
        doi: `10.1000/test.${i + 1}`
      }));

      const criteria = {
        inclusionCriteria: [
          'Performance analysis',
          'Distributed systems', 
          'Experimental evaluation',
          'Statistical analysis'
        ],
        exclusionCriteria: [
          'Theoretical only',
          'Opinion papers',
          'Non-peer reviewed'
        ],
        researchQuestion: 'What are the performance characteristics of distributed systems?'
      };

      const ScreenReferencesWithAIUseCase = require('../../src/domain/use-cases/screen-references-with-ai.use-case');
      const screeningUseCase = new ScreenReferencesWithAIUseCase();

      const startTime = performance.now();

      // Procesar en lotes de 10 para optimizar
      const batchSize = 10;
      const results = [];
      
      for (let i = 0; i < references.length; i += batchSize) {
        const batch = references.slice(i, i + batchSize);
        
        const batchResult = await screeningUseCase.executeBatch({
          references: batch,
          ...criteria
        });
        
        results.push(...batchResult.data);
        
        // Log progreso
        console.log(`📊 Procesadas ${Math.min(i + batchSize, references.length)}/100 referencias`);
      }

      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;

      // Validaciones de rendimiento
      expect(duration).toBeLessThan(300); // Menos de 5 minutos
      expect(results).toHaveLength(100);
      
      const refsPerMinute = (references.length / duration) * 60;
      expect(refsPerMinute).toBeGreaterThan(20); // Al menos 20 refs/minuto

      // Análisis de resultados
      const included = results.filter(r => r.data.decision === 'incluida').length;
      const excluded = results.filter(r => r.data.decision === 'excluida').length;
      const manual = results.filter(r => r.data.decision === 'revisar_manual').length;

      console.log(`📊 Cribado completado en ${duration.toFixed(1)}s`);
      console.log(`⚡ Velocidad: ${refsPerMinute.toFixed(1)} refs/minuto`);
      console.log(`📈 Resultados: ${included} incluidas, ${excluded} excluidas, ${manual} revisión manual`);
    });
  });

  describe('🔄 Stress Testing - Límites del Sistema', () => {
    test('Debe manejar picos de carga sin fallos', async () => {
      const iterations = 25;
      const failureThreshold = 0.05; // Máximo 5% de fallos aceptable
      
      const tasks = Array.from({ length: iterations }, async (_, i) => {
        try {
          const startTime = performance.now();
          
          // Simular carga mixta
          const taskType = i % 3;
          let result;
          
          if (taskType === 0) {
            // Generación de protocolo
            const GenerateProtocolAnalysisUseCase = require('../../src/domain/use-cases/generate-protocol-analysis.use-case');
            const useCase = new GenerateProtocolAnalysisUseCase();
            result = await useCase.execute({
              title: `Stress Test ${i}`,
              description: 'Stress testing load',
              area: 'Computer Science'
            });
          } else if (taskType === 1) {
            // Cribado
            const ScreenReferencesWithAIUseCase = require('../../src/domain/use-cases/screen-references-with-ai.use-case');
            const useCase = new ScreenReferencesWithAIUseCase();
            result = await useCase.execute({
              reference: {
                title: `Stress Reference ${i}`,
                abstract: 'Stress test abstract'
              },
              inclusionCriteria: ['Test'],
              exclusionCriteria: ['Exclude'],
              researchQuestion: 'Test question?'
            });
          } else {
            // Validación PRISMA 
            const { buildValidationPrompt } = require('../../src/config/prisma-validation-prompts');
            result = buildValidationPrompt(1, `Test content ${i}`);
          }
          
          const endTime = performance.now();
          
          return {
            success: true,
            duration: endTime - startTime,
            taskType,
            iteration: i
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            taskType,
            iteration: i
          };
        }
      });

      const results = await Promise.allSettled(tasks);
      const completedTasks = results.map(r => r.value || { success: false });
      
      const successful = completedTasks.filter(t => t.success).length;
      const failed = completedTasks.filter(t => !t.success).length;
      const failureRate = failed / iterations;

      expect(failureRate).toBeLessThan(failureThreshold);
      expect(successful).toBeGreaterThan(iterations * 0.95); // Al menos 95% éxito

      const avgDuration = completedTasks
        .filter(t => t.success && t.duration)
        .reduce((sum, t) => sum + t.duration, 0) / successful / 1000;

      console.log(`💪 Stress test completado:`);
      console.log(`✅ Exitosos: ${successful}/${iterations} (${(successful/iterations*100).toFixed(1)}%)`);
      console.log(`❌ Fallos: ${failed}/${iterations} (${(failureRate*100).toFixed(1)}%)`);
      console.log(`⏱️ Tiempo promedio: ${avgDuration.toFixed(2)}s`);
    });
  });

  describe('💾 Uso de Memoria - Memory Profiling', () => {
    test('Debe mantener uso de memoria <500MB durante operación sostenida', async () => {
      const initialMemory = process.memoryUsage();
      console.log(`🔍 Memoria inicial: ${(initialMemory.rss / 1024 / 1024).toFixed(1)}MB`);

      // Simular 50 operaciones consecutivas
      for (let i = 0; i < 50; i++) {
        const GenerateProtocolAnalysisUseCase = require('../../src/domain/use-cases/generate-protocol-analysis.use-case');
        const useCase = new GenerateProtocolAnalysisUseCase();
        
        await useCase.execute({
          title: `Memory Test ${i}`,
          description: 'Memory usage testing',
          area: 'Computer Science'
        });

        // Forzar garbage collection si está disponible
        if (global.gc) {
          global.gc();
        }

        // Medir memoria cada 10 operaciones
        if (i % 10 === 0) {
          const currentMemory = process.memoryUsage();
          const rssInMB = currentMemory.rss / 1024 / 1024;
          console.log(`📊 Operación ${i}: ${rssInMB.toFixed(1)}MB`);
        }
      }

      const finalMemory = process.memoryUsage();
      const finalRssInMB = finalMemory.rss / 1024 / 1024;
      const memoryIncrease = finalRssInMB - (initialMemory.rss / 1024 / 1024);

      console.log(`🔍 Memoria final: ${finalRssInMB.toFixed(1)}MB`);
      console.log(`📈 Incremento: ${memoryIncrease.toFixed(1)}MB`);

      // No debe exceder 500MB de uso total
      expect(finalRssInMB).toBeLessThan(500);
      
      // El incremento no debe ser excesivo (< 100MB para 50 operaciones)
      expect(memoryIncrease).toBeLessThan(100);
    });
  });
});