const OpenAI = require('openai');

class GenerateTitlesUseCase {
  constructor() {
    // Inicializar OpenAI/ChatGPT
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  /**
   * Genera 5 opciones de títulos con validación Cochrane
   * @param {Object} params - Parámetros
   * @param {Object} params.matrixData - Datos de la matriz Es/No Es
   * @param {Object} params.picoData - Datos del marco PICO
   * @param {String} params.aiProvider - Proveedor de IA ('chatgpt', 'chatgpt' o 'gemini')
   * @returns {Object} Resultado con 5 títulos y validación
   */
  async execute({ matrixData, picoData, aiProvider = 'chatgpt' }) {
    try {
      console.log('Generando 5 títulos con validación Cochrane...');
      
      if (!this.openai) {
        throw new Error('No hay proveedor de IA configurado');
      }
      
      // Construir contexto del proyecto
      const context = this._buildContext(matrixData, picoData);
      
      // Construir prompt para el AI
      const prompt = this._buildPrompt(context);
      
      // Llamar al servicio de IA
      let response;
      try {
        response = await this._generateWithChatGPT(prompt);
      } catch (error) {
        console.error(`Error con ChatGPT:`, error.message);
        throw error;
      }
      
      // Log de respuesta cruda para debugging
      console.log('Respuesta cruda de la IA:', JSON.stringify(response).substring(0, 500));
      
      // Parsear respuesta
      const titles = this._parseResponse(response);
      
      console.log(`Generados ${titles.length} títulos exitosamente con chatgpt`);
      
      return {
        success: true,
        data: {
          titles,
          provider: 'chatgpt'
        }
      };
    } catch (error) {
      console.error('Error en GenerateTitlesUseCase:', error);
      throw new Error(`Error generando títulos: ${error.message}`);
    }
  }

  /**
   * Genera títulos usando ChatGPT
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
          content: "Eres un Editor en Jefe de un Journal de Ingeniería de alto impacto (Q1). REGLAS CRÍTICAS ABSOLUTAS: (1) OUTCOMES: Usa SOLO términos paraguas (Performance, Efficiency, Scalability, Reliability, Usability, Security). PROHIBIDO listar métricas (Latency, Throughput, Accuracy, etc.). (2) COMPARACIÓN: Si PICO-C existe, MÍNIMO 4 de 5 títulos DEBEN incluir 'vs' o 'versus' explícitamente. (3) ESTILO Q1/Q2: Títulos declarativos/descriptivos. PROHIBIDO: 'Exploring', 'Investigating', 'A Study of'. SÍ: '[I] vs [C] for [O]', '[O] of [I] Compared to [C]'. Respondes ÚNICAMENTE en formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.6, // Aumentado a 0.6 para evitar que los 5 títulos suenen idénticos
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content);
  }

  /**
   * Construye el contexto del proyecto desde matriz y PICO
   */
  _buildContext(matrixData, picoData) {
    let context = '';
    
    if (matrixData) {
      context += '**Matriz Es/No Es:**\n';
      if (matrixData.population) context += `- Población: ${matrixData.population}\n`;
      if (matrixData.intervention) context += `- Intervención: ${matrixData.intervention}\n`;
      if (matrixData.need) context += `- Necesidad: ${matrixData.need}\n`;
      if (matrixData.outcomes) context += `- Resultados Esperados: ${matrixData.outcomes}\n`;
      if (matrixData.provider) context += `- Proveedor: ${matrixData.provider}\n`;
      if (matrixData.studyType) context += `- Tipo de Estudio: ${matrixData.studyType}\n`;
      if (matrixData.comparison) context += `- Comparación: ${matrixData.comparison}\n`;
      context += '\n';
    }
    
    if (picoData) {
      context += '**Marco PICO (definido en paso anterior):**\n';
      if (picoData.population) context += `- P (Población): ${picoData.population}\n`;
      if (picoData.intervention) context += `- I (Intervención): ${picoData.intervention}\n`;
      if (picoData.comparison) context += `- C (Comparación): ${picoData.comparison}\n`;
      if (picoData.outcome || picoData.outcomes) context += `- O (Resultados): ${picoData.outcome || picoData.outcomes}\n`;
    }
    
    return context;
  }

  /**
   * Construye el prompt para generar títulos usando los datos PICO ya definidos en el paso anterior
   */
  _buildPrompt(context) {
    return `Eres un Senior Research Editor especializado en ingeniería y metodología PRISMA 2020. Tu objetivo es generar 5 títulos académicos de alto impacto para una Revisión Sistemática de Literatura.

═══════════════════════════════════════════════════════════════
DATOS PICO DEL PROTOCOLO (Ya definidos en paso anterior - USAR TAL CUAL)
═══════════════════════════════════════════════════════════════
${context}

⚠️ IMPORTANTE: Los datos PICO arriba ya fueron validados metodológicamente. NO los reinterpretes ni modifiques. Úsalos directamente como insumo para construir los títulos.

═══════════════════════════════════════════════════════════════
REGLAS DE REDACCIÓN ACADÉMICA PARA TÍTULOS
═══════════════════════════════════════════════════════════════

1. **PRISMA Ítem 1**: El título DEBE incluir la naturaleza del estudio: "A Systematic Review", "A Scoping Review" o "Evidence Synthesis".

2. **Outcome (O) Sintetizado (Umbrella Term)**: 
   - ⚠️⚠️⚠️ CRÍTICO ABSOLUTO: NO listes métricas individuales (e.g., "latency", "throughput", "accuracy", "precision", "cost", "time").
   - ⚠️⚠️⚠️ PROHIBIDO usar comas, "+", "and", "y" en Outcomes del título.
   - DEBES usar UN SOLO término "paraguas" que englobe el impacto.
   - **Términos paraguas OBLIGATORIOS para Ingeniería:**
     * "Latency + Throughput + Response Time" → "**Performance**" (NO: "Latency and Throughput")
     * "Scalability + Load Handling + Concurrency" → "**Scalability**" (NO: "Scalability and Concurrency")
     * "Productivity + Maintainability + Code Quality" → "**Development Efficiency**" (NO: "Productivity and Maintainability")
     * "Error Rate + Uptime + Fault Tolerance" → "**Reliability**" (NO: "Reliability and Uptime")
     * "Learning Curve + Ease of Use + DX" → "**Usability**" (NO: "Usability and Learning Curve")
     * "Security + Authentication + Vulnerability" → "**Security**" (NO: "Security and Authentication")
     * "CPU + Memory + Disk I/O" → "**Resource Consumption**" (NO: "CPU and Memory Usage")
   - El título debe leerse fluido y académico, usando UN SOLO término paraguas.
   - ❌ EJEMPLO INCORRECTO: "[I] vs [C] for Latency and Throughput in [P]" 
   - ✅ EJEMPLO CORRECTO: "[I] vs [C] for Performance in [P]"

3. **Comparador (C) - REGLA CRÍTICA**: 
   - ⚠️⚠️⚠️ Si el PICO tiene Comparison (C) definida, esto es una FORTALEZA metodológica que DEBE aparecer en el título.
   - **OBLIGATORIO ABSOLUTO:** Mínimo 4 de 5 títulos DEBEN incluir la comparación explícitamente con "vs" o "versus".
   - ❌ NO omitir la comparación aunque el título se vea largo.
   - ❌ NO usar comparación implícita o vaga ("different approaches", "alternative methods").
   - ✅ Formato comparativo EXPLÍCITO: "[I] vs [C] for [O] in [P]" o "[O] of [I] Compared to [C] in [P]"
   - ✅ La comparación debe ser ESPECÍFICA: "Mongoose vs Native Driver", "React Hooks vs Redux", NO "ORM vs Traditional Methods".
   - ⚠️ Si el usuario definió C en PICO, es porque quiere comparar. NO lo ignores en el título.

4. **Estilo Declarativo/Descriptivo (Q1/Q2)**:
   - ⚠️⚠️⚠️ Preferir títulos que DECLARAN lo que se compara/evalúa (NO usar verbos exploratorios).
   - ✅ Ejemplos CORRECTOS Q1/Q2: 
     * "Mongoose vs Native Driver for Performance in Node.js Backend Systems" (DECLARATIVO, término paraguas "Performance")
     * "React Hooks vs Redux for Development Efficiency in Enterprise Web Applications" (DECLARATIVO, término paraguas "Development Efficiency")
   - ❌ PROHIBIDO ABSOLUTO: "A Study of...", "Exploring...", "Investigating...", "Analyzing...", "Examining..."
   - ❌ PROHIBIDO: Listar múltiples métricas: "for Latency, Throughput, and Scalability" → debe ser "for Performance"
   - ✅ SÍ usar: "[Tech A] vs [Tech B] for [Umbrella Term]", "[Umbrella Term] of [Tech] Compared to [Baseline]"

5. **Sin buzzwords**: Prohibido usar "Moderno", "Avanzado", "Reciente", "Impacto general", "Mejora", "Estudio sobre", "Exploring", "Investigating".

6. **Longitud**: Entre 12 y 18 palabras.

7. **Precisión técnica**: Usar la terminología exacta del PICO para P, I, C y términos paraguas para O.

═══════════════════════════════════════════════════════════════
PATRONES DE ESTRUCTURA (Prioridad a Comparativos si C existe)
═══════════════════════════════════════════════════════════════

**CUANDO HAY COMPARACIÓN (C) - USAR ESTOS 4 PATRONES PRIMERO (MÍNIMO 4 DE 5 TÍTULOS):**
⚠️ RECORDATORIO: [O] DEBE SER UN SOLO TÉRMINO PARAGUAS (Performance, Efficiency, Scalability, Reliability, Usability, Security, Resource Consumption, Development Efficiency)

**Patrón C1** (Declarativo directo - PREFERIDO): [I] vs [C] for [O] in [P]: A Systematic Review
   Ejemplo: "Mongoose vs Native Driver for Performance in Node.js Backend Systems: A Systematic Review"
   ❌ NO: "Mongoose vs Native Driver for Latency and Throughput in Node.js Backend Systems"

**Patrón C2** (Outcome primero): [O] of [I] Compared to [C] in [P]: A Systematic Review
   Ejemplo: "Performance of Mongoose Compared to Native Driver in Node.js Backend Systems: A Systematic Review"

**Patrón C3** (Comparativo nominal): [I] and [C] for [O] in [P]: A Comparative Systematic Review
   Ejemplo: "Mongoose and Native Driver for Performance in Node.js Backend Systems: A Comparative Systematic Review"

**Patrón C4** (Evaluación): Evaluating [I] Against [C] for [O] in [P]: A Systematic Review
   Ejemplo: "Evaluating Mongoose Against Native Driver for Performance in Node.js Backend Systems: A Systematic Review"

**CUANDO NO HAY COMPARACIÓN - USAR ESTOS:**
**Patrón A** (Sin Comparison): [I] for [O] in [P]: A Systematic Review
**Patrón B** (Outcome primero): [O] of [I] in [P]: A Systematic Review
**Patrón D** (Scoping): [O] of [I] in [P]: A Scoping Review

═══════════════════════════════════════════════════════════════
JUSTIFICACIÓN (30-50 palabras en español)
═══════════════════════════════════════════════════════════════
Debe explicar el "Research Gap": por qué esa combinación de P + I + O merece ser investigada.
NO hablar de la gramática del título. Hablar del CONTENIDO y su relevancia científica.

PROHIBIDO: "El título refleja...", "Se utiliza el Patrón A...", "Este título integra..."
CORRECTO: Hablar del vacío de investigación y la relevancia del tema.

═══════════════════════════════════════════════════════════════
FORMATO JSON DE RESPUESTA
═══════════════════════════════════════════════════════════════

{
  "titles": [
    {
      "title": "Título en INGLÉS académico",
      "spanishTitle": "Traducción profesional al ESPAÑOL",
      "justification": "Justificación en español (30-50 palabras)",
      "spanishJustification": "Misma justificación",
      "cochraneCompliance": "full|partial",
      "wordCount": 15,
      "pattern": "A|B|C|D",
      "components": {
        "population": "[Del PICO-P]",
        "intervention": "[Del PICO-I]",
        "comparator": "[Del PICO-C o null]",
        "outcome": "[Del PICO-O]",
        "naturaleza": "Systematic Review / Scoping Review"
      },
      "validation": {
        "explicitReview": true,
        "clearPhenomenon": true,
        "hasPopulation": true,
        "hasOutcome": true,
        "isSpecific": true,
        "lengthOK": true
      }
    }
  ]
}

═══════════════════════════════════════════════════════════════
INSTRUCCIONES FINALES
═══════════════════════════════════════════════════════════════

1. Genera EXACTAMENTE 5 títulos DISTINTOS y NO REDUNDANTES
2. Mínimo 4 de 5 deben tener "cochraneCompliance": "full"
3. ⚠️⚠️⚠️ **CRÍTICO - UMBRELLA TERM:** Cada título DEBE usar UN SOLO término paraguas para O (Performance, Efficiency, Scalability, Reliability, Usability, Security, Resource Consumption, Development Efficiency). PROHIBIDO listar métricas (Latency, Throughput, Accuracy, etc.)
4. ⚠️⚠️⚠️ **CRÍTICO - COMPARACIÓN:** Si PICO tiene C (Comparison), MÍNIMO 4 de 5 títulos DEBEN usar patrones C1, C2, C3 o C4 con "vs" o "versus" EXPLÍCITO
5. Cada título DEBE tener justificación de 30-50 palabras
6. ⚠️⚠️⚠️ **Estilo Q1/Q2:** Títulos declarativos/descriptivos. PROHIBIDO ABSOLUTO: "Exploring", "Investigating", "A Study of", "Analyzing", "Examining"
7. Responde ÚNICAMENTE con JSON válido, sin texto adicional

⚠️⚠️⚠️ VALIDACIÓN FINAL ANTES DE ENVIAR JSON:
- ¿Cada título usa UN SOLO término paraguas para O? (NO listas de métricas)
- ¿Si C existe, al menos 4 títulos incluyen "vs" o "versus"?
- ¿NINGÚN título usa "Exploring", "Investigating", "A Study of"?
- ¿Cada componente.outcome es un término paraguas válido?

GENERA LOS 5 TÍTULOS AHORA:`;
  }

  /**
   * Parsea la respuesta del AI con validación completa
   */
  _parseResponse(parsedJson) {
    try {
      // La respuesta ya viene parseada desde los métodos de generación
      const parsed = parsedJson;
      
      // Validar estructura
      if (!parsed.titles || !Array.isArray(parsed.titles)) {
        throw new Error('Respuesta no contiene array de títulos');
      }
      
      if (parsed.titles.length < 5) {
        throw new Error(`Solo se generaron ${parsed.titles.length} títulos, se esperaban 5`);
      }
      
      // Validar cada título con schema completo
      const validatedTitles = parsed.titles.map((item, index) => {
        // Validar title
        if (!item.title || typeof item.title !== 'string') {
          throw new Error(`Título ${index + 1} inválido: falta propiedad 'title'`);
        }
        
        const title = item.title.trim();
        const wordCount = title.split(/\s+/).length;
        
        // Validar longitud (5-22 palabras)
        if (wordCount < 5) {
          console.warn(`Título ${index + 1} muy corto (${wordCount} palabras): "${title.substring(0, 50)}..."`);
        }
        if (wordCount > 22) {
          console.warn(`Título ${index + 1} muy largo (${wordCount} palabras): "${title.substring(0, 50)}..."`);
        }
        
        // Validar compliance
        const compliance = item.cochraneCompliance || 'partial';
        if (!['full', 'partial', 'none'].includes(compliance)) {
          console.warn(`Compliance inválido para título ${index + 1}, usando 'partial'`);
        }
        
        // Validar components (actualizado con validación de outcome)
        const components = item.components || {};
        
        // CRÍTICO: Validar que todos los componentes PICO estén presentes
        const missingComponents = [];
        if (!components.population) missingComponents.push('population');
        if (!components.intervention) missingComponents.push('intervention');
        if (!components.outcome) missingComponents.push('outcome'); // NUEVO: Outcome es obligatorio
        
        if (missingComponents.length > 0) {
          console.warn(`Título ${index + 1} falta components PICO requeridos: ${missingComponents.join(', ')}`);
        }
        
        // Validar que el outcome sea un término paraguas válido (NO métricas individuales)
        if (components.outcome) {
          const validUmbrellaTerms = [
            'performance', 'efficiency', 'scalability', 'reliability', 'usability', 
            'security', 'resource consumption', 'development efficiency', 'maintainability',
            'productivity', 'accuracy', 'effectiveness', 'quality', 'abstraction'
          ];
          
          const invalidMetrics = [
            'latency', 'throughput', 'response time', 'cpu', 'memory', 'disk',
            'precision', 'recall', 'f1-score', 'accuracy rate', 'error rate',
            'time', 'cost', 'yield', 'speed', 'duration', 'delay'
          ];
          
          const outcomeLower = components.outcome.toLowerCase();
          const hasCommaOrAnd = outcomeLower.includes(',') || outcomeLower.includes(' and ') || outcomeLower.includes(' y ');
          const isInvalidMetric = invalidMetrics.some(metric => outcomeLower.includes(metric));
          const isValidUmbrella = validUmbrellaTerms.some(term => outcomeLower.includes(term));
          
          if (hasCommaOrAnd) {
            console.warn(`⚠️ Título ${index + 1} lista múltiples métricas: "${components.outcome}" - DEBE usar UN SOLO término paraguas (Performance, Efficiency, etc.)`);
          }
          
          if (isInvalidMetric && !isValidUmbrella) {
            console.warn(`⚠️ Título ${index + 1} usa métrica individual: "${components.outcome}" - DEBE usar término paraguas (Performance en vez de Latency/Throughput)`);
          }
        }
        
        // Validar justification (OBLIGATORIO)
        const justification = item.justification || item.reasoning || '';
        if (!justification || justification.length < 20) {
          console.warn(`Título ${index + 1} tiene justificación faltante o muy corta (${justification.length} caracteres)`);
        } else {
          console.log(`Título ${index + 1} tiene justificación (${justification.length} caracteres)`);
        }
        
        // Extraer título en español y justificación en español
        const spanishTitle = item.spanishTitle || title; // Si no hay traducción, usar el título original
        const spanishJustification = item.spanishJustification || justification;
        
        return {
          title: title,
          spanishTitle: spanishTitle,
          cochraneCompliance: ['full', 'partial', 'none'].includes(compliance) ? compliance : 'partial',
          justification: justification || 'Sin justificación proporcionada',
          spanishJustification: spanishJustification || 'Sin justificación proporcionada',
          reasoning: justification || 'Sin justificación proporcionada', // Mantener por compatibilidad
          components: {
            population: components.population || 'unspecified',
            intervention: components.intervention || 'unspecified',
            comparator: components.comparator || components.comparison || null, // Soportar ambos nombres
            outcome: components.outcome || 'unspecified' // CRÍTICO: Outcome debe estar presente
          },
          wordCount: wordCount,
          // Agregar flag de validación para outcome
          hasExplicitOutcome: components.outcome && components.outcome !== 'unspecified' && components.outcome.length > 3
        };
      });
      
      // Verificar que al menos 3 sean 'full' compliance
      const fullCount = validatedTitles.filter(t => t.cochraneCompliance === 'full').length;
      if (fullCount < 3) {
        console.warn(`Solo ${fullCount} títulos tienen 'full' compliance, se esperaban al menos 3`);
      }
      
      // NUEVA VALIDACIÓN: Verificar que si hay Comparación (C), al menos 4 títulos incluyan "vs" o "versus"
      const hasComparison = validatedTitles.some(t => t.components.comparator && t.components.comparator !== 'null' && t.components.comparator !== 'unspecified');
      if (hasComparison) {
        const withVsCount = validatedTitles.filter(t => {
          const titleLower = t.title.toLowerCase();
          return titleLower.includes(' vs ') || titleLower.includes(' vs. ') || titleLower.includes(' versus ');
        }).length;
        
        if (withVsCount < 4) {
          console.warn(`⚠️⚠️⚠️ CRÍTICO: Solo ${withVsCount} títulos incluyen comparación explícita (vs/versus), se esperaban al menos 4`);
          console.warn(`⚠️ PICO tiene Comparación (C) definida, mínimo 4 de 5 títulos DEBEN incluir "vs" o "versus" explícitamente`);
        } else {
          console.log(`✅ Validación comparación: ${withVsCount} títulos incluyen "vs/versus" explícitamente`);
        }
      }
      
      // NUEVA VALIDACIÓN: Verificar que al menos 4 títulos usen términos paraguas válidos
      const validUmbrellaTerms = [
        'performance', 'efficiency', 'scalability', 'reliability', 'usability', 
        'security', 'resource consumption', 'development efficiency', 'maintainability',
        'productivity', 'accuracy', 'effectiveness', 'quality', 'abstraction'
      ];
      
      const withUmbrellaCount = validatedTitles.filter(t => {
        const outcomeLower = (t.components.outcome || '').toLowerCase();
        return validUmbrellaTerms.some(term => outcomeLower.includes(term)) && 
               !outcomeLower.includes(',') && 
               !outcomeLower.includes(' and ') && 
               !outcomeLower.includes(' y ');
      }).length;
      
      if (withUmbrellaCount < 4) {
        console.warn(`⚠️⚠️⚠️ CRÍTICO: Solo ${withUmbrellaCount} títulos usan términos paraguas (umbrella terms), se esperaban al menos 4`);
        console.warn(`⚠️ Los títulos DEBEN usar UN SOLO término paraguas para Outcomes (Performance, Efficiency, Scalability, etc.), NO listar métricas individuales`);
      } else {
        console.log(`✅ Validación umbrella terms: ${withUmbrellaCount} títulos usan términos paraguas correctamente`);
      }
      
      // NUEVA VALIDACIÓN: Verificar que NO haya títulos con verbos exploratorios
      const exploratoryVerbs = ['exploring', 'investigating', 'analyzing', 'examining', 'a study of'];
      const withExploratoryCount = validatedTitles.filter(t => {
        const titleLower = t.title.toLowerCase();
        return exploratoryVerbs.some(verb => titleLower.includes(verb));
      }).length;
      
      if (withExploratoryCount > 0) {
        console.warn(`⚠️⚠️⚠️ CRÍTICO: ${withExploratoryCount} títulos usan verbos exploratorios prohibidos (Exploring, Investigating, A Study of, etc.)`);
        console.warn(`⚠️ Títulos Q1/Q2 DEBEN ser declarativos/descriptivos: "[I] vs [C] for [O]", NO "Exploring...", "Investigating..."`);
      } else {
        console.log(`✅ Validación estilo Q1/Q2: Ningún título usa verbos exploratorios`);
      }
      
      // NUEVA VALIDACIÓN: Verificar que al menos 4 títulos tengan outcomes explícitos
      const withExplicitOutcome = validatedTitles.filter(t => t.hasExplicitOutcome).length;
      if (withExplicitOutcome < 4) {
        console.warn(`⚠️ Solo ${withExplicitOutcome} títulos tienen outcome explícito, se esperaban al menos 4`);
        console.warn(`⚠️ Recordatorio: Los títulos deben incluir outcomes específicos y medibles (ej: "diagnostic accuracy", "development time", "energy efficiency")`);
      }
      
      console.log(`Validación exitosa: ${validatedTitles.length} títulos, ${fullCount} con full compliance, ${withExplicitOutcome} con outcome explícito`);
      
      return validatedTitles.slice(0, 5); // Retornar máximo 5
      
    } catch (error) {
      console.error('Error parseando respuesta:', error.message);
      console.error('   Respuesta recibida:', JSON.stringify(parsedJson).substring(0, 300));
      
      // Fallback: generar títulos de respaldo
      console.log('Usando títulos de respaldo...');
      return this._generateFallbackTitles();
    }
  }

  /**
   * Genera títulos de respaldo en caso de error
   */
  _generateFallbackTitles() {
    return [
      {
        title: 'A Systematic Literature Review: Research Topic in Study Context',
        spanishTitle: 'Una Revisión Sistemática de Literatura: Tema de Investigación en Contexto de Estudio',
        cochraneCompliance: 'partial',
        justification: 'Título genérico de respaldo - requiere personalización con datos PICO',
        spanishJustification: 'Título genérico de respaldo - requiere personalización con datos PICO',
        reasoning: 'Título genérico de respaldo - requiere personalización con datos PICO',
        components: {
          population: 'unspecified population',
          intervention: 'unspecified intervention',
          comparator: null,
          outcome: 'unspecified outcomes'
        },
        wordCount: 9
      },
      {
        title: 'Exploring Intervention Strategies for Target Outcomes: A Systematic Review',
        spanishTitle: 'Explorando Estrategias de Intervención para Resultados Objetivo: Una Revisión Sistemática',
        cochraneCompliance: 'partial',
        justification: 'Título de respaldo - estructura básica correcta pero necesita especificación',
        spanishJustification: 'Título de respaldo - estructura básica correcta pero necesita especificación',
        reasoning: 'Título de respaldo - estructura básica correcta pero necesita especificación',
        components: {
          population: 'target population',
          intervention: 'intervention strategies',
          comparator: null,
          outcome: 'target outcomes'
        },
        wordCount: 10
      },
      {
        title: 'Study Intervention and Its Impact on Primary Outcomes: A Literature Review',
        spanishTitle: 'Intervención de Estudio y su Impacto en Resultados Primarios: Una Revisión de Literatura',
        cochraneCompliance: 'partial',
        justification: 'Título de respaldo - faltan detalles específicos de población y contexto',
        spanishJustification: 'Título de respaldo - faltan detalles específicos de población y contexto',
        reasoning: 'Título de respaldo - faltan detalles específicos de población y contexto',
        components: {
          population: 'study participants',
          intervention: 'study intervention',
          comparator: null,
          outcome: 'primary outcomes'
        },
        wordCount: 12
      },
      {
        title: 'A Scoping Review of Research Topic in Target Population',
        spanishTitle: 'Una Revisión Exploratoria del Tema de Investigación en Población Objetivo',
        cochraneCompliance: 'partial',
        justification: 'Título de respaldo - requiere información específica de PICO',
        spanishJustification: 'Título de respaldo - requiere información específica de PICO',
        reasoning: 'Título de respaldo - requiere información específica de PICO',
        components: {
          population: 'target population',
          intervention: 'research topic',
          comparator: null,
          outcome: 'research findings'
        },
        wordCount: 10
      },
      {
        title: 'Systematic Review: Implementation Strategies for Study Context and Expected Results',
        spanishTitle: 'Revisión Sistemática: Estrategias de Implementación para Contexto de Estudio y Resultados Esperados',
        cochraneCompliance: 'partial',
        justification: 'Título de respaldo - estructura adecuada pero requiere datos específicos',
        spanishJustification: 'Título de respaldo - estructura adecuada pero requiere datos específicos',
        reasoning: 'Título de respaldo - estructura adecuada pero requiere datos específicos',
        components: {
          population: 'study context',
          intervention: 'implementation strategies',
          comparator: null,
          outcome: 'expected results'
        },
        wordCount: 11
      }
    ];
  }
}

module.exports = GenerateTitlesUseCase;

