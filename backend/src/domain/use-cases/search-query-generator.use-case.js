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
  async generate({ databases = ['scopus', 'ieee'], picoData = {}, protocolTerms = {}, researchArea = '', matrixData = {}, aiProvider = 'chatgpt', yearStart, yearEnd, selectedTitle }) {
    try {
      console.log('🔍 Generando queries de búsqueda...');
      console.log('📌 Título RSL:', selectedTitle || 'No especificado');

      const prompt = this.buildPrompt({ databases, picoData, protocolTerms, researchArea, matrixData, yearStart, yearEnd, selectedTitle });
      
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
   * Construye el prompt mejorado para la IA con reglas PRISMA/Cochrane
   */
  buildPrompt({ databases, picoData, protocolTerms, researchArea, matrixData, yearStart, yearEnd, selectedTitle }) {
    // Extraer términos del protocolo
    const technologies = protocolTerms?.tecnologia || protocolTerms?.technologies || [];
    const domains = protocolTerms?.dominio || protocolTerms?.applicationDomain || [];
    const studyTypes = protocolTerms?.tipoEstudio || protocolTerms?.studyType || [];
    const themes = protocolTerms?.focosTematicos || protocolTerms?.thematicFocus || [];

    return `Eres un experto en metodología PRISMA y Cochrane para Revisiones Sistemáticas de Literatura (RSL).

═══════════════════════════════════════════════════════════════
CONTEXTO METODOLÓGICO (REGLA BASE)
═══════════════════════════════════════════════════════════════

La ESTRATEGIA DE BÚSQUEDA operacionaliza la cadena:
Título RSL → PICO → Definición de Términos → Criterios I/E → CADENAS DE BÚSQUEDA

👉 NO introduces conceptos nuevos.
👉 Solo traduces lo ya definido en consultas ejecutables.
👉 Toda búsqueda debe ser REPRODUCIBLE por otro investigador.

═══════════════════════════════════════════════════════════════
TRAZABILIDAD (DERIVA DE PASOS PREVIOS)
═══════════════════════════════════════════════════════════════

${selectedTitle ? `TÍTULO RSL: "${selectedTitle}"` : ''}

COMPONENTES PICO:
- P (Población): ${picoData?.population || 'No especificado'}
- I (Intervención): ${picoData?.intervention || 'No especificado'}
- C (Comparación): ${picoData?.comparison || 'N/A'}
- O (Resultado): ${picoData?.outcome || 'No especificado'}

TÉRMINOS DEFINIDOS EN EL PROTOCOLO:
🔬 Tecnología (de I): ${technologies.join(', ') || 'No especificado'}
🏥 Dominio (de P): ${domains.join(', ') || 'No especificado'}
📚 Tipo estudio: ${studyTypes.join(', ') || 'No especificado'}
🎯 Focos temáticos (de O): ${themes.join(', ') || 'No especificado'}

ÁREA DE INVESTIGACIÓN: ${researchArea || 'General'}
RANGO TEMPORAL: ${yearStart && yearEnd ? `${yearStart}-${yearEnd}` : 'No especificado'}
IDIOMA: Inglés (dominante en literatura técnica)

═══════════════════════════════════════════════════════════════
REGLAS METODOLÓGICAS (NIVEL EXPERTO)
═══════════════════════════════════════════════════════════════

Regla 1. DERIVACIÓN SECUENCIAL OBLIGATORIA
- Cada término de la cadena DEBE provenir de: Título → PICO → Definición de términos
- ❌ NO se permiten términos "exploratorios" no justificados

Regla 2. DESCOMPOSICIÓN POR BLOQUES CONCEPTUALES
Construye la cadena por bloques semánticos:

┌─────────────────┬──────────────────────┐
│ BLOQUE          │ ORIGEN               │
├─────────────────┼──────────────────────┤
│ Tecnología      │ I del PICO           │
│ Dominio/contexto│ P del PICO           │
│ Enfoque/resultado│ O del PICO (si aplica)│
└─────────────────┴──────────────────────┘

Cada bloque usa OR interno y se conectan con AND.

Regla 3. USO CORRECTO DE OPERADORES
- AND → intersección conceptual (entre bloques)
- OR → sinónimos/variantes (dentro de bloques)
- " " → frases exactas (multi-palabra)
- Truncadores solo si es técnicamente relevante

Ejemplo correcto de estructura:
(Bloque Tecnología) AND (Bloque Dominio) AND (Bloque Resultado)

Regla 4. INCLUIR TODOS LOS SINÓNIMOS TÉCNICOS REALES
Cada bloque debe incluir:
- Nombres completos y acrónimos
- Variantes ortográficas
- Términos equivalentes del dominio

Ejemplo: "Object Document Mapping" OR ODM OR Mongoose

Regla 5. CONSISTENCIA INTER-BASE
La LÓGICA CONCEPTUAL debe ser idéntica en todas las bases.
Solo cambia la SINTAXIS, no los conceptos.

═══════════════════════════════════════════════════════════════
SINTAXIS POR BASE DE DATOS (NIVEL IMPLEMENTACIÓN)
═══════════════════════════════════════════════════════════════

IEEE Xplore:
- Query corta (máx. 3 grupos AND)
- NO usar campos (TI:, AB:, "Document Title")
- Cada grupo puede tener hasta 2 OR
- NO paréntesis anidados
- Ejemplo: ("Internet of Things" OR IoT) AND ("digital health" OR telehealth) AND (privacy OR security)
${yearStart && yearEnd ? `- FILTRO TEMPORAL: La interfaz IEEE usa filtro separado de año, NO incluyas año en query` : ''}

Scopus:
- Formato: TITLE-ABS-KEY((...))
- Agrupa sinónimos con OR dentro de paréntesis
- Conecta bloques conceptuales con AND
- Asegurar paréntesis balanceados
- Ejemplo: TITLE-ABS-KEY(("machine learning" OR "deep learning") AND ("healthcare" OR "medical") AND ("diagnosis" OR "prediction"))
${yearStart && yearEnd ? `- FILTRO TEMPORAL: Agrega al final: AND PUBYEAR > ${yearStart - 1} AND PUBYEAR < ${yearEnd + 1}` : ''}

PubMed:
- Use [Title/Abstract] para términos principales
- Opcionalmente incluir MeSH entre corchetes [MeSH Terms]
- Ejemplo: (machine learning[Title/Abstract] OR deep learning[Title/Abstract]) AND (healthcare[Title/Abstract] OR medical[Title/Abstract])
${yearStart && yearEnd ? `- FILTRO TEMPORAL: PubMed usa filtros de fecha separados, NO incluyas año en query` : ''}

Web of Science:
- Formato: TS=((bloque1) AND (bloque2) AND (bloque3))
- Ejemplo: TS=(("machine learning" OR "deep learning") AND ("healthcare" OR "medical"))
${yearStart && yearEnd ? `- FILTRO TEMPORAL: Agrega al final: AND PY=(${yearStart}-${yearEnd})` : ''}

Google Scholar:
- Query simple sin campos
- Ejemplo: ("machine learning" OR "deep learning") AND ("healthcare" OR "medical")
${yearStart && yearEnd ? `- FILTRO TEMPORAL: Google Scholar usa filtros de fecha en interfaz, NO incluyas año` : ''}

ACM Digital Library:
- Similar a Scopus pero sin wrapper TITLE-ABS-KEY
- Ejemplo: ("machine learning" OR "deep learning") AND ("healthcare" OR "medical")
${yearStart && yearEnd ? `- FILTRO TEMPORAL: ACM usa filtros de fecha separados, NO incluyas año en query` : ''}

ScienceDirect / SpringerLink / Wiley:
- Query simple con paréntesis para agrupar
- Ejemplo: ("machine learning" OR "deep learning") AND ("healthcare" OR "medical")
${yearStart && yearEnd ? `- FILTRO TEMPORAL: Usan filtros de fecha en interfaz, NO incluyas año` : ''}

═══════════════════════════════════════════════════════════════
CHECKLIST DE CALIDAD (AUTOEVALÚA ANTES DE RESPONDER)
═══════════════════════════════════════════════════════════════

✓ ¿La búsqueda puede replicarse exactamente?
✓ ¿Todos los términos provienen del título/PICO/términos definidos?
✓ ¿Incluye sinónimos técnicos reales?
✓ ¿Usa correctamente AND / OR / " "?
✓ ¿Mantiene consistencia conceptual entre bases?
✓ ¿Respeta la sintaxis específica de cada base?

═══════════════════════════════════════════════════════════════
FORMATO DE RESPUESTA (TEXTO PLANO, SIN MARKDOWN)
═══════════════════════════════════════════════════════════════

DATABASE: nombre_base_datos
QUERY: tu query completa aqui en una sola linea
EXPLANATION: Derivación: [mencionar qué términos vienen de P/I/C/O del PICO]

---

CRÍTICO - DEBES GENERAR EXACTAMENTE ${databases.length} QUERIES:
${databases.map((db, i) => `${i + 1}. ${db}`).join('\n')}

IMPORTANTE: 
- Genera UNA query para CADA UNA de las ${databases.length} bases de datos listadas arriba
- NO omitas ninguna base de datos de la lista
- NO generes queries para otras bases de datos no listadas
- NO uses backticks, NO uses markdown, solo texto plano con el formato indicado
- Cada query debe estar en una sola línea continua
- La EXPLANATION debe justificar la trazabilidad desde PICO

GENERA LAS ${databases.length} CADENAS DE BÚSQUEDA AHORA:
`;
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

