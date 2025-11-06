const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Caso de uso: Generar análisis de protocolo con IA
 * Genera matriz Es/No Es, pregunta refinada, análisis Cochrane y título propuesto
 */
class GenerateProtocolAnalysisUseCase {
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
   * Genera análisis completo del protocolo usando IA
   * @param {Object} data - Datos del protocolo
   * @param {string} data.title - Título del proyecto
   * @param {string} data.description - Descripción del proyecto
   * @param {string} data.aiProvider - Proveedor de IA (chatgpt o gemini)
   * @returns {Promise<Object>} Análisis generado
   */
  async execute({ title, description, aiProvider = 'chatgpt' }) {
    if (!title || !description) {
      throw new Error('Título y descripción son requeridos');
    }

    const prompt = this.buildPrompt(title, description);

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
      console.error('Error generando análisis con IA:', error);
      throw new Error(`Error al generar análisis: ${error.message}`);
    }
  }

  /**
   * Construye el prompt para la IA basado en la fase del protocolo
   */
  buildPrompt(title, description) {
    return `Eres un experto en metodología de investigación y revisiones sistemáticas de literatura siguiendo estándares PRISMA y Cochrane.

**PROYECTO:**
Título inicial: ${title}
Descripción: ${description}

**TU TAREA:**
Analizar esta propuesta de investigación y generar un protocolo de revisión sistemática completo que evalúe si la idea cumple con los estándares PRISMA/Cochrane/WPOM.

**GENERA UN JSON CON ESTA ESTRUCTURA EXACTA:**

{
  "titulo_propuesto": "Título refinado siguiendo formato Cochrane: [Tecnología/Concepto] in [Contexto]: A Systematic Literature Review on [Aspectos Clave]",
  
  "evaluacion_inicial": {
    "tema_claro": "si|no",
    "delimitacion_adecuada": "si|no",
    "viabilidad_slr": "si|no",
    "comentario": "Breve análisis de la propuesta (2-3 líneas)"
  },
  
  "fase1_marco_pico": {
    "marco_pico": {
      "population": {
        "descripcion": "Descripción clara de la población/contexto (2-3 líneas)"
      },
      "intervention": {
        "descripcion": "Descripción de la intervención/tecnología (2-3 líneas)"
      },
      "comparison": {
        "descripcion": "Descripción de comparaciones o alternativas (2-3 líneas)"
      },
      "outcomes": {
        "descripcion": "Resultados esperados (2-3 líneas)"
      }
    }
  },
  
  "fase2_matriz_es_no_es": {
    "elementos": [
      {
        "pregunta": "¿Cuál es la población o contexto?",
        "presente": "si|no|parcial",
        "justificacion": "Explicación breve (1-2 líneas)"
      },
      {
        "pregunta": "¿Cuál es la intervención o fenómeno de interés?",
        "presente": "si|no|parcial",
        "justificacion": "Explicación breve"
      },
      {
        "pregunta": "¿Cuál es la necesidad o motivación?",
        "presente": "si|no|parcial",
        "justificacion": "Explicación breve"
      },
      {
        "pregunta": "¿Cuáles son los resultados esperados?",
        "presente": "si|no|parcial",
        "justificacion": "Explicación breve"
      }
    ],
    "es": [
      "Criterio que SÍ incluye (1 línea)",
      "Otro criterio incluido",
      "Otro criterio incluido"
    ],
    "no_es": [
      "Criterio que NO incluye (1 línea)",
      "Otro criterio excluido",
      "Otro criterio excluido"
    ],
    "pregunta_refinada": "Pregunta de investigación mejorada basada en el análisis (1-2 líneas)"
  },
  
  "fase3_analisis_cochrane": {
    "elementos_cumplimiento": [
      {
        "elemento": "Delimita la población o contexto",
        "cumple": "si|no|parcial",
        "comentario": "Breve análisis (1 línea)"
      },
      {
        "elemento": "Identifica fenómeno de interés",
        "cumple": "si|no|parcial",
        "comentario": "Breve análisis"
      },
      {
        "elemento": "Define resultados esperados",
        "cumple": "si|no|parcial",
        "comentario": "Breve análisis"
      }
    ],
    "recomendaciones_pregunta": [
      "Pregunta de investigación 1 según Cochrane",
      "Pregunta de investigación 2 (opcional)"
    ]
  },
  
  "fase4_terminos_clave": {
    "tecnologia_herramientas": ["término1", "término2", "término3"],
    "dominio_aplicacion": ["dominio1", "dominio2"],
    "tipo_estudio": ["Systematic Literature Review"],
    "focos_tematicos": ["foco1", "foco2", "foco3"]
  },
  
  "fase5_cumplimiento_prisma": {
    "items_evaluados": [
      {
        "numero": 1,
        "item": "¿Es entendible por alguien que no es experto?",
        "cumple": "si|no|parcial",
        "evidencia": "Breve justificación (1 línea)"
      },
      {
        "numero": 2,
        "item": "¿Se definen claramente las variables?",
        "cumple": "si|no|parcial",
        "evidencia": "Breve justificación"
      },
      {
        "numero": 3,
        "item": "¿Existe justificación de la revisión?",
        "cumple": "si|no|parcial",
        "evidencia": "Breve justificación"
      }
    ],
    "puntuacion_total": "X/13 ítems cumplidos",
    "conclusion": "El protocolo cumple|no cumple completamente con PRISMA/WPOM"
  },
  
  "fase6_criterios_inclusion_exclusion": {
    "criterios_inclusion": [
      "Criterio de inclusión 1 (1 línea)",
      "Criterio de inclusión 2",
      "Criterio de inclusión 3"
    ],
    "criterios_exclusion": [
      "Criterio de exclusión 1 (1 línea)",
      "Criterio de exclusión 2",
      "Criterio de exclusión 3"
    ]
  },
  
  "fase7_estrategia_busqueda": {
    "cadena_busqueda": "Cadena booleana completa con AND, OR, NOT y comillas",
    "bases_datos": [
      "IEEE Xplore",
      "ACM Digital Library",
      "Scopus",
      "Web of Science",
      "Google Scholar"
    ],
    "rango_temporal": {
      "inicio": 2019,
      "fin": 2025,
      "justificacion": "Breve razón del rango temporal (1 línea)"
    }
  }
}

**REGLAS CRÍTICAS:**
1. El título propuesto debe ser académico, específico y seguir formato Cochrane
2. Evalúa rigurosamente si la propuesta cumple con metodología SLR
3. La matriz Es/No Es debe tener evaluación + listas de criterios
4. Los términos clave deben estar bien categorizados
5. Sé conciso pero preciso (1-2 líneas por campo)
6. Usa SOLO comillas dobles normales ("), NO comillas tipográficas
7. Responde ÚNICAMENTE con JSON válido`;
  }

  /**
   * Genera análisis usando ChatGPT (OpenAI)
   */
  async generateWithChatGPT(prompt) {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo más capaz para análisis complejo
      messages: [
        {
          role: "system",
          content: "Eres un experto en metodología de investigación científica, revisiones sistemáticas de literatura (SLR) y estándares PRISMA/Cochrane. Tienes amplia experiencia en diseño de protocolos de investigación. Respondes siempre en formato JSON válido, estructurado y completo."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000, // Aumentado para respuestas más largas
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content);
  }

  /**
   * Genera análisis usando Gemini (Google)
   */
  async generateWithGemini(prompt) {
    if (!this.gemini) {
      throw new Error('Gemini API key no configurada');
    }

    try {
      // Usar gemini-2.5-flash (modelo disponible y rápido)
      const model = this.gemini.getGenerativeModel({ 
        model: "models/gemini-2.5-flash"
      });

      // Construir el prompt con instrucciones para JSON
      const fullPrompt = `${prompt}

IMPORTANTE: 
1. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional
2. Usa SOLO comillas dobles normales ("), NO uses comillas tipográficas (" " ' ')
3. Escapa correctamente los caracteres especiales dentro de las cadenas
4. NO uses caracteres Unicode especiales (–, —, …, etc.)`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 16384, // Máximo para gemini-2.5-flash
          responseMimeType: "application/json" // Forzar respuesta en JSON
        }
      });
      
      const response = await result.response;
      const text = response.text();
      
      // Limpiar la respuesta agresivamente
      let cleanedText = text.trim();
      
      // Remover bloques de código markdown si existen
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      
      // Reemplazar comillas tipográficas y otros caracteres Unicode problemáticos
      cleanedText = cleanedText
        .replace(/[""]/g, '"')  // Comillas tipográficas dobles → comillas normales
        .replace(/['']/g, "'")  // Comillas tipográficas simples → apóstrofes normales
        .replace(/[…]/g, '...')  // Elipsis tipográfica → tres puntos
        .replace(/[–—]/g, '-')   // Guiones largos → guion normal
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Caracteres de control
        .replace(/\r\n/g, '\n')  // Normalizar saltos de línea Windows
        .replace(/\r/g, '\n');   // Normalizar saltos de línea Mac
      
      // Intentar parsear directamente
      try {
        return JSON.parse(cleanedText);
      } catch (firstError) {
        console.log('⚠️ Primera prueba de parsing falló, intentando reparación adicional...');
        
        // Si falla, intentar reparaciones más agresivas
        try {
          // Registrar snippet para debug
          const errorPos = parseInt(firstError.message.match(/position (\d+)/)?.[1] || '0');
          if (errorPos > 0) {
            const start = Math.max(0, errorPos - 100);
            const end = Math.min(cleanedText.length, errorPos + 100);
            console.log(`📍 Contenido alrededor del error (posición ${errorPos}):`);
            console.log(cleanedText.substring(start, end));
          }
          
          // Intentar parsear de nuevo
          return JSON.parse(cleanedText);
        } catch (secondError) {
          // Si aún falla, registrar el contenido completo para debug
          console.error('❌ JSON recibido de Gemini (primeros 500 chars):');
          console.error(cleanedText.substring(0, 500));
          console.error('\n❌ JSON recibido de Gemini (últimos 500 chars):');
          console.error(cleanedText.substring(Math.max(0, cleanedText.length - 500)));
          
          throw new Error(`JSON inválido de Gemini: ${secondError.message}`);
        }
      }
    } catch (error) {
      console.error('Error en Gemini:', error);
      throw new Error(`Error al generar con Gemini: ${error.message}`);
    }
  }
}

module.exports = GenerateProtocolAnalysisUseCase;
