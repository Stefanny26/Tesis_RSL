const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GenerateTitlesUseCase {
  constructor() {
    // Inicializar OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    
    // Inicializar Gemini
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  /**
   * Genera 5 opciones de títulos con validación Cochrane
   * @param {Object} params - Parámetros
   * @param {Object} params.matrixData - Datos de la matriz Es/No Es
   * @param {Object} params.picoData - Datos del marco PICO
   * @param {String} params.aiProvider - Proveedor de IA ('chatgpt' o 'gemini')
   * @returns {Object} Resultado con 5 títulos y validación
   */
  async execute({ matrixData, picoData, aiProvider = 'gemini' }) {
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
        if (aiProvider === 'gemini') {
          response = await this._generateWithGemini(prompt);
        } else {
          response = await this._generateWithChatGPT(prompt);
        }
      } catch (error) {
        console.error(`❌ Error con ${aiProvider}:`, error.message);
        
        // Fallback automático
        if (aiProvider === 'gemini') {
          console.log('🔄 Intentando fallback a ChatGPT...');
          try {
            response = await this._generateWithChatGPT(prompt);
            usedProvider = 'chatgpt';
            console.log('✅ Fallback a ChatGPT exitoso');
          } catch (fallbackError) {
            console.error('❌ Fallback a ChatGPT también falló:', fallbackError.message);
            throw new Error(`Ambos proveedores fallaron. Gemini: ${error.message}. ChatGPT: ${fallbackError.message}`);
          }
        } else {
          console.log('🔄 Intentando fallback a Gemini...');
          try {
            response = await this._generateWithGemini(prompt);
            usedProvider = 'gemini';
            console.log('✅ Fallback a Gemini exitoso');
          } catch (fallbackError) {
            console.error('❌ Fallback a Gemini también falló:', fallbackError.message);
            throw new Error(`Ambos proveedores fallaron. ChatGPT: ${error.message}. Gemini: ${fallbackError.message}`);
          }
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
      temperature: 0.7,
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
      model: "models/gemini-2.5-flash"
    });

    const fullPrompt = `${prompt}

CRÍTICO: 
- Responde ÚNICAMENTE con JSON válido
- Usa SOLO comillas dobles normales (")
- NO uses markdown ni bloques de código`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.7,
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
    return `Eres un experto en revisiones sistemáticas de literatura y metodología Cochrane/PRISMA.

**Contexto del proyecto:**
${context}

**Tarea:**
Genera 5 opciones de títulos académicos EN INGLÉS para una revisión sistemática basándote en el contexto proporcionado. Cada título debe:

1. Ser claro, conciso y descriptivo
2. Incluir los elementos clave: población, intervención y resultados
3. Seguir las mejores prácticas de Cochrane para títulos de revisiones sistemáticas
4. Indicar el tipo de revisión cuando sea relevante (Systematic Review, Scoping Review, etc.)
5. **IMPORTANTE: Los títulos DEBEN estar en INGLÉS (idioma académico estándar)**

**Criterios de validación Cochrane:**
- **Full compliance (cumplimiento total):** Incluye población, intervención y resultados claramente definidos. Formato académico apropiado.
- **Partial compliance (cumplimiento parcial):** Incluye algunos elementos pero falta claridad o faltan componentes clave.
- **None (no cumple):** Título vago, confuso o sin elementos estructurales básicos.

**Formato de respuesta (DEBE ser JSON válido):**
\`\`\`json
{
  "titles": [
    {
      "title": "Title in English here",
      "cochraneCompliance": "full|partial|none",
      "reasoning": "Brief explanation in English (max 2 lines)"
    }
  ]
}
\`\`\`

**IMPORTANTE:**
- Genera EXACTAMENTE 5 títulos diferentes
- **TODOS los títulos DEBEN estar en INGLÉS**
- Al menos 3 deben tener "full" compliance
- Los títulos deben ser variados en estilo pero todos académicamente rigurosos
- Responde ÚNICAMENTE con el JSON, sin texto adicional antes o después
- NO uses comillas simples, SOLO comillas dobles en el JSON
- Asegúrate de que el JSON sea válido`;
  }

  /**
   * Parsea la respuesta del AI
   */
  _parseResponse(parsedJson) {
    try {
      // La respuesta ya viene parseada desde los métodos de generación
      const parsed = parsedJson;
      
      // Validar estructura
      if (!parsed.titles || !Array.isArray(parsed.titles)) {
        throw new Error('Respuesta no contiene array de títulos');
      }
      
      // Validar cada título
      const validatedTitles = parsed.titles.map((item, index) => {
        if (!item.title || typeof item.title !== 'string') {
          throw new Error(`Título ${index + 1} inválido`);
        }
        
        const compliance = item.cochraneCompliance || 'partial';
        if (!['full', 'partial', 'none'].includes(compliance)) {
          console.warn(`Compliance inválido para título ${index + 1}, usando 'partial'`);
        }
        
        return {
          title: item.title.trim(),
          cochraneCompliance: ['full', 'partial', 'none'].includes(compliance) ? compliance : 'partial',
          reasoning: item.reasoning || 'Sin razonamiento proporcionado'
        };
      });
      
      // Asegurar que hay al menos 5 títulos
      if (validatedTitles.length < 5) {
        console.warn(`Solo se generaron ${validatedTitles.length} títulos, se esperaban 5`);
      }
      
      return validatedTitles.slice(0, 5); // Retornar máximo 5
      
    } catch (error) {
      console.error('❌ Error parseando respuesta:', error);
      console.error('   Respuesta recibida:', JSON.stringify(parsedJson).substring(0, 200));
      
      // Fallback: generar títulos de respaldo
      return this._generateFallbackTitles();
    }
  }

  /**
   * Genera títulos de respaldo en caso de error
   */
  _generateFallbackTitles() {
    return [
      {
        title: 'A Systematic Literature Review: [Topic] in [Context]',
        cochraneCompliance: 'partial',
        reasoning: 'Título genérico de respaldo - requiere personalización'
      },
      {
        title: 'Exploring [Intervention] for [Outcomes]: A Systematic Review',
        cochraneCompliance: 'partial',
        reasoning: 'Título de respaldo - estructura básica correcta'
      },
      {
        title: '[Intervention] and Its Impact on [Outcomes]: A Literature Review',
        cochraneCompliance: 'partial',
        reasoning: 'Título de respaldo - faltan detalles de población'
      },
      {
        title: 'A Scoping Review of [Topic] in [Population]',
        cochraneCompliance: 'partial',
        reasoning: 'Título de respaldo - requiere información específica'
      },
      {
        title: 'Systematic Review: [Intervention] Strategies in [Context]',
        cochraneCompliance: 'partial',
        reasoning: 'Título de respaldo - estructura adecuada pero genérica'
      }
    ];
  }
}

module.exports = GenerateTitlesUseCase;
