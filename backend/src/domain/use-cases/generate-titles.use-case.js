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
          content: "Eres un Editor en Jefe de un Journal de Ingeniería de alto impacto (Q1). Tu estándar de calidad es extremo. Generas títulos académicos con rigor metodológico PRISMA 2020. Respondes ÚNICAMENTE en formato JSON válido."
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
      context += '**Marco PICO:**\n';
      if (picoData.population) context += `- P (Población): ${picoData.population}\n`;
      if (picoData.intervention) context += `- I (Intervención): ${picoData.intervention}\n`;
      if (picoData.comparison) context += `- C (Comparación): ${picoData.comparison}\n`;
      if (picoData.outcomes) context += `- O (Resultados): ${picoData.outcomes}\n`;
    }
    
    return context;
  }

  /**
   * Construye el prompt para generar títulos con reglas metodológicas rigurosas PRISMA 2020
   */
  _buildPrompt(context) {
    return `Eres un Senior Research Editor especializado en ingeniería y metodología PRISMA 2020. Tu objetivo es generar 5 títulos de alto impacto para una Revisión Sistemática.

═══════════════════════════════════════════════════════════════
CONTEXTO DEL PROTOCOLO (Insumos Reales)
═══════════════════════════════════════════════════════════════
${context}

═══════════════════════════════════════════════════════════════
REGLAS DE ORO DE REDACCIÓN ACADÉMICA
═══════════════════════════════════════════════════════════════
1. PRISMA COMPLIANCE (Ítem 1): Aunque el sistema sabe que es una RSL, el título final DEBE sugerir la naturaleza del estudio (ej: "A Systematic Review", "A Scoping Review" o "Evidence Synthesis"). Esto es vital para la indexación en Scopus/WoS.
2. PRECISIÓN TÉCNICA: Sustituir términos genéricos por específicos. 
   - NO: "Inteligencia Artificial" -> SÍ: "Deep Reinforcement Learning" o "Convolutional Neural Networks".
   - NO: "Impacto en salud" -> SÍ: "Tasa de diagnóstico erróneo" o "Latencia en la respuesta".
3. PROHIBICIÓN DE "BUZZWORDS": Prohibido usar: "Moderno", "Avanzado", "Reciente", "Estudio sobre", "Análisis de".
4. LONGITUD: Entre 12 y 18 palabras.

═══════════════════════════════════════════════════════════════
PATRONES DE ESTRUCTURA (Selecciona uno por cada título)
═══════════════════════════════════════════════════════════════
A. [Intervención/Tecnología] for [Población/Problema]: A Systematic Mapping Study.
B. [Resultado/Outcome] of [Tecnología] in [Contexto]: A Systematic Review of the Literature.
C. [Tecnología A] vs. [Tecnología B] for [Problema]: A Comparative Evidence Synthesis.
D. Current Trends and Future Challenges in [Tecnología] for [Dominio]: A Scoping Review.

═══════════════════════════════════════════════════════════════
INSTRUCCIONES PARA LA JUSTIFICACIÓN (Peer-Review Style)
═══════════════════════════════════════════════════════════════
La justificación NO debe hablar de la gramática del título. Debe explicar por qué esa intersección de (P) y (I) es un "Research Gap" (vacío de investigación) que merece ser estudiado en ${new Date().getFullYear()}.

═══════════════════════════════════════════════════════════════
FORMATO DE RESPUESTA (JSON ESTRICTO)
═══════════════════════════════════════════════════════════════

IMPORTANTE: Cada título DEBE incluir una justificación de 30-50 palabras que explique:
1. Por qué la combinación de elementos del título es relevante científicamente
2. Qué necesidad de investigación justifica ese enfoque específico
3. Por qué esa delimitación particular (población + intervención) es importante

**FORMATO DE JUSTIFICACIÓN**: Debe hablar del CONTENIDO y RELEVANCIA del estudio, NO del título como objeto.

PROHIBIDO usar frases como:
- "Se utiliza el Patrón A/B/C..."
- "El título refleja..."
- "Este título articula..."
- "El título integra..."

CORRECTO - Hablar del contenido:
Ejemplo 1: "El aprendizaje automático en contextos cardiovasculares requiere análisis de grandes volúmenes de datos clínicos que superan los enfoques estadísticos tradicionales, permitiendo identificar patrones complejos en poblaciones adultas con factores de riesgo específicos."

Ejemplo 2: "La simulación de redes de comunicación en entornos profesionales de ingeniería demanda metodologías específicas que permitan evaluar el rendimiento en escenarios controlados, considerando las particularidades técnicas del dominio de aplicación."

**FORMATO BILINGÜE**: Todos los títulos DEBEN estar en INGLÉS como idioma principal (title) y ESPAÑOL como traducción (spanishTitle).
- title: Título académico en INGLÉS (siguiendo patrones A, B, C o D)
- spanishTitle: Traducción profesional al ESPAÑOL del mismo título
- justification: Justificación en ESPAÑOL (30-50 palabras)
- spanishJustification: Misma justificación (redundante, pero incluir para compatibilidad)

{
  "titles": [
    {
      "title": "[Título académico en INGLÉS, siguiendo patrones A, B, C o D]",
      "spanishTitle": "[Traducción profesional y académica del título al ESPAÑOL]",
      "justification": "[OBLIGATORIO: 30-50 palabras en ESPAÑOL explicando la relevancia del contenido]",
      "spanishJustification": "[Misma justificación en español - redundante pero incluir]",
      "cochraneCompliance": "full|partial|low",
      "wordCount": [número de palabras del título EN INGLÉS],
      "pattern": "A|B|C|D",
      "components": {
        "fenomeno": "[tecnología/variable/constructo central]",
        "poblacion": "[contexto/dominio específico]",
        "enfoque": "[aspecto metodológico o variable de interés]",
        "naturaleza": "Systematic Review / Scoping Review / Evidence Synthesis"
      },
      "validation": {
        "explicitReview": true|false,
        "clearPhenomenon": true|false,
        "hasPopulation": true|false,
        "isSpecific": true|false,
        "lengthOK": true|false
      }
    }
    // ... 5 títulos total
  ]
}

═══════════════════════════════════════════════════════════════
CRITERIOS DE COMPLIANCE
═══════════════════════════════════════════════════════════════

**"cochraneCompliance": "full"** (meta: 4-5 títulos):
- Cumple las 4 reglas de oro de redacción académica
- Todos los campos de validation son true
- Longitud 12-18 palabras
- Patrón A, B, C o D correctamente aplicado
- Especificidad técnica presente
- Naturaleza del estudio explícita (Systematic Review, Scoping Review, etc.)

**"cochraneCompliance": "partial"** (máximo 1 título):
- Falta UN elemento de validation
- O longitud ligeramente fuera de rango (10-12 o 18-20 palabras)
- Estructura académica presente pero mejorable

**"cochraneCompliance": "low"** (máximo 0 títulos):
- Falta 2+ elementos de validation
- Título vago, genérico o confuso
- Sin estructura PICO identificable

═══════════════════════════════════════════════════════════════
EJEMPLOS REFERENCIALES DE TÍTULOS VÁLIDOS
═══════════════════════════════════════════════════════════════

CORRECTO (Patrón A, full compliance):
"Machine Learning Techniques for Fraud Detection in Digital Financial Transactions: A Systematic Review"
- Fenómeno: Machine Learning Techniques
- Población: Digital Financial Transactions
- Enfoque: Fraud Detection
- Naturaleza: Systematic Review (explícito)
- Palabras: 13

CORRECTO (Patrón C, full compliance):
"Blockchain vs. Centralized Databases for Electronic Health Records: A Comparative Evidence Synthesis"
- Comparación explícita
- Población: Electronic Health Records
- Outcome: Comparative Evidence
- Naturaleza: Evidence Synthesis (explícito)
- Palabras: 12

INCORRECTO (ambiguo, low compliance):
"Artificial Intelligence: A Review"
- Fenómeno: demasiado amplio ("AI")
- Sin población específica
- Sin enfoque metodológico
- Palabras: 4 (muy corto)
- No especifica tipo de revisión

INCORRECTO (buzzwords, low compliance):
"Advanced Analysis of Modern IoT Impact in Smart Cities"
- "Advanced" y "Modern" son buzzwords prohibidos
- "impacto" sin especificar EN QUÉ
- "análisis" es genérico
- No menciona naturaleza del estudio

═══════════════════════════════════════════════════════════════
SALIDA ESPERADA (JSON ESTRICTO):
═══════════════════════════════════════════════════════════════
{
  "titles": [
    {
      "title": "Title in English (Academic English only)",
      "spanishTitle": "Traducción académica (No literal, sino terminológica)",
      "justification": "Explicación técnica del valor científico (30-50 palabras)",
      "spanishJustification": "Misma explicación (redundante pero incluir)",
      "cochraneCompliance": "full",
      "wordCount": 15,
      "pattern": "A",
      "components": {
        "fenomeno": "Tecnología exacta",
        "poblacion": "Dominio de aplicación",
        "enfoque": "Variable medida (Outcome)",
        "naturaleza": "Systematic Review / Scoping Review"
      },
      "validation": {
        "explicitReview": true,
        "clearPhenomenon": true,
        "hasPopulation": true,
        "isSpecific": true,
        "lengthOK": true
      }
    }
    // ... total 5
  ]
}

═══════════════════════════════════════════════════════════════
INSTRUCCIONES FINALES
═══════════════════════════════════════════════════════════════

1. Genera EXACTAMENTE 5 títulos DISTINTOS y NO REDUNDANTES
2. PRIORIZA full compliance (mínimo 4 de 5 deben ser "full")
3. Usa información del CONTEXTO DEL PROTOCOLO para derivar componentes
4. Si falta información en el contexto, infiere de manera razonable pero NUNCA uses placeholders genéricos
5. Cada título debe ser DIRECTAMENTE USABLE como título oficial del protocolo
6. CRÍTICO: Cada título DEBE incluir explícitamente la naturaleza del estudio (A Systematic Review, A Scoping Review, etc.) - Esto es OBLIGATORIO para cumplir PRISMA 2020 Ítem 1
7. CRÍTICO: Cada título DEBE tener una justificación de 30-50 palabras (campo "justification" OBLIGATORIO) explicando el RESEARCH GAP
8. Responde ÚNICAMENTE con JSON válido, sin texto adicional

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
        
        // Validar components (nuevo)
        const components = item.components || {};
        if (!components.population || !components.intervention || !components.outcome) {
          console.warn(`Título ${index + 1} falta components PICO requeridos`);
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
            comparator: components.comparator || null,
            outcome: components.outcome || 'unspecified'
          },
          wordCount: wordCount
        };
      });
      
      // Verificar que al menos 3 sean 'full' compliance
      const fullCount = validatedTitles.filter(t => t.cochraneCompliance === 'full').length;
      if (fullCount < 3) {
        console.warn(`Solo ${fullCount} títulos tienen 'full' compliance, se esperaban al menos 3`);
      }
      
      console.log(`Validación exitosa: ${validatedTitles.length} títulos, ${fullCount} con full compliance`);
      
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

