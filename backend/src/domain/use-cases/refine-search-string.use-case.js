const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Caso de uso: Refinar cadena de búsqueda
 * Optimiza la estrategia de búsqueda basándose en resultados iniciales
 */
class RefineSearchStringUseCase {
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  async execute({ 
    currentSearchString, 
    searchResults,
    researchQuestion,
    databases,
    aiProvider = 'chatgpt' 
  }) {
    if (!currentSearchString) {
      throw new Error('Cadena de búsqueda actual es requerida');
    }

    const prompt = this.buildPrompt(currentSearchString, searchResults, researchQuestion, databases);

    try {
      let result;
      
      if (aiProvider === 'chatgpt') {
        result = await this.generateWithChatGPT(prompt);
      } else if (aiProvider === 'gemini') {
        result = await this.generateWithGemini(prompt);
      } else {
        throw new Error('Proveedor de IA no soportado');
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error refinando cadena de búsqueda:', error);
      throw new Error(`Error al refinar búsqueda: ${error.message}`);
    }
  }

  buildPrompt(searchString, results, question, databases) {
    return `Eres un experto en estrategias de búsqueda para revisiones sistemáticas de literatura siguiendo PRISMA.

**PREGUNTA DE INVESTIGACIÓN:**
${question}

**CADENA DE BÚSQUEDA ACTUAL:**
${searchString}

**BASES DE DATOS A USAR:**
${databases?.join(', ') || 'IEEE Xplore, ACM Digital Library, Scopus, Springer, ScienceDirect'}

**ANÁLISIS DE RESULTADOS (primeros 25):**
${this.formatResults(results)}

**TU TAREA:**
Analizar la efectividad de la cadena de búsqueda actual y proponer mejoras basadas en:
1. Relevancia de los resultados obtenidos
2. Tasa de falsos positivos/negativos
3. Cobertura de la pregunta de investigación
4. Mejores prácticas de búsqueda académica

**RESPONDE EN FORMATO JSON:**

{
  "analisis": {
    "fortalezas": [
      "Aspectos positivos de la cadena actual"
    ],
    "debilidades": [
      "Problemas identificados"
    ],
    "tasa_relevancia_estimada": 0.75,
    "cobertura_pregunta": "alta|media|baja",
    "problemas_detectados": [
      "Problema 1: descripción",
      "Problema 2: descripción"
    ]
  },
  
  "cadena_refinada": {
    "version_mejorada": "Nueva cadena de búsqueda booleana",
    "cambios_realizados": [
      "Cambio 1: razón",
      "Cambio 2: razón"
    ],
    "terminos_agregados": [
      {"termino": "nuevo término", "justificacion": "por qué se agregó"}
    ],
    "terminos_removidos": [
      {"termino": "término removido", "justificacion": "por qué se removió"}
    ],
    "operadores_optimizados": "Explicación de cambios en operadores booleanos"
  },
  
  "adaptaciones_por_base": {
    "IEEE_Xplore": "Cadena adaptada para IEEE",
    "ACM_Digital_Library": "Cadena adaptada para ACM",
    "Scopus": "Cadena adaptada para Scopus",
    "Springer": "Cadena adaptada para Springer",
    "ScienceDirect": "Cadena adaptada para ScienceDirect",
    "Google_Scholar": "Cadena adaptada para Google Scholar"
  },
  
  "recomendaciones_adicionales": {
    "sinonimos_sugeridos": [
      "lista de sinónimos para términos clave"
    ],
    "filtros_recomendados": {
      "rango_temporal": "2019-2025",
      "tipo_documento": ["journal", "conference"],
      "idioma": "inglés"
    },
    "busquedas_complementarias": [
      "Búsqueda manual en conferencias específicas",
      "Revisión de referencias de estudios clave"
    ]
  },
  
  "metricas_esperadas": {
    "estimacion_resultados": {
      "total": 150,
      "relevantes": 80,
      "tasa_precision": 0.53
    },
    "comparacion_anterior": {
      "incremento_precision": "+15%",
      "cambio_recall": "similar"
    }
  },
  
  "proximos_pasos": [
    "Paso 1: Ejecutar búsqueda refinada",
    "Paso 2: Analizar primeros 50 resultados",
    "Paso 3: Realizar ajustes finales si es necesario"
  ]
}

**PRINCIPIOS DE REFINAMIENTO:**
1. Balancear precision (evitar falsos positivos) y recall (capturar todos los relevantes)
2. Usar sinónimos y variaciones de términos técnicos
3. Considerar diferentes nomenclaturas según la base de datos
4. Mantener la cadena manejable y reproducible
5. Documentar todos los cambios con justificación

Responde SOLO con JSON válido.`;
  }

  formatResults(results) {
    if (!results || results.length === 0) {
      return 'No se proporcionaron resultados para análisis';
    }

    const summary = results.slice(0, 25).map((r, i) => {
      return `${i + 1}. "${r.title}" - ${r.year || 'N/A'} - Relevancia: ${r.relevance || 'No evaluada'}`;
    }).join('\n');

    return summary;
  }

  async generateWithChatGPT(prompt) {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o", // Modelo más potente para análisis complejo
      messages: [
        {
          role: "system",
          content: "Eres un experto en diseño de estrategias de búsqueda para revisiones sistemáticas. Tienes experiencia con múltiples bases de datos académicas y sus sintaxis específicas. Respondes en formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  async generateWithGemini(prompt) {
    if (!this.gemini) {
      throw new Error('Gemini API key no configurada');
    }

    const model = this.gemini.getGenerativeModel({ 
      model: "gemini-1.5-pro", // Pro para análisis más profundo
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 8000,
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
    }
    
    return JSON.parse(text);
  }
}

module.exports = RefineSearchStringUseCase;
