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
   * @param {string} selectedTitle - Título de la RSL seleccionado en el paso 3
   * @param {string} projectTitle - Título del proyecto (legacy, se usa selectedTitle si está disponible)
   */
  async execute({ selectedTitle, projectTitle, projectDescription, picoData, matrixData, aiProvider, specificSection, customFocus }) {
    try {
      // REGLA METODOLÓGICA: Los términos DEBEN basarse en el título de la RSL seleccionado
      const rslTitle = selectedTitle || projectTitle;
      
      console.log('🔍 Generando términos del protocolo...');
      console.log('📋 Título RSL:', rslTitle);
      
      if (specificSection) {
        console.log('🎯 Regenerando sección específica:', specificSection);
        console.log('💡 Enfoque personalizado:', customFocus || 'predeterminado');
      }

      const prompt = this.buildPrompt({
        rslTitle,
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
  buildPrompt({ rslTitle, projectTitle, projectDescription, picoData, matrixData, specificSection, customFocus }) {
    // Usar título de la RSL seleccionado como fuente principal
    const title = (rslTitle || projectTitle || 'Tema no especificado').replace(/\n/g, ' ').trim();
    const description = (projectDescription || 'Sin descripción').replace(/\n/g, ' ').trim();
    
    // Extraer datos PICO
    const P = picoData?.population || 'unspecified';
    const I = picoData?.intervention || 'unspecified';
    const C = picoData?.comparison || null;
    const O = picoData?.outcome || 'unspecified';
    
    // Extraer matriz Es/No Es
    const isIncluded = (matrixData?.is || []).slice(0, 10);
    const isNotIncluded = (matrixData?.isNot || []).slice(0, 10);

    // Si hay sección específica y enfoque personalizado, generar prompt especializado
    if (specificSection && customFocus) {
      return this.buildSpecificSectionPrompt({
        title,
        description,
        P, I, C, O,
        isIncluded,
        isNotIncluded,
        specificSection,
        customFocus
      });
    }

    return `
Eres un experto en metodología PRISMA/Cochrane para revisiones sistemáticas de literatura. Tu tarea: generar términos clave para el protocolo DERIVADOS DIRECTAMENTE del TÍTULO de la RSL.

RESPONDE ÚNICAMENTE con JSON válido (sin texto adicional, sin markdown, sin comentarios).

═══════════════════════════════════════════════════════════════
PRINCIPIO METODOLÓGICO FUNDAMENTAL
═══════════════════════════════════════════════════════════════

⚠️ REGLA CRÍTICA: Todos los términos DEBEN derivar del TÍTULO seleccionado.
⚠️ NO introducir conceptos nuevos que no estén en el título.
⚠️ La sección "Definición de Términos" descompone técnicamente el título, no inventa conceptos.

═══════════════════════════════════════════════════════════════
TÍTULO DE LA REVISIÓN SISTEMÁTICA (FUENTE ÚNICA)
═══════════════════════════════════════════════════════════════

"${title}"

═══════════════════════════════════════════════════════════════
CONTEXTO PICO (para validación de coherencia)
═══════════════════════════════════════════════════════════════

- P (Población): ${P}
- I (Intervención): ${I}
- C (Comparación): ${C || 'ninguna'}
- O (Resultados): ${O}

Matriz ES: ${isIncluded.length ? isIncluded.join(' | ') : 'ninguno'}
Matriz NO ES: ${isNotIncluded.length ? isNotIncluded.join(' | ') : 'ninguno'}

═══════════════════════════════════════════════════════════════
REGLAS METODOLÓGICAS OBLIGATORIAS
═══════════════════════════════════════════════════════════════

🔬 TECNOLOGÍA / HERRAMIENTAS:

Regla T1: La tecnología debe ser el constructo tecnológico central DEL TÍTULO
Regla T2: Solo incluir subtipos/variantes que sean extensiones directas del término del título
Regla T3: NO incluir tecnologías periféricas que no aparecen en el título
Regla T4: Debe alinearse con "I" (Intervención) del PICO

Ejemplo correcto:
Título: "Aplicaciones del aprendizaje automático..."
✅ Tecnologías: ["Machine Learning", "Supervised Learning", "Deep Learning", "Predictive Models"]

Ejemplo INCORRECTO:
Título: "Aplicaciones del aprendizaje automático..."
❌ Tecnologías: ["Big Data", "Cloud Computing"] ← NO están en el título

🏥 DOMINIO DE APLICACIÓN:

Regla D1: El dominio debe corresponder EXACTAMENTE al contexto indicado en el título
Regla D2: NO ampliar dominios más allá del título
Regla D3: La población del título debe reflejarse explícitamente en el dominio
Regla D4: Debe alinearse con "P" (Población) del PICO

Ejemplo correcto:
Título: "...enfermedades cardiovasculares en adultos"
✅ Dominio: ["Healthcare", "Clinical Cardiology", "Cardiovascular Disease Detection", "Adult Population"]

Ejemplo INCORRECTO:
Título: "...enfermedades cardiovasculares..."
❌ Dominio: ["Chronic Diseases", "Public Health"] ← Demasiado amplio

🎯 FOCOS TEMÁTICOS:

Regla F1: Los focos NO introducen nuevos objetivos, descomponen analíticamente el fenómeno del título
Regla F2: Cada foco responde a una pregunta implícita del título
Regla F3: Deben anticipar los resultados esperados (O del PICO)
Regla F4: Entre 3-5 focos (ideal: 4)

Ejemplo correcto:
Título: "...detección temprana de enfermedades cardiovasculares..."
✅ Focos: ["Diagnostic Accuracy", "Model Performance", "Implementation Challenges", "Clinical Decision Support"]
← Todos derivan de "detección temprana"

Ejemplo INCORRECTO:
Título: "...detección temprana..."
❌ Focos: ["Cost Analysis", "Policy Impact"] ← NO están en el alcance del título

═══════════════════════════════════════════════════════════════
VALIDACIÓN DE COHERENCIA CRUZADA (AUTOMÁTICA)
═══════════════════════════════════════════════════════════════

Antes de generar, verifica:
✓ ¿Cada término de "technologies" está en el TÍTULO o es subtipo directo?
✓ ¿El "applicationDomain" refleja el contexto poblacional DEL TÍTULO?
✓ ¿Los "thematicFocus" responden a preguntas implícitas DEL TÍTULO?
✓ ¿Hay coherencia: technologies ↔ I(PICO), applicationDomain ↔ P(PICO), thematicFocus ↔ O(PICO)?

═══════════════════════════════════════════════════════════════
FORMATO DE SALIDA (JSON ESTRICTO)
═══════════════════════════════════════════════════════════════

{
  "technologies": [
    "Término 1",
    "Término 2",
    "Término 3",
    "Término 4"
  ],
  "applicationDomain": [
    "Término 1",
    "Término 2",
    "Término 3",
    "Término 4"
  ],
  "thematicFocus": [
    "Término 1",
    "Término 2",
    "Término 3",
    "Término 4"
  ]
}

CARACTERÍSTICAS DE LOS TÉRMINOS:
- En ESPAÑOL (agregar inglés entre paréntesis si es técnico)
- Máximo 5 palabras por término
- Mínimo 4 términos por categoría
- Sin explicaciones adicionales
- Útiles para búsqueda académica (keywords)

═══════════════════════════════════════════════════════════════
EJEMPLO COMPLETO (METODOLÓGICAMENTE CORRECTO)
═══════════════════════════════════════════════════════════════

Título: "Aplicaciones del aprendizaje automático en la detección temprana de enfermedades cardiovasculares en adultos"

{
  "technologies": [
    "Machine Learning",
    "Supervised Learning",
    "Deep Learning",
    "Predictive Models"
  ],
  "applicationDomain": [
    "Healthcare",
    "Clinical Cardiology",
    "Cardiovascular Disease Detection",
    "Adult Population"
  ],
  "thematicFocus": [
    "Diagnostic Accuracy",
    "Model Performance",
    "Implementation Challenges",
    "Clinical Decision Support"
  ]
}

Análisis de coherencia:
✓ technologies → "aprendizaje automático" del título
✓ applicationDomain → "enfermedades cardiovasculares en adultos" del título
✓ thematicFocus → "detección temprana" del título

═══════════════════════════════════════════════════════════════
AHORA GENERA PARA EL TÍTULO:
═══════════════════════════════════════════════════════════════

"${title}"

INSTRUCCIÓN FINAL: Analiza el título palabra por palabra. Identifica:
1. ¿Qué tecnología/método central menciona? → technologies
2. ¿Qué población/contexto/dominio menciona? → applicationDomain
3. ¿Qué aspecto/resultado/enfoque busca? → thematicFocus

RESPONDE SOLO CON EL JSON. NADA MÁS.
`.trim();
  }

  /**
   * Construye un prompt específico para regenerar una sección con enfoque personalizado
   */
  buildSpecificSectionPrompt({ title, description, P, I, C, O, isIncluded, isNotIncluded, specificSection, customFocus }) {
    // Mapeo de secciones a nombres legibles
    const sectionNames = {
      tecnologia: 'technologies',
      dominio: 'applicationDomain',
      focosTematicos: 'thematicFocus'
    };

    const jsonKey = sectionNames[specificSection] || specificSection;

    return `
Eres un experto en metodología PRISMA para revisiones sistemáticas. Tu tarea: regenerar ÚNICAMENTE la sección "${jsonKey}" con enfoque personalizado.

RESPONDE ÚNICAMENTE con JSON válido (sin texto adicional, sin markdown, sin comentarios).

═══════════════════════════════════════════════════════════════
TÍTULO DE LA RSL (FUENTE ÚNICA)
═══════════════════════════════════════════════════════════════

"${title}"

CONTEXTO PICO:
- P (Población): ${P}
- I (Intervención): ${I}  
- C (Comparación): ${C || 'ninguna'}
- O (Resultados): ${O}

Matriz ES: ${isIncluded.join(' | ')}
Matriz NO ES: ${isNotIncluded.join(' | ')}

═══════════════════════════════════════════════════════════════
ENFOQUE PERSONALIZADO DEL USUARIO
═══════════════════════════════════════════════════════════════

${customFocus}

═══════════════════════════════════════════════════════════════
REGLAS PARA LA SECCIÓN "${jsonKey}"
═══════════════════════════════════════════════════════════════

${jsonKey === 'technologies' ? `
🔬 TECNOLOGÍA:
- DEBE derivar del concepto técnico central DEL TÍTULO
- Solo incluir variantes/subtipos que sean extensiones directas
- NO introducir tecnologías no mencionadas en el título
- Debe alinear con "I" (Intervención) del PICO
- 4-6 términos técnicos útiles para búsqueda académica
` : ''}

${jsonKey === 'applicationDomain' ? `
🏥 DOMINIO:
- DEBE corresponder al contexto/población del TÍTULO
- NO ampliar más allá del alcance del título
- Reflejar población explícita del título
- Debe alinear con "P" (Población) del PICO
- 4-6 términos de dominio/contexto
` : ''}

${jsonKey === 'thematicFocus' ? `
🎯 FOCOS TEMÁTICOS:
- DEBEN descomponer analíticamente el fenómeno del TÍTULO
- Cada foco responde a pregunta implícita del título
- NO introducir objetivos nuevos no presentes en título
- Debe alinear con "O" (Resultados) del PICO
- 3-5 focos analíticos distinguibles
` : ''}

FORMATO DE SALIDA (JSON ESTRICTO):
{
  "technologies": ["término 1", "término 2", "término 3", "término 4"],
  "applicationDomain": ["término 1", "término 2", "término 3", "término 4"],
  "thematicFocus": ["término 1", "término 2", "término 3", "término 4"]
}

IMPORTANTE: Aunque solo estás regenerando "${jsonKey}", debes devolver las 3 categorías. Las otras 2 categorías puedes llenarlas con términos genéricos (se descartarán en frontend).

CARACTERÍSTICAS:
- En ESPAÑOL (inglés entre paréntesis si es muy técnico)
- Máximo 5 palabras por término
- Mínimo 4 términos
- Sin explicaciones adicionales
- Aplicar enfoque personalizado: ${customFocus}

AHORA GENERA "${jsonKey}" PARA: "${title}"

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

