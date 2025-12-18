const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Servicio centralizado para interacción con APIs de IA
 * Soporta OpenAI (ChatGPT) y Google Gemini con fallback automático
 */
class AIService {
  constructor() {
    // Inicializar OpenAI/ChatGPT (PRIORIDAD 1)
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    
    // Inicializar Gemini (PRIORIDAD 2)
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    if (!this.openai && !this.gemini) {
      console.warn('⚠️ No hay APIs de IA configuradas');
    }
  }

  /**
   * Genera texto usando el proveedor disponible
   * Compatible con 2 modos:
   * - generateText(fullPromptWithContext) - Un solo string con todo
   * - generateText(systemInstructions, userContent, provider) - Separado
   * 
   * @param {string} promptOrSystem - Prompt completo o instrucción del sistema
   * @param {string} contentOrProvider - Contenido del usuario o provider ('chatgpt'/'gemini')
   * @param {string} providerOverride - Provider explícito (opcional)
   * @returns {Promise<string>} Texto generado
   */
  async generateText(promptOrSystem, contentOrProvider = null, providerOverride = null) {
    let systemPrompt, userPrompt, provider;
    
    // Detectar modo de uso
    if (contentOrProvider === null || contentOrProvider === undefined) {
      // Modo 1: generateText(fullPrompt)
      systemPrompt = "Eres un asistente experto en análisis académico.";
      userPrompt = promptOrSystem;
      provider = providerOverride;
    } else if (['chatgpt', 'gemini'].includes(contentOrProvider)) {
      // Modo 2: generateText(fullPrompt, 'chatgpt')
      systemPrompt = "Eres un asistente experto en análisis académico.";
      userPrompt = promptOrSystem;
      provider = contentOrProvider;
    } else {
      // Modo 3: generateText(systemPrompt, userContent, provider)
      systemPrompt = promptOrSystem;
      userPrompt = contentOrProvider;
      provider = providerOverride;
    }
    // Determinar proveedor
    let useProvider = provider;
    
    if (!useProvider) {
      // Auto-selección: preferir ChatGPT si está disponible
      if (this.openai) {
        useProvider = 'chatgpt';
      } else if (this.gemini) {
        useProvider = 'gemini';
      } else {
        throw new Error('No hay proveedores de IA configurados');
      }
    }

    try {
      if (useProvider === 'chatgpt' && this.openai) {
        return await this._generateWithChatGPT(systemPrompt, userPrompt);
      } else if (useProvider === 'gemini' && this.gemini) {
        return await this._generateWithGemini(systemPrompt, userPrompt);
      } else if (this.openai) {
        // Fallback a ChatGPT
        console.log('🔄 Fallback a ChatGPT...');
        return await this._generateWithChatGPT(systemPrompt, userPrompt);
      } else if (this.gemini) {
        // Fallback a Gemini
        console.log('🔄 Fallback a Gemini...');
        return await this._generateWithGemini(systemPrompt, userPrompt);
      } else {
        throw new Error('No hay proveedores de IA configurados');
      }
    } catch (error) {
      console.error(`❌ Error con ${useProvider}:`, error.message);
      
      // Intentar fallback al otro proveedor
      if (useProvider === 'chatgpt' && this.gemini) {
        console.log('🔄 Intentando fallback a Gemini...');
        return await this._generateWithGemini(systemPrompt, userPrompt);
      } else if (useProvider === 'gemini' && this.openai) {
        console.log('🔄 Intentando fallback a ChatGPT...');
        return await this._generateWithChatGPT(systemPrompt, userPrompt);
      }
      
      throw error;
    }
  }

  /**
   * Genera texto con ChatGPT
   * @private
   */
  async _generateWithChatGPT(systemPrompt, userPrompt) {
    if (!this.openai) {
      throw new Error('OpenAI API key no configurada');
    }

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2500
    });

    return completion.choices[0].message.content;
  }

  /**
   * Genera texto con Gemini
   * @private
   */
  async _generateWithGemini(systemPrompt, userPrompt) {
    if (!this.gemini) {
      throw new Error('Gemini API key no configurada');
    }

    const model = this.gemini.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2500
      }
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * Genera embeddings (solo disponible con OpenAI)
   * @param {string} text - Texto para generar embedding
   * @returns {Promise<number[]>} Vector de embedding
   */
  async generateEmbedding(text) {
    if (!this.openai) {
      throw new Error('OpenAI API key requerida para embeddings');
    }

    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  }

  /**
   * Verifica si hay proveedores disponibles
   * @returns {Object} Estado de disponibilidad
   */
  getAvailability() {
    return {
      chatgpt: !!this.openai,
      gemini: !!this.gemini,
      any: !!(this.openai || this.gemini)
    };
  }
}

module.exports = AIService;
