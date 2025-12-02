const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GenerateTitlesUseCase {
  constructor() {
    // Inicializar OpenAI/ChatGPT (PRIORIDAD 1)
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    
    // Inicializar Gemini (PRIORIDAD 3)
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
      console.log('📝 Generando 5 títulos con validación Cochrane...');
      
      // Construir contexto del proyecto
      const context = this._buildContext(matrixData, picoData);
      
      // Construir prompt para el AI
      const prompt = this._buildPrompt(context);
      
      // Llamar al servicio de IA correspondiente con fallback automático
      let response;
      let usedProvider = aiProvider;
      
      try {
        if (aiProvider === 'chatgpt' && this.openai) {
          response = await this._generateWithChatGPT(prompt);
        } else if (aiProvider === 'gemini' && this.gemini) {
          response = await this._generateWithGemini(prompt);
        } else if (this.openai) {
          response = await this._generateWithChatGPT(prompt);
          usedProvider = 'chatgpt';
        } else if (this.gemini) {
          response = await this._generateWithGemini(prompt);
          usedProvider = 'gemini';
        } else {
          throw new Error('No hay proveedores de IA configurados');
        }
      } catch (error) {
        console.error(`❌ Error con ${aiProvider}:`, error.message);
        
        // Fallback chain: chatgpt → gemini
        if (aiProvider === 'chatgpt' && this.gemini) {
          console.log('🔄 Intentando fallback a Gemini...');
          try {
            response = await this._generateWithGemini(prompt);
            usedProvider = 'gemini';
            console.log('✅ Fallback a Gemini exitoso');
          } catch (geminiError) {
            throw new Error(`Todos los proveedores fallaron. ChatGPT: ${error.message}. Gemini: ${geminiError.message}`);
          }
        } else if (aiProvider === 'gemini' && this.openai) {
          console.log('🔄 Intentando fallback a ChatGPT...');
          try {
            response = await this._generateWithChatGPT(prompt);
            usedProvider = 'chatgpt';
            console.log('✅ Fallback a ChatGPT exitoso');
          } catch (chatError) {
            throw new Error(`Todos los proveedores fallaron. Gemini: ${error.message}. ChatGPT: ${chatError.message}`);
          }
        } else {
          throw error;
        }
      }
      
      // Parsear respuesta
      const titles = this._parseResponse(response);
      
      console.log(`✅ Generados ${titles.length} títulos exitosamente con ${usedProvider}`);
      
      return {
        success: true,
        data: {
          titles,
          provider: usedProvider
        }
      };
    } catch (error) {
      console.error('❌ Error en GenerateTitlesUseCase:', error);
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
          content: "Eres un experto en revisiones sistemáticas de literatura y metodología Cochrane/PRISMA. Generas títulos académicos de alta calidad. Respondes ÚNICAMENTE en formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.35,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content);
  }

  /**
   * Genera títulos usando Gemini
   */
  async _generateWithGemini(prompt) {
    if (!this.gemini) {
      throw new Error('Gemini API key no configurada');
    }

    const model = this.gemini.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp"
    });

    const fullPrompt = `${prompt}

CRÍTICO: 
- Responde ÚNICAMENTE con JSON válido
- Usa SOLO comillas dobles normales (")
- NO uses markdown ni bloques de código`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    });
    
    const response = await result.response;
    let text = response.text().trim();
    
    // Limpiar markdown si existe
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    return JSON.parse(text.trim());
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
   * Construye el prompt para generar títulos
   */
  _buildPrompt(context) {
    return `Eres un experto en revisiones sistemáticas (Cochrane/PRISMA) y redacción académica de títulos. Tu tarea: generar EXACTAMENTE 5 títulos académicos en INGLÉS para una revisión sistemática, alineados con Cochrane/PRISMA.

**CONTEXTO DEL PROYECTO:**
${context}

**REGLAS OBLIGATORIAS:**
1. Cada título debe identificar el tipo de revisión: incluye "Systematic Review", "Scoping Review" o "Systematic Literature Review".
2. Cada título debe contener al menos: a) población/contexto, b) intervención/exposición, c) principal outcome/objetivo. Si hay comparador, inclúyelo explícitamente.
3. Longitud recomendada: 8-18 palabras. Evita títulos extremadamente largos (>22 palabras) o muy cortos (<8).
4. Usa lenguaje académico y preciso. NO uses placeholders genéricos como [Topic] o [Population].
5. Si algún elemento PICO falta en el contexto, marca el componente como "unspecified" pero mantén el título lo más específico posible.

**FORMATO DE RESPUESTA (JSON EXACTO):**
{
  "titles": [
    {
      "title": "Exact title in English",
      "cochraneCompliance": "full|partial|none",
      "reasoning": "One-line justification in English (max 30 words)",
      "components": {
        "population": "specific population or context",
        "intervention": "intervention/exposure being studied",
        "comparator": "comparison group or null if none",
        "outcome": "primary outcomes or objectives"
      }
    }
  ]
}

**VALIDACIÓN INTERNA:**
- Al menos 3 títulos deben tener "cochraneCompliance": "full".
- Si algún título es "partial" o "none", explica brevemente por qué en reasoning.
- NO uses comillas simples; usa SOLO comillas dobles (") en el JSON.
- NO incluyas texto fuera del JSON.
- Componentes requeridos: population, intervention, outcome (comparator puede ser null).

**EJEMPLOS DE ESTRUCTURA:**
- "[Intervention] for [Population]: A Systematic Review of [Outcome]"
- "[Intervention] vs [Comparator] in [Population]: Impact on [Outcome] - A Systematic Review"
- "Patterns and Effects of [Intervention] on [Outcome]: A Systematic Literature Review"

**CRITERIOS COCHRANE/PRISMA:**
- **full**: Incluye población, intervención Y resultados claramente. Tipo de revisión explícito. Título claro y académico.
- **partial**: Falta algún elemento PICO o no está suficientemente claro. Estructura académica presente.
- **none**: Título vago, confuso, sin estructura PICO identificable.

Genera 5 títulos DISTINTOS y NO REDUNDANTES que un investigador pueda usar inmediatamente como título oficial de protocolo. Responde SOLO con el JSON.`;
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
          console.warn(`⚠️ Título ${index + 1} muy corto (${wordCount} palabras): "${title.substring(0, 50)}..."`);
        }
        if (wordCount > 22) {
          console.warn(`⚠️ Título ${index + 1} muy largo (${wordCount} palabras): "${title.substring(0, 50)}..."`);
        }
        
        // Validar compliance
        const compliance = item.cochraneCompliance || 'partial';
        if (!['full', 'partial', 'none'].includes(compliance)) {
          console.warn(`⚠️ Compliance inválido para título ${index + 1}, usando 'partial'`);
        }
        
        // Validar components (nuevo)
        const components = item.components || {};
        if (!components.population || !components.intervention || !components.outcome) {
          console.warn(`⚠️ Título ${index + 1} falta components PICO requeridos`);
        }
        
        return {
          title: title,
          cochraneCompliance: ['full', 'partial', 'none'].includes(compliance) ? compliance : 'partial',
          reasoning: item.reasoning || 'Sin razonamiento proporcionado',
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
        console.warn(`⚠️ Solo ${fullCount} títulos tienen 'full' compliance, se esperaban al menos 3`);
      }
      
      console.log(`✅ Validación exitosa: ${validatedTitles.length} títulos, ${fullCount} con full compliance`);
      
      return validatedTitles.slice(0, 5); // Retornar máximo 5
      
    } catch (error) {
      console.error('❌ Error parseando respuesta:', error.message);
      console.error('   Respuesta recibida:', JSON.stringify(parsedJson).substring(0, 300));
      
      // Fallback: generar títulos de respaldo
      console.log('🔄 Usando títulos de respaldo...');
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
        cochraneCompliance: 'partial',
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
        cochraneCompliance: 'partial',
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
        cochraneCompliance: 'partial',
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
        cochraneCompliance: 'partial',
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
        cochraneCompliance: 'partial',
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

