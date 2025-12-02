const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, strict: false });

class GenerateProtocolAnalysisUseCase {
  constructor({ openaiApiKey = process.env.OPENAI_API_KEY, geminiApiKey = process.env.GEMINI_API_KEY } = {}) {
    if (openaiApiKey) {
      this.openai = new OpenAI({ apiKey: openaiApiKey });
    }
    if (geminiApiKey) {
      this.gemini = new GoogleGenerativeAI(geminiApiKey);
    }
    this.outputSchema = {
      type: 'object',
      required: ['titulo_propuesto', 'fase1_marco_pico', 'fase2_matriz_es_no_es'],
      properties: {
        titulo_propuesto: { type: 'string' },
        fase1_marco_pico: { type: 'object' },
        fase2_matriz_es_no_es: { type: 'object' }
      }
    };
    this.validateOutput = ajv.compile(this.outputSchema);
  }

  normalizeText(text) {
    if (!text || typeof text !== 'string') return '';
    let s = text.replace(/[\u201C\u201D\u201E\u201F""]/g, '"').replace(/[\u2018\u2019\u201A\u201B'']/g, "'").replace(/[\u2013\u2014��]/g, '-').replace(/\u2026�/g, '...').replace(/\uFEFF/g, '').replace(/[\u0000-\u001F\u007F-\u009F]/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const first = s.indexOf('{');
    const last = s.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) s = s.slice(first, last + 1);
    if (s.startsWith('```json')) s = s.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    else if (s.startsWith('```')) s = s.replace(/^```\n?/, '').replace(/\n?```$/, '');
    return s.trim();
  }

  sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  async retry(fn, retries = 3, baseMs = 400) {
    let attempt = 0;
    while (attempt < retries) {
      try { return await fn(); }
      catch (err) {
        attempt++;
        if (attempt >= retries) throw err;
        await this.sleep(baseMs * Math.pow(2, attempt));
      }
    }
  }

  buildPrompt(title, description) {
    return 'Eres experto en PRISMA/Cochrane. Genera JSON con: titulo_propuesto, fase1_marco_pico {marco_pico: {population: {descripcion}, intervention: {descripcion}, comparison: {descripcion}, outcomes: {descripcion}}}, fase2_matriz_es_no_es {elementos: [{pregunta, presente, justificacion}] (7 items), es: [], no_es: [], pregunta_refinada}. Proyecto: ' + title + '. Descripcion: ' + description + '. Responde SOLO JSON valido.';
  }

  async generateWithChatGPT(prompt) {
    if (!this.openai) throw new Error('OpenAI no configurado');
    const res = await this.retry(async () => {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Experto en revisiones sistematicas. Responde solo JSON valido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });
      return completion.choices?.[0]?.message?.content || '';
    }, 3, 500);
    return this.normalizeText(res);
  }

  async generateWithGemini(prompt) {
    if (!this.gemini) throw new Error('Gemini no configurado');
    const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await this.retry(async () => {
      const r = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt + '. Responde SOLO JSON.' }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8000, responseMimeType: 'application/json' }
      });
      const response = await r.response;
      return await response.text();
    }, 3, 500);
    return this.normalizeText(result);
  }

  async parseAndValidateJson(rawText, correctionFn = null) {
    const cleaned = this.normalizeText(rawText);
    try {
      const parsed = JSON.parse(cleaned);
      const valid = this.validateOutput(parsed);
      if (!valid) return { ok: false, error: 'schema', details: this.validateOutput.errors, parsed };
      return { ok: true, value: parsed };
    } catch (parseError) {
      if (correctionFn) {
        try {
          const correction = await correctionFn('Corrige este JSON: ' + cleaned);
          const parsed2 = JSON.parse(this.normalizeText(correction));
          if (!this.validateOutput(parsed2)) return { ok: false, error: 'schema_after_correction' };
          return { ok: true, value: parsed2, corrected: true };
        } catch (err2) {
          return { ok: false, error: 'parse_failed', message: err2.message, raw: cleaned };
        }
      }
      return { ok: false, error: 'parse_failed', message: parseError.message, raw: cleaned };
    }
  }

  async execute({ title, description, aiProvider = 'chatgpt' } = {}) {
    if (!title || !description) throw new Error('Titulo y descripcion requeridos');
    console.log('Generando analisis...', aiProvider);
    const prompt = this.buildPrompt(title, description);
    const chatgptCaller = async (p) => await this.generateWithChatGPT(p);
    const geminiCaller = async (p) => await this.generateWithGemini(p);
    let raw, usedProvider = aiProvider;
    try {
      if (aiProvider === 'chatgpt' && this.openai) {
        raw = await chatgptCaller(prompt);
      } else if (aiProvider === 'gemini' && this.gemini) {
        raw = await geminiCaller(prompt);
      } else if (this.openai) {
        // Fallback a ChatGPT si el proveedor solicitado no está disponible
        usedProvider = 'chatgpt';
        raw = await chatgptCaller(prompt);
      } else if (this.gemini) {
        // Fallback a Gemini si ChatGPT no está disponible
        usedProvider = 'gemini';
        raw = await geminiCaller(prompt);
      } else {
        throw new Error('No hay proveedores de IA configurados');
      }
    } catch (firstErr) {
      console.error(`❌ Error en ${aiProvider}:`, firstErr.message);
      console.error('Detalles del error:', firstErr);
      
      // Intentar con el otro proveedor disponible
      if (aiProvider === 'chatgpt' && this.gemini) { 
        console.log('⚠️  ChatGPT falló, intentando con Gemini...');
        usedProvider = 'gemini'; 
        raw = await geminiCaller(prompt); 
      } else if (aiProvider === 'gemini' && this.openai) {
        console.log('⚠️  Gemini falló, intentando con ChatGPT...');
        usedProvider = 'chatgpt';
        raw = await chatgptCaller(prompt);
      } else {
        throw firstErr;
      }
    }
    const parseResult = await this.parseAndValidateJson(raw, this.openai ? chatgptCaller : geminiCaller);
    if (!parseResult.ok) {
      if (usedProvider === 'chatgpt' && this.gemini) {
        const altRaw = await geminiCaller(prompt);
        const altParse = await this.parseAndValidateJson(altRaw, chatgptCaller);
        if (altParse.ok) return { success: true, data: altParse.value, usedProvider: 'gemini' };
      } else if (usedProvider === 'gemini' && this.openai) {
        const altRaw = await chatgptCaller(prompt);
        const altParse = await this.parseAndValidateJson(altRaw, geminiCaller);
        if (altParse.ok) return { success: true, data: altParse.value, usedProvider: 'chatgpt' };
      }
      throw new Error('No se pudo obtener JSON valido');
    }
    console.log('Analisis generado con', usedProvider);
    return { success: true, data: parseResult.value, usedProvider };
  }
}

module.exports = GenerateProtocolAnalysisUseCase;

