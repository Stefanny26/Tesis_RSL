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
     - Incluir TODOS los términos de "Términos Tecnología" + VARIACIONES + SINÓNIMOS CONCEPTUALES
     - EXPANSIÓN DOBLE:
       a) Variaciones sintácticas: Abreviaturas, versiones completas, nombres alternativos
       b) Sinónimos conceptuales: Términos equivalentes usados en literatura académica
     - EJEMPLO:
       * Término original: "Mongoose"
       * Variaciones: "Mongoose ODM", "Mongoose.js", "Mongoose Library" 
       * Sinónimos conceptuales: "Object Document Mapper", "MongoDB ORM", "Node ODM"
     - FORMATO: ("Mongoose" OR "Mongoose ODM" OR "Object Document Mapper" OR "MongoDB ORM")
     - OBJETIVO: **MAXIMIZAR RECALL** - No perder papers que usen terminología alternativa
     - 7-10 términos totales (variaciones + sinónimos)
     
  2. Bloque P (Contexto/Dominio):
     - Incluir TODOS los términos de "Términos Dominio" + VARIACIONES + SINÓNIMOS
     - EXPANSIÓN DOBLE:
       a) Variaciones: Wildcards (Backend*, Server-side*), nombres técnicos
       b) Sinónimos: Contextos alternativos equivalentes
     - EJEMPLO:
       * Término: "Backend Development"
       * Variaciones: "Backend", "Server-side Development"
       * Sinónimos: "API Development", "Server Programming", "Web Services"
     - FORMATO: ("Backend" OR "Server-side" OR "API Development" OR "Web Services")
     - 5-7 términos totales

  3. Bloque C (Comparación) - CRÍTICO SI PICO-C EXISTE:
     - SI PICO-C está definido → OBLIGATORIO incluir este bloque
     - Incluir tecnología/método de comparación + VARIACIONES + SINÓNIMOS CONCEPTUALES
     - **SINÓNIMOS CONCEPTUALES SON CRÍTICOS AQUÍ** - Los autores usan terminología diversa
     - EJEMPLO:
       * Término: "Native Driver"
       * Variaciones: "Native MongoDB Driver", "MongoDB Native"
       * Sinónimos conceptuales: "Raw queries", "Direct access", "Direct MongoDB operations", "Low-level driver"
     - FORMATO: ("Native Driver" OR "Raw queries" OR "Direct access" OR "Low-level driver")
     - Ejemplo: Si comparas "Mongoose vs Native Driver" → ambos deben estar con sinónimos
     - 7-10 términos (crítico para no perder estudios comparativos)
     - SIN SINÓNIMOS: Perderás papers que comparen pero usen "Raw queries" en lugar de "Native Driver"
     - CON SINÓNIMOS: Capturarás todos los estudios comparativos independientemente de terminología

  4. Bloque O (Outcomes/Focos/Métricas):
     - Incluir TODOS los términos de "Focos Temáticos" + VARIACIONES + SINÓNIMOS
     - ESTRATEGIA DE EXPANSIÓN:
       a) Término paraguas (Performance, Efficiency)
       b) Métricas específicas (Latency, Throughput) 
       c) Sinónimos de métricas (Response Time = Latency, Speed = Performance)
     - EJEMPLO:
       * Paraguas: "Performance"
       * Métricas: "Latency", "Throughput"
       * Sinónimos: "Response Time", "Speed", "Execution Time", "Processing Time"
     - FORMATO: ("Performance" OR "Latency" OR "Throughput" OR "Response Time" OR "Speed")
     - WILDCARDS: (Perform*, Efficien*, Productiv*)
     - 8-12 términos totales (paraguas + métricas + sinónimos)

REGLA 4: MAXIMIZAR SENSIBILIDAD (RECALL) CON SINÓNIMOS CONCEPTUALES
  
  ⚠️ **OBJETIVO PRIMARIO EN SLR: NO PERDER PAPERS RELEVANTES**
  
  En Revisiones Sistemáticas, es preferible tener 1000 resultados para filtrar manualmente (Screening)
  que perder 50 papers relevantes por búsqueda demasiado restrictiva.
  
  **DIFERENCIA CRÍTICA:**
  - Variaciones sintácticas: Reescrituras del mismo término ("Native Driver" → "MongoDB Native Driver")
  - Sinónimos conceptuales: Términos diferentes con significado equivalente ("Native Driver" → "Raw queries", "Direct access")
  
  **PROCESO DE IDENTIFICACIÓN DE SINÓNIMOS:**
  Para cada término clave, pregúntate:
  1. ¿Qué otros términos usan los investigadores para referirse a este concepto?
  2. ¿Qué sinónimos aparecen en papers académicos de esta área?
  3. ¿Qué términos técnicos equivalentes existen?
  4. ¿Qué abreviaturas o acrónimos se usan?
  
  **EJEMPLOS DE EXPANSIÓN CORRECTA:**
  - "Machine Learning" → Incluir: "ML", "Statistical Learning", "Predictive Modeling", "Data-driven algorithms"
  - "Performance" → Incluir: "Efficiency", "Speed", "Throughput", "Latency", "Response Time", "Execution Time"
  - "Native Driver" → Incluir: "Raw queries", "Direct access", "Low-level driver", "Direct database operations"
  - "Code Complexity" → Incluir: "Code Quality", "Maintainability", "Technical Debt", "Cognitive Complexity"
  
  **REGLAS DE EXPANSIÓN:**
  - TRADUCCIÓN AUTOMÁTICA: Si los términos están en ESPAÑOL → traducir a INGLÉS + agregar sinónimos en inglés
  - Query final: 100% INGLÉS (idioma académico universal)
  - ESTRUCTURA: Cada bloque = un paréntesis con términos OR (variaciones + sinónimos)
  - EXPANSIÓN MÍNIMA: 7-10 términos por bloque I/C/O (variaciones + sinónimos), 5-7 por bloque P
  - WILDCARDS: Usar asteriscos (*) donde aplique (Perform*, Databas*, Efficien*)
  - SINÓNIMOS OBLIGATORIOS: Cada término técnico clave debe tener al menos 3 sinónimos conceptuales
  
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
MAL (solo variaciones sintácticas): 
  ("Mongoose" AND "Performance") OR ("Mongoose" AND "Latency") <- repetitivo, bajo recall

REGULAR (variaciones pero sin sinónimos conceptuales):
  ("Mongoose" OR "Mongoose ODM") AND ("Node.js" OR "Backend") AND ("Native Driver" OR "MongoDB Driver") AND ("Performance" OR "Latency")
  ⚠️ PROBLEMA: Perderás papers que mencionen "Raw queries" o "Direct access" en lugar de "Native Driver"

EXCELENTE (variaciones + sinónimos conceptuales - MAXIMIZA RECALL):
  ("Mongoose" OR "Mongoose ODM" OR "Object Document Mapper" OR "MongoDB ORM") AND 
  ("Node.js" OR "NodeJS" OR "Backend" OR "Server-side" OR "API Development") AND 
  ("Native Driver" OR "MongoDB Driver" OR "Raw queries" OR "Direct access" OR "Direct MongoDB" OR "Low-level driver") AND 
  ("Performance" OR "Latency" OR "Throughput" OR "Response Time" OR "Speed" OR "Execution Time")
  ✅ BENEFICIO: Captura ALL los papers relevantes independientemente de la terminología usada por los autores

CRÍTICO: Si PICO-C = "Native Driver", tu query DEBE incluir:
  1. El término principal + variaciones ("Native Driver", "MongoDB Native Driver")
  2. Sinónimos conceptuales ("Raw queries", "Direct access", "Direct database operations")
  Solo así capturarás TODOS los estudios comparativos.

═══════════════════════════════════════════════════════════════
EJEMPLOS DE EXPANSIÓN POR BLOQUE
═══════════════════════════════════════════════════════════════

BLOQUE I - Mongoose (Ejemplo):
Variaciones: "Mongoose", "Mongoose ODM", "Mongoose.js", "Mongoose Library"
Sinónimos: "Object Document Mapper", "MongoDB ORM", "Node ODM", "Document Mapper"
Query: ("Mongoose" OR "Mongoose ODM" OR "Mongoose.js" OR "Object Document Mapper" OR "MongoDB ORM" OR "Node ODM")

BLOQUE P - Backend Development (Ejemplo):
Variaciones: "Backend", "Backend Development", "Server-side"
Sinónimos: "API Development", "Server Programming", "Web Services", "Backend Systems"
Query: ("Backend" OR "Backend Development" OR "Server-side" OR "API Development" OR "Server Programming")

BLOQUE C - Native Driver (Ejemplo) - CRÍTICO PARA ESTUDIOS COMPARATIVOS:
Variaciones: "Native Driver", "Native MongoDB Driver", "MongoDB Native"
Sinónimos conceptuales: "Raw queries", "Direct access", "Direct MongoDB", "Low-level driver", "Direct database operations"
Query: ("Native Driver" OR "Native MongoDB Driver" OR "Raw queries" OR "Direct access" OR "Direct MongoDB" OR "Low-level driver")

BLOQUE O - Performance (Ejemplo):
Término paraguas: "Performance"
Métricas específicas: "Latency", "Throughput"
Sinónimos: "Response Time", "Speed", "Execution Time", "Processing Time", "Efficiency"
Query: ("Performance" OR "Latency" OR "Throughput" OR "Response Time" OR "Speed" OR "Execution Time" OR "Efficiency")

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
DEBES incluir Bloque C con variaciones + sinónimos conceptuales del término de comparación.
SIN BLOQUE C = queries inútiles (solo traerán artículos de ${picoData?.intervention || 'la intervención'}, no comparativos).

` : ''}═══════════════════════════════════════════════════════════════
VALIDACIÓN ANTES DE ENVIAR (CRÍTICO PARA RECALL)
═══════════════════════════════════════════════════════════════

Antes de generar las queries, verifica MENTALMENTE:

✅ **BLOQUE I (Intervención):**
   - ¿Incluí el término principal + al menos 3 variaciones?
   - ¿Incluí al menos 3 sinónimos conceptuales que investigadores podrían usar?
   - Ejemplo: Si I = "Machine Learning" → ¿Incluí "ML", "Statistical Learning", "Predictive Modeling"?

✅ **BLOQUE P (Población/Contexto):**
   - ¿Incluí el contexto principal + al menos 2 variaciones?
   - ¿Incluí al menos 2 sinónimos de contexto?
   - Ejemplo: Si P = "Backend" → ¿Incluí "Server-side", "API Development", "Web Services"?

✅ **BLOQUE C (Comparación) - SI EXISTE:**
   - ¿Incluí el término de comparación + al menos 3 variaciones?
   - ¿Incluí al menos 3 sinónimos conceptuales? ← CRÍTICO para no perder estudios comparativos
   - Ejemplo: Si C = "Native Driver" → ¿Incluí "Raw queries", "Direct access", "Low-level driver"?

✅ **BLOQUE O (Outcomes):**
   - ¿Incluí el término paraguas (Performance, Efficiency, etc.)?
   - ¿Incluí al menos 3 métricas específicas?
   - ¿Incluí al menos 3 sinónimos de esas métricas?
   - Ejemplo: Si O = "Performance" → ¿Incluí "Latency", "Throughput", "Response Time", "Speed"?

✅ **CONSISTENCIA ENTRE BASES:**
   - ¿Todas las bases tienen los MISMOS conceptos, solo cambiando sintaxis?
   - ¿Ninguna base tiene términos que otras no tienen?

SI TODAS LAS VALIDACIONES PASAN → PROCEDER CON GENERACIÓN
SI ALGUNA FALLA → REVISAR Y EXPANDIR CON MÁS SINÓNIMOS

═══════════════════════════════════════════════════════════════

GENERA LAS ${databases.length} CADENAS DE BÚSQUEDA BALANCEADAS AHORA:
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

