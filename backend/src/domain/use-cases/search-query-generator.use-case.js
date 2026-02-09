const OpenAI = require('openai');
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
    // Inicializar OpenAI/ChatGPT
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  /**
   * Genera queries de búsqueda para múltiples bases de datos
   */
  async generate({ databases = ['scopus', 'ieee'], picoData = {}, protocolTerms = {}, researchArea = '', matrixData = {}, aiProvider = 'chatgpt', yearStart, yearEnd, selectedTitle }) {
    try {
      console.log('Generando queries de búsqueda...');
      console.log('Título RSL:', selectedTitle || 'No especificado');
      console.log('Rango temporal recibido: yearStart =', yearStart, ', yearEnd =', yearEnd);

      const prompt = this.buildPrompt({ databases, picoData, protocolTerms, researchArea, matrixData, yearStart, yearEnd, selectedTitle });
      
      let text;
      if (this.openai) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        });
        text = completion.choices[0].message.content;
      } else {
        throw new Error('No hay proveedor de IA configurado (OpenAI API Key requerida)');
      }

      console.log('Respuesta COMPLETA de IA para búsquedas:');
      console.log('='.repeat(80));
      console.log(text);
      console.log('='.repeat(80));
      console.log(`Bases de datos solicitadas (${databases.length}):`, databases);

      // Parsear la respuesta
      const queries = this.parseResponse(text, databases, yearStart, yearEnd);
      
      console.log(`Resultado del parseo: ${queries.length} queries de ${databases.length} solicitadas`);
      
      // Verificar si faltan queries
      if (queries.length < databases.length) {
        console.warn(`PROBLEMA: Faltan ${databases.length - queries.length} queries`);
        const generatedDbs = queries.map(q => q.database.toLowerCase());
        const missingDbs = databases.filter(db => !generatedDbs.includes(db.toLowerCase()));
        console.warn(`Bases de datos faltantes: ${missingDbs.join(', ')}`);
      }

      console.log('Queries generadas exitosamente');
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
      console.error('Error generando queries:', error);
      throw new Error(`Error generando queries de búsqueda: ${error.message}`);
    }
  }

  /**
   * Construye el prompt consumiendo datos ya validados de pasos anteriores
   */
  buildPrompt({ databases, picoData, protocolTerms, researchArea, matrixData, yearStart, yearEnd, selectedTitle }) {
    // Extraer términos del protocolo (ya confirmados por el investigador en pasos anteriores)
    const technologies = protocolTerms?.tecnologia || protocolTerms?.technologies || [];
    const domains = protocolTerms?.dominio || protocolTerms?.applicationDomain || [];
    const themes = protocolTerms?.focosTematicos || protocolTerms?.thematicFocus || [];

    // Normalizar PICO outcome (frontend envía 'outcome' singular, legacy usa 'outcomes')
    const picoOutcome = picoData?.outcome || picoData?.outcomes || 'No especificado';

    return `Eres un Metadata Specialist y Bibliotecario Académico experto en Revisiones Sistemáticas (RSL) bajo PRISMA 2020. Tu tarea es traducir un protocolo de investigación en cadenas de búsqueda (Search Strings) BALANCEADAS, precisas y reproducibles.

═══════════════════════════════════════════════════════════════
DATOS DEL PROTOCOLO (ya validados en pasos anteriores — usar tal cual)
═══════════════════════════════════════════════════════════════

TÍTULO RSL: "${selectedTitle || 'No definido'}"

MARCO PICO (ya definido y editado por el investigador):
- P (Población/Contexto): ${picoData?.population || 'No especificado'}
- I (Intervención/Tecnología): ${picoData?.intervention || 'No especificado'}
- C (Comparación): ${picoData?.comparison || 'N/A'}
- O (Outcomes/Resultados): ${picoOutcome}

TÉRMINOS DEL PROTOCOLO (ya confirmados por el investigador):
- Tecnología (I): ${technologies.length ? technologies.join(' | ') : 'No especificado'}
- Dominio (P): ${domains.length ? domains.join(' | ') : 'No especificado'}
- Focos temáticos (O): ${themes.length ? themes.join(' | ') : 'No especificado'}

RANGO TEMPORAL: ${yearStart && yearEnd ? `${yearStart}-${yearEnd}` : 'No especificado'}

═══════════════════════════════════════════════════════════════
REGLAS DE BALANCEO Y CONSISTENCIA (CRÍTICAS PARA SLR)
═══════════════════════════════════════════════════════════════

REGLA DE ORO: CONSISTENCIA CONCEPTUAL ABSOLUTA
  Una SLR exige buscar LOS MISMOS conceptos en todas las bases. 
  ERROR (Sesgo de Selección):
     - IEEE: "Performance" OR "Latency"
     - ACM: "Throughput" OR "Memory"
     - Springer: "Productivity"
  CORRECTO (Uniformidad):
     - IEEE: ("Performance" OR "Throughput" OR "Efficiency")
     - ACM: ("Performance" OR "Throughput" OR "Efficiency")
     - Springer: ("Performance" OR "Throughput" OR "Efficiency")
  
  >> SELECCIONA UN ÚNICO CONJUNTO DE TÉRMINOS MAESTROS PARA I, P, y O.
  >> ÚSALO EN TODAS LAS BASES (solo adaptando sintaxis o wildcards).

REGLA 2: EVITAR AMBIGÜEDAD DE CONTEXTO
  Si la Intervención (I) tiene nombres comunes (ej: "Mongoose", "Atom", "Spring"), el Bloque P (Contexto) es OBLIGATORIO para desambiguar.
  Query débil: ("Mongoose") AND ("Performance") -> Trae zoología.
  Query robusta: ("Mongoose") AND ("Node.js" OR "Backend") AND ("Performance") -> Contexto técnico asegurado.

REGLA 3: ESTRUCTURA DE BLOQUES CON OR INTERNO - CRÍTICO PARA RSL COMPARATIVAS
  
  ESTRUCTURA OBLIGATORIA: (Bloque_I) AND (Bloque_P) AND (Bloque_C) AND (Bloque_O)
  
  CADA BLOQUE contiene términos sinónimos/variaciones unidos con OR:
  
  1. Bloque I (Intervención/Tecnología Principal):
     - Incluir TODOS los términos de "Términos Tecnología" + variaciones
     - EXPANSIÓN: Abreviaturas (AI, ML, NLP), sinónimos técnicos, wildcards
     - FORMATO: ("Mongoose" OR "Mongoose ODM" OR "Mongoose.js" OR "Mongoose Library")
     - 5-7 variaciones por término clave
     
  2. Bloque P (Contexto/Dominio):
     - Incluir TODOS los términos de "Términos Dominio" + variaciones
     - EXPANSIÓN: Wildcards (Backend*, Server-side*), nombres técnicos, contextos relacionados
     - FORMATO: ("Node.js" OR "NodeJS" OR "Node Backend" OR "Server-side JavaScript")
     - 3-5 variaciones

  3. Bloque C (Comparación) - CRÍTICO SI PICO-C EXISTE:
     - SI PICO-C está definido → OBLIGATORIO incluir este bloque
     - Incluir la tecnología/método de comparación + variaciones
     - FORMATO: ("Native Driver" OR "MongoDB Native Driver" OR "Native MongoDB" OR "MongoDB Driver")
     - Ejemplo: Si comparas "Mongoose vs Native Driver" → ambos deben estar en la query
     - 3-5 variaciones del término de comparación
     - SIN ESTE BLOQUE: Traerás artículos solo de Mongoose, no comparativos
     - CON ESTE BLOQUE: Solo artículos que mencionen ambas tecnologías (comparativos)

  4. Bloque O (Outcomes/Focos/Métricas):
     - Incluir TODOS los términos de "Focos Temáticos" + variaciones
     - COMBINACIÓN: Términos paraguas (Performance, Efficiency) + métricas específicas (Latency, Throughput)
     - FORMATO: ("Performance" OR "Throughput" OR "Response Time" OR "Latency" OR "Execution Time")
     - WILDCARDS: (Perform*, Efficien*, Productiv*)
     - 5-7 variaciones

REGLA 4: TRADUCCIÓN Y EXPANSIÓN DE TÉRMINOS
  - TRADUCCIÓN AUTOMÁTICA: Si los términos están en ESPAÑOL → traducir a INGLÉS
  - Query final: 100% INGLÉS (idioma académico universal)
  - ESTRUCTURA: Cada bloque = un paréntesis con términos OR
  - EXPANSIÓN MÍNIMA: 5-7 variaciones por bloque I/O, 3-5 por bloque P/C
  - WILDCARDS: Usar asteriscos (*) donde aplique (Perform*, Databas*, Efficien*)
  
  PROHIBIDO:
  - (A AND B AND C) OR (A AND B AND D) ← ineficiente, repetitivo, propenso a errores
  - Omitir PICO-C si está definido ← perderás estudios comparativos
  
  ESTRUCTURA CORRECTA:
  - (I_términos OR I_sinónimos) AND (P_términos OR P_variantes) AND (C_término_comparación OR C_variantes) AND (O_métricas OR O_sinónimos)

═══════════════════════════════════════════════════════════════
PROCESO DE GENERACIÓN
═══════════════════════════════════════════════════════════════

1. Define mentalmente la "QUERY MAESTRA":
   (I_Terms) AND (P_Terms) AND (O_Terms)
2. Aplica esa MISMA lógica a cada base solicitada.
3. Solo modifica la SINTAXIS (comillas, paréntesis, wildcards), NUNCA los conceptos.

═══════════════════════════════════════════════════════════════
ESTRUCTURA DE CADA QUERY - FÓRMULA OBLIGATORIA
═══════════════════════════════════════════════════════════════

SI PICO-C ESTÁ VACÍO O "N/A":
   (Bloque_I) AND (Bloque_P) AND (Bloque_O)

SI PICO-C TIENE VALOR (estudio comparativo):
   (Bloque_I) AND (Bloque_P) AND (Bloque_C) AND (Bloque_O)

Estructura de cada bloque:
- Bloque_I: ("término1" OR "sinónimo1" OR "variante1" OR "abreviatura1" OR ...)
- Bloque_P: ("contexto1" OR "dominio1" OR "variante1" OR ...)
- Bloque_C: ("tecnología_comparación" OR "método_alternativo" OR "variante" OR ...) <- SOLO si PICO-C existe
- Bloque_O: ("métrica1" OR "outcome1" OR "variable1" OR "sinónimo1" OR ...)

Ejemplo real:
MAL: ("Mongoose" AND "Performance") OR ("Mongoose" AND "Latency") <- repetitivo
BIEN: ("Mongoose" OR "Mongoose ODM") AND ("Node.js" OR "Backend") AND ("Native Driver" OR "MongoDB Driver") AND ("Performance" OR "Latency" OR "Throughput")

CRÍTICO: Si PICO-C = "Native Driver", tu query DEBE incluir ambos términos (Mongoose AND Native Driver) para encontrar estudios comparativos.

═══════════════════════════════════════════════════════════════
SINTAXIS POR BASE DE DATOS
═══════════════════════════════════════════════════════════════

${databases.map(db => {
  const dbLower = db.toLowerCase();
  if (dbLower === 'ieee' || dbLower === 'ieee xplore') return `**IEEE Xplore:** Query directa SIN etiquetas de campo. NO soporta wildcards (*) en frases entre comillas. Usar términos completos. Agrupar con paréntesis.${yearStart ? ' Filtro temporal en interfaz, NO en query.' : ''}`;
  if (dbLower === 'scopus') return `**Scopus:** Formato TITLE-ABS-KEY((...bloques...)). Soporta wildcards (*). Paréntesis balanceados.${yearStart && yearEnd ? ` Agregar: AND PUBYEAR > ${yearStart - 1} AND PUBYEAR < ${yearEnd + 1}` : ''}`;
  if (dbLower === 'pubmed') return `**PubMed:** Usar [Title/Abstract]. Soporta wildcards (*). Considerar MeSH Terms si aplica.${yearStart ? ' Filtro temporal en interfaz.' : ''}`;
  if (dbLower === 'webofscience' || dbLower === 'web of science') return `**Web of Science:** Formato TS=((...bloques...)). Soporta wildcards (*).${yearStart && yearEnd ? ` Agregar: AND PY=(${yearStart}-${yearEnd})` : ''}`;
  if (dbLower === 'google_scholar' || dbLower === 'google scholar') return `**Google Scholar:** Query simple sin etiquetas. NO soporta wildcards ni operadores avanzados.${yearStart ? ' Filtro temporal en interfaz.' : ''}`;
  if (dbLower === 'acm') return `**ACM Digital Library:** Query con paréntesis, sin wrapper especial. Soporta wildcards (*).${yearStart ? ' Filtro temporal en interfaz.' : ''}`;
  return `**${db}:** Query simple con paréntesis.${yearStart ? ' Filtro temporal en interfaz.' : ''}`;
}).join('\n')}

═══════════════════════════════════════════════════════════════
FORMATO DE RESPUESTA (TEXTO PLANO, SIN MARKDOWN)
═══════════════════════════════════════════════════════════════

DATABASE: [Nombre exacto]
QUERY: [Cadena completa en una sola línea]
EXPLANATION: [Términos incluidos con origen PICO + términos EXCLUIDOS por redundancia y por qué]

---

GENERAR EXACTAMENTE ${databases.length} QUERIES para:
${databases.map((db, i) => `${i + 1}. ${db}`).join('\n')}

- UNA query por CADA base (${databases.length} total)
- NO omitir ninguna, NO generar extras
- Cada QUERY en una línea continua (sin saltos)
- La LÓGICA CONCEPTUAL debe ser idéntica entre bases — solo cambia la SINTAXIS
- EXPANSIÓN: 5-7 términos OR por bloque I/O, 3-5 términos OR por bloque P/C
- ESTRUCTURA: ${picoData?.comparison && picoData.comparison !== 'N/A' ? '4 bloques (I, P, C, O)' : '3 bloques (I, P, O)'} unidos con AND
- Wildcards (*) donde aplique según sintaxis de cada base

${picoData?.comparison && picoData.comparison !== 'N/A' ? `RECORDATORIO CRÍTICO: PICO-C está definido ("${picoData.comparison}").
DEBES incluir Bloque C con variaciones del término de comparación.
SIN BLOQUE C = queries inútiles (solo traerán artículos de ${picoData?.intervention || 'la intervención'}, no comparativos).

` : ''}GENERA LAS ${databases.length} CADENAS DE BÚSQUEDA BALANCEADAS AHORA:
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
   * Parsea y sanitiza la respuesta de la IA con resilencia a múltiples formatos
   */
  parseResponse(text, databases, yearStart, yearEnd) {
    console.log('Parseando queries de búsqueda...');
    console.log(`Total de líneas a parsear: ${text.split('\n').length}`);
    console.log(`Bases de datos solicitadas: ${databases.join(', ')}`);

    // Eliminar bloques de código markdown si la IA los incluyó por error
    const cleanText = text.replace(/```[a-z]*\n/g, '').replace(/```/g, '');
    
    const queries = [];
    const requestedDatabaseIds = databases.map(db => this.normalizeDatabaseName(db));
    console.log(`IDs normalizados: ${requestedDatabaseIds.join(', ')}`);

    // Dividir por bloques usando DATABASE: como separador
    const blocks = cleanText.split(/DATABASE\s*:/i).filter(b => b.trim());

    for (const block of blocks) {
      const lines = block.split('\n');
      const dbName = lines[0].trim();
      
      // Buscar la línea que empieza con QUERY:
      const queryLine = lines.find(l => l.toUpperCase().startsWith('QUERY:'));
      const explanationLine = lines.find(l => l.toUpperCase().startsWith('EXPLANATION:'));

      if (dbName && queryLine) {
        const parsedQuery = {
          database: dbName,
          query: queryLine.replace(/QUERY\s*:/i, '').trim(),
          explanation: explanationLine ? explanationLine.replace(/EXPLANATION\s*:/i, '').trim() : ''
        };
        
        // Si la query se cortó, buscar líneas siguientes
        const queryIndex = lines.findIndex(l => l.toUpperCase().startsWith('QUERY:'));
        const explanationIndex = lines.findIndex(l => l.toUpperCase().startsWith('EXPLANATION:'));
        
        // Concatenar líneas adicionales de query (hasta EXPLANATION o fin de bloque)
        if (queryIndex !== -1) {
          const endIndex = explanationIndex !== -1 ? explanationIndex : lines.length;
          for (let i = queryIndex + 1; i < endIndex; i++) {
            const line = lines[i].trim();
            if (line && !line.match(/^---+$/) && !line.toUpperCase().startsWith('DATABASE:')) {
              parsedQuery.query += ' ' + line;
            }
          }
        }
        
        queries.push(parsedQuery);
        console.log(`Query parseada para: ${dbName}`);
      }
    }

    console.log(`Total queries parseadas (antes de filtrar): ${queries.length}`);
    console.log(`Queries parseadas:`, queries.map(q => q.database).join(', '));

    // Filtrar: Solo queries para bases de datos solicitadas
    const filteredQueries = queries.filter(q => {
      const normalizedDbName = this.normalizeDatabaseName(q.database);
      const isRequested = requestedDatabaseIds.includes(normalizedDbName);
      
      console.log(`Verificando "${q.database}" -> normalizado: "${normalizedDbName}" -> ${isRequested ? 'INCLUIDA' : 'DESCARTADA'}`);
      
      if (!isRequested) {
        console.log(`Descartando query no solicitada: ${q.database}`);
      }
      
      return isRequested;
    });

    console.log(`Total queries FILTRADAS: ${filteredQueries.length}`);
    console.log(`Queries filtradas:`, filteredQueries.map(q => q.database).join(', '));

    // Si no se parseó correctamente, usar fallback
    if (filteredQueries.length === 0) {
      console.warn('No se parsearon queries válidas, generando básicas como fallback');
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
        console.log(`Validando IEEE query...`);
        while (!validateIEEE(q.query) && q.query.includes(' AND ')) {
          console.warn(`IEEE query inválida, reduciendo grupos AND...`);
          const parts = q.query.split(/\s+AND\s+/i);
          parts.pop();
          q.query = parts.join(' AND ');
        }
        console.log(`IEEE query validada`);
      } else if (dbLower === 'scopus') {
        if (!validateScopus(q.query)) {
          console.warn(`Scopus query sin TITLE-ABS-KEY, corrigiendo...`);
          if (!q.query.startsWith('TITLE-ABS-KEY')) {
            q.query = `TITLE-ABS-KEY(${q.query})`;
          }
        }
        
        // Agregar filtro temporal si falta
        if (yearStart && yearEnd && !q.query.includes('PUBYEAR')) {
          console.warn(`Scopus query sin filtro temporal, agregando PUBYEAR...`);
          q.query = `${q.query} AND PUBYEAR > ${yearStart - 1} AND PUBYEAR < ${yearEnd + 1}`;
          console.log(`Filtro temporal agregado: PUBYEAR > ${yearStart - 1} AND PUBYEAR < ${yearEnd + 1}`);
        }
      } else if (dbLower === 'pubmed') {
        if (!validatePubMed(q.query)) {
          console.warn(`PubMed query sin campos, agregando [Title/Abstract]...`);
          // Intento básico de corrección
          q.query = q.query.replace(/\b(\w+)\b/g, '$1[Title/Abstract]');
        }
      } else {
        // Validación básica para otras bases
        if (!basicValidateQuery(q.query)) {
          console.warn(`Query inválida para ${q.database}, aplicando limpieza...`);
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

