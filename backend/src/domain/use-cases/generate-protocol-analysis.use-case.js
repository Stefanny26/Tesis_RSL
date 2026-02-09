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
      required: ['fase1_marco_pico', 'fase2_matriz_es_no_es'],
      properties: {
        fase1_marco_pico: { 
          type: 'object',
          required: ['marco_pico', 'pregunta_contestable'],
          properties: {
            marco_pico: { type: 'object' },
            pregunta_contestable: { type: 'string' }
          }
        },
        fase2_matriz_es_no_es: { 
          type: 'object',
          required: ['analisis_critico', 'criterios_inclusion_es', 'criterios_exclusion_no_es', 'estructura_matriz_sintesis'],
          properties: {
            analisis_critico: { type: 'array' },
            criterios_inclusion_es: { type: 'array' },
            criterios_exclusion_no_es: { type: 'array' },
            estructura_matriz_sintesis: { type: 'array' }
          }
        }
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
   * Construye prompt metodológicamente robusto con reglas PRISMA 2020/Cochrane
   * @param {Object} params - Parámetros del proyecto
   * @param {string} params.title - Título del proyecto
   * @param {string} params.description - Descripción del proyecto
   * @param {string} params.area - Área de conocimiento
   * @param {number} params.yearStart - Año inicial del rango temporal
   * @param {number} params.yearEnd - Año final del rango temporal
   */
  buildPrompt({ title, description, area = 'No especificada', yearStart = 2020, yearEnd = new Date().getFullYear() }) {
    return `
Eres un experto en metodología PRISMA 2020 y Cochrane para revisiones sistemáticas de literatura (RSL) en Ingeniería y Tecnología.

═══════════════════════════════════════════════════════════════
DATOS DEL PROYECTO
═══════════════════════════════════════════════════════════════
• Título: ${title}
• Descripción: ${description}
• Área de conocimiento: ${area}
• Rango temporal: ${yearStart} - ${yearEnd}

═══════════════════════════════════════════════════════════════
TAREA: GENERAR PROTOCOLO METODOLÓGICO Y MATRIZ DE DELIMITACIÓN
═══════════════════════════════════════════════════════════════

Tu misión es generar un protocolo que permita construir una **pregunta contestable** y una estructura para una futura **matriz de síntesis**.

═══════════════════════════════════════════════════════════════
FASE 1: MARCO PICO (Pregunta de Investigación Contestable)
═══════════════════════════════════════════════════════════════

Debes definir cada componente buscando **precisión absoluta y operacionalización**:

🧑 **P - POPULATION/PROBLEM:**
⚠️ **REGLA CRÍTICA PARA INGENIERÍA Y TECNOLOGÍA:**
- Definición: El **DOMINIO**, **SISTEMA** o **CONTEXTO TÉCNICO** donde se aplica la tecnología.
- La POBLACIÓN en RSL de ingeniería NO son los "artículos" ni "estudios", sino el ecosistema técnico.
- PRISMA 2020 para ingeniería exige definir **A QUÉ TIPO DE SISTEMAS O ENTORNOS** se aplican los estudios que se busca.
- Formato obligatorio: "Sistemas de [tipo] en contextos de [dominio]" o "Entornos de [tipo] que utilizan [tecnología]"

**EJEMPLO CORRECTO REAL:**
"Sistemas de software backend desarrollados en Node.js que requieren persistencia de datos en bases de datos NoSQL (específicamente MongoDB), incluyendo aplicaciones escalables, microservicios y APIs RESTful."

**QUÉ DEBE INCLUIR:**
- Tipo de sistema o plataforma técnica (ej: Sistemas backend, Aplicaciones móviles, Redes neuronales, Sistemas distribuidos)
- Tecnologías específicas que usa ese sistema (ej: Node.js, MongoDB, React, TensorFlow)
- Contexto de aplicación (ej: APIs RESTful, Microservicios, Aplicaciones empresariales)
- Características técnicas (ej: Escalables, Tiempo real, Alta concurrencia)
- **LONGITUD MÍNIMA: 40-60 palabras**

**QUÉ NO DEBE INCLUIR JAMÁS:**
- ❌ "Estudios", "Artículos", "Investigaciones", "Publicaciones académicas" como sujeto principal
- ❌ "Literatura científica", "Papers", "Revisiones" (eso es la UNIDAD DE ANÁLISIS de la RSL, NO la población)
- ❌ Edad, profesiones, ubicación geográfica de personas
- ❌ "Profesionales", "usuarios", "trabajadores", "desarrolladores" como población
- ❌ "Bases de datos académicas", "Journals", "Conferencias"

**EJEMPLOS DE POBLACIÓN INCORRECTA (NUNCA GENERAR):**
- ❌ "Artículos científicos publicados en IEEE y Scopus" ← Esto es la unidad de análisis
- ❌ "Estudios empíricos sobre rendimiento" ← Esto es el tipo de estudio
- ❌ "Publicaciones académicas revisadas por pares" ← Esto es criterio de inclusión
- ❌ "Investigaciones en bases de datos indexadas" ← Esto es fuente de búsqueda

**EJEMPLOS DE POBLACIÓN CORRECTA (SEGUIR ESTOS):**
- ✅ "Sistemas de backend en Node.js con persistencia MongoDB en contextos de microservicios escalables"
- ✅ "Aplicaciones de aprendizaje automático implementadas con TensorFlow en dominios de visión por computadora"
- ✅ "Sistemas IoT con comunicación MQTT desplegados en entornos de smart cities y domótica"
- ✅ "Aplicaciones web desarrolladas con React que implementan gestión de estado con Redux en contextos empresariales"

**JUSTIFICACIÓN METODOLÓGICA (incluir siempre en el JSON):**
"La población se define como el dominio, sistema o contexto técnico donde se aplicará la tecnología investigada, NO como estudios o publicaciones (esas son la unidad de análisis). Esta definición sigue estándares Kitchenham y PRISMA para revisiones en ingeniería."

🔬 **I - INTERVENTION (Intervención/Exposición):**
- Definición: La tecnología, método, práctica o fenómeno observado que constituye el eje central del estudio.
- **Debe estar lo más definida y operacionalizada posible** (versión, tipo, características distintivas).
- Debe ser BUSCABLE en bases de datos académicas (IEEE, Scopus, ACM).
- **LONGITUD MÍNIMA: 40-60 palabras** describiendo la intervención detalladamente, cómo se implementa, qué la caracteriza.

**Ejemplo válido:** "Algoritmos de aprendizaje profundo (redes neuronales convolucionales y recurrentes) aplicados en sistemas de reconocimiento de patrones, incluyendo sus arquitecturas, parámetros de configuración y técnicas de entrenamiento."

⚖️ **C - COMPARISON (Comparador):**
- Definición: Alternativa de intervención, métodos tradicionales, estándar de la industria o "sin intervención".
- **Si NO aplica comparación:** Indicar explícitamente "No se compara con intervención específica" y **justificar por qué** (ej: enfoque exploratorio, no existe estándar de oro claro, naturaleza descriptiva de la revisión).
- **Si SÍ aplica:** Ser específico (ej: "métodos tradicionales sin IA", "algoritmos clásicos", "enfoque manual").
- **LONGITUD MÍNIMA: 30-50 palabras**

🎯 **O - OUTCOMES (Resultados Medibles):**
- Definición: Variables de resultado medibles y observables que se espera encontrar en los estudios.
- **¿Qué impacto medible se espera obtener?** (rendimiento, precisión, latencia, usabilidad, tasa de error, tiempo de respuesta)
- Deben ser **métricas específicas** que puedan extraerse de los estudios.
- **LONGITUD MÍNIMA: 40-60 palabras** listando outcomes concretos, unidades de medida cuando sea posible.

⚠️ **REGLA CRÍTICA PARA TÍTULOS - USO DE TÉRMINOS PARAGUAS (UMBRELLA TERMS):**
Para TÍTULOS de RSL, usa un TÉRMINO PARAGUAS que agrupe múltiples métricas relacionadas:

**TÉRMINOS PARAGUAS COMUNES EN INGENIERÍA:**
- "Performance" → Agrupa: Latency, Throughput, Response Time, Execution Time, Speed
- "Scalability" → Agrupa: Load Handling, Concurrency, Resource Scaling, Horizontal/Vertical Scaling
- "Reliability" → Agrupa: Error Rate, Uptime, Fault Tolerance, Availability, Robustness
- "Usability" → Agrupa: Learning Curve, Developer Experience, Ease of Use, Documentation Quality
- "Development Efficiency" → Agrupa: Productivity, Code Complexity, Maintainability, Development Time
- "Security" → Agrupa: Vulnerability Detection, Attack Prevention, Authentication, Authorization
- "Resource Consumption" → Agrupa: CPU Usage, Memory Footprint, Disk I/O, Network Bandwidth
- "Code Quality" → Agrupa: Maintainability, Readability, Technical Debt, Code Smells

**PARA LA DESCRIPCIÓN DETALLADA DE OUTCOMES** (en el campo descripcion), SÍ lista métricas específicas.
**PARA EL TÍTULO DE LA RSL**, usa el término paraguas.

**Ejemplo válido:** "Métricas de rendimiento del sistema medidas en: (1) precisión de clasificación (accuracy, F1-score), (2) tiempo de respuesta en milisegundos, (3) uso de recursos computacionales (CPU, memoria), (4) escalabilidad medida en throughput de peticiones por segundo. TÉRMINO PARAGUAS PARA TÍTULO: Performance."

**PREGUNTA CONTESTABLE:**
Construir pregunta PICO formal que guíe toda la revisión:
- **CON comparación:** "En [P - sistemas/contextos], ¿cómo influye la aplicación de [I] en comparación con [C] sobre los niveles de [O]?"
- **SIN comparación:** "En [P - sistemas/contextos], ¿cuál es el efecto/impacto de [I] en términos de [O]?"

═══════════════════════════════════════════════════════════════
FASE 2: MATRIZ DE CRITERIOS DE ELEGIBILIDAD (Inclusión/Exclusión)
═══════════════════════════════════════════════════════════════

Esta matriz sistematiza la revisión y asegura el rigor científico. Debe preparar el terreno para la futura **extracción de datos** en la matriz de síntesis.

**ANÁLISIS CRÍTICO - 7 DIMENSIONES DE VALIDACIÓN:**
Genera exactamente 7 elementos de análisis con respuestas fundamentadas:

1. **¿Qué fenómeno/tecnología se investiga específicamente?**
   - presente: [Respuesta detallada basada en título/descripción, min. 20-30 palabras]
   - justificacion: [Por qué este foco, relevancia para ${area}, min. 30-40 palabras]

2. **¿En qué contexto técnico o dominio se aplica?**
   - presente: [SISTEMAS O ENTORNOS TÉCNICOS específicos donde opera la tecnología. NO mencionar 'artículos', 'estudios' o 'publicaciones'. Ejemplo: 'Sistemas backend Node.js con MongoDB'. Min. 20-30 palabras]
   - justificacion: [Relevancia del ecosistema técnico para delimitar alcance de la RSL. Explicar por qué este sistema/entorno es el foco. Min. 30-40 palabras]

3. **¿Qué intervención/método específico se analiza?**
   - presente: [Detalle del método, características operacionales, min. 20-30 palabras]
   - justificacion: [Operacionalización, implementación, min. 30-40 palabras]

4. **¿Existe comparación con alternativas?**
   - presente: [Sí/No y cuál específicamente, min. 20-30 palabras]
   - justificacion: [Delimitación del contraste, impacto en la pregunta, min. 30-40 palabras]

5. **¿Qué variables de resultado se miden?**
   - presente: [Métricas de éxito específicas, min. 20-30 palabras]
   - justificacion: [Por qué estas métricas, relación con objetivos, min. 30-40 palabras]

6. **¿Qué tipos de estudios se consideran válidos?**
   - presente: [Diseño metodológico: empírico, experimental, casos de estudio, min. 20-30 palabras]
   - justificacion: [Adecuación al área ${area}, rigor requerido, min. 30-40 palabras]

7. **¿Cuál es el rigor de la evidencia requerida?**
   - presente: [Journals, conferencias indexadas, exclusión de literatura gris, min. 20-30 palabras]
   - justificacion: [Estándares de calidad, impacto en validez de resultados, min. 30-40 palabras]

**CRITERIOS DE INCLUSIÓN (ES) - 7 elementos mínimos:**
Genera 7 criterios POSITIVOS que definan el alcance de la revisión:
1. "Estudios que analicen [fenómeno/tecnología específica] en contextos de ${area}"
2. "Investigaciones que utilicen [método/tecnología I] de forma operacionalizada"
3. "Estudios que midan resultados en términos de [outcomes específicos]"
4. "Artículos en journals revisados por pares o conferencias indexadas (IEEE, ACM, Springer, Elsevier)"
5. "Publicaciones entre ${yearStart} y ${yearEnd}"
6. "Estudios empíricos con datos cuantitativos o cualitativos verificables"
7. "Investigaciones en inglés o español con acceso a texto completo"

**CRITERIOS DE EXCLUSIÓN (NO ES) - 7 elementos mínimos:**
Genera 7 límites NEGATIVOS claros:
1. "Estudios anteriores a ${yearStart} que no reflejan el estado actual de la tecnología"
2. "Literatura gris (tesis, reportes técnicos no publicados) que no cumplen estándares académicos"
3. "Investigaciones en áreas fuera de ${area} que no son relevantes para el fenómeno"
4. "Artículos sin evidencia empírica (opiniones, editoriales) que no aportan datos verificables"
5. "Estudios que no analicen específicamente [intervención I]"
6. "Investigaciones que no midan resultados cuantificables en [outcomes O]"
7. "Publicaciones en idiomas distintos a inglés/español sin traducción disponible"

**ESTRUCTURA DE MATRIZ DE SÍNTESIS:**
Define las columnas que se usarán para extraer datos de cada estudio incluido:
[
  "Autor/Año",
  "Propósito del estudio",
  "Población/Contexto (P)",
  "Intervención aplicada (I)",
  "Comparador utilizado (C)",
  "Metodología aplicada (diseño, muestra, instrumentos)",
  "Resultados clave en Outcomes (O)",
  "Métricas cuantitativas reportadas",
  "Conclusiones principales",
  "Limitaciones del estudio"
]

═══════════════════════════════════════════════════════════════
FORMATO JSON DE SALIDA (ESTRICTO)
═══════════════════════════════════════════════════════════════

{
  "fase1_marco_pico": {
    "marco_pico": {
      "population": {
        "descripcion": "[SISTEMAS O ENTORNOS TÉCNICOS donde se aplica la tecnología. NUNCA 'artículos' o 'estudios'. Formato: 'Sistemas de [tipo técnico] en [stack tecnológico] para [contexto aplicación], incluyendo [características técnicas]'. Ejemplo real: 'Sistemas de software backend desarrollados en Node.js que requieren persistencia de datos en bases de datos NoSQL (específicamente MongoDB), incluyendo aplicaciones escalables, microservicios y APIs RESTful.' Mínimo 40 palabras.]",
        "justificacion": "La población se define como el dominio, sistema o contexto técnico donde se aplicará la tecnología investigada, NO como estudios o publicaciones (esas son la unidad de análisis). PRISMA 2020 exige especificar a qué tipo de sistemas/entornos se aplican los estudios buscados. Esta definición sigue estándares Kitchenham y PRISMA para revisiones en ingeniería."
      },
      "intervention": {
        "descripcion": "[Tecnología/método operacionalizado con características distintivas. Mínimo 40 palabras.]",
        "justificacion": "[Por qué esta intervención, cómo se operacionaliza, relación con ${area}. Mínimo 30 palabras.]"
      },
      "comparison": {
        "descripcion": "[Comparador específico o 'No se compara con intervención específica'. Mínimo 30 palabras.]",
        "justificacion": "[Relevancia de la comparación o justificación de ausencia. Mínimo 30 palabras.]"
      },
      "outcomes": {
        "descripcion": "[Métricas medibles y observables específicas. Mínimo 40 palabras.]",
        "justificacion": "[Por qué estos outcomes, cómo se relacionan con objetivos. Mínimo 30 palabras.]"
      }
    },
    "pregunta_contestable": "En [P - contextos/sistemas], ¿cómo influye [I] en comparación con [C] sobre los niveles de [O]?"
  },
  "fase2_matriz_es_no_es": {
    "analisis_critico": [
      {
        "pregunta": "¿Qué fenómeno/tecnología se investiga específicamente?",
        "presente": "[min. 20-30 palabras]",
        "justificacion": "[min. 30-40 palabras]"
      }
      // ... 7 elementos total
    ],
    "criterios_inclusion_es": [
      "Criterio inclusión 1 (tema/tecnología)",
      "Criterio inclusión 2 (método)",
      "Criterio inclusión 3 (outcomes)",
      "Criterio inclusión 4 (calidad fuente)",
      "Criterio inclusión 5 (rango temporal ${yearStart}-${yearEnd})",
      "Criterio inclusión 6 (tipo evidencia)",
      "Criterio inclusión 7 (idioma/acceso)"
    ],
    "criterios_exclusion_no_es": [
      "Criterio exclusión 1 (temporal)",
      "Criterio exclusión 2 (literatura gris)",
      "Criterio exclusión 3 (área no relacionada)",
      "Criterio exclusión 4 (sin evidencia empírica)",
      "Criterio exclusión 5 (sin intervención específica)",
      "Criterio exclusión 6 (sin outcomes medibles)",
      "Criterio exclusión 7 (idioma sin traducción)"
    ],
    "estructura_matriz_sintesis": [
      "Autor/Año",
      "Propósito del estudio",
      "Población/Contexto (P)",
      "Intervención aplicada (I)",
      "Comparador utilizado (C)",
      "Metodología aplicada (diseño, muestra, instrumentos)",
      "Resultados clave en Outcomes (O)",
      "Métricas cuantitativas reportadas",
      "Conclusiones principales",
      "Limitaciones del estudio"
    ]
  }
}

═══════════════════════════════════════════════════════════════
VALIDACIÓN FINAL OBLIGATORIA
═══════════════════════════════════════════════════════════════

Antes de enviar el JSON, VERIFICA:

✅ **POBLACIÓN (P) - VALIDACIÓN CRÍTICA:**
   - ❌ ¿Contiene "artículos", "estudios", "investigaciones", "publicaciones", "papers", "literatura"? → INVALIDO
   - ❌ ¿Contiene "bases de datos académicas", "journals", "conferencias"? → INVALIDO
   - ❌ ¿Contiene profesiones ("desarrolladores", "ingenieros") o personas como sujeto? → INVALIDO
   - ✅ ¿Define SISTEMA, ENTORNO o CONTEXTO TÉCNICO? (ej: "Sistemas backend", "Aplicaciones móviles")
   - ✅ ¿Especifica STACK TECNOLÓGICO? (ej: "Node.js", "MongoDB", "React")
   - ✅ ¿Incluye CONTEXTO DE APLICACIÓN? (ej: "microservicios", "APIs RESTful")
   - ✅ ¿Tiene al menos 40 palabras descriptivas del sistema técnico?
   - ✅ ¿La justificación menciona "dominio/sistema técnico, NO estudios/publicaciones"?

✅ **PREGUNTA CONTESTABLE:**
   - ¿Puede responderse con los estudios delimitados por los criterios?
   - ¿Los outcomes son medibles en estudios empíricos?
   - ¿La intervención está suficientemente operacionalizada?
   - Si PICO-C existe → ¿La pregunta incluye "en comparación con [C]"?

✅ **CRITERIOS PREPARADOS PARA EXTRACCIÓN:**
   - ¿Los criterios de inclusión permiten identificar estudios con datos extraíbles?
   - ¿La estructura de matriz de síntesis cubre todas las dimensiones PICO?
   - ¿Los outcomes están reflejados como columnas en la matriz?

✅ **COHERENCIA INTERNA:**
   - Todos los elementos de inclusión están reflejados en PICO
   - Todos los elementos de exclusión justifican límites claros
   - La pregunta contestable conecta P-I-C-O de forma lógica
   - Si C existe, aparece en título, pregunta y matriz

⚠️ **SI ALGUNA VALIDACIÓN FALLA → CORREGIR ANTES DE ENVIAR JSON**

RESPONDE ÚNICAMENTE CON EL JSON VÁLIDO. NO AGREGUES TEXTO ADICIONAL.
`.trim();
  }

  async generateWithChatGPT(prompt) {
    if (!this.openai) throw new Error('OpenAI no configurado');
    const res = await this.retry(async () => {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un experto en metodología PRISMA 2020/Cochrane para revisiones sistemáticas en Ingeniería y Tecnología. REGLAS CRÍTICAS ABSOLUTAS: (1) La POBLACIÓN en RSL de ingeniería es el SISTEMA/ENTORNO TÉCNICO donde se aplica la tecnología, NUNCA "artículos", "estudios" o "publicaciones". (2) Si PICO-C existe, el TÍTULO DEBE incluirlo con formato "I vs C: Impact on O". (3) Usa TÉRMINOS PARAGUAS en títulos (Performance, Efficiency), no métricas individuales. Respondes solo con JSON válido.' },
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

