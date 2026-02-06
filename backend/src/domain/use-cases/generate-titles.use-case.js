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

2. **Outcome (O) explícito**: El título DEBE incluir el outcome específico del PICO. 
   - ❌ NO: "Machine Learning in Healthcare" (sin outcome)
   - ✅ SÍ: "ML for Diagnostic Accuracy in Healthcare" (outcome del PICO)

3. **Comparador (C)**: Si el PICO tiene Comparison definida, al menos 1 título debe usar formato comparativo: "[I] vs. [C] for [O] in [P]"

4. **Sin buzzwords**: Prohibido usar "Moderno", "Avanzado", "Reciente", "Impacto general", "Mejora", "Estudio sobre".

5. **Longitud**: Entre 12 y 18 palabras.

6. **Precisión técnica**: Usar la terminología exacta del PICO, no genéricos.

═══════════════════════════════════════════════════════════════
PATRONES DE ESTRUCTURA
═══════════════════════════════════════════════════════════════

**Patrón A** (Sin Comparison): [I] for [O] in [P]: A Systematic Review
**Patrón B** (Outcome primero): [O] of [I] in [P]: A Systematic Review  
**Patrón C** (Con Comparison): [I] vs. [C] for [O] in [P]: A Comparative Review
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
3. Cada título DEBE incluir el Outcome (O) del PICO de manera concreta
4. Si PICO tiene C (Comparison), al menos 1 título debe usar Patrón C
5. Cada título DEBE tener justificación de 30-50 palabras
6. Responde ÚNICAMENTE con JSON válido, sin texto adicional

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
        
        // Validar que el outcome no sea genérico o vago
        if (components.outcome) {
          const vagueOutcomes = ['impacto', 'impact', 'mejora', 'improvement', 'resultados', 'results', 'efectos', 'effects'];
          const isVagueOutcome = vagueOutcomes.some(vague => 
            components.outcome.toLowerCase().includes(vague) && components.outcome.split(' ').length <= 2
          );
          
          if (isVagueOutcome) {
            console.warn(`Título ${index + 1} tiene outcome vago: "${components.outcome}" - debe ser más específico (ej: "diagnostic accuracy", "energy efficiency", "development time")`);
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

