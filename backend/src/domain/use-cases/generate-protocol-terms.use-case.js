const OpenAI = require('openai');

/**
 * Use Case: Generador de Términos del Protocolo
 * 
 * Genera términos clave y sinónimos para cada componente del protocolo PICO
 * para ayudar en la búsqueda bibliográfica.
 */
class GenerateProtocolTermsUseCase {
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  /**
   * Genera términos y sinónimos para el protocolo
   */
  async execute({ projectTitle, projectDescription, picoData, matrixData, aiProvider, specificSection, customFocus }) {
    try {
      console.log('🔍 Generando términos del protocolo...');
      console.log('📋 Proyecto:', projectTitle);
      
      if (specificSection) {
        console.log('🎯 Regenerando sección específica:', specificSection);
        console.log('💡 Enfoque personalizado:', customFocus || 'predeterminado');
      }

      const prompt = this.buildPrompt({
        projectTitle,
        projectDescription,
        picoData,
        matrixData,
        specificSection,
        customFocus
      });
      
      if (!this.openai) {
        throw new Error('OpenAI no está configurado');
      }
      
      let terms = null;
      let retryCount = 0;
      const maxRetries = 2;

      while (!terms && retryCount < maxRetries) {
        try {
          const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: retryCount === 0 ? 0.25 : 0.1, // Baja temperatura para consistencia
            max_tokens: 600
          });
          
          const text = completion.choices[0].message.content;
          console.log('📥 Respuesta raw (primeros 300 chars):', text.substring(0, 300));

          // Parsear la respuesta
          terms = this.parseResponse(text);

          // Normalizar y validar términos (3-6 por categoría)
          terms = this.normalizeTerms(terms);

        } catch (parseError) {
          retryCount++;
          console.warn(`⚠️  Intento ${retryCount} falló:`, parseError.message);
          
          if (retryCount >= maxRetries) {
            throw parseError;
          }
          
          // Reintentar con instrucción más estricta
          console.log('🔄 Reintentando con temperatura más baja...');
        }
      }

      console.log('✅ Términos generados y validados exitosamente');
      console.log('📦 Términos finales:', JSON.stringify(terms, null, 2));

      return {
        success: true,
        data: {
          technologies: terms.technologies,
          applicationDomain: terms.applicationDomain,
          thematicFocus: terms.thematicFocus,
          provider: 'chatgpt'
        }
      };

    } catch (error) {
      console.error('❌ Error generando términos:', error);
      throw new Error(`Error generando términos del protocolo: ${error.message}`);
    }
  }

  /**
   * Construye el prompt para la IA (mejorado para forzar JSON)
   */
  buildPrompt({ projectTitle, projectDescription, picoData, matrixData, specificSection, customFocus }) {
    // Limpiar y extraer información del proyecto
    const topic = (projectTitle || 'Tema no especificado').replace(/\n/g, ' ').trim();
    const description = (projectDescription || 'Sin descripción').replace(/\n/g, ' ').trim();
    
    // Extraer datos PICO
    const P = picoData?.population || 'unspecified';
    const I = picoData?.intervention || 'unspecified';
    const C = picoData?.comparison || null;
    const O = picoData?.outcome || 'unspecified';
    
    // Extraer matriz Es/No Es (limitar a 10 items cada una para no saturar)
    const isIncluded = (matrixData?.is || []).slice(0, 10);
    const isNotIncluded = (matrixData?.isNot || []).slice(0, 10);

    // Si hay sección específica y enfoque personalizado, generar prompt especializado
    if (specificSection && customFocus) {
      return this.buildSpecificSectionPrompt({
        topic,
        description,
        P, I, C, O,
        isIncluded,
        isNotIncluded,
        specificSection,
        customFocus
      });
    }

    return `
Eres un experto en revisiones sistemáticas y en generación de protocolos académicos. Tu tarea: generar TÉRMINOS clave en ESPAÑOL para el protocolo del proyecto indicado. 

RESPONDE ÚNICAMENTE con JSON válido (sin texto adicional, sin markdown, sin comentarios).

CONTEXTO DEL PROYECTO:
- Título seleccionado: ${topic}
- Descripción: ${description}
- PICO:
  • Población (P): ${P}
  • Intervención (I): ${I}
  • Comparación (C): ${C || 'ninguna'}
  • Outcome (O): ${O}
- Matriz ES (incluir en búsqueda): ${isIncluded.length ? isIncluded.join(' | ') : 'ninguno especificado'}
- Matriz NO ES (excluir de búsqueda): ${isNotIncluded.length ? isNotIncluded.join(' | ') : 'ninguno especificado'}

INSTRUCCIONES CRÍTICAS:
1. Genera 4–6 términos por cada categoría: "technologies", "applicationDomain", "thematicFocus"
2. Todos los términos en ESPAÑOL. Si es muy técnico, agrega traducción inglés entre paréntesis: "Mongoose (Mongoose)"
3. Cada término debe ser CORTO (máximo 5 palabras)
4. NO incluyas explicaciones ni descripciones largas
5. Si algún elemento PICO es 'unspecified', infiere términos relevantes desde el TÍTULO y descripción
6. Prioriza términos útiles para construir cadenas de búsqueda académicas (keywords, sinónimos)
7. Los términos deben estar DIRECTAMENTE relacionados con "${topic}"
8. Asegúrate que ningún array esté vacío (mínimo 4 términos por categoría)

CATEGORÍAS:
- technologies: Tecnologías, herramientas, frameworks, lenguajes de programación, métodos técnicos
- applicationDomain: Áreas de aplicación, contextos, dominios (educación, salud, industria, etc.)
- thematicFocus: Aspectos/focos a investigar (rendimiento, seguridad, usabilidad, escalabilidad, metodologías, etc.)

FORMATO OBLIGATORIO (salida EXACTA en JSON):
{
  "technologies": ["término 1", "término 2", "término 3", "término 4"],
  "applicationDomain": ["término 1", "término 2", "término 3", "término 4"],
  "thematicFocus": ["término 1", "término 2", "término 3", "término 4"]
}

EJEMPLO para un proyecto sobre "Mongoose ODM en Node.js":
{
  "technologies": ["Mongoose (Mongoose)", "MongoDB", "Node.js", "ODM (Object Document Mapping)"],
  "applicationDomain": ["Desarrollo backend", "Aplicaciones web", "Microservicios", "APIs RESTful"],
  "thematicFocus": ["Rendimiento", "Escalabilidad", "Buenas prácticas", "Modelado de datos"]
}

AHORA GENERA PARA: "${topic}"

RESPONDE SOLO CON EL JSON. NADA MÁS.
`.trim();
  }

  /**
   * Construye un prompt específico para regenerar una sección con enfoque personalizado
   */
  buildSpecificSectionPrompt({ topic, description, P, I, C, O, isIncluded, isNotIncluded, specificSection, customFocus }) {
    // Mapeo de secciones a nombres legibles
    const sectionNames = {
      tecnologia: 'technologies',
      dominio: 'applicationDomain',
      focosTematicos: 'thematicFocus'
    };

    const sectionDescriptions = {
      tecnologia: 'Tecnologías, herramientas, frameworks, lenguajes de programación, métodos técnicos',
      dominio: 'Áreas de aplicación, contextos, dominios (educación, salud, industria, etc.)',
      focosTematicos: 'Aspectos/focos a investigar (rendimiento, seguridad, usabilidad, escalabilidad, metodologías, etc.)'
    };

    const jsonKey = sectionNames[specificSection];
    const sectionDesc = sectionDescriptions[specificSection];

    return `
Eres un experto en revisiones sistemáticas y en generación de protocolos académicos. Tu tarea: generar TÉRMINOS clave en ESPAÑOL para UNA SECCIÓN ESPECÍFICA del protocolo.

RESPONDE ÚNICAMENTE con JSON válido (sin texto adicional, sin markdown, sin comentarios).

CONTEXTO DEL PROYECTO:
- Título: ${topic}
- Descripción: ${description}
- PICO:
  • Población (P): ${P}
  • Intervención (I): ${I}
  • Comparación (C): ${C || 'ninguna'}
  • Outcome (O): ${O}
- Matriz ES: ${isIncluded.length ? isIncluded.join(' | ') : 'ninguno'}
- Matriz NO ES: ${isNotIncluded.length ? isNotIncluded.join(' | ') : 'ninguno'}

SECCIÓN A REGENERAR: ${specificSection}
DESCRIPCIÓN: ${sectionDesc}

ENFOQUE PERSONALIZADO DEL USUARIO:
"${customFocus}"

INSTRUCCIONES CRÍTICAS:
1. Genera 4–6 términos ÚNICAMENTE para la categoría "${jsonKey}"
2. CENTRA los términos en el enfoque personalizado que el usuario indicó arriba
3. Todos los términos en ESPAÑOL. Si es técnico, agrega traducción inglés: "término (English Term)"
4. Cada término debe ser CORTO (máximo 5 palabras)
5. NO incluyas explicaciones ni descripciones
6. Los términos deben ser útiles para búsquedas académicas
7. Asegúrate que el array NO esté vacío (mínimo 4 términos)
8. Prioriza aspectos relacionados con: "${customFocus}"

FORMATO OBLIGATORIO (salida EXACTA en JSON):
{
  "technologies": ["término 1", "término 2", "término 3", "término 4"],
  "applicationDomain": ["término 1", "término 2", "término 3", "término 4"],
  "thematicFocus": ["término 1", "término 2", "término 3", "término 4"]
}

IMPORTANTE: Aunque solo estás regenerando "${jsonKey}", debes devolver las 3 categorías en el JSON. Las que NO son "${jsonKey}" puedes llenarlas con términos genéricos basados en el proyecto (se descartarán en el frontend, pero son necesarias para formato válido).

RESPONDE SOLO CON EL JSON. NADA MÁS.
`.trim();
  }

  /**
   * Parsea la respuesta de la IA con parsing robusto de JSON
   */
  parseResponse(text) {
    // 1) Buscar el primer bloque JSON en el texto
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      console.error('❌ No se encontró JSON válido en la respuesta');
      console.error('Respuesta completa:', text);
      throw new Error('No se encontró JSON en la respuesta de la IA');
    }

    let jsonStr = text.substring(firstBrace, lastBrace + 1);

    // 2) Limpiar backticks de markdown (```json o ```)
    jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```/g, '').trim();

    // 3) Reemplazar comillas "curly" si existen
    jsonStr = jsonStr
      .replace(/[\u2018\u2019]/g, "'")  // comillas simples curly
      .replace(/[\u201C\u201D]/g, '"'); // comillas dobles curly

    // 4) Intentar parsear
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (err) {
      console.error('❌ JSON inválido:', err.message);
      console.error('JSON extraído (primeros 500 chars):', jsonStr.substring(0, 500));
      
      // Intentar fallback a formato de texto
      console.warn('⚠️  Intentando parseResponseFlexible como fallback...');
      return this.parseResponseFlexible(text);
    }

    // 5) Validar estructura y limpiar arrays
    const ensureArray = (v) => {
      if (!Array.isArray(v)) return [];
      return v.map(s => String(s).trim()).filter(s => s.length > 0);
    };

    const terms = {
      technologies: ensureArray(parsed.technologies),
      applicationDomain: ensureArray(parsed.applicationDomain),
      thematicFocus: ensureArray(parsed.thematicFocus)
    };

    // 6) Si alguna categoría queda vacía, agregar placeholder
    for (const key of Object.keys(terms)) {
      if (terms[key].length === 0) {
        console.warn(`⚠️  Categoría ${key} vacía, agregando placeholder`);
        terms[key].push('No especificado');
      }
    }

    return terms;
  }

  /**
   * Parser flexible como fallback (formato de texto) - Mejorado para español
   */
  parseResponseFlexible(text) {
    const terms = {
      technologies: [],
      applicationDomain: [],
      thematicFocus: []
    };

    const lines = text.split('\n');
    let currentSection = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Detectar secciones (inglés y español)
      if (trimmed.match(/^(TECHNOLOGIES?|TECNOLOGÍAS?|TECNOLOGIES?)\s*:/i)) {
        currentSection = 'technologies';
      } else if (trimmed.match(/^(APPLICATION[_ ]DOMAIN|DOMINIO DE APLICACI[OÓ]N|DOMINIO)\s*:/i)) {
        currentSection = 'applicationDomain';
      } else if (trimmed.match(/^(THEMATIC[_ ]FOCUS|FOCOS? TEM[AÁ]TICOS?|FOCO)\s*:/i)) {
        currentSection = 'thematicFocus';
      } else if (currentSection) {
        // Detectar items: guion (-), bullet (•) o numeración (1., 2., etc.)
        const itemMatch = trimmed.match(/^[-•]\s*(.+)/) || trimmed.match(/^\d+\.\s*(.+)/);
        if (itemMatch) {
          const term = itemMatch[1].trim();
          if (term.length > 0) {
            terms[currentSection].push(term);
          }
        }
      }
    }

    return terms;
  }

  /**
   * Normaliza y valida términos (3-6 por categoría)
   */
  normalizeTerms(terms) {
    const categories = ['technologies', 'applicationDomain', 'thematicFocus'];
    
    for (const category of categories) {
      if (!Array.isArray(terms[category])) {
        terms[category] = [];
      }

      // Limpiar términos vacíos o muy cortos
      terms[category] = terms[category]
        .map(t => String(t).trim())
        .filter(t => t.length > 2);

      // Si tiene más de 6, truncar
      if (terms[category].length > 6) {
        console.warn(`⚠️  Categoría ${category} tiene ${terms[category].length} términos, truncando a 6`);
        terms[category] = terms[category].slice(0, 6);
      }

      // Si tiene menos de 3, completar con placeholder
      while (terms[category].length < 3) {
        console.warn(`⚠️  Categoría ${category} tiene solo ${terms[category].length} términos, completando...`);
        terms[category].push('No especificado');
      }
    }

    return terms;
  }
}

module.exports = GenerateProtocolTermsUseCase;

