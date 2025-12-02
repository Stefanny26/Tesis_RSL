const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
  sanitizeTerm,
  validateIEEE,
  validateScopus,
  validatePubMed,
  basicValidateQuery,
  safeParseJSON,
  generateQueriesFromGroups
} = require('./query-sanitizer');

/**
 * Use Case: Generador de Queries de Búsqueda Académica
 * 
 * Genera queries optimizadas para bases de datos académicas
 * basándose en el protocolo PICO del proyecto.
 */
class SearchQueryGenerator {
  constructor() {
    // Inicializar OpenAI/ChatGPT (PRIORIDAD 1)
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    
    // Inicializar Gemini (PRIORIDAD 2)
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  /**
   * Genera queries de búsqueda para múltiples bases de datos
   */
  async generate({ databases = ['scopus', 'ieee'], picoData = {}, protocolTerms = {}, researchArea = '', matrixData = {}, aiProvider = 'chatgpt' }) {
    try {
      console.log('🔍 Generando queries de búsqueda...');

      const prompt = this.buildPrompt({ databases, picoData, protocolTerms, researchArea, matrixData });
      
      let text;
      if (aiProvider === 'chatgpt' && this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        });
        text = completion.choices[0].message.content;
      } else if (this.gemini) {
        const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
      } else {
        throw new Error('No hay proveedor de IA configurado');
      }

      console.log('📄 Respuesta COMPLETA de IA para búsquedas:');
      console.log('='.repeat(80));
      console.log(text);
      console.log('='.repeat(80));
      console.log(`🎯 Bases de datos solicitadas (${databases.length}):`, databases);

      // Parsear la respuesta
      const queries = this.parseResponse(text, databases);
      
      console.log(`📊 Resultado del parseo: ${queries.length} queries de ${databases.length} solicitadas`);
      
      // Verificar si faltan queries
      if (queries.length < databases.length) {
        console.warn(`⚠️  PROBLEMA: Faltan ${databases.length - queries.length} queries`);
        const generatedDbs = queries.map(q => q.database.toLowerCase());
        const missingDbs = databases.filter(db => !generatedDbs.includes(db.toLowerCase()));
        console.warn(`❌ Bases de datos faltantes: ${missingDbs.join(', ')}`);
      }

      console.log('✅ Queries generadas exitosamente');
      console.log('   Total queries:', queries.length);

      return {
        success: true,
        data: {
          queries,
          metadata: {
            databases: databases,
            generatedAt: new Date().toISOString()
          }
        }
      };

    } catch (error) {
      console.error('❌ Error generando queries:', error);
      throw new Error(`Error generando queries de búsqueda: ${error.message}`);
    }
  }

  /**
   * Construye el prompt mejorado para la IA
   */
  buildPrompt({ databases, picoData, protocolTerms, researchArea, matrixData }) {
    // Extraer términos del protocolo
    const technologies = protocolTerms?.tecnologia || protocolTerms?.technologies || [];
    const domains = protocolTerms?.dominio || protocolTerms?.applicationDomain || [];
    const studyTypes = protocolTerms?.tipoEstudio || protocolTerms?.studyType || [];
    const themes = protocolTerms?.focosTematicos || protocolTerms?.thematicFocus || [];

    return `Eres un experto en búsquedas bibliográficas académicas y en sintaxis de consultas para bases de datos (Scopus, IEEE Xplore, PubMed, Web of Science, ACM Digital Library, ScienceDirect, SpringerLink y Google Scholar).

Tu tarea: generar UNA SOLA query válida por base de datos, en INGLÉS, lista para pegar en la interfaz web o en la API de cada proveedor.

TÉRMINOS DEL PROTOCOLO:
Grupo 1 - Tecnología/Herramientas: ${technologies.join(', ') || 'No especificado'}
Grupo 2 - Dominio de aplicación: ${domains.join(', ') || 'No especificado'}
Grupo 3 - Tipo de estudio: ${studyTypes.join(', ') || 'No especificado'}
Grupo 4 - Focos temáticos: ${themes.join(', ') || 'No especificado'}

COMPONENTES PICO:
- Población: ${picoData?.population || 'No especificado'}
- Intervención: ${picoData?.intervention || 'No especificado'}
- Comparación: ${picoData?.comparison || 'N/A'}
- Resultado: ${picoData?.outcome || 'No especificado'}

ÁREA: ${researchArea || 'General'}

REGLAS ESTRICTAS POR BASE:
- IEEE Xplore: UNA SOLA query corta (máx. 3 grupos AND). No usar campos (TI:, AB:, "Document Title"). Cada grupo puede tener hasta 2 OR. No paréntesis anidados.
  Ejemplo: ("Internet of Things" OR IoT) AND ("digital health" OR telehealth) AND (privacy OR security)

- Scopus: Use TITLE-ABS-KEY((...)) y agrupe sinónimos. Asegurar paréntesis balanceados.
  Ejemplo: TITLE-ABS-KEY(("machine learning" OR "deep learning") AND ("healthcare" OR "medical") AND ("diagnosis" OR "prediction"))

- PubMed: Use [Title/Abstract] para términos de título/abstract; opcionalmente incluir MeSH entre corchetes [MeSH Terms].
  Ejemplo: (machine learning[Title/Abstract] OR deep learning[Title/Abstract]) AND (healthcare[Title/Abstract] OR medical[Title/Abstract])

- Web of Science: Use TS=(...) para topic searches.
  Ejemplo: TS=(("machine learning" OR "deep learning") AND ("healthcare" OR "medical"))

- Google Scholar: query simple sin campos.
  Ejemplo: ("machine learning" OR "deep learning") AND ("healthcare" OR "medical")

INSTRUCCIONES:
1. Agrupa sinónimos dentro de paréntesis con OR
2. Combina conceptos distintos con AND
3. Usa comillas en frases de varias palabras
4. Evita comodines (*) y caracteres especiales ({ } [ ] ^ ~ ?)
5. Genera queries en INGLÉS únicamente

FORMATO DE RESPUESTA (solo texto plano, sin markdown):
DATABASE: nombre_base_datos
QUERY: tu query completa aqui en una sola linea
EXPLANATION: breve explicacion en espanol

---

---
CRÍTICO - DEBES GENERAR EXACTAMENTE ${databases.length} QUERIES:
${databases.map((db, i) => `${i + 1}. ${db}`).join('\n')}

IMPORTANTE: 
- Genera UNA query para CADA UNA de las ${databases.length} bases de datos listadas arriba
- NO omitas ninguna base de datos de la lista
- NO generes queries para otras bases de datos no listadas
- NO uses backticks, NO uses markdown, solo texto plano con el formato indicado
- Cada query debe estar en una sola línea continua
---`;
  }

  /**
   * Normaliza el nombre de una base de datos para matching
   */
  normalizeDatabaseName(dbName) {
    // Map de aliases comunes
    const aliases = {
      'ieee xplore': 'ieee',
      'ieee': 'ieee',
      'web of science': 'webofscience',
      'webofscience': 'webofscience',
      'web_of_science': 'webofscience',
      'scopus': 'scopus',
      'acm': 'acm',
      'acm digital library': 'acm',
      'springer': 'springer',
      'springerlink': 'springer',
      'pubmed': 'pubmed',
      'google scholar': 'google_scholar',
      'google_scholar': 'google_scholar',
      'sciencedirect': 'sciencedirect',
      'science direct': 'sciencedirect'
    };

    const normalized = dbName.toLowerCase().trim();
    return aliases[normalized] || normalized.replace(/\s+/g, '_');
  }

  /**
   * Parsea y sanitiza la respuesta de la IA
   */
  parseResponse(text, databases) {
    const queries = [];
    const lines = text.split('\n');
    
    let currentQuery = {};
    let currentField = null;

    console.log('🔍 Parseando queries de búsqueda...');
    console.log(`📝 Total de líneas a parsear: ${lines.length}`);
    console.log(`📋 Bases de datos solicitadas: ${databases.join(', ')}`);

    // Crear un map de IDs válidos (normalizados)
    const requestedDatabaseIds = databases.map(db => this.normalizeDatabaseName(db));
    console.log(`📋 IDs normalizados: ${requestedDatabaseIds.join(', ')}`);

    for (const line of lines) {
      const trimmed = line.trim();

      // Detectar DATABASE
      if (trimmed.match(/^\*{0,2}\s*DATABASE\s*:\*{0,2}/i)) {
        if (currentQuery.database) {
          queries.push(currentQuery);
          console.log(`✅ Query parseada para: ${currentQuery.database}`);
        }
        currentQuery = {
          database: trimmed.replace(/^\*{0,2}\s*DATABASE\s*:\*{0,2}/i, '').trim(),
          query: '',
          explanation: ''
        };
        currentField = 'database';
        console.log(`📍 Nueva base de datos detectada: ${currentQuery.database}`);
      }
      // QUERY
      else if (trimmed.match(/^\*{0,2}\s*QUERY\s*:\*{0,2}/i)) {
        const queryText = trimmed.replace(/^\*{0,2}\s*QUERY\s*:\*{0,2}/i, '').trim();
        currentQuery.query = queryText;
        currentField = 'query';
      }
      // EXPLANATION
      else if (trimmed.match(/^\*{0,2}\s*EXPLANATION\s*:\*{0,2}/i)) {
        const explanationText = trimmed.replace(/^\*{0,2}\s*EXPLANATION\s*:\*{0,2}/i, '').trim();
        currentQuery.explanation = explanationText;
        currentField = 'explanation';
      }
      // Continuar acumulando texto
      else if (trimmed && currentField && !trimmed.match(/^---+$/) && !trimmed.match(/^\*{0,2}\s*(DATABASE|QUERY|EXPLANATION)\s*:\*{0,2}/i)) {
        if (currentField === 'query') {
          currentQuery.query += (currentQuery.query ? ' ' : '') + trimmed;
        } else if (currentField === 'explanation') {
          currentQuery.explanation += (currentQuery.explanation ? ' ' : '') + trimmed;
        }
      }
    }

    // Agregar la última query
    if (currentQuery.database) {
      queries.push(currentQuery);
      console.log(`✅ Query parseada para: ${currentQuery.database}`);
    }

    console.log(`📊 Total queries parseadas (antes de filtrar): ${queries.length}`);
    console.log(`📋 Queries parseadas:`, queries.map(q => q.database).join(', '));

    // 🔥 FILTRAR: Solo queries para bases de datos solicitadas
    const filteredQueries = queries.filter(q => {
      const normalizedDbName = this.normalizeDatabaseName(q.database);
      const isRequested = requestedDatabaseIds.includes(normalizedDbName);
      
      console.log(`🔍 Verificando "${q.database}" -> normalizado: "${normalizedDbName}" -> ${isRequested ? '✅ INCLUIDA' : '❌ DESCARTADA'}`);
      
      if (!isRequested) {
        console.log(`⚠️  Descartando query no solicitada: ${q.database}`);
      }
      
      return isRequested;
    });

    console.log(`📊 Total queries FILTRADAS (después de filtrar): ${filteredQueries.length}`);
    console.log(`📋 Queries filtradas:`, filteredQueries.map(q => q.database).join(', '));

    // Si no se parseó correctamente, usar fallback
    if (filteredQueries.length === 0) {
      console.warn('⚠️  No se parsearon queries válidas, generando básicas como fallback');
      return this.generateBasicQueries(databases);
    }

    // SANITIZACIÓN Y VALIDACIÓN
    const sanitizedQueries = [];
    for (const q of filteredQueries) {
      // Limpieza básica
      q.query = q.query.trim().replace(/^(`+)/, '').replace(/(`+)$/, '').replace(/\s+/g, ' ');
      q.explanation = q.explanation.trim();
      
      const dbLower = q.database.toLowerCase();
      
      // Validación específica por base de datos
      if (dbLower === 'ieee') {
        console.log(`🔧 Validando IEEE query...`);
        while (!validateIEEE(q.query) && q.query.includes(' AND ')) {
          console.warn(`⚠️  IEEE query inválida, reduciendo grupos AND...`);
          const parts = q.query.split(/\s+AND\s+/i);
          parts.pop();
          q.query = parts.join(' AND ');
        }
        console.log(`✅ IEEE query validada`);
      } else if (dbLower === 'scopus') {
        if (!validateScopus(q.query)) {
          console.warn(`⚠️  Scopus query sin TITLE-ABS-KEY, corrigiendo...`);
          if (!q.query.startsWith('TITLE-ABS-KEY')) {
            q.query = `TITLE-ABS-KEY(${q.query})`;
          }
        }
      } else if (dbLower === 'pubmed') {
        if (!validatePubMed(q.query)) {
          console.warn(`⚠️  PubMed query sin campos, agregando [Title/Abstract]...`);
          // Intento básico de corrección
          q.query = q.query.replace(/\b(\w+)\b/g, '$1[Title/Abstract]');
        }
      } else {
        // Validación básica para otras bases
        if (!basicValidateQuery(q.query)) {
          console.warn(`⚠️  Query inválida para ${q.database}, aplicando limpieza...`);
          q.query = q.query.replace(/[{}\[\]^~?<>]/g, '');
        }
      }
      
      sanitizedQueries.push(q);
    }

    return sanitizedQueries;
  }

  /**
   * Genera queries básicas como fallback
   */
  generateBasicQueries(databases) {
    return databases.map(db => ({
      database: db,
      query: 'TITLE-ABS-KEY("systematic review")',
      explanation: 'Query básica generada como fallback'
    }));
  }
}

module.exports = SearchQueryGenerator;

