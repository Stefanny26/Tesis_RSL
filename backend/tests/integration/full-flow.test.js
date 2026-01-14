/**
 * Tests de Integración: Flujo completo RSL
 * Protocolo → Cribado → PRISMA → Artículo
 */

const request = require('supertest');
const app = require('../src/server');
const Database = require('../src/infrastructure/database/database');

describe('Flujo Completo de RSL', () => {
  let authToken;
  let projectId;
  let userId;

  beforeAll(async () => {
    // Setup: Inicializar BD de prueba
    await Database.query('BEGIN');
  });

  afterAll(async () => {
    // Cleanup: Rollback cambios
    await Database.query('ROLLBACK');
    await Database.close();
  });

  describe('1. Autenticación', () => {
    it('debe registrar un nuevo usuario', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@rsl.com',
          password: 'TestPass123!'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      authToken = res.body.token;
      userId = res.body.user.id;
    });

    it('debe autenticar usuario existente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@rsl.com',
          password: 'TestPass123!'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('2. Fase de Protocolo', () => {
    it('debe crear un nuevo proyecto RSL', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test RSL: IoT Security',
          description: 'Caso de prueba automatizado'
        });

      expect(res.status).toBe(201);
      expect(res.body.project).toHaveProperty('id');
      projectId = res.body.project.id;
    });

    it('debe crear protocolo PICO', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/protocol`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          refinedQuestion: '¿Cuál es el impacto de técnicas de ciberseguridad en IoT?',
          population: 'Estudios sobre IoT',
          intervention: 'Técnicas de ciberseguridad',
          comparison: 'No específica',
          outcomes: 'Tasa de incidentes, tiempo de respuesta',
          researchQuestions: [
            'RQ1: ¿Qué técnicas se aplican?',
            'RQ2: ¿Cómo se gestionan vulnerabilidades?',
            'RQ3: ¿Qué evidencia hay sobre efectividad?'
          ],
          inclusionCriteria: ['IoT', 'Seguridad', '2023-2025'],
          exclusionCriteria: ['No empíricos', 'Sin acceso'],
          databases: [{ name: 'Scopus', query: 'IoT AND security' }]
        });

      expect(res.status).toBe(201);
      expect(res.body.protocol).toHaveProperty('id');
    });

    it('debe generar cadenas de búsqueda con IA', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/protocol/generate-search-queries`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          databases: ['Scopus', 'IEEE Xplore', 'ACM']
        });

      expect(res.status).toBe(200);
      expect(res.body.queries).toHaveLength(3);
      expect(res.body.queries[0]).toHaveProperty('database');
      expect(res.body.queries[0]).toHaveProperty('query');
    });
  });

  describe('3. Fase de Búsqueda y Cribado', () => {
    it('debe importar referencias desde BibTeX', async () => {
      const bibContent = `@article{test2024,
        title={IoT Security Framework},
        author={Test Author},
        year={2024},
        journal={Test Journal}
      }`;

      const res = await request(app)
        .post(`/api/projects/${projectId}/references/import`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('format', 'bibtex')
        .attach('file', Buffer.from(bibContent), 'test.bib');

      expect(res.status).toBe(200);
      expect(res.body.imported).toBeGreaterThan(0);
    });

    it('debe detectar duplicados automáticamente', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/references/detect-duplicates`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('duplicates');
    });

    it('debe realizar cribado híbrido (Embeddings + IA)', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/screening/hybrid`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          threshold: 0.15,
          useAI: true
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('phase1Results');
      expect(res.body).toHaveProperty('phase2Results');
      expect(res.body.summary).toHaveProperty('included');
      expect(res.body.summary).toHaveProperty('excluded');
    });
  });

  describe('4. Fase PRISMA', () => {
    it('debe generar 27 ítems PRISMA automáticamente', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/prisma/generate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.itemsGenerated).toBe(27);
    });

    it('debe obtener estadísticas de cumplimiento PRISMA', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/prisma/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('completed');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('percentage');
    });

    it('debe validar ítem PRISMA con IA gatekeeper', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/prisma/1/validate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is a systematic review of IoT security techniques.'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('decision');
      expect(res.body).toHaveProperty('score');
      expect(['APROBADO', 'NECESITA_MEJORAS', 'RECHAZADO']).toContain(res.body.decision);
    });
  });

  describe('5. Fase de Extracción RQS', () => {
    it('debe extraer datos RQS de referencias incluidas', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/rqs/extract`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('extracted');
      expect(res.body.extracted).toBeGreaterThan(0);
    });

    it('debe obtener estadísticas RQS', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/rqs/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('studyTypes');
      expect(res.body).toHaveProperty('technologies');
    });
  });

  describe('6. Fase de Generación de Artículo', () => {
    it('debe generar artículo científico completo', async () => {
      const res = await request(app)
        .post(`/api/projects/${projectId}/article/generate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.article).toHaveProperty('title');
      expect(res.body.article).toHaveProperty('abstract');
      expect(res.body.article).toHaveProperty('introduction');
      expect(res.body.article).toHaveProperty('methods');
      expect(res.body.article).toHaveProperty('results');
      expect(res.body.article).toHaveProperty('discussion');
      expect(res.body.article).toHaveProperty('conclusions');
      expect(res.body.article.metadata.wordCount).toBeGreaterThan(3000);
    });

    it('debe exportar artículo a PDF', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/article/export/pdf`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
    });

    it('debe exportar artículo a DOCX', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/article/export/docx`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });

    it('debe exportar artículo a LaTeX', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/article/export/latex`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/x-latex');
      expect(res.text).toContain('\\documentclass');
    });
  });

  describe('7. Métricas del Sistema', () => {
    it('debe calcular ahorro de tiempo vs manual', async () => {
      const res = await request(app)
        .get(`/api/projects/${projectId}/metrics`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('timeSaved');
      expect(res.body).toHaveProperty('efficiencyPercentage');
      expect(res.body.efficiencyPercentage).toBeGreaterThan(90);
    });
  });
});

/**
 * Tests de regresión para bugs corregidos
 */
describe('Regresión: Bugs Corregidos', () => {
  let authToken;
  let projectId;

  beforeAll(async () => {
    // Crear proyecto de prueba
    const auth = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@rsl.com', password: 'TestPass123!' });
    authToken = auth.body.token;

    const proj = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Regression Test', description: 'Test' });
    projectId = proj.body.project.id;
  });

  it('Bug fix: Sección 3.2 NO debe estar vacía', async () => {
    // Simular flujo completo hasta artículo
    await request(app)
      .post(`/api/projects/${projectId}/protocol`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ /* protocolo mínimo */ });

    await request(app)
      .post(`/api/projects/${projectId}/prisma/generate`)
      .set('Authorization', `Bearer ${authToken}`);

    const article = await request(app)
      .post(`/api/projects/${projectId}/article/generate`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(article.body.article.results).toContain('## 3.2');
    expect(article.body.article.results).not.toMatch(/## 3\.2[^#]*\n\n##/); // No vacío entre 3.2 y siguiente sección
  });

  it('Bug fix: Estadísticas NO deben mostrar N/A', async () => {
    const article = await request(app)
      .post(`/api/projects/${projectId}/article/generate`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(article.body.article.results).not.toContain('N/A registros');
    expect(article.body.article.results).toMatch(/\d+ registros/); // Debe tener números reales
  });

  it('Bug fix: Síntesis de RQs NO debe decir "No se identificaron estudios"', async () => {
    const article = await request(app)
      .post(`/api/projects/${projectId}/article/generate`)
      .set('Authorization', `Bearer ${authToken}`);

    // Si hay estudios incluidos, las RQs no deben estar vacías
    if (article.body.article.metadata.rqsEntriesCount > 0) {
      expect(article.body.article.results).not.toContain('No se identificaron estudios');
    }
  });
});
