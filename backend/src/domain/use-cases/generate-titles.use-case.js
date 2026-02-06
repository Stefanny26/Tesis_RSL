const OpenAI = require('openai');

class GenerateTitlesUseCase {
  constructor() {
    // Inicializar OpenAI/ChatGPT
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  /**
   * Genera 5 opciones de títulos con validación Cochrane
   * @param {Object} params - Parámetros
   * @param {Object} params.matrixData - Datos de la matriz Es/No Es
   * @param {Object} params.picoData - Datos del marco PICO
   * @param {String} params.aiProvider - Proveedor de IA ('chatgpt', 'chatgpt' o 'gemini')
   * @returns {Object} Resultado con 5 títulos y validación
   */
  async execute({ matrixData, picoData, aiProvider = 'chatgpt' }) {
    try {
      console.log('Generando 5 títulos con validación Cochrane...');
      
      if (!this.openai) {
        throw new Error('No hay proveedor de IA configurado');
      }
      
      // Construir contexto del proyecto
      const context = this._buildContext(matrixData, picoData);
      
      // Construir prompt para el AI
      const prompt = this._buildPrompt(context);
      
      // Llamar al servicio de IA
      let response;
      try {
        response = await this._generateWithChatGPT(prompt);
      } catch (error) {
        console.error(`Error con ChatGPT:`, error.message);
        throw error;
      }
      
      // Log de respuesta cruda para debugging
      console.log('Respuesta cruda de la IA:', JSON.stringify(response).substring(0, 500));
      
      // Parsear respuesta
      const titles = this._parseResponse(response);
      
      console.log(`Generados ${titles.length} títulos exitosamente con chatgpt`);
      
      return {
        success: true,
        data: {
          titles,
          provider: 'chatgpt'
        }
      };
    } catch (error) {
      console.error('Error en GenerateTitlesUseCase:', error);
      throw new Error(`Error generando títulos: ${error.message}`);
    }
  }

  /**
   * Genera títulos usando ChatGPT
   */
  async _generateWithChatGPT(prompt) {
    if (!this.openai) {
      throw new Error('OpenAI API key no configurada');
    }

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un Editor en Jefe de un Journal de Ingeniería de alto impacto (Q1). Tu estándar de calidad es extremo. Generas títulos académicos con rigor metodológico PRISMA 2020. Respondes ÚNICAMENTE en formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.6, // Aumentado a 0.6 para evitar que los 5 títulos suenen idénticos
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content);
  }

  /**
   * Construye el contexto del proyecto desde matriz y PICO
   */
  _buildContext(matrixData, picoData) {
    let context = '';
    
    if (matrixData) {
      context += '**Matriz Es/No Es:**\n';
      if (matrixData.population) context += `- Población: ${matrixData.population}\n`;
      if (matrixData.intervention) context += `- Intervención: ${matrixData.intervention}\n`;
      if (matrixData.need) context += `- Necesidad: ${matrixData.need}\n`;
      if (matrixData.outcomes) context += `- Resultados Esperados: ${matrixData.outcomes}\n`;
      if (matrixData.provider) context += `- Proveedor: ${matrixData.provider}\n`;
      if (matrixData.studyType) context += `- Tipo de Estudio: ${matrixData.studyType}\n`;
      if (matrixData.comparison) context += `- Comparación: ${matrixData.comparison}\n`;
      context += '\n';
    }
    
    if (picoData) {
      context += '**Marco PICO:**\n';
      if (picoData.population) context += `- P (Población): ${picoData.population}\n`;
      if (picoData.intervention) context += `- I (Intervención): ${picoData.intervention}\n`;
      if (picoData.comparison) context += `- C (Comparación): ${picoData.comparison}\n`;
      if (picoData.outcomes) context += `- O (Resultados): ${picoData.outcomes}\n`;
    }
    
    return context;
  }

  /**
   * Construye el prompt para generar títulos con reglas metodológicas rigurosas PRISMA 2020
   */
  _buildPrompt(context) {
    return `Eres un Senior Research Editor especializado en ingeniería y metodología PRISMA 2020. Tu objetivo es generar 5 títulos de alto impacto para una Revisión Sistemática.

═══════════════════════════════════════════════════════════════
CONTEXTO DEL PROTOCOLO (Insumos Reales)
═══════════════════════════════════════════════════════════════
${context}

═══════════════════════════════════════════════════════════════
REGLAS DE ORO DE REDACCIÓN ACADÉMICA (Actualizado con énfasis en PICO completo)
═══════════════════════════════════════════════════════════════
1. PRISMA COMPLIANCE (Ítem 1): El título DEBE incluir explícitamente la naturaleza del estudio (ej: "A Systematic Review", "A Scoping Review" o "Evidence Synthesis"). Obligatorio para indexación Scopus/WoS.

2. INCLUSIÓN EXPLÍCITA DEL OUTCOME (O): **CRÍTICO** - El título DEBE incluir el resultado/outcome específico que se evaluará:
   - ❌ NO: "Machine Learning in Healthcare" (sin outcome)
   - ❌ NO: "ML for Healthcare Impact" (outcome vago)
   - ✅ SÍ: "ML for Diagnostic Accuracy in Healthcare" (outcome específico)
   - ✅ SÍ: "ML for Reducing Hospital Readmission Rates" (outcome medible)
   
   **Ejemplos de Outcomes Concretos por Área:**
   - Salud: "Diagnostic Accuracy", "Treatment Response Rate", "Patient Mortality Reduction"
   - Software: "Development Time", "Code Quality", "Bug Detection Rate"
   - Educación: "Learning Outcomes", "Academic Performance", "Student Engagement"
   - Manufactura: "Production Efficiency", "Defect Rate", "Energy Consumption"

3. INTEGRACIÓN DEL COMPARATOR (C) cuando exista: Si PICO incluye C (Comparison), el título DEBE reflejarlo:
   - Formato: "[I] vs. [C] for [Outcome] in [P]: A Comparative Review"
   - Ejemplo: "Deep Learning vs. Traditional ML for Fraud Detection in Banking: A Systematic Review"
   - Si NO hay C explícito, omitir la comparación del título

4. PRECISIÓN TÉCNICA: Sustituir términos genéricos por específicos:
   - NO: "Inteligencia Artificial" -> SÍ: "Deep Reinforcement Learning" o "Convolutional Neural Networks"
   - NO: "Impacto" / "Mejora" -> SÍ: Outcome medible específico (ver punto 2)
   
5. PROHIBICIÓN DE "BUZZWORDS": Prohibido usar: "Moderno", "Avanzado", "Reciente", "Impacto general", "Mejora", "Estudio sobre", "Análisis de".

6. LONGITUD: Entre 12 y 18 palabras.

═══════════════════════════════════════════════════════════════
PATRONES DE ESTRUCTURA ACTUALIZADOS (Incluyen P-I-C-O completo)
═══════════════════════════════════════════════════════════════
**REGLA FUNDAMENTAL: Todos los patrones DEBEN incluir el Outcome (O) de manera explícita y medible.**

**Patrón A (Sin Comparison)**: 
[Intervención/Tecnología] for [Outcome Específico] in [Población/Contexto]: A Systematic Review
Ejemplo: "Machine Learning Algorithms for Diagnostic Accuracy in Cardiovascular Diseases: A Systematic Review"
- I: Machine Learning Algorithms
- O: Diagnostic Accuracy (outcome concreto)
- P: Cardiovascular Diseases
- Naturaleza: Systematic Review

**Patrón B (Con énfasis en Outcome)**: 
[Outcome Específico] of [Intervención] in [Población]: A Systematic Review
Ejemplo: "Energy Efficiency of Cloud Computing Architectures in Data Centers: A Systematic Review"
- O: Energy Efficiency (outcome medible)
- I: Cloud Computing Architectures
- P: Data Centers
- Natural  eza: Systematic Review

**Patrón C (Con Comparison explícita)**:
[Intervención A] vs. [Intervención B] for [Outcome] in [Población]: A Comparative Evidence Synthesis
Ejemplo: "Agile vs. Waterfall for Project Delivery Time in Software Startups: A Comparative Review"
- I: Agile
- C: Waterfall
- O: Project Delivery Time (outcome medible)
- P: Software Startups
- Naturaleza: Comparative Review

**Patrón D (Scoping - exploratorio)**:
[Outcome/Efectos] of [Intervención] in [Población]: Evidence Mapping and Future Directions
Ejemplo: "Security Vulnerabilities of IoT Devices in Smart Homes: A Scoping Review"
- O: Security Vulnerabilities (outcome específico)
- I: IoT Devices
- P: Smart Homes
- Naturaleza: Scoping Review

═══════════════════════════════════════════════════════════════
INSTRUCCIONES PARA LA JUSTIFICACIÓN (Peer-Review Style)
═══════════════════════════════════════════════════════════════
La justificación NO debe hablar de la gramática del título. Debe explicar por qué esa intersección de (P) y (I) es un "Research Gap" (vacío de investigación) que merece ser estudiado en ${new Date().getFullYear()}.

═══════════════════════════════════════════════════════════════
FORMATO DE RESPUESTA (JSON ESTRICTO)
═══════════════════════════════════════════════════════════════

IMPORTANTE: Cada título DEBE incluir una justificación de 30-50 palabras que explique:
1. Por qué la combinación de elementos del título es relevante científicamente
2. Qué necesidad de investigación justifica ese enfoque específico
3. Por qué esa delimitación particular (población + intervención) es importante

**FORMATO DE JUSTIFICACIÓN**: Debe hablar del CONTENIDO y RELEVANCIA del estudio, NO del título como objeto.

PROHIBIDO usar frases como:
- "Se utiliza el Patrón A/B/C..."
- "El título refleja..."
- "Este título articula..."
- "El título integra..."

CORRECTO - Hablar del contenido:
Ejemplo 1: "El aprendizaje automático en contextos cardiovasculares requiere análisis de grandes volúmenes de datos clínicos que superan los enfoques estadísticos tradicionales, permitiendo identificar patrones complejos en poblaciones adultas con factores de riesgo específicos."

Ejemplo 2: "La simulación de redes de comunicación en entornos profesionales de ingeniería demanda metodologías específicas que permitan evaluar el rendimiento en escenarios controlados, considerando las particularidades técnicas del dominio de aplicación."

**FORMATO BILINGÜE**: Todos los títulos DEBEN estar en INGLÉS como idioma principal (title) y ESPAÑOL como traducción (spanishTitle).
- title: Título académico en INGLÉS (siguiendo patrones A, B, C o D)
- spanishTitle: Traducción profesional al ESPAÑOL del mismo título
- justification: Justificación en ESPAÑOL (30-50 palabras)
- spanishJustification: Misma justificación (redundante, pero incluir para compatibilidad)

{
  "titles": [
    {
      "title": "[Título académico en INGLÉS, siguiendo patrones A, B, C o D]",
      "spanishTitle": "[Traducción profesional y académica del título al ESPAÑOL]",
      "justification": "[OBLIGATORIO: 30-50 palabras en ESPAÑOL explicando la relevancia del contenido]",
      "spanishJustification": "[Misma justificación en español - redundante pero incluir]",
      "cochraneCompliance": "full|partial|low",
      "wordCount": [número de palabras del título EN INGLÉS],
      "pattern": "A|B|C|D",
      "components": {
        "fenomeno": "[tecnología/variable/constructo central]",
        "poblacion": "[contexto/dominio específico]",
        "enfoque": "[aspecto metodológico o variable de interés]",
        "naturaleza": "Systematic Review / Scoping Review / Evidence Synthesis"
      },
      "validation": {
        "explicitReview": true|false,
        "clearPhenomenon": true|false,
        "hasPopulation": true|false,
        "isSpecific": true|false,
        "lengthOK": true|false
      }
    }
    // ... 5 títulos total
  ]
}

═══════════════════════════════════════════════════════════════
CRITERIOS DE COMPLIANCE
═══════════════════════════════════════════════════════════════

**"cochraneCompliance": "full"** (meta: 4-5 títulos):
- Cumple las 4 reglas de oro de redacción académica
- Todos los campos de validation son true
- Longitud 12-18 palabras
- Patrón A, B, C o D correctamente aplicado
- Especificidad técnica presente
- Naturaleza del estudio explícita (Systematic Review, Scoping Review, etc.)

**"cochraneCompliance": "partial"** (máximo 1 título):
- Falta UN elemento de validation
- O longitud ligeramente fuera de rango (10-12 o 18-20 palabras)
- Estructura académica presente pero mejorable

**"cochraneCompliance": "low"** (máximo 0 títulos):
- Falta 2+ elementos de validation
- Título vago, genérico o confuso
- Sin estructura PICO identificable

═══════════════════════════════════════════════════════════════
EJEMPLOS REFERENCIALES DE TÍTULOS VÁLIDOS (Actualizados con PICO completo)
═══════════════════════════════════════════════════════════════

**CORRECTO** (Patrón A, full compliance - Outcome explícito):
"Machine Learning Algorithms for Fraud Detection Accuracy in Digital Banking: A Systematic Review"
- I (Intervención): Machine Learning Algorithms
- O (Outcome): Fraud Detection Accuracy (medible)
- P (Población): Digital Banking
- Naturaleza: Systematic Review (explícito)
- Palabras: 12
- ✅ Outcome concreto y medible

**CORRECTO** (Patrón B, full compliance - Outcome primero):
"Energy Efficiency of Blockchain Consensus Mechanisms in Cryptocurrency Networks: A Systematic Review"
- O (Outcome): Energy Efficiency (medible)
- I (Intervención): Blockchain Consensus Mechanisms
- P (Población): Cryptocurrency Networks
- Naturaleza: Systematic Review
- Palabras: 12
- ✅ Outcome específico y cuantificable

**CORRECTO** (Patrón C, full compliance - Con Comparison):
"Microservices vs. Monolithic Architectures for Deployment Velocity in Cloud Applications: A Comparative Review"
- I (Intervención): Microservices
- C (Comparator): Monolithic Architectures
- O (Outcome): Deployment Velocity (tiempo medible)
- P (Población): Cloud Applications
- Naturaleza: Comparative Review
- Palabras: 13
- ✅ Comparison explícita + Outcome concreto

**CORRECTO** (Patrón D, full compliance - Scoping con Outcome):
"Security Vulnerabilities of Internet of Things Devices in Smart Home Environments: A Scoping Review"
- O (Outcome): Security Vulnerabilities (medible)
- I (Intervención): Internet of Things Devices
- P (Población): Smart Home Environments
- Naturaleza: Scoping Review
- Palabras: 14
- ✅ Outcome específico (vulnerabilidades de seguridad)

**INCORRECTO** (Outcome vago, low compliance):
"Artificial Intelligence for Healthcare Improvement: A Review"
❌ Problemas:
- "Improvement" es demasiado vago (¿qué se mejora?)
- No especifica outcome medible (¿diagnóstico? ¿costos? ¿tiempos?)
- Fenómeno: demasiado amplio ("AI")
- Palabras: 7 (muy corto)
- Sin outcome concreto

**INCORRECTO** (Sin Outcome, low compliance):
"Machine Learning in Web Development: A Systematic Review"
❌ Problemas:
- NO indica QUÉ se evalúa/mide (falta O)
- ¿Evalúa velocidad? ¿calidad? ¿costos? ¿productividad?
- Título incompleto sin outcome
- Debe especificar: "ML for Development Time Reduction" o "ML for Code Quality"

**INCORRECTO** (buzzwords + outcome vago, low compliance):
"Advanced Analysis of Modern IoT Impact in Smart Cities"
❌ Problemas:
- "Advanced" y "Modern" son buzzwords prohibidos
- "Impact" sin especificar EN QUÉ (outcome vago)
- "análisis" es genérico
- No menciona naturaleza del estudio
- Debe especificar outcome: "Energy Consumption", "Traffic Flow Optimization", etc.

═══════════════════════════════════════════════════════════════
SALIDA ESPERADA (JSON ESTRICTO):
═══════════════════════════════════════════════════════════════
{
  "titles": [
    {
      "title": "Title in English (Academic English only)",
      "spanishTitle": "Traducción académica (No literal, sino terminológica)",
      "justification": "Explicación técnica del valor científico (30-50 palabras)",
      "spanishJustification": "Misma explicación (redundante pero incluir)",
      "cochraneCompliance": "full",
      "wordCount": 15,
      "pattern": "A",
      "components": {
        "fenomeno": "Tecnología exacta",
        "poblacion": "Dominio de aplicación",
        "enfoque": "Variable medida (Outcome)",
        "naturaleza": "Systematic Review / Scoping Review"
      },
      "validation": {
        "explicitReview": true,
        "clearPhenomenon": true,
        "hasPopulation": true,
        "isSpecific": true,
        "lengthOK": true
      }
    }
    // ... total 5
  ]
}

═══════════════════════════════════════════════════════════════
INSTRUCCIONES FINALES (Actualizado con verificación PICO completa)
═══════════════════════════════════════════════════════════════

**ANTES DE GENERAR, VERIFICA EL CONTEXTO PICO:**
${context}

**ANÁLISIS OBLIGATORIO DEL CONTEXTO:**
1. ¿El PICO tiene "Outcomes" (O) definido? 
   - SI: Úsalo literalmente en el título
   - NO: Infiere un outcome medible del contexto (eficiencia, calidad, velocidad, precisión, costo, etc.)

2. ¿El PICO tiene "Comparison" (C) definido?
   - SI: Usa Patrón C ([I] vs. [C] for [O] in [P])
   - NO: Usa Patrón A o B

3. ¿La Población (P) es específica?
   - Úsala tal cual sin generalizaciones

4. ¿La Intervención (I) es técnica?
   - Evita términos vagos ("IA", "ML" sin especificar tipo)

**CHECKLIST DE VALIDACIÓN POR TÍTULO:**
Para cada uno de los 5 títulos, verifica:
- [ ] ¿Incluye la Población (P) específica del PICO?
- [ ] ¿Incluye la Intervención (I) específica del PICO?
- [ ] **[CRÍTICO]** ¿Incluye el Outcome (O) de manera concreta y medible?
- [ ] Si hay Comparison (C), ¿está incluida en el título?
- [ ] ¿Indica explícitamente la naturaleza del estudio? (Systematic Review, Scoping Review, etc.)
- [ ] ¿Tiene entre 12-18 palabras?
- [ ] ¿Evita buzzwords prohibidos?

**INSTRUCCIONES DE GENERACIÓN:**
1. Genera EXACTAMENTE 5 títulos DISTINTOS y NO REDUNDANTES
2. PRIORIZA full compliance (mínimo 4 de 5 deben ser "full")
3. **OBLIGATORIO**: Cada título DEBE incluir el Outcome (O) de manera específica
4. Si PICO tiene Comparison (C), AL MENOS 1 título debe usar Patrón C (A vs. B)
5. Usa información del CONTEXTO DEL PROTOCOLO para derivar componentes
6. Si falta Outcome en el contexto, infiere uno medible y relevante (NO uses "impacto general" o "mejora")
7. Cada título debe ser DIRECTAMENTE USABLE como título oficial del protocolo
8. **CRÍTICO**: Cada título DEBE incluir explícitamente la naturaleza del estudio (A Systematic Review, A Scoping Review, etc.) - OBLIGATORIO para PRISMA 2020 Ítem 1
9. **CRÍTICO**: Cada título DEBE tener una justificación de 30-50 palabras (campo "justification" OBLIGATORIO) explicando el RESEARCH GAP
10. Responde ÚNICAMENTE con JSON válido, sin texto adicional

**FORMATO JSON - ACTUALIZADO CON VALIDACIÓN PICO:**
{
  "titles": [
    {
      "title": "Title in English (Academic English only)",
      "spanishTitle": "Traducción académica",
      "justification": "Explicación técnica (30-50 palabras)",
      "spanishJustification": "Misma explicación",
      "cochraneCompliance": "full",
      "wordCount": 15,
      "pattern": "A",
      "components": {
        "population": "[Extraído de PICO-P]",
        "intervention": "[Extraído de PICO-I]",
        "comparator": "[Extraído de PICO-C o null]",
        "outcome": "[Extraído de PICO-O - OBLIGATORIO, debe ser específico y medible]",
        "naturaleza": "Systematic Review / Scoping Review"
      },
      "validation": {
        "explicitReview": true,
        "clearPhenomenon": true,
        "hasPopulation": true,
        "hasOutcome": true,  ← NUEVO: Validar que outcome esté presente
        "isSpecific": true,
        "lengthOK": true
      }
    }
    // ... total 5
  ]
}

GENERA LOS 5 TÍTULOS AHORA CON OUTCOME EXPLÍCITO EN CADA UNO:`;
  }

  /**
   * Parsea la respuesta del AI con validación completa
   */
  _parseResponse(parsedJson) {
    try {
      // La respuesta ya viene parseada desde los métodos de generación
      const parsed = parsedJson;
      
      // Validar estructura
      if (!parsed.titles || !Array.isArray(parsed.titles)) {
        throw new Error('Respuesta no contiene array de títulos');
      }
      
      if (parsed.titles.length < 5) {
        throw new Error(`Solo se generaron ${parsed.titles.length} títulos, se esperaban 5`);
      }
      
      // Validar cada título con schema completo
      const validatedTitles = parsed.titles.map((item, index) => {
        // Validar title
        if (!item.title || typeof item.title !== 'string') {
          throw new Error(`Título ${index + 1} inválido: falta propiedad 'title'`);
        }
        
        const title = item.title.trim();
        const wordCount = title.split(/\s+/).length;
        
        // Validar longitud (5-22 palabras)
        if (wordCount < 5) {
          console.warn(`Título ${index + 1} muy corto (${wordCount} palabras): "${title.substring(0, 50)}..."`);
        }
        if (wordCount > 22) {
          console.warn(`Título ${index + 1} muy largo (${wordCount} palabras): "${title.substring(0, 50)}..."`);
        }
        
        // Validar compliance
        const compliance = item.cochraneCompliance || 'partial';
        if (!['full', 'partial', 'none'].includes(compliance)) {
          console.warn(`Compliance inválido para título ${index + 1}, usando 'partial'`);
        }
        
        // Validar components (actualizado con validación de outcome)
        const components = item.components || {};
        
        // CRÍTICO: Validar que todos los componentes PICO estén presentes
        const missingComponents = [];
        if (!components.population) missingComponents.push('population');
        if (!components.intervention) missingComponents.push('intervention');
        if (!components.outcome) missingComponents.push('outcome'); // NUEVO: Outcome es obligatorio
        
        if (missingComponents.length > 0) {
          console.warn(`Título ${index + 1} falta components PICO requeridos: ${missingComponents.join(', ')}`);
        }
        
        // Validar que el outcome no sea genérico o vago
        if (components.outcome) {
          const vagueOutcomes = ['impacto', 'impact', 'mejora', 'improvement', 'resultados', 'results', 'efectos', 'effects'];
          const isVagueOutcome = vagueOutcomes.some(vague => 
            components.outcome.toLowerCase().includes(vague) && components.outcome.split(' ').length <= 2
          );
          
          if (isVagueOutcome) {
            console.warn(`Título ${index + 1} tiene outcome vago: "${components.outcome}" - debe ser más específico (ej: "diagnostic accuracy", "energy efficiency", "development time")`);
          }
        }
        
        // Validar justification (OBLIGATORIO)
        const justification = item.justification || item.reasoning || '';
        if (!justification || justification.length < 20) {
          console.warn(`Título ${index + 1} tiene justificación faltante o muy corta (${justification.length} caracteres)`);
        } else {
          console.log(`Título ${index + 1} tiene justificación (${justification.length} caracteres)`);
        }
        
        // Extraer título en español y justificación en español
        const spanishTitle = item.spanishTitle || title; // Si no hay traducción, usar el título original
        const spanishJustification = item.spanishJustification || justification;
        
        return {
          title: title,
          spanishTitle: spanishTitle,
          cochraneCompliance: ['full', 'partial', 'none'].includes(compliance) ? compliance : 'partial',
          justification: justification || 'Sin justificación proporcionada',
          spanishJustification: spanishJustification || 'Sin justificación proporcionada',
          reasoning: justification || 'Sin justificación proporcionada', // Mantener por compatibilidad
          components: {
            population: components.population || 'unspecified',
            intervention: components.intervention || 'unspecified',
            comparator: components.comparator || components.comparison || null, // Soportar ambos nombres
            outcome: components.outcome || 'unspecified' // CRÍTICO: Outcome debe estar presente
          },
          wordCount: wordCount,
          // Agregar flag de validación para outcome
          hasExplicitOutcome: components.outcome && components.outcome !== 'unspecified' && components.outcome.length > 3
        };
      });
      
      // Verificar que al menos 3 sean 'full' compliance
      const fullCount = validatedTitles.filter(t => t.cochraneCompliance === 'full').length;
      if (fullCount < 3) {
        console.warn(`Solo ${fullCount} títulos tienen 'full' compliance, se esperaban al menos 3`);
      }
      
      // NUEVA VALIDACIÓN: Verificar que al menos 4 títulos tengan outcomes explícitos
      const withExplicitOutcome = validatedTitles.filter(t => t.hasExplicitOutcome).length;
      if (withExplicitOutcome < 4) {
        console.warn(`⚠️ Solo ${withExplicitOutcome} títulos tienen outcome explícito, se esperaban al menos 4`);
        console.warn(`⚠️ Recordatorio: Los títulos deben incluir outcomes específicos y medibles (ej: "diagnostic accuracy", "development time", "energy efficiency")`);
      }
      
      console.log(`Validación exitosa: ${validatedTitles.length} títulos, ${fullCount} con full compliance, ${withExplicitOutcome} con outcome explícito`);
      
      return validatedTitles.slice(0, 5); // Retornar máximo 5
      
    } catch (error) {
      console.error('Error parseando respuesta:', error.message);
      console.error('   Respuesta recibida:', JSON.stringify(parsedJson).substring(0, 300));
      
      // Fallback: generar títulos de respaldo
      console.log('Usando títulos de respaldo...');
      return this._generateFallbackTitles();
    }
  }

  /**
   * Genera títulos de respaldo en caso de error
   */
  _generateFallbackTitles() {
    return [
      {
        title: 'A Systematic Literature Review: Research Topic in Study Context',
        spanishTitle: 'Una Revisión Sistemática de Literatura: Tema de Investigación en Contexto de Estudio',
        cochraneCompliance: 'partial',
        justification: 'Título genérico de respaldo - requiere personalización con datos PICO',
        spanishJustification: 'Título genérico de respaldo - requiere personalización con datos PICO',
        reasoning: 'Título genérico de respaldo - requiere personalización con datos PICO',
        components: {
          population: 'unspecified population',
          intervention: 'unspecified intervention',
          comparator: null,
          outcome: 'unspecified outcomes'
        },
        wordCount: 9
      },
      {
        title: 'Exploring Intervention Strategies for Target Outcomes: A Systematic Review',
        spanishTitle: 'Explorando Estrategias de Intervención para Resultados Objetivo: Una Revisión Sistemática',
        cochraneCompliance: 'partial',
        justification: 'Título de respaldo - estructura básica correcta pero necesita especificación',
        spanishJustification: 'Título de respaldo - estructura básica correcta pero necesita especificación',
        reasoning: 'Título de respaldo - estructura básica correcta pero necesita especificación',
        components: {
          population: 'target population',
          intervention: 'intervention strategies',
          comparator: null,
          outcome: 'target outcomes'
        },
        wordCount: 10
      },
      {
        title: 'Study Intervention and Its Impact on Primary Outcomes: A Literature Review',
        spanishTitle: 'Intervención de Estudio y su Impacto en Resultados Primarios: Una Revisión de Literatura',
        cochraneCompliance: 'partial',
        justification: 'Título de respaldo - faltan detalles específicos de población y contexto',
        spanishJustification: 'Título de respaldo - faltan detalles específicos de población y contexto',
        reasoning: 'Título de respaldo - faltan detalles específicos de población y contexto',
        components: {
          population: 'study participants',
          intervention: 'study intervention',
          comparator: null,
          outcome: 'primary outcomes'
        },
        wordCount: 12
      },
      {
        title: 'A Scoping Review of Research Topic in Target Population',
        spanishTitle: 'Una Revisión Exploratoria del Tema de Investigación en Población Objetivo',
        cochraneCompliance: 'partial',
        justification: 'Título de respaldo - requiere información específica de PICO',
        spanishJustification: 'Título de respaldo - requiere información específica de PICO',
        reasoning: 'Título de respaldo - requiere información específica de PICO',
        components: {
          population: 'target population',
          intervention: 'research topic',
          comparator: null,
          outcome: 'research findings'
        },
        wordCount: 10
      },
      {
        title: 'Systematic Review: Implementation Strategies for Study Context and Expected Results',
        spanishTitle: 'Revisión Sistemática: Estrategias de Implementación para Contexto de Estudio y Resultados Esperados',
        cochraneCompliance: 'partial',
        justification: 'Título de respaldo - estructura adecuada pero requiere datos específicos',
        spanishJustification: 'Título de respaldo - estructura adecuada pero requiere datos específicos',
        reasoning: 'Título de respaldo - estructura adecuada pero requiere datos específicos',
        components: {
          population: 'study context',
          intervention: 'implementation strategies',
          comparator: null,
          outcome: 'expected results'
        },
        wordCount: 11
      }
    ];
  }
}

module.exports = GenerateTitlesUseCase;

