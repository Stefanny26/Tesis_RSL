/**
 * Setup de Jest para tests de integración
 */

// Timeout global para tests (30 segundos)
jest.setTimeout(30000);

// Mock de variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-12345678901234567890';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

// Mock de servicios externos si es necesario
beforeAll(() => {
  console.log('🧪 Iniciando suite de tests...');
});

afterAll(() => {
  console.log('✅ Tests completados');
});

// Helpers globales
global.testHelpers = {
  /**
   * Genera datos de prueba para un proyecto RSL
   */
  generateTestProject() {
    return {
      title: `Test Project ${Date.now()}`,
      description: 'Automated test project',
      type: 'systematic_review'
    };
  },

  /**
   * Genera protocolo PICO de prueba
   */
  generateTestProtocol() {
    return {
      refinedQuestion: '¿Cuál es el impacto de X en Y?',
      population: 'Estudios sobre X',
      intervention: 'Técnica X',
      comparison: 'No específica',
      outcomes: 'Métrica Y',
      researchQuestions: [
        'RQ1: ¿Pregunta 1?',
        'RQ2: ¿Pregunta 2?',
        'RQ3: ¿Pregunta 3?'
      ],
      inclusionCriteria: ['Criterio 1', 'Criterio 2'],
      exclusionCriteria: ['Criterio 1', 'Criterio 2'],
      databases: [
        { name: 'Scopus', query: 'test query' }
      ]
    };
  },

  /**
   * Genera referencia de prueba
   */
  generateTestReference() {
    return {
      title: 'Test Article Title',
      authors: 'Test Author et al.',
      year: 2024,
      journal: 'Test Journal',
      abstract: 'This is a test abstract for automated testing.',
      doi: '10.1000/test.2024.001'
    };
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection en:', promise, 'reason:', reason);
});

module.exports = {};
