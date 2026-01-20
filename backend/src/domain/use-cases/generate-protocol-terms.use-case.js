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
            temperature: 0.4, // Equilibrio entre creatividad y consistencia
            max_tokens: 800
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
Regla T2: GENERAR 4-5 términos: el término principal + subtipos/variantes técnicas relacionadas
Regla T3: Las variantes deben ser extensiones directas o sinónimos técnicos del término del título
Regla T4: NO incluir tecnologías periféricas que no aparecen en el título
Regla T5: Debe alinearse con "I" (Intervención) del PICO
Regla T6: OBLIGATORIO: Siempre generar al menos 4 términos si el título lo permite

Ejemplo correcto:
Título: "Machine Learning Applications..."
✅ Tecnologías (4 términos): 
  "Aprendizaje Automático - Machine Learning"
  "Inteligencia Artificial - Artificial Intelligence"
  "Aprendizaje Profundo - Deep Learning"
  "Redes Neuronales - Neural Networks"

Título: "Aplicaciones de blockchain..."
✅ Tecnologías (4 términos):
  "Blockchain"
  "Contratos Inteligentes - Smart Contracts"
  "Tecnología de Registro Distribuido - Distributed Ledger Technology"
  "Criptografía - Cryptography"

Ejemplo INCORRECTO:
Título: "Machine Learning Applications..."
❌ Tecnologías: ["Aprendizaje Automático - Machine Learning"] ← ERROR: Solo 1 término, debe generar 4-5
❌ Tecnologías: ["Big Data", "Cloud Computing"] ← ERROR: NO están en el título

🏥 DOMINIO DE APLICACIÓN:

Regla D1: El dominio debe corresponder EXACTAMENTE al contexto indicado en el título
Regla D2: GENERAR 3-4 términos relacionados con el sector/industria/contexto del título
Regla D3: Incluir el dominio principal + subdominios o contextos técnicos relacionados
Regla D4: La población del título debe reflejarse explícitamente en el dominio
Regla D5: Debe alinearse con "P" (Población) del PICO
Regla D6: OBLIGATORIO: Generar al menos 3 términos del contexto del título

⚠️ REGLA D5 CRÍTICA - SEPARACIÓN DOMINIO vs VARIABLE:

El dominio responde a "¿DÓNDE?" → Sector, industria, entorno técnico, población
La variable (thematicFocus) responde a "¿QUÉ se mide?" → Eficiencia, calidad, impacto, rendimiento

╔═══════════════════════════════════════════════════════════════╗
║  ❌ NO INCLUIR EN applicationDomain (van en thematicFocus):  ║
║  • Eficiencia / Efficiency                                    ║
║  • Productividad / Productivity                               ║
║  • Rendimiento / Performance                                  ║
║  • Calidad / Quality                                          ║
║  • Impacto / Impact                                           ║
║  • Mejora / Improvement                                       ║
║  • Automatización / Automation                                ║
║  Estos son RESULTADOS/VARIABLES, NO dominios                  ║
╚═══════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════╗
║  ✅ SÍ INCLUIR EN applicationDomain:                          ║
║  • Sectores: Healthcare, Education, Finance                   ║
║  • Industrias: Manufacturing, Retail, Logistics               ║
║  • Entornos técnicos: Web Development, Mobile Apps, Cloud     ║
║  • Contextos: Enterprise Systems, Small Business, Startups    ║
║  • Poblaciones: Adult Patients, University Students, SMEs     ║
╚═══════════════════════════════════════════════════════════════╝

Ejemplo 1 - Título: "Impact of Machine Learning on Web Development Efficiency in Business Contexts"
✅ CORRECTO applicationDomain (4 términos):
  "Desarrollo Web - Web Development"
  "Contextos Empresariales - Business Contexts"
  "Ingeniería de Software - Software Engineering"
  "Sistemas Empresariales - Enterprise Systems"

❌ INCORRECTO (mezcla con variables):
  "Eficiencia en Desarrollo - Development Efficiency" ← NO, esto va en thematicFocus
  ["Desarrollo Web"] ← ERROR: Solo 1 término, debe generar 3-4

Ejemplo 2 - Título: "Early Detection of Cardiovascular Diseases in Adults Using ML"
✅ CORRECTO applicationDomain (4 términos):
  "Atención Médica - Healthcare"
  "Cardiología Clínica - Clinical Cardiology"
  "Población Adulta - Adult Population"
  "Medicina Diagnóstica - Diagnostic Medicine"

❌ INCORRECTO:
  "Detección Temprana - Early Detection" ← NO, esto va en thematicFocus
  ["Healthcare", "Adult Population"] ← ERROR: Solo 2 términos, faltan contextos relacionados

Ejemplo 3 - Título: "Productivity Improvement in Mobile Development with CI/CD"
✅ CORRECTO applicationDomain (4 términos):
  "Desarrollo Móvil - Mobile Development"
  "Ingeniería de Software - Software Engineering"
  "Desarrollo de Aplicaciones - Application Development"
  "Sistemas de Software - Software Systems"

❌ INCORRECTO:
  "Productividad - Productivity" ← NO, va en thematicFocus
  ["Mobile Development"] ← ERROR: Solo 1 término, debe generar 3-4

📌 REGLA DE ORO:
Si el término termina en "-dad" (eficiencia, productividad, calidad, usabilidad) → NO es dominio
Si el término describe un resultado/outcome/métrica → NO es dominio
Si el término responde "¿dónde?" → SÍ es dominio
Si el término responde "¿qué se mide?" → NO es dominio (va en thematicFocus)

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
    "Aprendizaje Automático - Machine Learning",
    "Aprendizaje Profundo - Deep Learning",
    "Inteligencia Artificial - Artificial Intelligence"
  ],
  "applicationDomain": [
    "Desarrollo Web - Web Development",
    "Ingeniería de Software - Software Engineering",
    "Sistemas Empresariales - Enterprise Systems"
  ],
  "thematicFocus": [
    "Eficiencia en Desarrollo - Development Efficiency",
    "Mejora de Productividad - Productivity Improvement",
    "Automatización de Procesos - Process Automation"
  ]
}

CARACTERÍSTICAS DE LOS TÉRMINOS:
- Formato BILINGÜE en una sola línea: "Español - English"
- Español primero, luego inglés separado por " - "
- Máximo 5 palabras por idioma
- Entre 3-5 términos por categoría (NO rellenar artificialmente)
- Términos traducibles a bases académicas (Scopus/WoS/IEEE)
- Sin explicaciones adicionales, solo el JSON

═══════════════════════════════════════════════════════════════
EJEMPLO COMPLETO (METODOLÓGICAMENTE CORRECTO)
═══════════════════════════════════════════════════════════════

Título: "Machine Learning Applications for Early Detection of Cardiovascular Diseases in Adults"

{
  "technologies": [
    "Aprendizaje Automático - Machine Learning",
    "Aprendizaje Supervisado - Supervised Learning",
    "Aprendizaje Profundo - Deep Learning",
    "Modelos Predictivos - Predictive Models"
  ],
  "applicationDomain": [
    "Atención Médica - Healthcare",
    "Cardiología Clínica - Clinical Cardiology",
    "Detección de Enfermedades Cardiovasculares - Cardiovascular Disease Detection",
    "Población Adulta - Adult Population"
  ],
  "thematicFocus": [
    "Precisión Diagnóstica - Diagnostic Accuracy",
    "Rendimiento de Modelos - Model Performance",
    "Desafíos de Implementación - Implementation Challenges",
    "Apoyo a Decisiones Clínicas - Clinical Decision Support"
  ]
}

Análisis de coherencia:
✓ technologies → "Machine Learning" del título (términos buscables en Scopus)
✓ applicationDomain → "Cardiovascular Diseases in Adults" del título (CONTEXTO, no variables)
✓ thematicFocus → "Early Detection" del título (VARIABLES a medir, no dominios)

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
- GENERAR 4-5 términos: término principal + variantes/subtipos directos
- Solo incluir variantes/subtipos que sean extensiones directas o sinónimos técnicos
- NO introducir tecnologías no mencionadas en el título
- Debe alinear con "I" (Intervención) del PICO
- OBLIGATORIO: Mínimo 4 términos técnicos útiles para búsqueda académica

Ejemplo: "Machine Learning Applications..." → Genera:
  "Aprendizaje Automático - Machine Learning"
  "Inteligencia Artificial - Artificial Intelligence"
  "Aprendizaje Profundo - Deep Learning"
  "Redes Neuronales - Neural Networks"
` : ''}

${jsonKey === 'applicationDomain' ? `
🏥 DOMINIO DE APLICACIÓN:

⚠️ REGLA CRÍTICA - NO MEZCLAR CON VARIABLES:

El dominio responde a "¿DÓNDE?" (sector, contexto, industria, población)
Las variables responden a "¿QUÉ se mide?" (eficiencia, calidad, impacto)

❌ NO incluir en applicationDomain:
• Eficiencia / Efficiency
• Productividad / Productivity  
• Rendimiento / Performance
• Calidad / Quality
• Impacto / Impact
• Mejora / Improvement
• Automatización / Automation
→ Estos son VARIABLES, van en thematicFocus

✅ SÍ incluir en applicationDomain:
• Sectores: Healthcare, Education, Finance
• Industrias: Manufacturing, Retail, Logistics
• Entornos técnicos: Web Development, Mobile Apps, Cloud Computing
• Contextos: Enterprise Systems, Small Business, Startups
• Poblaciones: Adult Patients, University Students, SMEs

Ejemplo del título actual "${title}":
Identifica SOLO el contexto/sector/entorno DONDE se aplica.
Ignora las variables de resultado/impacto (esas van en thematicFocus).

Reglas:
- DEBE corresponder al contexto/población del TÍTULO
- GENERAR 3-4 términos: dominio principal + subdominios/contextos técnicos relacionados
- NO ampliar más allá del alcance del título
- Debe alinear con "P" (Población) del PICO
- OBLIGATORIO: Mínimo 3 términos de dominio/contexto (NO variables)

Ejemplo: "...in Web Development for Technology Firms..." → Genera:
  "Desarrollo Web - Web Development"
  "Empresas Tecnológicas - Technology Firms"
  "Ingeniería de Software - Software Engineering"
  "Sistemas Empresariales - Enterprise Systems"


📌 REGLA DE ORO: Si el término termina en "-dad" o describe un resultado → NO es dominio
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
  "technologies": ["Term 1", "Term 2", "Term 3"],
  "applicationDomain": ["Term 1", "Term 2", "Term 3"],
  "thematicFocus": ["Term 1", "Term 2", "Term 3"]
}

IMPORTANTE: Aunque solo estás regenerando "${jsonKey}", debes devolver las 3 categorías. Las otras 2 categorías puedes llenarlas con términos genéricos (se descartarán en frontend).

CARACTERÍSTICAS:
- Formato BILINGÜE en una sola línea: "Español - English"
- Español primero, luego inglés separado por " - "
- Máximo 5 palabras por idioma
- Entre 3-5 términos (NO rellenar si no son válidos académicamente)
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
      return v
        .map(item => String(item).trim())
        .filter(item => item.length > 2);
    };

    const terms = {
      technologies: ensureArray(parsed.technologies),
      applicationDomain: ensureArray(parsed.applicationDomain),
      thematicFocus: ensureArray(parsed.thematicFocus)
    };

    // 6) REGLA METODOLÓGICA: NO rellenar con 'No especificado'
    // Si una categoría queda vacía, es responsabilidad del investigador definir términos manualmente
    for (const key of Object.keys(terms)) {
      if (terms[key].length === 0) {
        console.warn(`⚠️  Categoría ${key} vacía - El investigador debe definir términos manualmente`);
      }
    }

    return terms;
  }

  /**
   * Parser flexible como fallback (formato de texto) - Mejorado para español y formato bilingüe
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

      // Limpiar términos inválidos
      terms[category] = terms[category]
        .map(t => String(t).trim())
        .filter(t => t.length > 2);

      // Si tiene más de 6, truncar (límite metodológico)
      if (terms[category].length > 6) {
        console.warn(`⚠️  Categoría ${category} tiene ${terms[category].length} términos, truncando a 6`);
        terms[category] = terms[category].slice(0, 6);
      }

      // REGLA METODOLÓGICA: NO completar artificialmente
      // Si la IA no generó suficientes términos válidos, el investigador debe agregarlos manualmente
      if (terms[category].length < 3) {
        console.warn(`⚠️  Categoría ${category} tiene solo ${terms[category].length} términos válidos`);
        console.warn(`    El investigador debe revisar y agregar términos manualmente si es necesario`);
      }
    }

    return terms;
  }
}

module.exports = GenerateProtocolTermsUseCase;

