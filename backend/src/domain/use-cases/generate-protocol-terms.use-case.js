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
      
      console.log('Generando términos del protocolo...');
      console.log('Título RSL:', rslTitle);
      
      if (specificSection) {
        console.log('Regenerando sección específica:', specificSection);
        console.log('Enfoque personalizado:', customFocus || 'predeterminado');
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
          console.log('Respuesta raw (primeros 300 chars):', text.substring(0, 300));

          // Parsear la respuesta
          terms = this.parseResponse(text);

          // Normalizar y validar términos (3-6 por categoría)
          terms = this.normalizeTerms(terms);

        } catch (parseError) {
          retryCount++;
          console.warn(`Intento ${retryCount} falló:`, parseError.message);
          
          if (retryCount >= maxRetries) {
            throw parseError;
          }
          
          // Reintentar con instrucción más estricta
          console.log('Reintentando con temperatura más baja...');
        }
      }

      console.log('Términos generados y validados exitosamente');
      console.log('Términos finales:', JSON.stringify(terms, null, 2));

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
      console.error('Error generando términos:', error);
      throw new Error(`Error generando términos del protocolo: ${error.message}`);
    }
  }

  /**
   * Construye el prompt para la IA (refinado para sincronización PICO y Matriz de Síntesis)
   */
  buildPrompt({ rslTitle, projectTitle, projectDescription, picoData, matrixData, specificSection, customFocus }) {
    // Usar título de la RSL seleccionado como fuente principal
    const title = (rslTitle || projectTitle || 'Tema no especificado').replace(/\n/g, ' ').trim();
    const description = (projectDescription || 'Sin descripción').replace(/\n/g, ' ').trim();
    
    // Extraer datos PICO para sincronización
    const P = picoData?.population?.descripcion || picoData?.population || 'No definida';
    const I = picoData?.intervention?.descripcion || picoData?.intervention || 'No definida';
    const C = picoData?.comparison?.descripcion || picoData?.comparison || 'No definida';
    const O = picoData?.outcomes?.descripcion || picoData?.outcomes || 'No definida';
    
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
Eres un experto en Bibliometría y Revisiones Sistemáticas (RSL) bajo estándares PRISMA 2020. 
Tu objetivo es descomponer el TÍTULO seleccionado en términos de búsqueda técnicos y bilingües que permitan:
1. Construir cadenas de búsqueda con operadores booleanos
2. Alimentar la futura Matriz de Síntesis (Autor, Metodología, Resultados)
3. Garantizar coherencia absoluta con el marco PICO definido

RESPONDE ÚNICAMENTE con JSON válido (sin texto adicional, sin markdown, sin comentarios).

═══════════════════════════════════════════════════════════════
CONTEXTO DEL PROTOCOLO (Sincronización PICO)
═══════════════════════════════════════════════════════════════

TÍTULO RSL (FUENTE ÚNICA): "${title}"

OBJETIVO: Responder a una "pregunta contestable" sobre cómo [I] afecta a [O] en el contexto de [P].

DEFINICIÓN PICO ACTUAL (Ya establecida en paso anterior):
- **P (Población/Contexto)**: ${P}
  → Orienta el "applicationDomain" (¿DÓNDE se investiga?)

- **I (Intervención/Tecnología)**: ${I}
  → Orienta las "technologies" (¿QUÉ tecnología/método se aplica?)

- **C (Comparación)**: ${C}
  → Contexto adicional si existe comparación explícita

- **O (Resultado/Variable)**: ${O}
  → Orienta el "thematicFocus" (¿QUÉ se mide/evalúa?)

Matriz ES (Inclusión): ${isIncluded.length ? isIncluded.join(' | ') : 'No definida'}
Matriz NO ES (Exclusión): ${isNotIncluded.length ? isNotIncluded.join(' | ') : 'No definida'}

═══════════════════════════════════════════════════════════════
REGLAS METODOLÓGICAS PARA GENERACIÓN DE TÉRMINOS
═══════════════════════════════════════════════════════════════

PRINCIPIO FUNDAMENTAL: Todos los términos DEBEN:
1. Derivar del TÍTULO seleccionado (no inventar conceptos nuevos)
2. Ser consistentes con el marco PICO definido
3. Ser buscables en bases académicas (Scopus, IEEE Xplore, WoS, ACM)
4. Permitir llenar columnas de la Matriz de Síntesis

**1. TECNOLOGÍAS (Sincronizado con I - Intervención):**

**Objetivo:** Identificar la solución técnica central y sus variantes para construir el string de búsqueda.

**Reglas obligatorias:**
- Debe derivar del componente [I] del PICO: "${I}"
- Generar 4-5 términos: término principal + variantes/subtipos técnicos
- Las variantes deben ser extensiones directas o sinónimos académicos
- NO incluir tecnologías periféricas no mencionadas en título/PICO
- Los términos deben permitir usar operadores booleanos (AND, OR)

**Formato para búsqueda:**
- Cada término debe ser buscable como: ("Term 1" OR "Term 2" OR "Term 3")
- Ejemplo: ("Machine Learning" OR "Deep Learning" OR "Neural Networks")

**Ejemplo correcto:**
Título: "Machine Learning Applications..."
PICO-I: "Algoritmos de aprendizaje automático..."
Technologies (4-5 términos):
  "Aprendizaje Automático - Machine Learning"
  "Aprendizaje Profundo - Deep Learning"
  "Redes Neuronales - Neural Networks"
  "Inteligencia Artificial - Artificial Intelligence"

**Ejemplo INCORRECTO:**
Solo 1 término: ["Machine Learning"] → Debe generar 4-5 variantes
Tecnologías no relacionadas: ["Big Data", "Cloud Computing"] → No están en título/PICO-I

**2. DOMINIO DE APLICACIÓN (Sincronizado con P - Población):**

**Objetivo:** Definir el contexto/entorno donde se aplica la tecnología, filtrar ruido en búsqueda.

**Reglas obligatorias:**
- Debe derivar del componente [P] del PICO: "${P}"
- Generar 3-4 términos: dominio principal + subdominios/contextos técnicos
- Responde a: "¿En qué entorno/sistema/sector se aplica?"
- NO incluir variables de resultado (eficiencia, calidad, impacto)

**REGLA DE ORO - SEPARACIÓN CRÍTICA:**

╔═══════════════════════════════════════════════════════════════╗
║  NO INCLUIR EN applicationDomain (son VARIABLES):            ║
║  • Eficiencia / Efficiency                                    ║
║  • Productividad / Productivity                               ║
║  • Rendimiento / Performance                                  ║
║  • Calidad / Quality                                          ║
║  • Impacto / Impact                                           ║
║  • Mejora / Improvement                                       ║
║  → Estos son RESULTADOS medibles, van en thematicFocus        ║
╚═══════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════╗
║  SÍ INCLUIR EN applicationDomain:                            ║
║  • Sectores: Healthcare, Education, Finance, Manufacturing    ║
║  • Industrias: Retail, Logistics, Energy, Agriculture         ║
║  • Entornos técnicos: Web Development, Mobile Apps, Cloud     ║
║  • Sistemas: Enterprise Systems, Embedded Systems, IoT        ║
║  • Contextos: Small Business, Startups, Academic Research     ║
╚═══════════════════════════════════════════════════════════════╝

**Prueba de validación:**
- Si el término termina en "-dad" o "-ity" → NO es dominio
- Si responde "¿Dónde/En qué contexto?" → SÍ es dominio
- Si responde "¿Qué se mide?" → NO es dominio (va en thematicFocus)

**Ejemplo correcto:**
Título: "ML in Web Development for Enterprise Systems"
PICO-P: "Estudios sobre desarrollo de software empresarial..."
ApplicationDomain (3-4 términos):
  "Desarrollo Web - Web Development"
  "Sistemas Empresariales - Enterprise Systems"
  "Ingeniería de Software - Software Engineering"
  "Aplicaciones Corporativas - Corporate Applications"

**Ejemplo INCORRECTO:**
"Eficiencia en Desarrollo" → Es VARIABLE (thematicFocus)
Solo 1 término: ["Web Development"] → Debe generar 3-4

**3. FOCOS TEMÁTICOS (Sincronizado con O - Outcomes):**

**Objetivo:** Definir las VARIABLES/RESULTADOS que se extraerán para llenar la Matriz de Síntesis.

**Reglas obligatorias:**
- Debe derivar del componente [ O] del PICO: "${O}"
- **OBLIGATORIO: Generar SIEMPRE 3-5 focos** que respondan: "¿Qué se mide/evalúa?"
- Son las COLUMNAS de la futura Matriz de Síntesis
- Deben permitir comparar hallazgos entre autores
- Si PICO-O no es claro, inferir del título qué aspectos son evaluables (eficiencia, calidad, rendimiento, usabilidad, impacto, etc.)

**¿Qué incluir en thematicFocus?**
- Métricas de RENDIMIENTO: Eficiencia, Velocidad, Throughput, Latencia
- Métricas de CALIDAD: Precisión, Exactitud, Confiabilidad, Robustez
- Aspectos de USABILIDAD: Facilidad de uso, Experiencia de usuario, Curva de aprendizaje
- Factores de ADOPCIÓN: Viabilidad, Costos, Escalabilidad, Mantenibilidad
- IMPACTO: Productividad, Satisfacción, Mejoras medibles, ROI
- DESAFÍOS: Limitaciones identificadas, Barreras de implementación

**Conexión con Matriz de Síntesis:**
Los términos aquí se convertirán en columnas como:
- "Autor/Año"
- "Metodología aplicada"
- "[Foco 1]: Precisión Diagnóstica"
- "[Foco 2]: Rendimiento del Modelo"
- "[Foco 3]: Desafíos de Implementación"

**Ejemplo correcto 1:**
Título: "Early Detection of Cardiovascular Diseases using ML"
PICO-O: "Precisión diagnóstica, rendimiento de modelos, viabilidad clínica"
ThematicFocus (4 términos):
  "Precisión Diagnóstica - Diagnostic Accuracy"
  "Rendimiento de Modelos - Model Performance"
  "Viabilidad Clínica - Clinical Feasibility"
  "Interpretabilidad de Resultados - Results Interpretability"

**Ejemplo correcto 2:**
Título: "Machine Learning for Web Development"
PICO-O: "Mejoras en productividad, calidad del código"
ThematicFocus (4 términos) - INFERIDOS del contexto de desarrollo:
  "Productividad del Desarrollador - Developer Productivity"
  "Calidad del Código - Code Quality"
  "Eficiencia del Desarrollo - Development Efficiency"
  "Mantenibilidad del Software - Software Maintainability"

**Ejemplo INCORRECTO:**
"Desarrollo de Software" → Es DOMINIO (applicationDomain)
Términos no medibles: "Impacto general", "Avances recientes"
**Array vacío [] → NUNCA dejar vacío, siempre inferir 3-5 términos**

═══════════════════════════════════════════════════════════════
VALIDACIÓN DE COHERENCIA CRUZADA (AUTOMÁTICA)
═══════════════════════════════════════════════════════════════

Antes de generar, verifica:
✓ ¿Cada término de "technologies" está alineado con PICO-I: "${I}"?
✓ ¿El "applicationDomain" refleja el contexto de PICO-P: "${P}"?
✓ ¿Los "thematicFocus" son medibles y derivan de PICO-O: "${O}"?
✓ ¿Los términos son buscables con operadores booleanos en bases académicas?
✓ ¿Los focos temáticos permiten llenar columnas de una Matriz de Síntesis?

═══════════════════════════════════════════════════════════════
FORMATO DE SALIDA (JSON ESTRICTO)
═══════════════════════════════════════════════════════════════

Debes entregar un JSON con términos bilingües "Español - English" listos para ser usados en cadenas de búsqueda (Strings) con operadores Booleanos.

{
  "technologies": [
    "Término 1 ES - Term 1 EN",
    "Término 2 ES - Term 2 EN",
    "Término 3 ES - Term 3 EN",
    "Término 4 ES - Term 4 EN"
  ],
  "applicationDomain": [
    "Dominio 1 ES - Domain 1 EN",
    "Dominio 2 ES - Domain 2 EN",
    "Dominio 3 ES - Domain 3 EN"
  ],
  "thematicFocus": [
    "Foco 1 ES - Focus 1 EN",
    "Foco 2 ES - Focus 2 EN",
    "Foco 3 ES - Focus 3 EN",
    "Foco 4 ES - Focus 4 EN"
  ]
}

**CARACTERÍSTICAS DE LOS TÉRMINOS:**
- Formato BILINGÜE en una sola línea: "Español - English"
- Español primero, luego inglés separado por " - "
- Máximo 5 palabras por idioma
- Entre 3-5 términos por categoría (NO rellenar artificialmente)
- Términos buscables en bases académicas (uso de comillas en búsqueda)
- Sin explicaciones adicionales, solo el JSON

═══════════════════════════════════════════════════════════════
EJEMPLO COMPLETO (METODOLÓGICAMENTE CORRECTO)
═══════════════════════════════════════════════════════════════

**Caso: Título** "Machine Learning for Early Detection of Cardiovascular Diseases in Adults"

**PICO del paso anterior:**
- P: "Estudios empíricos sobre detección de enfermedades cardiovasculares en población adulta"
- I: "Algoritmos de aprendizaje automático (redes neuronales, modelos predictivos)"
- C: "Métodos diagnósticos tradicionales"
- O: "Precisión diagnóstica, sensibilidad, especificidad, tiempo de detección"

**JSON GENERADO:**
{
  "technologies": [
    "Aprendizaje Automático - Machine Learning",
    "Aprendizaje Supervisado - Supervised Learning",
    "Redes Neuronales - Neural Networks",
    "Modelos Predictivos - Predictive Models"
  ],
  "applicationDomain": [
    "Diagnóstico Cardiovascular - Cardiovascular Diagnosis",
    "Cardiología Clínica - Clinical Cardiology",
    "Población Adulta - Adult Population",
    "Medicina Diagnóstica - Diagnostic Medicine"
  ],
  "thematicFocus": [
    "Precisión Diagnóstica - Diagnostic Accuracy",
    "Sensibilidad del Modelo - Model Sensitivity",
    "Especificidad del Modelo - Model Specificity",
    "Tiempo de Detección - Detection Time"
  ]
}

**Análisis de coherencia:**
✓ technologies → Alineado con PICO-I "algoritmos de aprendizaje automático"
✓ applicationDomain → Alineado con PICO-P "detección cardiovascular en adultos" (NO incluye "precisión" que es variable)
✓ thematicFocus → Alineado con PICO-O "precisión, sensibilidad, especificidad, tiempo" (métricas medibles)
✓ Todos buscables con: ("Machine Learning" OR "Neural Networks") AND ("Cardiovascular" OR "Cardiology") AND ("Diagnostic Accuracy" OR "Sensitivity")

═══════════════════════════════════════════════════════════════
AHORA GENERA TÉRMINOS PARA:
═══════════════════════════════════════════════════════════════

**TÍTULO:** "${title}"

**PICO DEFINIDO:**
- P: ${P}
- I: ${I}
- C: ${C}
- O: ${O}

**INSTRUCCIÓN FINAL:** 
Analiza el TÍTULO y el PICO. Genera términos que:
1. Sean consistentes con cada componente PICO
2. Permitan construir búsquedas booleanas efectivas
3. Faciliten llenar una Matriz de Síntesis (Autor, Método, Resultados)

**⚠️ REGLA CRÍTICA PARA thematicFocus:**
- **NUNCA dejes el array thematicFocus vacío []**
- **OBLIGATORIO: Genera 3-5 términos SIEMPRE**
- Si PICO-O es vago, infiere del TÍTULO qué aspectos son medibles:
  * Tecnologías → mide su "Rendimiento", "Eficiencia", "Precisión"
  * Metodologías → mide su "Efectividad", "Aplicabilidad", "Desafíos"
  * Procesos → mide su "Productividad", "Calidad", "Costos"

**REGLAS FINALES:**
- NO inventes conceptos fuera del alcance del título "${title}"
- Máximo 5 palabras por término
- **technologies**: 4-5 términos
- **applicationDomain**: 3-4 términos
- **thematicFocus**: 3-5 términos (OBLIGATORIO, nunca vacío)
- Solo JSON. Sin explicaciones.

**FORMATO JSON REQUERIDO (verifica que thematicFocus NO esté vacío):**
{
  "technologies": ["Término 1", "Término 2", "Término 3", "Término 4"],
  "applicationDomain": ["Dominio 1", "Dominio 2", "Dominio 3"],
  "thematicFocus": ["Foco 1", "Foco 2", "Foco 3", "Foco 4"]
}

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
TECNOLOGÍA:
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
DOMINIO DE APLICACIÓN:

REGLA CRÍTICA - NO MEZCLAR CON VARIABLES:

El dominio responde a "¿DÓNDE?" (sector, contexto, industria, población)
Las variables responden a "¿QUÉ se mide?" (eficiencia, calidad, impacto)

NO incluir en applicationDomain:
• Eficiencia / Efficiency
• Productividad / Productivity  
• Rendimiento / Performance
• Calidad / Quality
• Impacto / Impact
• Mejora / Improvement
• Automatización / Automation
→ Estos son VARIABLES, van en thematicFocus

SÍ incluir en applicationDomain:
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


REGLA DE ORO: Si el término termina en "-dad" o describe un resultado → NO es dominio
` : ''}

${jsonKey === 'thematicFocus' ? `
FOCOS TEMÁTICOS:
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
      console.error('No se encontró JSON válido en la respuesta');
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
      console.error('JSON inválido:', err.message);
      console.error('JSON extraído (primeros 500 chars):', jsonStr.substring(0, 500));
      
      // Intentar fallback a formato de texto
      console.warn('Intentando parseResponseFlexible como fallback...');
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

    // REGLA METODOLÓGICA: NO rellenar con 'No especificado'
    // Si una categoría queda vacía, es responsabilidad del investigador definir términos manualmente
    for (const key of Object.keys(terms)) {
      if (terms[key].length === 0) {
        console.warn(`Categoría ${key} vacía - El investigador debe definir términos manualmente`);
        
        // ⚠️ EXCEPCIÓN CRÍTICA: thematicFocus nunca debe estar vacío
        // Si la IA no generó términos, sugerir términos genéricos basados en contexto académico
        if (key === 'thematicFocus') {
          console.warn('⚠️ FALLBACK ACTIVADO: Generando thematicFocus genéricos para evitar array vacío');
          terms[key] = [
            "Rendimiento - Performance",
            "Eficiencia - Efficiency",
            "Efectividad - Effectiveness"
          ];
          console.warn('ℹ️ Se agregaron términos genéricos. El investigador DEBE revisarlos y personalizarlos según su PICO-O');
        }
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
        console.warn(`Categoría ${category} tiene ${terms[category].length} términos, truncando a 6`);
        terms[category] = terms[category].slice(0, 6);
      }

      // REGLA METODOLÓGICA: NO completar artificialmente
      // Si la IA no generó suficientes términos válidos, el investigador debe agregarlos manualmente
      if (terms[category].length < 3) {
        console.warn(`Categoría ${category} tiene solo ${terms[category].length} términos válidos`);
        console.warn(`El investigador debe revisar y agregar términos manualmente si es necesario`);
      }
    }

    return terms;
  }
}

module.exports = GenerateProtocolTermsUseCase;

