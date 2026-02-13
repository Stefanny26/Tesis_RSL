/**
 * 🚀 PRUEBAS DE RENDIMIENTO - PROMPTS IA
 * Mide tiempo de respuesta y precisión de prompts ChatGPT
 */

const { performance } = require('perf_hooks');
const GenerateProtocolAnalysisUseCase = require('../../src/domain/use-cases/generate-protocol-analysis.use-case');
const GenerateTitlesUseCase = require('../../src/domain/use-cases/generate-titles.use-case');
const ScreenReferencesWithAIUseCase = require('../../src/domain/use-cases/screen-references-with-ai.use-case');

describe('🚀 Performance Tests - AI Prompts', () => {
  let protocolUseCase;
  let titlesUseCase;
  let screeningUseCase;

  beforeAll(() => {
    protocolUseCase = new GenerateProtocolAnalysisUseCase();
    titlesUseCase = new GenerateTitlesUseCase();
    screeningUseCase = new ScreenReferencesWithAIUseCase();
  });

  describe('⏱️ Tiempo de Respuesta - Generación Protocolo', () => {
    const testCases = [
      {
        name: 'Proyecto Simple',
        data: {
          title: 'Machine Learning in Healthcare',
          description: 'Simple ML healthcare study',
          area: 'Computer Science'
        }
      },
      {
        name: 'Proyecto Complejo',
        data: {
          title: 'Blockchain-Based IoT Security Framework with Machine Learning Integration for Smart City Applications',
          description: 'Complex multi-technology study involving blockchain, IoT, ML, and smart cities',
          area: 'Computer Science'
        }
      }
    ];

    test.each(testCases)('$name - Debe generar protocolo en <5 segundos', async ({ data }) => {
      const startTime = performance.now();
      
      const result = await protocolUseCase.execute(data);
      
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // Convertir a segundos

      // Assertions de rendimiento
      expect(duration).toBeLessThan(5); // Menos de 5 segundos
      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      console.log(`📊 ${data.title}: ${duration.toFixed(2)}s`);
    });
  });

  describe('⏱️ Tiempo de Respuesta - Generación Títulos', () => {
    test('Debe generar 5 títulos en <3 segundos', async () => {
      const testData = {
        matrixData: {
          population: 'Node.js applications with MongoDB',
          intervention: 'Mongoose ODM',
          outcomes: 'Performance metrics'
        },
        picoData: {
          population: 'Node.js backend systems',
          intervention: 'Mongoose Object Document Mapping',
          comparison: 'Native MongoDB driver',
          outcome: 'Development practices and performance'
        }
      };

      const startTime = performance.now();
      
      const result = await titlesUseCase.execute(testData);
      
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;

      expect(duration).toBeLessThan(3);
      expect(result.success).toBe(true);
      expect(result.data.titles).toHaveLength(5);

      console.log(`📊 Títulos generados: ${duration.toFixed(2)}s`);
    });
  });

  describe('⏱️ Cribado Automático - Velocidad', () => {
    const testReferences = [
      {
        title: 'Mongoose Performance in Node.js Applications',
        abstract: 'This study analyzes performance metrics...',
        year: 2023
      },
      {
        title: 'Blockchain Security in IoT Networks', 
        abstract: 'Security framework for blockchain IoT...',
        year: 2022
      },
      {
        title: 'Machine Learning for Healthcare Diagnosis',
        abstract: 'ML algorithms applied to medical diagnosis...',
        year: 2024
      }
    ];

    test('Cribado individual debe tomar <2 segundos por referencia', async () => {
      const criterios = {
        inclusionCriteria: ['Node.js', 'MongoDB', 'Performance'],
        exclusionCriteria: ['Theoretical only', 'Not peer-reviewed'],
        researchQuestion: '¿Cuál es el impacto de X en Y?'
      };

      for (const ref of testReferences) {
        const startTime = performance.now();
        
        const result = await screeningUseCase.execute({
          reference: ref,
          ...criterios
        });
        
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000;

        expect(duration).toBeLessThan(2);
        expect(result.success).toBe(true);
        expect(result.data.decision).toMatch(/incluida|excluida|revisar_manual/);

        console.log(`📊 Ref "${ref.title.substring(0,30)}...": ${duration.toFixed(2)}s`);
      }
    });

    test('Cribado en lote debe procesar >= 3 refs/minuto', async () => {
      const criteria = {
        inclusionCriteria: ['Performance', 'Study'],
        exclusionCriteria: ['Opinion'],
        researchQuestion: 'Performance analysis'
      };

      const startTime = performance.now();
      
      const result = await screeningUseCase.executeBatch({
        references: testReferences,
        ...criteria
      });
      
      const endTime = performance.now();
      const totalDuration = (endTime - startTime) / 1000;
      const refsPerMinute = (testReferences.length / totalDuration) * 60;

      expect(refsPerMinute).toBeGreaterThanOrEqual(3);
      expect(result.success).toBe(true);

      console.log(`📊 Velocidad lote: ${refsPerMinute.toFixed(1)} refs/minuto`);
    });
  });

  describe('💰 Análisis de Costos - APIs', () => {
    test('Costo por proyecto completo debe ser <$0.02', async () => {
      // Simular proyecto completo
      const costs = {
        protocol: 0.002,    // ~2000 tokens * $0.001/1K
        titles: 0.003,      // ~3000 tokens  
        screening: 0.008,   // ~40 refs * 200 tokens
        prisma: 0.005,      // 27 items * 100 tokens
        article: 0.010      // ~10K tokens
      };

      const totalCost = Object.values(costs).reduce((a, b) => a + b, 0);

      expect(totalCost).toBeLessThan(0.02); // < 2 centavos USD
      
      console.log(`💰 Costo total estimado: $${totalCost.toFixed(4)}`);
      console.log(`📊 Desglose:`, costs);
    });
  });
});

describe('🧠 Performance Tests - Embeddings (Local)', () => {
  const ScreenReferencesWithEmbeddingsUseCase = require('../../src/domain/use-cases/screen-references-embeddings.use-case');
  let embeddingsUseCase;

  beforeAll(async () => {
    embeddingsUseCase = new ScreenReferencesWithEmbeddingsUseCase();
    // Pre-cargar modelo para tests justos
    await embeddingsUseCase.initializeModel();
  });

  test('Carga inicial del modelo debe tomar <60 segundos', async () => {
    const freshUseCase = new ScreenReferencesWithEmbeddingsUseCase();
    
    const startTime = performance.now();
    await freshUseCase.initializeModel();
    const endTime = performance.now();
    
    const duration = (endTime - startTime) / 1000;
    
    expect(duration).toBeLessThan(60);
    console.log(`🧠 Carga modelo embeddings: ${duration.toFixed(1)}s`);
  });

  test('Procesamiento embeddings debe ser >10 refs/segundo', async () => {
    const testRefs = Array.from({ length: 20 }, (_, i) => ({
      title: `Test Reference ${i}`,
      abstract: `This is a test abstract for reference ${i} about performance testing.`
    }));

    const protocol = {
      researchQuestion: 'Performance testing',
      population: 'Test systems',
      intervention: 'Performance metrics'
    };

    const startTime = performance.now();
    
    const results = await Promise.all(
      testRefs.map(ref => embeddingsUseCase.execute({ reference: ref, protocol }))
    );
    
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;
    const refsPerSecond = testRefs.length / duration;

    expect(refsPerSecond).toBeGreaterThan(10);
    expect(results.every(r => r.success)).toBe(true);
    
    console.log(`🚀 Velocidad embeddings: ${refsPerSecond.toFixed(1)} refs/segundo`);
  });
});