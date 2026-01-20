/**
 * Configuración de Prompts de Validación PRISMA
 * Basado en ANEXO B: PROMPTS DEL GATEKEEPER DE VALIDACIÓN PRISMA
 */

const PRISMA_VALIDATION_PROMPTS = {
  // --- TÍTULO Y RESUMEN ---
  1: {
    itemNumber: 1,
    section: "TÍTULO",
    topic: "Identificación",
    systemPrompt: "Eres un evaluador experto en el estándar PRISMA 2020 para revisiones sistemáticas.",
    validationTemplate: `TAREA: Evaluar si el TÍTULO cumple con el Ítem 1 de PRISMA 2020.

TÍTULO A EVALUAR:
{content}

CRITERIOS DE EVALUACIÓN:

✅ OBLIGATORIOS (deben cumplirse TODOS):
1. Identifica explícitamente como "Revisión Sistemática" o términos equivalentes
   - Válido: "Revisión Sistemática", "Systematic Review", "Meta-análisis"
   - Inválido: "Revisión de Literatura", "Estado del Arte" (sin "sistemática")

2. Menciona claramente el tema central de la investigación
   - Debe indicar qué se está revisando (intervención, fenómeno, tecnología)

3. Formato académico apropiado
   - Longitud: 10-25 palabras (flexible, no crítico)
   - Claro y específico

EVALUACIÓN POR NIVELES:
APROBADO (100%): Cumple los 3 criterios obligatorios.
NECESITA_MEJORAS (50-90%): Cumple 2 de 3 criterios o tiene problemas menores.
RECHAZADO (<50%): NO identifica como revisión sistemática, tema no claro o formato no académico.

FORMATO DE RESPUESTA (JSON válido):
{
  "decision": "APROBADO | NECESITA_MEJORAS | RECHAZADO",
  "score": 85,
  "reasoning": "Breve explicación de 2-3 líneas",
  "issues": ["Problema específico si aplica"],
  "suggestions": ["Sugerencia concreta de mejora"],
  "criteriaChecklist": {
    "identificaComoRevisionSistematica": true,
    "mencionaTema": true,
    "formatoAcademico": true
  }
}

Responde SOLO con el JSON.`,
    requiredFields: ["identificaComoRevisionSistematica", "mencionaTema"],
  },

  2: {
    itemNumber: 2,
    section: "RESUMEN",
    topic: "Resumen estructurado",
    systemPrompt: "Eres un evaluador experto en el estándar PRISMA 2020 para revisiones sistemáticas.",
    validationTemplate: `TAREA: Evaluar si el RESUMEN cumple con el Ítem 2 de PRISMA 2020.

RESUMEN A EVALUAR:
{content}

CRITERIOS DE EVALUACIÓN:

✅ OBLIGATORIOS (estructura de resumen académico):
1. OBJETIVO / BACKGROUND: Pregunta de investigación y problema.
2. MÉTODOS: Bases de datos, criterios I/E, período, número inicial.
3. RESULTADOS: Número final, hallazgos principales, outcomes.
4. CONCLUSIONES: Interpretación, implicaciones.

⚠️ REQUISITOS ADICIONALES:
- Autocontenido
- Longitud: 200-400 palabras

FORMATO DE RESPUESTA (JSON válido):
{
  "decision": "APROBADO | NECESITA_MEJORAS | RECHAZADO",
  "score": 75,
  "reasoning": "Explicación de 2-3 líneas",
  "issues": ["Problema detectado"],
  "suggestions": ["Cómo mejorar"],
  "criteriaChecklist": {
    "incluyeObjetivo": true,
    "incluyeMetodos": true,
    "incluyeResultados": false,
    "incluyeConclusiones": true,
    "esAutocontenido": true
  }
}

Responde SOLO con el JSON.`,
    requiredFields: ["incluyeObjetivo", "incluyeMetodos", "incluyeResultados", "incluyeConclusiones"],
  },

  // --- INTRODUCCIÓN ---
  3: {
    itemNumber: 3,
    section: "INTRODUCCIÓN",
    topic: "Justificación",
    systemPrompt: "Eres un evaluador experto en el estándar PRISMA 2020 para revisiones sistemáticas.",
    validationTemplate: `TAREA: Evaluar si la JUSTIFICACIÓN cumple con el Ítem 3 de PRISMA 2020.

TEXTO A EVALUAR:
{content}

CRITERIOS DE EVALUACIÓN:

✅ COMPONENTES OBLIGATORIOS:
1. CONTEXTO / ANTECEDENTES: Estado del arte resumido.
2. GAP / NECESIDAD: ¿Qué NO se conoce? ¿Por qué es necesaria OTRA revisión?
3. RELEVANCIA: ¿Por qué es importante?

FORMATO DE RESPUESTA (JSON válido):
{
  "decision": "APROBADO | NECESITA_MEJORAS | RECHAZADO",
  "score": 80,
  "reasoning": "Explicación",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "incluyeContexto": true,
    "identificaGap": true,
    "explicaRelevancia": true
  }
}

Responde SOLO con el JSON.`,
    requiredFields: ["incluyeContexto", "identificaGap", "explicaRelevancia"],
  },

  4: {
    itemNumber: 4,
    section: "INTRODUCCIÓN",
    topic: "Objetivos",
    systemPrompt: "Eres un evaluador experto en el estándar PRISMA 2020 para revisiones sistemáticas.",
    validationTemplate: `TAREA: Evaluar si los OBJETIVOS cumplen con el Ítem 4 de PRISMA 2020.

TEXTO A EVALUAR:
{content}

CRITERIOS DE EVALUACIÓN:

✅ COMPONENTES OBLIGATORIOS:
1. DECLARACIÓN CLARA DEL OBJETIVO: Verbos específicos (evaluar, sintetizar).
2. COMPONENTES PICO: Population, Intervention, Comparison, Outcome (cuando aplique).
3. ALINEACIÓN CON JUSTIFICACIÓN.

FORMATO DE RESPUESTA (JSON válido):
{
  "decision": "APROBADO | NECESITA_MEJORAS | RECHAZADO",
  "score": 90,
  "reasoning": "Explicación",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "objetivoClaro": true,
    "incluyePICO": true,
    "verbosEspecificos": true,
    "alineadoConJustificacion": true
  }
}

Responde SOLO con el JSON.`,
    requiredFields: ["objetivoClaro", "incluyePICO"],
  },

  // --- MÉTODOS ---
  5: {
    itemNumber: 5,
    section: "MÉTODOS",
    topic: "Criterios de elegibilidad",
    systemPrompt: "Eres un evaluador experto en el estándar PRISMA 2020.",
    validationTemplate: `TAREA: Evaluar CRITERIOS DE ELEGIBILIDAD (Ítem 5).

TEXTO A EVALUAR:
{content}

CRITERIOS PRISMA 2020:
1. CRITERIOS DE INCLUSIÓN (explícitos): Tipos de estudio, Población, Intervención, Outcomes, Período, Idiomas.
2. CRITERIOS DE EXCLUSIÓN (explícitos): Razones claras.
3. CLARIDAD Y REPRODUCIBILIDAD.

FORMATO DE RESPUESTA (JSON válido):
{
  "decision": "APROBADO | NECESITA_MEJORAS | RECHAZADO",
  "score": 88,
  "reasoning": "Explicación",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "incluyeCriteriosInclusión": true,
    "incluyeCriteriosExclusión": true,
    "esReproducible": true,
    "cubrePICO": true
  }
}

Responde SOLO con el JSON.`,
    requiredFields: ["incluyeCriteriosInclusión", "incluyeCriteriosExclusión"],
  },

  6: {
    itemNumber: 6,
    section: "MÉTODOS",
    topic: "Fuentes de información",
    systemPrompt: "Eres un evaluador experto en PRISMA 2020.",
    validationTemplate: `TAREA: Evaluar FUENTES DE INFORMACIÓN (Ítem 6).

TEXTO A EVALUAR:
{content}

CRITERIOS PRISMA:
1. BASES DE DATOS ELECTRÓNICAS: Nombres completos (mínimo 2-3).
2. FECHAS DE BÚSQUEDA: Cuándo se realizó, rango cubierto.
3. OTRAS FUENTES: Manual, expertos, literatura gris (si aplica).

FORMATO DE RESPUESTA (JSON válido):
{
  "decision": "APROBADO | NECESITA_MEJORAS | RECHAZADO",
  "score": 92,
  "reasoning": "Explicación",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "listaBasesdeDatos": true,
    "fechasBusqueda": true,
    "minimo2Bases": true
  }
}

Responde SOLO con el JSON.`,
    requiredFields: ["listaBasesdeDatos", "fechasBusqueda"],
  },

  7: {
    itemNumber: 7,
    section: "MÉTODOS",
    topic: "Estrategia de búsqueda",
    systemPrompt: "Eres un evaluador experto en PRISMA 2020.",
    validationTemplate: `TAREA: Evaluar ESTRATEGIA DE BÚSQUEDA (Ítem 7).

TEXTO A EVALUAR:
{content}

CRITERIOS PRISMA:
1. CADENA DE BÚSQUEDA COMPLETA: Al menos para una base (keywords, operadores booleanos).
2. LÍMITES Y FILTROS: Idioma, fecha, tipo doc.
3. ADAPTACIONES: A otras bases.

FORMATO DE RESPUESTA (JSON válido):
{
  "decision": "APROBADO | NECESITA_MEJORAS | RECHAZADO",
  "score": 95,
  "reasoning": "Explicación",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "muestraCadenaCompleta": true,
    "incluyeOperadores": true,
    "especificaLimites": true
  }
}

Responde SOLO con el JSON.`,
    requiredFields: ["muestraCadenaCompleta", "especificaLimites"],
  },
};

// Generar prompts genéricos para el resto de ítems (8-27) para asegurar funcionalidad
// Se pueden ir especializando conforme se documenten en el Anexo.
const GENERIC_SYSTEM_PROMPT = "Eres un evaluador experto en el estándar PRISMA 2020 para revisiones sistemáticas.";
const GENERIC_TEMPLATE = (item, topic) => `TAREA: Evaluar si el contenido cumple con el Ítem ${item} (${topic}) de PRISMA 2020.

TEXTO A EVALUAR:
{content}

CRITERIOS PROVISIONALES:
1. El texto debe ser completo y detallado.
2. Debe usar lenguaje académico formal.
3. Debe describir explícitamente el proceso o resultados requeridos por el ítem ${topic}.

FORMATO DE RESPUESTA (JSON válido):
{
  "decision": "APROBADO | NECESITA_MEJORAS | RECHAZADO",
  "score": 70,
  "reasoning": "Evaluación basada en criterios generales de PRISMA",
  "issues": [],
  "suggestions": ["Mejorar detalle y claridad"],
  "criteriaChecklist": {
    "contenidoCompleto": true,
    "lenguajeAcademico": true
  }
}

Responde SOLO con el JSON.`;

const ITEMS_INFO = {
  8: "Proceso de selección",
  9: "Proceso de extracción de datos",
  10: "Lista de datos",
  11: "Riesgo de sesgo",
  12: "Medidas de efecto",
  13: "Métodos de síntesis",
  14: "Sesgo de reporte",
  15: "Certeza de la evidencia",
  16: "Selección de estudios",
  17: "Características de estudios",
  18: "Riesgo de sesgo en estudios",
  19: "Resultados individuales",
  20: "Resultados de síntesis",
  21: "Sesgo de reporte (resultados)",
  22: "Certeza de evidencia",
  23: "Interpretación y discusión",
  24: "Registro y protocolo",
  25: "Financiamiento",
  26: "Conflictos de interés",
  27: "Disponibilidad de datos"
};

for (const [num, topic] of Object.entries(ITEMS_INFO)) {
  if (!PRISMA_VALIDATION_PROMPTS[num]) {
    PRISMA_VALIDATION_PROMPTS[num] = {
      itemNumber: parseInt(num),
      section: parseInt(num) < 16 ? "MÉTODOS" : (parseInt(num) < 23 ? "RESULTADOS" : "OTRA INFO"),
      topic: topic,
      systemPrompt: GENERIC_SYSTEM_PROMPT,
      validationTemplate: GENERIC_TEMPLATE(num, topic),
      requiredFields: ["contenidoCompleto"]
    };
  }
}

module.exports = PRISMA_VALIDATION_PROMPTS;
