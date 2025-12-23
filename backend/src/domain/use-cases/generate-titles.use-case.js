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
      
      // Log de respuesta cruda para debugging
      console.log('📦 Respuesta cruda de la IA:', JSON.stringify(response).substring(0, 500));
      
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
          content: "Eres un experto en metodología PRISMA/Cochrane con especialización en redacción de títulos académicos para revisiones sistemáticas. Generas títulos rigurosos, específicos y directamente usables. Respondes ÚNICAMENTE en formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5, // Aumentado de 0.35 a 0.5 para mayor variedad
      max_tokens: 3000, // Aumentado de 2000 a 3000 para respuestas más completas
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
      model: "gemini-2.0-flash-exp",
      systemInstruction: "Eres un experto en metodología PRISMA/Cochrane con especialización en redacción de títulos académicos para revisiones sistemáticas. Generas títulos rigurosos, específicos y directamente usables."
    });

    const fullPrompt = `${prompt}

CRÍTICO: 
- Responde ÚNICAMENTE con JSON válido
- Usa SOLO comillas dobles normales (")
- NO uses markdown ni bloques de código`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.5, // Aumentado de 0.35 a 0.5
        maxOutputTokens: 10000, // Aumentado para respuestas más completas
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
   * Construye el prompt para generar títulos con reglas metodológicas rigurosas
   */
  _buildPrompt(context) {
    return `Eres un experto en metodología PRISMA/Cochrane especializado en redacción de títulos académicos para protocolos de Revisión Sistemática de Literatura (RSL).

═══════════════════════════════════════════════════════════════
CONTEXTO DEL PROTOCOLO (YA DEFINIDO EN FASES ANTERIORES)
═══════════════════════════════════════════════════════════════
${context}

═══════════════════════════════════════════════════════════════
TAREA: GENERAR 5 TÍTULOS ACADÉMICOS PARA RSL
═══════════════════════════════════════════════════════════════

**REGLAS METODOLÓGICAS OBLIGATORIAS:**

1️⃣ **NATURALEZA DEL ESTUDIO** (IMPORTANTE):
   - ❌ NO incluir frases como "una revisión sistemática", "systematic review", "RSL"
   - ✅ Razón: El sistema YA ES para revisiones sistemáticas, es redundante mencionarlo en el título
   - ✅ El título debe ser DIRECTO al fenómeno, población y enfoque
   - Ejemplo: "Técnicas de aprendizaje automático en detección de fraudes financieros" (NO agregar "...una revisión sistemática")

2️⃣ **COMPONENTES OBLIGATORIOS** (responder estas 4 preguntas):
   a) ¿Qué tema/fenómeno? → Variable/constructo/tecnología central
   b) ¿Qué población? → Contexto/dominio de aplicación específico
   c) ¿Qué enfoque o variable? → Aspecto metodológico o resultado de interés
   d) ¿Cuál es la naturaleza? → Tipo de revisión (sistemática, scoping, etc.)

3️⃣ **ESPECIFICIDAD TÉCNICA**:
   - Si el dominio es técnico/tecnológico: incluir el campo (ej: "machine learning", "cybersecurity", "cloud computing")
   - Si es clínico/médico: incluir patología/condición (ej: "diabetes tipo 2", "enfermedades cardiovasculares")
   - Si es social: incluir población específica (ej: "adolescentes", "docentes universitarios")

4️⃣ **PROHIBICIONES** (evitar ambigüedad):
   - ❌ Palabras vacías SIN CONTEXTO: "impacto", "avance", "desarrollo", "análisis"
   - ❌ Frases genéricas: "una revisión", "estudio exploratorio", "investigación sobre"
   - ❌ Términos vagos: "reciente", "moderno", "avanzado", "efectivo" (sin cuantificar)
   - ✅ USO CORRECTO: "impacto EN la tasa de error" (especificado), "avances EN técnicas de encriptación 2020-2025" (contextualizado)

5️⃣ **LONGITUD ÓPTIMA**:
   - Mínimo recomendable: 12 palabras
   - Máximo recomendable: 22 palabras
   - Ideal: 15-18 palabras
   - **PENALIZACIÓN**: Títulos <10 palabras o >25 palabras deben justificarse

6️⃣ **ESTRUCTURA RECOMENDADA** (3 patrones principales):

   **Patrón A** (más usado):
   [Variable/constructo] + en + [población/contexto] + mediante + [abordaje/metodología]
   
   Ejemplo: "Modelos predictivos aplicados a enfermedades cardiovasculares en adultos mediante aprendizaje automático"

   **Patrón B** (para comparaciones):
   [Intervención A] vs [Intervención B] + en + [población] + : impacto en + [outcome]
   
   Ejemplo: "Terapias cognitivo-conductuales vs farmacoterapia en depresión mayor: impacto en remisión de síntomas"

   **Patrón C** (para síntesis temática):
   [Práctica/fenómeno] + en + [dominio/sector] + : síntesis de evidencia
   
   Ejemplo: "Prácticas de ciberseguridad en infraestructuras críticas: síntesis de evidencia"

7️⃣ **VALIDACIÓN DE CALIDAD** (autoevaluación obligatoria):
   
   ✅ **TÍTULO VÁLIDO si cumple TODO esto:**
   - ❌ NO menciona "revisión sistemática" (redundante en este sistema)
   - ✅ Identifica fenómeno central SIN ambigüedad
   - ✅ Refleja alcance metodológico
   - ✅ Incluye población/contexto cuando corresponde
   - ✅ Suficientemente específico (no confundible con otro estudio)
   - ✅ Longitud entre 12-22 palabras

═══════════════════════════════════════════════════════════════
FORMATO DE RESPUESTA (JSON ESTRICTO)
═══════════════════════════════════════════════════════════════

IMPORTANTE: Cada título DEBE incluir una justificación de 30-50 palabras que explique:
1. Por qué la combinación de elementos del título es relevante científicamente
2. Qué necesidad de investigación justifica ese enfoque específico
3. Por qué esa delimitación particular (población + intervención) es importante

**FORMATO DE JUSTIFICACIÓN**: Debe hablar del CONTENIDO y RELEVANCIA del estudio, NO del título como objeto.

❌ PROHIBIDO usar frases como:
- "Se utiliza el Patrón A/B/C..."
- "El título refleja..."
- "Este título articula..."
- "El título integra..."

✅ CORRECTO - Hablar del contenido:
Ejemplo 1: "El aprendizaje automático en contextos cardiovasculares requiere análisis de grandes volúmenes de datos clínicos que superan los enfoques estadísticos tradicionales, permitiendo identificar patrones complejos en poblaciones adultas con factores de riesgo específicos."

Ejemplo 2: "La simulación de redes de comunicación en entornos profesionales de ingeniería demanda metodologías específicas que permitan evaluar el rendimiento en escenarios controlados, considerando las particularidades técnicas del dominio de aplicación."

**FORMATO BILINGÜE**: Todos los títulos DEBEN estar en INGLÉS como idioma principal (title) y ESPAÑOL como traducción (spanishTitle).
- title: Título académico en INGLÉS (siguiendo patrones A, B o C)
- spanishTitle: Traducción profesional al ESPAÑOL del mismo título
- justification: Justificación en ESPAÑOL (30-50 palabras)
- spanishJustification: Misma justificación (redundante, pero incluir para compatibilidad)

{
  "titles": [
    {
      "title": "[Título académico en INGLÉS, siguiendo patrones A, B o C]",
      "spanishTitle": "[Traducción profesional y académica del título al ESPAÑOL]",
      "justification": "[OBLIGATORIO: 30-50 palabras en ESPAÑOL explicando la relevancia del contenido]",
      "spanishJustification": "[Misma justificación en español - redundante pero incluir]",
      "cochraneCompliance": "full|partial|low",
      "wordCount": [número de palabras del título EN INGLÉS],
      "pattern": "A|B|C",
      "components": {
        "fenomeno": "[tecnología/variable/constructo central]",
        "poblacion": "[contexto/dominio específico]",
        "enfoque": "[aspecto metodológico o variable de interés]",
        "naturaleza": "Síntesis de evidencia" // No mencionar "Revisión Sistemática" (redundante)
      },
      "validation": {
        "explicitReview": true|false, // ¿Es claro que es un estudio de síntesis? (NO debe mencionar "revisión sistemática")
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
- Cumple las 7 reglas metodológicas
- Todos los campos de validation son true
- Longitud 12-22 palabras
- Patrón A, B o C correctamente aplicado
- Especificidad técnica presente

**"cochraneCompliance": "partial"** (máximo 1 título):
- Falta UN elemento de validation
- O longitud ligeramente fuera de rango (10-12 o 22-24 palabras)
- Estructura académica presente pero mejorable

**"cochraneCompliance": "low"** (máximo 0 títulos):
- Falta 2+ elementos de validation
- Título vago, genérico o confuso
- Sin estructura PICO identificable

═══════════════════════════════════════════════════════════════
EJEMPLOS REFERENCIALES DE TÍTULOS VÁLIDOS
═══════════════════════════════════════════════════════════════

✅ CORRECTO (Patrón A, full compliance):
"Técnicas de aprendizaje automático aplicadas a detección de fraudes financieros en transacciones digitales"
- Fenómeno: aprendizaje automático
- Población: transacciones digitales / fraudes financieros
- Enfoque: detección
- Naturaleza: síntesis de evidencia (implícito)
- Palabras: 14 ✅

✅ CORRECTO (Patrón B, full compliance):
"Blockchain vs bases de datos centralizadas en registros médicos electrónicos: impacto en seguridad y privacidad"
- Comparación explícita
- Población: registros médicos electrónicos
- Outcome: seguridad y privacidad
- Palabras: 15 ✅

❌ INCORRECTO (ambiguo, low compliance):
"Inteligencia Artificial en la actualidad: una revisión"
- Fenómeno: demasiado amplio ("IA")
- Sin población específica
- Sin enfoque metodológico
- "en la actualidad" es vago
- Palabras: 8 (muy corto)

❌ INCORRECTO (sin naturaleza explícita):
"Análisis del impacto de IoT en ciudades inteligentes"
- No dice "revisión sistemática"
- "impacto" sin especificar EN QUÉ
- "análisis" es genérico

═══════════════════════════════════════════════════════════════
EJEMPLO COMPLETO DE TÍTULO CON JUSTIFICACIÓN (BILINGÜE)
═══════════════════════════════════════════════════════════════

{
  "title": "Machine Learning Techniques Applied to Fraud Detection in Digital Financial Transactions",
  "spanishTitle": "Técnicas de aprendizaje automático aplicadas a detección de fraudes en transacciones financieras digitales",
  "justification": "El aprendizaje automático en contextos financieros digitales permite analizar grandes volúmenes de transacciones e identificar patrones anómalos que superan los enfoques tradicionales de detección. La combinación de técnicas avanzadas con el dominio específico de fraudes financieros responde a la creciente complejidad de los ataques en entornos digitales.",
  "spanishJustification": "El aprendizaje automático en contextos financieros digitales permite analizar grandes volúmenes de transacciones e identificar patrones anómalos que superan los enfoques tradicionales de detección. La combinación de técnicas avanzadas con el dominio específico de fraudes financieros responde a la creciente complejidad de los ataques en entornos digitales.",
  "cochraneCompliance": "full",
  "wordCount": 12,
  "pattern": "A",
  "components": {
    "fenomeno": "machine learning techniques",
    "poblacion": "digital financial transactions",
    "enfoque": "fraud detection",
    "naturaleza": "Evidence synthesis"
  },
  "validation": {
    "explicitReview": true,
    "clearPhenomenon": true,
    "hasPopulation": true,
    "isSpecific": true,
    "lengthOK": true
  }
}

═══════════════════════════════════════════════════════════════
INSTRUCCIONES FINALES
═══════════════════════════════════════════════════════════════

1. Genera EXACTAMENTE 5 títulos DISTINTOS y NO REDUNDANTES
2. PRIORIZA full compliance (mínimo 4 de 5 deben ser "full")
3. Usa información del CONTEXTO DEL PROTOCOLO para derivar componentes
4. Si falta información en el contexto, infiere de manera razonable pero NUNCA uses placeholders genéricos
5. Cada título debe ser DIRECTAMENTE USABLE como título oficial del protocolo
6. **CRÍTICO**: Cada título DEBE tener una justificación de 30-50 palabras (campo "justification" OBLIGATORIO)
7. Responde ÚNICAMENTE con JSON válido, sin texto adicional

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
        
        // Validar justification (OBLIGATORIO)
        const justification = item.justification || item.reasoning || '';
        if (!justification || justification.length < 20) {
          console.warn(`⚠️ Título ${index + 1} tiene justificación faltante o muy corta (${justification.length} caracteres)`);
        } else {
          console.log(`✅ Título ${index + 1} tiene justificación (${justification.length} caracteres)`);
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

