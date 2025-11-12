const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GenerateSearchStrategiesUseCase {
  constructor() {
    // Inicializar OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      console.log('✅ OpenAI inicializado correctamente');
    } else {
      console.warn('⚠️  OPENAI_API_KEY no configurada - ChatGPT no disponible');
    }
    
    // Inicializar Gemini
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('✅ Gemini inicializado correctamente');
    } else {
      console.warn('⚠️  GEMINI_API_KEY no configurada - Gemini no disponible');
    }
    
    // Verificar que al menos uno esté disponible
    if (!this.openai && !this.gemini) {
      console.error('❌ ERROR CRÍTICO: Ningún proveedor de IA configurado');
      throw new Error('Se requiere al menos OPENAI_API_KEY o GEMINI_API_KEY');
    }
  }

  /**
   * Genera estrategias de búsqueda específicas por base de datos
   * @param {Object} params - Parámetros
   * @param {Object} params.matrixData - Datos de la matriz Es/No Es
   * @param {Object} params.picoData - Datos del marco PICO
   * @param {Array} params.keyTerms - Términos clave extraídos (opcional)
   * @param {Array} params.databases - Lista de bases de datos
   * @param {String} params.aiProvider - Proveedor de IA
   * @returns {Object} Estrategias por base de datos
   */
  async execute({ matrixData, picoData, keyTerms, databases, aiProvider = 'gemini' }) {
    try {
      console.log(`📝 Generando estrategias para ${databases.length} bases de datos...`);
      
      const strategies = {};
      
      // Generar estrategia para cada base de datos
      for (const database of databases) {
        console.log(`   Procesando: ${database}`);
        
        const strategy = await this._generateStrategyForDatabase({
          database,
          matrixData,
          picoData,
          keyTerms,
          aiProvider
        });
        
        strategies[database] = strategy;
      }
      
      console.log('✅ Estrategias generadas exitosamente');
      
      // Agregar recomendaciones de refinamiento
      const recommendations = this._generateRecommendations(strategies);
      
      return {
        success: true,
        data: {
          strategies,
          databases,
          recommendations,
          provider: aiProvider,
          methodology: 'Construcción sistemática basada en PRISMA/Cochrane'
        }
      };
    } catch (error) {
      console.error('❌ Error en GenerateSearchStrategiesUseCase:', error);
      throw new Error(`Error generando estrategias: ${error.message}`);
    }
  }

  /**
   * Genera estrategia para una base de datos específica
   */
  async _generateStrategyForDatabase({ database, matrixData, picoData, keyTerms, aiProvider }) {
    const context = this._buildContext(matrixData, picoData, keyTerms);
    const databaseRules = this._getDatabaseRules(database);
    const prompt = this._buildPrompt(context, database, databaseRules);
    
    let response;
    let usedProvider = aiProvider;
    
    try {
      if (aiProvider === 'gemini') {
        response = await this._generateWithGemini(prompt);
      } else {
        response = await this._generateWithChatGPT(prompt);
      }
    } catch (firstError) {
      console.error(`❌ Error con ${aiProvider}:`, firstError.message);
      console.warn(`🔄 Intentando fallback...`);
      
      // Fallback al otro proveedor
      try {
        if (aiProvider === 'gemini' && this.openai) {
          console.log('   → Intentando con ChatGPT...');
          usedProvider = 'chatgpt';
          response = await this._generateWithChatGPT(prompt);
          console.log('   ✅ ChatGPT funcionó correctamente');
        } else if (aiProvider === 'chatgpt' && this.gemini) {
          console.log('   → Intentando con Gemini...');
          usedProvider = 'gemini';
          response = await this._generateWithGemini(prompt);
          console.log('   ✅ Gemini funcionó correctamente');
        } else {
          const availableProviders = [];
          if (this.openai) availableProviders.push('OpenAI');
          if (this.gemini) availableProviders.push('Gemini');
          
          console.error(`❌ No hay proveedor alternativo disponible`);
          console.error(`   Proveedores configurados: ${availableProviders.join(', ') || 'ninguno'}`);
          throw new Error(`${aiProvider} falló y no hay alternativa disponible. Error: ${firstError.message}`);
        }
      } catch (secondError) {
        console.error(`❌ Fallback también falló:`, secondError.message);
        
        // Si ambos fallan, intentar devolver estrategia de respaldo
        console.warn(`⚠️  Usando estrategia genérica de respaldo para ${database}`);
        return this._parseStrategyResponse({
          searchString: this._generateFallbackStrategy(context, databaseRules),
          keyTerms: this._extractKeyTermsFromContext(context),
          synonymGroups: [],
          explanation: 'Estrategia genérica generada debido a fallo en proveedores de IA',
          coverage: 'Plantilla básica - requiere personalización',
          testingTips: ['Personaliza los términos según tu investigación']
        }, database);
      }
    }
    
    console.log(`   ✅ ${database} generado con ${usedProvider}`);
    return this._parseStrategyResponse(response, database);
  }

  /**
   * Genera estrategia usando ChatGPT
   */
  async _generateWithChatGPT(prompt) {
    if (!this.openai) {
      throw new Error('OpenAI API key no configurada');
    }

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un experto en búsquedas bibliográficas y sintaxis de bases de datos académicas. Conoces perfectamente la sintaxis específica de cada base de datos. Respondes ÚNICAMENTE en formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content || content.trim().length === 0) {
      throw new Error('Respuesta vacía de ChatGPT');
    }
    return JSON.parse(content);
  }

  /**
   * Genera estrategia usando Gemini con retry automático
   */
  async _generateWithGemini(prompt, retries = 2) {
    if (!this.gemini) {
      throw new Error('Gemini API key no configurada');
    }

    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`   🔄 Gemini intento ${attempt}/${retries}...`);
        
        const model = this.gemini.getGenerativeModel({ 
          model: "models/gemini-2.5-flash",
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 4096
          }
        });

        const fullPrompt = `${prompt}

CRÍTICO: 
- Responde ÚNICAMENTE con JSON válido
- Usa SOLO comillas dobles normales (")
- NO uses markdown`;

        // Timeout de 30 segundos
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Gemini tardó más de 30 segundos')), 30000)
        );

        const generatePromise = model.generateContent({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 4096,
            responseMimeType: "application/json"
          }
        });

        const result = await Promise.race([generatePromise, timeoutPromise]);
        
        const response = await result.response;
        let text = await response.text();
        
        // Normalizar y limpiar texto
        text = text.trim()
          .replace(/[\u201C\u201D\u201E\u201F""]/g, '"')
          .replace(/[\u2018\u2019\u201A\u201B'']/g, "'")
          .replace(/[\u2013\u2014–—]/g, '-')
          .replace(/\u2026…/g, '...')
          .replace(/\uFEFF/g, '')
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n');
        
        // Extraer JSON del texto
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          text = text.slice(firstBrace, lastBrace + 1);
        }
        
        // Limpiar markdown
        if (text.startsWith('```json')) {
          text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (text.startsWith('```')) {
          text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }
        
        const cleaned = text.trim();
        
        if (!cleaned || cleaned.length < 2) {
          throw new Error('Respuesta vacía de Gemini');
        }
        
        const parsed = JSON.parse(cleaned);
        console.log(`   ✅ Gemini respondió correctamente`);
        return parsed;
        
      } catch (error) {
        lastError = error;
        console.error(`   ❌ Intento ${attempt} falló:`, error.message);
        
        // Si no es el último intento, esperar antes de reintentar
        if (attempt < retries) {
          const waitTime = attempt * 2000; // 2s, 4s
          console.log(`   ⏳ Esperando ${waitTime/1000}s antes de reintentar...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    // Mejorar mensaje de error según el tipo
    if (lastError.message && lastError.message.includes('fetch failed')) {
      throw new Error('Error de conexión con Gemini API - verifica tu conexión a internet o firewall');
    } else if (lastError.message && (lastError.message.includes('503') || lastError.message.includes('Service Unavailable'))) {
      throw new Error('Gemini API temporalmente no disponible (503) - intenta con ChatGPT o espera unos minutos');
    } else if (lastError.message && lastError.message.includes('429')) {
      throw new Error('Límite de solicitudes excedido (429) - espera un momento o cambia a ChatGPT');
    } else if (lastError.message && lastError.message.includes('Timeout')) {
      throw new Error('Gemini API no responde (timeout) - verifica tu conexión o intenta con ChatGPT');
    } else if (lastError instanceof SyntaxError) {
      console.error('❌ Error parseando JSON de Gemini');
      throw new Error(`Gemini devolvió JSON inválido: ${lastError.message}`);
    }
    
    throw lastError;
  }

  /**
   * Construye el contexto del proyecto con estructura PICO
   */
  _buildContext(matrixData, picoData, keyTerms) {
    let context = '';
    
    context += '**CONTEXTO DE INVESTIGACIÓN:**\n\n';
    
    if (picoData) {
      context += '**Marco PICO (base para estrategia de búsqueda):**\n';
      if (picoData.population) {
        context += `- P (Población/Contexto): ${picoData.population}\n`;
        context += `  → Conceptos a buscar: Identifica términos principales y sinónimos\n`;
      }
      if (picoData.intervention) {
        context += `- I (Intervención/Tecnología): ${picoData.intervention}\n`;
        context += `  → Conceptos a buscar: Incluye variantes, acrónimos y términos relacionados\n`;
      }
      if (picoData.comparison) {
        context += `- C (Comparación): ${picoData.comparison}\n`;
        context += `  → Conceptos a buscar: Si aplica, agrega alternativas o métodos comparados\n`;
      }
      if (picoData.outcomes) {
        context += `- O (Resultados esperados): ${picoData.outcomes}\n`;
        context += `  → Conceptos a buscar: Términos de evaluación, métricas, impactos\n`;
      }
      context += '\n';
    }
    
    if (matrixData) {
      context += '**Matriz Es/No Es (clarificación de alcance):**\n';
      if (matrixData.population) context += `- Población: ${matrixData.population}\n`;
      if (matrixData.intervention) context += `- Intervención: ${matrixData.intervention}\n`;
      if (matrixData.outcomes) context += `- Resultados: ${matrixData.outcomes}\n`;
      if (matrixData.comparison) context += `- Comparación: ${matrixData.comparison}\n`;
      context += '\n';
    }
    
    if (keyTerms && keyTerms.length > 0) {
      context += `**Términos clave identificados:** ${keyTerms.join(', ')}\n`;
      context += '→ Usa estos como punto de partida, expándelos con sinónimos\n\n';
    }
    
    context += '**INSTRUCCIONES DE CONSTRUCCIÓN:**\n';
    context += '1. Para cada elemento PICO, genera 2-4 sinónimos o variantes\n';
    context += '2. Agrupa sinónimos con OR dentro de paréntesis\n';
    context += '3. Conecta grupos de conceptos con AND\n';
    context += '4. Usa comillas para frases exactas\n';
    context += '5. Considera variantes UK/US (optimise/optimize, colour/color)\n';
    
    return context;
  }

  /**
   * Obtiene las reglas sintácticas de cada base de datos
   */
  _getDatabaseRules(database) {
    const rules = {
      scopus: {
        name: 'Scopus',
        fields: {
          title: 'TITLE',
          abstract: 'ABS',
          keywords: 'KEY',
          titleAbsKey: 'TITLE-ABS-KEY',
          author: 'AUTHOR-NAME',
          affiliation: 'AFFIL',
          year: 'PUBYEAR'
        },
        operators: {
          and: 'AND',
          or: 'OR',
          not: 'AND NOT',
          proximity: 'W/',
          wildcard: '*',
          phrase: '""'
        },
        notes: [
          'TITLE-ABS-KEY() busca en título, resumen y palabras clave simultáneamente',
          'Los operadores NOT deben expandirse: "AND NOT term1 AND NOT term2"',
          'Agrupa sinónimos con OR dentro de paréntesis, conceptos con AND fuera',
          'W/n indica proximidad de palabras (W/3 = máximo 3 palabras entre términos)',
          'Usa * para truncamiento (ej: "learn*" encuentra learn, learning, learned)',
          'Comillas "" para frases exactas (ej: "machine learning")'
        ],
        example: 'TITLE-ABS-KEY(("machine learning" OR "ML" OR "artificial intelligence" OR "AI") AND ("classification" OR "prediction") AND NOT ("deep learning" OR "neural network"))',
        bestPractices: [
          'Incluye siempre 2-3 sinónimos por concepto principal',
          'Usa paréntesis para controlar precedencia de operadores',
          'Considera variantes UK/US (optimise vs optimize)',
          'Combina términos amplios (OR) con específicos (AND)'
        ]
      },
      ieee: {
        name: 'IEEE Xplore',
        fields: {
          title: '"Document Title"',
          abstract: '"Abstract"',
          keywords: '"Author Keywords"',
          indexTerms: '"IEEE Terms"',
          metadata: '"Metadata"'
        },
        operators: {
          and: 'AND',
          or: 'OR',
          not: 'NOT',
          proximity: 'NEAR/',
          wildcard: '*',
          phrase: '""'
        },
        notes: [
          'Nombres de campos van entre comillas: "Document Title"',
          'NEAR/n busca términos cercanos (NEAR/5 = 5 palabras máximo)',
          'Usa * para truncamiento al final de palabras',
          'Los campos específicos mejoran precisión pero reducen cobertura',
          'Operador : asigna búsqueda a un campo específico'
        ],
        example: '("Document Title":"machine learning" OR "Document Title":"ML") AND ("Abstract":"classification" OR "Abstract":"prediction") NOT "deep learning"',
        bestPractices: [
          'Combina búsqueda en título y abstract para mejor cobertura',
          'Usa "Author Keywords" para términos muy específicos',
          'NEAR/ es útil para relaciones conceptuales ("algorithm" NEAR/3 "optimization")'
        ]
      },
      acm: {
        name: 'ACM Digital Library',
        fields: {
          any: 'AllField',
          title: 'Title',
          abstract: 'Abstract',
          keywords: 'Keyword'
        },
        operators: {
          and: 'AND',
          or: 'OR',
          not: 'NOT',
          phrase: '""'
        },
        notes: [
          'Sintaxis simple similar a búsqueda web',
          'Usa + para términos obligatorios',
          'Usa - para excluir términos',
          'Notación de campo: Title:(términos) o Abstract:(términos)'
        ],
        example: '+Title:(machine learning) +Abstract:(classification) -"deep learning"',
        bestPractices: [
          'Comienza con búsqueda amplia en AllField',
          'Refina con campos específicos si hay muchos resultados',
          'Usa comillas para frases exactas'
        ]
      },
      wos: {
        name: 'Web of Science',
        fields: {
          topic: 'TS',
          title: 'TI',
          abstract: 'AB',
          author: 'AU',
          keywords: 'AK'
        },
        operators: {
          and: 'AND',
          or: 'OR',
          not: 'NOT',
          proximity: 'NEAR/',
          same: 'SAME',
          wildcard: '*',
          phrase: '""'
        },
        notes: [
          'TS= (Topic) busca en título, abstract, keywords y Keywords Plus simultáneamente',
          'NEAR/n busca términos dentro de n palabras (TS=("algorithm" NEAR/5 "optimization"))',
          'SAME busca términos en el mismo campo/registro',
          'Usa $ o * para truncamiento (optimi$ation = optimisation o optimization)',
          'Operador = asigna la búsqueda al campo especificado'
        ],
        example: 'TS=(("machine learning" OR "ML" OR "artificial intelligence") AND ("classification" OR "prediction")) NOT TS=("deep learning" OR "neural network")',
        bestPractices: [
          'TS= es el campo más completo, úsalo como base principal',
          'NEAR/ útil para capturar relaciones contextuales',
          'Combina variantes ortográficas con $ (organi$ation)',
          'NOT excluye falsos positivos comunes'
        ]
      },
      scholar: {
        name: 'Google Scholar',
        fields: {
          title: 'intitle',
          author: 'author',
          anywhere: 'allintitle'
        },
        operators: {
          and: 'AND',
          or: 'OR',
          not: '-',
          phrase: '""',
          required: '+'
        },
        notes: [
          'Sintaxis simple tipo Google',
          'intitle: busca términos en el título',
          'Usa - para excluir términos',
          'Agrupa con paréntesis para operadores complejos'
        ],
        example: 'intitle:"machine learning" (classification OR prediction) -"deep learning"',
        bestPractices: [
          'Google Scholar es menos formal, prioriza relevancia sobre sintaxis',
          'Usa comillas para frases exactas',
          'Combina intitle: con términos generales para mejor balance'
        ]
      },
      springer: {
        name: 'Springer Link',
        fields: {
          any: '',
          title: 'title',
          keyword: 'keyword'
        },
        operators: {
          and: 'AND',
          or: 'OR',
          not: 'NOT',
          phrase: '""'
        },
        notes: [
          'Búsqueda avanzada con operadores booleanos estándar',
          'Especifica campos con prefijos (title:, keyword:)',
          'Usa comillas para frases exactas',
          'Paréntesis para agrupar términos relacionados'
        ],
        example: 'title:"machine learning" AND keyword:(classification OR prediction) NOT "deep learning"',
        bestPractices: [
          'Combina búsqueda en título y keywords para precisión',
          'Usa NOT para excluir áreas no relacionadas',
          'Los operadores booleanos deben ir en MAYÚSCULAS'
        ]
      },
      sciencedirect: {
        name: 'ScienceDirect',
        fields: {
          any: '',
          title: 'Title',
          abstract: 'Abstract',
          keywords: 'Keywords',
          titleAbsKey: 'Title-Abstr-Key'
        },
        operators: {
          and: 'AND',
          or: 'OR',
          not: 'AND NOT',
          phrase: '""',
          wildcard: '*'
        },
        notes: [
          'Sintaxis similar a Scopus (mismo propietario: Elsevier)',
          'Title-Abstr-Key() busca en título, abstract y keywords simultáneamente',
          'Soporta wildcards con * para truncamiento',
          'Los operadores NOT se escriben como AND NOT'
        ],
        example: 'Title-Abstr-Key(("machine learning" OR "ML") AND ("classification" OR "prediction")) AND NOT "deep learning"',
        bestPractices: [
          'Title-Abstr-Key() es el campo más completo, úsalo como base',
          'Sintaxis muy similar a Scopus, fácil de adaptar',
          'Usa wildcards (*) para capturar variaciones morfológicas'
        ]
      }
    };
    
    return rules[database.toLowerCase()] || rules.scopus;
  }

  /**
   * Construye el prompt para generar estrategia
   */
  _buildPrompt(context, database, rules) {
    return `Eres un experto en búsquedas bibliográficas sistemáticas para ${rules.name}.

**Contexto del proyecto:**
${context}

**Tu tarea:** Construir una cadena de búsqueda siguiendo metodología RSL (PRISMA/Cochrane).

**PASO 1 - Identificar conceptos semánticos:**
Del contexto, extrae los 3-4 conceptos principales (ej: Población, Intervención, Resultado).

**PASO 2 - Generar sinónimos y variantes:**
Para cada concepto, identifica sinónimos, acrónimos, plurales y términos relacionados.
Ejemplo: "machine learning" → ["machine learning", "ML", "artificial intelligence", "AI"]

**PASO 3 - Combinar con operadores booleanos:**
- Dentro de cada concepto: usa OR (sinónimos)
- Entre conceptos: usa AND (relación lógica)
- Agrupa con paréntesis para claridad

**PASO 4 - Adaptar a sintaxis ${rules.name}:**
**Campos disponibles:** ${Object.entries(rules.fields).map(([k, v]) => `${k}: ${v}`).join(', ')}
**Operadores:** ${Object.values(rules.operators).join(', ')}
**Ejemplo de sintaxis válida:** 
${rules.example}

${rules.bestPractices ? '**Mejores prácticas ' + rules.name + ':**\n' + rules.bestPractices.map(p => `- ${p}`).join('\n') : ''}

**PASO 5 - Validar cobertura y precisión:**
- ¿Cubre todos los conceptos del PICO? (P, I, C, O)
- ¿Incluye variantes lingüísticas? (UK/US: optimise/optimize, colour/color)
- ¿Es específica pero no demasiado restrictiva?
- ¿Agrupa correctamente con paréntesis para precedencia?

**PASO 6 - Considerar refinamiento futuro:**
- Identificar términos que podrían causar falsos positivos (para excluir con NOT)
- Sugerir cómo simplificar para testing inicial
- Indicar cómo expandir si hay pocos resultados

**Formato JSON (responde SOLO esto):**
{
  "searchString": "cadena de búsqueda completa adaptada a ${rules.name}",
  "keyTerms": ["término1", "término2", "término3"],
  "synonymGroups": [
    {"concept": "Población/Contexto", "terms": ["term1", "term2", "term3"]},
    {"concept": "Intervención/Tecnología", "terms": ["term3", "term4", "term5"]},
    {"concept": "Resultado/Outcome", "terms": ["term6", "term7"]}
  ],
  "explanation": "Explica la lógica de la cadena: qué conceptos combina y por qué",
  "coverage": "Indica qué elementos del PICO/contexto se cubrieron (P, I, C, O)",
  "testingTips": [
    "Sugerencia 1 para probar esta cadena en ${rules.name}",
    "Sugerencia 2 sobre cómo refinar según resultados"
  ]
}

**REQUISITOS CRÍTICOS:**
- searchString debe ser UNA SOLA LÍNEA ejecutable
- Usa sintaxis EXACTA de ${rules.name} (respeta campos y operadores)
- Incluye al menos 2-3 sinónimos por concepto clave
- Agrupa términos con paréntesis para precedencia correcta
- Responde SOLO JSON válido, sin markdown`;
  }

  /**
   * Parsea la respuesta de estrategia
   */
  _parseStrategyResponse(parsedJson, database) {
    try {
      // La respuesta ya viene parseada
      const parsed = parsedJson;
      
      return {
        searchString: parsed.searchString || '',
        keyTerms: parsed.keyTerms || [],
        synonymGroups: parsed.synonymGroups || [],
        explanation: parsed.explanation || 'Estrategia generada automáticamente',
        coverage: parsed.coverage || 'Cobertura completa del contexto',
        testingTips: parsed.testingTips || [
          'Prueba primero con una versión simplificada de la cadena',
          'Si obtienes muchos resultados, añade más términos específicos con AND'
        ],
        database: database,
        methodology: 'Basado en PRISMA/Cochrane - construcción sistemática por conceptos'
      };
      
    } catch (error) {
      console.error(`❌ Error parseando estrategia para ${database}:`, error);
      
      // Estrategia de respaldo
      return {
        searchString: `("population terms") AND ("intervention terms") AND ("outcome terms")`,
        keyTerms: [],
        synonymGroups: [],
        explanation: 'Estrategia genérica de respaldo - requiere personalización manual según PICO',
        coverage: 'Plantilla básica PICO - expandir con términos específicos',
        testingTips: [
          'Reemplaza "population terms" con términos de tu contexto/población',
          'Reemplaza "intervention terms" con tu tecnología/intervención',
          'Reemplaza "outcome terms" con tus resultados esperados',
          'Añade sinónimos con OR: ("term1" OR "synonym1" OR "synonym2")'
        ],
        database: database,
        error: true,
        methodology: 'Plantilla genérica - personalizar según proyecto específico'
      };
    }
  }

  /**
   * Genera recomendaciones para refinar y validar las búsquedas
   */
  _generateRecommendations(strategies) {
    return {
      testing: [
        '🧪 Prueba primero con combinaciones pequeñas para validar sintaxis',
        '📊 Anota el número de resultados de cada prueba en una tabla',
        '🎯 Si obtienes 0 resultados, elimina términos muy específicos',
        '📉 Si obtienes >1000 resultados, añade más filtros AND'
      ],
      refinement: [
        '📅 Aplica filtros temporales (ej: 2019-2025 para tecnologías actuales)',
        '🌐 Filtra por idioma (generalmente Inglés)',
        '📄 Selecciona tipo de documento (journal articles, conference papers)',
        '🎓 Filtra por área temática (Computer Science, Engineering)'
      ],
      validation: [
        '✅ Revisa los primeros 10-15 artículos recuperados',
        '🎯 Verifica que al menos 70% sean relevantes a tu pregunta',
        '📋 Si hay muchos falsos positivos, usa AND NOT para excluirlos',
        '🔄 Itera: ajusta términos según lo que encuentres'
      ],
      documentation: [
        '📝 Registra cada cadena probada con fecha y resultados',
        '📊 Documenta qué bases dieron mejores resultados',
        '🔍 Guarda ejemplos de artículos relevantes encontrados',
        '📑 Incluye todo esto en la sección "Estrategia de búsqueda" del protocolo'
      ],
      transparency: [
        '📢 Documenta cambios realizados a las cadenas originales',
        '🎯 Justifica por qué incluiste o excluiste ciertos términos',
        '📊 Reporta número de resultados por base y por iteración',
        '✨ Esto cumple con requisitos de transparencia PRISMA'
      ]
    };
  }

  /**
   * Genera una estrategia de respaldo básica cuando fallan los proveedores IA
   */
  _generateFallbackStrategy(context, rules) {
    // Estrategia básica usando sintaxis de la base de datos
    const field = rules.fields.titleAbsKey || rules.fields.topic || rules.fields.title || '';
    const andOp = rules.operators.and;
    const orOp = rules.operators.or;
    
    // Estructura básica PICO
    if (field) {
      return `${field}(("population terms" ${orOp} "context") ${andOp} ("intervention" ${orOp} "technology") ${andOp} ("outcome" ${orOp} "result"))`;
    } else {
      return `("population terms" ${orOp} "context") ${andOp} ("intervention" ${orOp} "technology") ${andOp} ("outcome" ${orOp} "result")`;
    }
  }

  /**
   * Extrae términos clave básicos del contexto
   */
  _extractKeyTermsFromContext(context) {
    const terms = [];
    
    // Extraer términos entre comillas o después de dos puntos
    const matches = context.match(/[:"']([^:"']+)[:"']/g);
    if (matches) {
      matches.forEach(match => {
        const term = match.replace(/[:"']/g, '').trim();
        if (term.length > 3 && !terms.includes(term)) {
          terms.push(term);
        }
      });
    }
    
    return terms.slice(0, 5); // Máximo 5 términos
  }
}

module.exports = GenerateSearchStrategiesUseCase;
