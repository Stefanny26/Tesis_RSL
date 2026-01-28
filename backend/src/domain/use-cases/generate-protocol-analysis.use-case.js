const OpenAI = require('openai');
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true, strict: false });

class GenerateProtocolAnalysisUseCase {
  constructor({ openaiApiKey = process.env.OPENAI_API_KEY } = {}) {
    if (openaiApiKey) {
      this.openai = new OpenAI({ apiKey: openaiApiKey });
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

  /**
   * Construye prompt metodológicamente robusto con reglas PRISMA/Cochrane
   * @param {Object} params - Parámetros del proyecto
   * @param {string} params.title - Título del proyecto
   * @param {string} params.description - Descripción del proyecto
   * @param {string} params.area - Área de conocimiento
   * @param {number} params.yearStart - Año inicial del rango temporal
   * @param {number} params.yearEnd - Año final del rango temporal
   */
  buildPrompt({ title, description, area = 'No especificada', yearStart = 2020, yearEnd = new Date().getFullYear() }) {
    return `
Eres un experto en metodología PRISMA/Cochrane para revisiones sistemáticas de literatura.

═══════════════════════════════════════════════════════════════
DATOS DEL PROYECTO
═══════════════════════════════════════════════════════════════
• Título: ${title}
• Descripción: ${description}
• Área de conocimiento: ${area}
• Rango temporal: ${yearStart} - ${yearEnd}

═══════════════════════════════════════════════════════════════
TAREA: GENERAR PROTOCOLO METODOLÓGICO COMPLETO
═══════════════════════════════════════════════════════════════

Tu misión es generar:
1. TÍTULO PROPUESTO para la revisión sistemática
2. FASE 1: Marco PICO completo
3. FASE 2: Matriz ES / NO ES con validación cruzada

═══════════════════════════════════════════════════════════════
FASE 1: MARCO PICO
═══════════════════════════════════════════════════════════════

INSTRUCCIONES CRÍTICAS PARA CADA COMPONENTE:

🧑 POPULATION (P):
⚠️ **REGLA CRÍTICA PARA INGENIERÍA Y TECNOLOGÍA:**
- La POBLACIÓN en una RSL de ingeniería NO son personas, sino ESTUDIOS o CONTEXTOS TECNOLÓGICOS
- ❌ INCORRECTO: "Profesionales de TI entre 25-45 años en empresas latinoamericanas"
- ✅ CORRECTO: "Estudios empíricos sobre desarrollo de software en contextos empresariales"

**FORMATO OBLIGATORIO PARA POBLACIÓN:**
"Estudios [tipo de estudios] sobre [fenómeno tecnológico] en [contexto técnico/dominio de aplicación]"

**EJEMPLOS VÁLIDOS:**
- "Estudios empíricos sobre aplicaciones de IA en ingeniería de software"
- "Investigaciones académicas que evalúan métodos de pruebas automatizadas en desarrollo ágil"
- "Evaluaciones técnicas de herramientas de aprendizaje automático en sistemas de producción"

**QUÉ DEBE INCLUIR:**
- Tipo de estudios (empíricos, evaluativos, experimentales, etc.)
- Fenómeno o tecnología investigada
- Contexto técnico o dominio de aplicación (relacionado con ${area})
- **LONGITUD MÍNIMA: 40-60 palabras** explicando qué estudios, sobre qué fenómeno, en qué contexto

**QUÉ NO DEBE INCLUIR JAMÁS:**
- ❌ Edad de personas
- ❌ Profesiones o roles humanos como población primaria  
- ❌ Ubicación geográfica de personas
- ❌ Características demográficas
- ❌ "Profesionales", "usuarios", "trabajadores" como sujeto principal

**JUSTIFICACIÓN METODOLÓGICA (incluir siempre):**
"La población se define en términos de estudios/contextos técnicos conforme a metodología PRISMA 2020 y guías de revisiones sistemáticas en ingeniería, donde la unidad de análisis son publicaciones académicas, no sujetos humanos."

🔬 INTERVENTION (I):
- Debe ser la tecnología/método/fenómeno central del título
- Debe ser OPERACIONALIZABLE (se puede buscar en bases de datos)
- Si es tecnología: especificar versión/tipo y características
- Si es método: especificar características distintivas y cómo se implementa
- **LONGITUD MÍNIMA: 40-60 palabras** describiendo la intervención detalladamente

⚖️ COMPARISON (C):
- Si NO aplica comparación, indicar: "No se compara con intervención específica" y justificar por qué
- Si SÍ aplica: ser explícito (ej: "métodos tradicionales sin IA", "placebo", "estándar de oro")
- **LONGITUD MÍNIMA: 30-50 palabras** justificando la presencia o ausencia de comparación

🎯 OUTCOMES (O):
- Deben ser MEDIBLES y OBSERVABLES en estudios empíricos
- Ejemplos válidos: "rendimiento", "tasa de error", "satisfacción del usuario", "tiempo de respuesta"
- Evitar: "impacto general", "efectividad" (sin especificar qué se mide)
- **LONGITUD MÍNIMA: 40-60 palabras** listando outcomes específicos, cómo se medirán, por qué son relevantes

═══════════════════════════════════════════════════════════════
FASE 2: MATRIZ ES / NO ES
═══════════════════════════════════════════════════════════════

**REGLAS OBLIGATORIAS:**

1️⃣ DERIVACIÓN DIRECTA:
   - Todo en ES/NO ES DEBE derivar del título, descripción y área
   - NO inventar ámbitos fuera del proyecto

2️⃣ 5 DIMENSIONES MÍNIMAS (ambos arrays ES y NO_ES):
   a) Tema/Tecnología específica
   b) Tipo de estudio/método
   c) Contexto/Población
   d) Dominio de aplicación
   e) Tipo de evidencia

3️⃣ TÉRMINOS MEDIBLES:
   - ❌ Evitar: "estudios antiguos", "tecnología avanzada", "muy relevante"
   - ✅ Usar: "estudios publicados entre ${yearStart}-${yearEnd}", "tecnologías X, Y, Z", "evidencia empírica"

4️⃣ COHERENCIA CON PICO:
   - Si ES dice "estudios experimentales" → PICO debe reflejar eso
   - Si NO ES dice "literatura gris" → esto se convertirá en criterio de exclusión

5️⃣ VALIDACIÓN CRUZADA:
   - Cada elemento de ES debe tener presencia en algún componente PICO
   - Cada elemento de NO ES debe justificar una exclusión

**FORMATO PARA ES (array):**
Generar 5-7 elementos que definan POSITIVAMENTE el alcance:
- "Estudios empíricos sobre [tecnología] aplicados en [contexto]"
- "Investigaciones publicadas entre ${yearStart} y ${yearEnd}"
- "Artículos en journals revisados por pares"
- "Aplicaciones en el área de ${area}"
- etc.

**FORMATO PARA NO_ES (array):**
Generar 5-7 elementos que definan LÍMITES NEGATIVOS:
- "Estudios anteriores a ${yearStart} (contexto desactualizado)"
- "Literatura gris (tesis, reportes técnicos no publicados)"
- "Investigaciones en áreas fuera de ${area}"
- "Artículos sin evidencia empírica"
- etc.

**ELEMENTOS DE DELIMITACIÓN (7 preguntas):**
Genera exactamente 7 elementos de análisis con RESPUESTAS FUNDAMENTADAS:
- **Campo "presente"**: Mínimo 20-30 palabras, respuesta específica y detallada
- **Campo "justificacion"**: Mínimo 30-40 palabras, explicación metodológica completa

[
  {
    pregunta: "¿Qué fenómeno o tecnología se investiga específicamente?",
    presente: "[respuesta detallada basada en título/descripción, min. 20-30 palabras]",
    justificacion: "[por qué es relevante para la RSL, conexión con objetivos, min. 30-40 palabras]"
  },
  {
    pregunta: "¿En qué contexto técnico o dominio se investiga?",
    presente: "[contexto técnico/dominio específico, NO personas, min. 20-30 palabras]",
    justificacion: "[relevancia del contexto técnico para ${area}, min. 30-40 palabras]"
  },
  {
    pregunta: "¿Qué tipo de intervención o método se analiza?",
    presente: "[método/tecnología con características distintivas, min. 20-30 palabras]",
    justificacion: "[operacionalización, cómo se implementa, min. 30-40 palabras]"
  },
  {
    pregunta: "¿Se compara con alguna alternativa?",
    presente: "[sí/no y cuál, con detalles si aplica, min. 20-30 palabras]",
    justificacion: "[relevancia de la comparación o ausencia, impacto en RSL, min. 30-40 palabras]"
  },
  {
    pregunta: "¿Qué resultados o variables se miden?",
    presente: "[outcomes medibles específicos, min. 20-30 palabras]",
    justificacion: "[por qué estos outcomes, cómo se relacionan con objetivos, min. 30-40 palabras]"
  },
  {
    pregunta: "¿Qué tipos de estudios se consideran válidos?",
    presente: "[ej: experimentales, observacionales, casos de estudio - con detalles, min. 20-30 palabras]",
    justificacion: "[adecuación al área ${area}, rigor metodológico requerido, min. 30-40 palabras]"
  },
  {
    pregunta: "¿Qué tipo de evidencia se requiere?",
    presente: "[ej: datos cuantitativos, análisis cualitativo - con especificaciones, min. 20-30 palabras]",
    justificacion: "[coherencia metodológica, por qué este tipo de evidencia, min. 30-40 palabras]"
  }
]

**PREGUNTA REFINADA:**
Construir pregunta PICO formal:
"En [P], ¿la aplicación de [I], en comparación con [C], resulta en [O]?"

O si no hay comparación:
"En [P], ¿cuál es el efecto/impacto de [I] en [O]?"

═══════════════════════════════════════════════════════════════
FORMATO JSON DE SALIDA (ESTRICTO)
═══════════════════════════════════════════════════════════════

{
  "titulo_propuesto": "[Título específico de máximo 20 palabras que incluya: fenómeno + contexto + 'revisión sistemática']",
  "fase1_marco_pico": {
    "marco_pico": {
      "population": {
        "descripcion": "[Estudios [tipo] sobre [fenómeno] en [contexto técnico/dominio]. NO INCLUIR edad, personas, profesiones como población principal. Mínimo 40 palabras.]",
        "justificacion": "La población se define en términos de estudios/contextos técnicos conforme a metodología PRISMA 2020 y guías de revisiones sistemáticas en ingeniería, donde la unidad de análisis son publicaciones académicas, no sujetos humanos."
      },
      "intervention": {
        "descripcion": "[I operacionalizable, derivada del título. Mínimo 40 palabras.]",
        "justificacion": "[Por qué esta intervención es relevante, cómo se operacionaliza en estudios, relación con ${area}]"
      },
      "comparison": {
        "descripcion": "[C explícita o 'No aplica'. Mínimo 30 palabras.]",
        "justificacion": "[Relevancia de la comparación o justificación de su ausencia]"
      },
      "outcomes": {
        "descripcion": "[O medibles y observables. Mínimo 40 palabras.]",
        "justificacion": "[Por qué estos outcomes, cómo se relacionan con objetivos de la revisión]"
      }
    }
  },
  "fase2_matriz_es_no_es": {
    "elementos": [
      {
        "pregunta": "...",
        "presente": "...",
        "justificacion": "..."
      }
      // ... 7 elementos total
    ],
    "es": [
      "Elemento ES 1 (dimensión: tema/tecnología)",
      "Elemento ES 2 (dimensión: tipo de estudio)",
      "Elemento ES 3 (dimensión: contexto técnico/dominio)",
      "Elemento ES 4 (dimensión: dominio aplicación)",
      "Elemento ES 5 (dimensión: tipo de evidencia)",
      "Elemento ES 6 (adicional: rango temporal ${yearStart}-${yearEnd})",
      "Elemento ES 7 (adicional específico del área ${area})"
    ],
    "no_es": [
      "Elemento NO ES 1 (exclusión tema/tecnología fuera de alcance)",
      "Elemento NO ES 2 (exclusión tipo de estudio no válido)",
      "Elemento NO ES 3 (exclusión contexto técnico no aplicable)",
      "Elemento NO ES 4 (exclusión dominio fuera de ${area})",
      "Elemento NO ES 5 (exclusión tipo de evidencia no rigurosa)",
      "Elemento NO ES 6 (exclusión temporal: antes de ${yearStart})",
      "Elemento NO ES 7 (exclusión literatura gris o fuentes no académicas)"
    ],
    "pregunta_refinada": "En [estudios sobre contexto P], ¿[verbo investigativo] de [I] [comparación opcional] resulta en [O]?"
  }
}

═══════════════════════════════════════════════════════════════
VALIDACIÓN FINAL OBLIGATORIA
═══════════════════════════════════════════════════════════════

Antes de enviar el JSON, VERIFICA:
✅ **POBLACIÓN NO CONTIENE:**
   - ❌ Edad (años, rango etario)
   - ❌ Profesiones como sujeto principal ("desarrolladores", "ingenieros", "profesionales")
   - ❌ Ubicación geográfica de personas
   - ❌ Características demográficas
   
✅ **POBLACIÓN SÍ CONTIENE:**
   - ✅ Tipo de estudios (empíricos, evaluativos, etc.)
   - ✅ Fenómeno tecnológico investigado
   - ✅ Contexto técnico o dominio de aplicación
   - ✅ Justificación metodológica PRISMA 2020

✅ Todos los elementos ES están reflejados en algún componente PICO
✅ Todos los elementos NO ES justifican exclusiones futuras
✅ Las 5 dimensiones mínimas están cubiertas en ES y NO ES
✅ No hay términos ambiguos ("muy", "poco", "relevante" sin cuantificar)
✅ La pregunta refinada puede responderse con los estudios delimitados
✅ Cada componente PICO tiene descripción Y justificación

RESPONDE ÚNICAMENTE CON EL JSON VÁLIDO. NO AGREGUES TEXTO ADICIONAL.
`.trim();
  }

  async generateWithChatGPT(prompt) {
    if (!this.openai) throw new Error('OpenAI no configurado');
    const res = await this.retry(async () => {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un experto en metodología PRISMA/Cochrane para revisiones sistemáticas en Ingeniería y Tecnología. REGLA CRÍTICA: La POBLACIÓN en RSL de ingeniería son ESTUDIOS o CONTEXTOS TECNOLÓGICOS, NUNCA personas. Respondes solo con JSON válido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6, // Aumentado de 0.3 a 0.6 para mayor especificidad
        max_tokens: 5000, // Aumentado para prompt más largo
        response_format: { type: 'json_object' }
      });
      return completion.choices?.[0]?.message?.content || '';
    }, 3, 500);
    return this.normalizeText(res);
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

  /**
   * Ejecuta la generación de análisis de protocolo
   * @param {Object} params - Parámetros de entrada
   * @param {string} params.title - Título del proyecto
   * @param {string} params.description - Descripción del proyecto
   * @param {string} params.area - Área de conocimiento (opcional)
   * @param {number} params.yearStart - Año inicial del rango temporal (opcional, default: 2019)
   * @param {number} params.yearEnd - Año final del rango temporal (opcional, default: 2025)
   * @param {string} params.aiProvider - Proveedor de IA (default: 'chatgpt')
   */
  async execute({ title, description, area, yearStart, yearEnd, aiProvider = 'chatgpt' } = {}) {
    if (!title || !description) throw new Error('Titulo y descripcion requeridos');
    if (!this.openai) throw new Error('No hay proveedor de IA configurado (OpenAI)');
    
    console.log('🔬 Generando análisis de protocolo...');
    console.log('   Proveedor:', aiProvider);
    console.log('   Área:', area || 'No especificada');
    console.log('   Rango temporal:', yearStart || 2019, '-', yearEnd || 2025);
    
    const prompt = this.buildPrompt({ title, description, area, yearStart, yearEnd });
    const chatgptCaller = async (p) => await this.generateWithChatGPT(p);
    
    let raw;
    try {
      raw = await chatgptCaller(prompt);
    } catch (error) {
      console.error(`❌ Error en ChatGPT:`, error.message);
      throw error;
    }
    
    const parseResult = await this.parseAndValidateJson(raw, chatgptCaller);
    if (!parseResult.ok) {
      throw new Error('No se pudo obtener JSON valido');
    }
    
    console.log('Analisis generado con chatgpt');
    return { success: true, data: parseResult.value, usedProvider: 'chatgpt' };
  }
}

module.exports = GenerateProtocolAnalysisUseCase;

