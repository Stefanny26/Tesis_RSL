/**
 * Prompts de Validación para Gatekeeper PRISMA 2020
 * 
 * Sistema de validación usando OpenAI ChatGPT
 * 
 * Cada ítem tiene:
 * - Criterios PRISMA oficiales
 * - Prompt de validación para la IA
 * - Configuración de evaluación
 */

const PRISMA_VALIDATION_PROMPTS = {
  1: {
    itemNumber: 1,
    section: "TÍTULO",
    topic: "Identificación como revisión sistemática",
    prismaCriteria: [
      "Debe identificar el reporte como una revisión sistemática",
      "Puede incluir palabras como 'revisión sistemática', 'systematic review', 'meta-análisis'",
      "Debe mencionar el tema o pregunta de investigación central"
    ],
    systemPrompt: "Eres un evaluador experto en el estándar PRISMA 2020 para revisiones sistemáticas. Tu tarea es evaluar si el contenido cumple con los criterios específicos de cada ítem PRISMA.",
    validationTemplate: `Eres un evaluador experto en el estándar PRISMA 2020 para revisiones sistemáticas.

TAREA: Evaluar si el TÍTULO cumple con el Ítem 1 de PRISMA 2020.

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

APROBADO (>85%):
- Cumple los 3 criterios obligatorios
- Título claro y profesional

NECESITA_MEJORAS (50-85%):
- Cumple 2 de 3 criterios obligatorios
- O cumple todos pero con problemas menores

RECHAZADO (<50%):
- NO identifica como revisión sistemática
- O tema no claro

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

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.`,
    minimumScore: 70,
    requiredFields: ["identificaComoRevisionSistematica", "mencionaTema"]
  },

  2: {
    itemNumber: 2,
    section: "RESUMEN",
    topic: "Resumen estructurado",
    prismaCriteria: [
      "Resumen estructurado con secciones: Objetivos, Métodos, Resultados, Conclusiones",
      "Debe ser autocontenido (entendible sin leer el artículo completo)",
      "Longitud típica: 200-400 palabras"
    ],
    systemPrompt: "Eres un evaluador experto en PRISMA 2020. Evalúa resúmenes de revisiones sistemáticas.",
    validationTemplate: `Evaluar si el RESUMEN cumple con el Ítem 2 de PRISMA 2020.

RESUMEN A EVALUAR:
{content}

CRITERIOS OBLIGATORIOS:

1. OBJETIVO / BACKGROUND
   - Pregunta de investigación o objetivo de la revisión
   - Problema que motiva la revisión

2. MÉTODOS
   - Bases de datos consultadas (mínimo 2)
   - Criterios de inclusión/exclusión (resumen)
   - Período de búsqueda
   - Número inicial de estudios

3. RESULTADOS
   - Número final de estudios incluidos
   - Principales hallazgos
   - Outcomes medidos

4. CONCLUSIONES
   - Interpretación de hallazgos
   - Implicaciones prácticas

REQUISITOS:
- Autocontenido (sin referencias a "ver sección X")
- Sin abreviaturas sin definir
- 200-400 palabras

EVALUACIÓN:

APROBADO (>85%):
- Incluye las 4 secciones claramente
- Autocontenido y claro

NECESITA_MEJORAS (50-85%):
- Falta 1 sección o está incompleta
- Información desorganizada

RECHAZADO (<50%):
- Faltan 2+ secciones
- No autocontenido
- Muy breve (<150 palabras)

RESPONDE SOLO JSON:
{
  "decision": "APROBADO | NECESITA_MEJORAS | RECHAZADO",
  "score": 75,
  "reasoning": "Explicación",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "incluyeObjetivo": true,
    "incluyeMetodos": true,
    "incluyeResultados": false,
    "incluyeConclusiones": true,
    "esAutocontenido": true
  }
}`,
    minimumScore: 70
  },

  5: {
    itemNumber: 5,
    section: "MÉTODOS",
    topic: "Criterios de elegibilidad",
    prismaCriteria: [
      "Especifica los criterios de inclusión",
      "Especifica los criterios de exclusión",
      "Debe ser reproducible por otro investigador"
    ],
    systemPrompt: "Eres un evaluador experto en PRISMA 2020. Evalúa la claridad de criterios de elegibilidad.",
    validationTemplate: `Evaluar CRITERIOS DE ELEGIBILIDAD (Ítem 5 PRISMA).

TEXTO:
{content}

DEBE INCLUIR:

1. CRITERIOS DE INCLUSIÓN (explícitos)
   - Tipos de estudios
   - Población/contexto
   - Intervención/fenómeno
   - Outcomes
   - Período temporal
   - Idiomas

2. CRITERIOS DE EXCLUSIÓN (explícitos)
   - Qué NO se incluye
   - Razones claras

3. REPRODUCIBILIDAD
   - Otro investigador podría replicar

APROBADO (>85%):
- Inclusión y exclusión bien definidos
- Reproducible
- Cubre PICO

NECESITA_MEJORAS (50-85%):
- Falta alguna dimensión
- Algunos criterios vagos

RECHAZADO (<50%):
- Criterios ausentes o muy incompletos
- No reproducible

RESPONDE JSON:
{
  "decision": "APROBADO | NECESITA_MEJORAS | RECHAZADO",
  "score": 88,
  "reasoning": "Los criterios son claros y reproducibles",
  "issues": ["No especifica idiomas"],
  "suggestions": ["Agregar: 'Estudios en inglés y español'"],
  "criteriaChecklist": {
    "criteriosInclusión": true,
    "criteriosExclusión": true,
    "reproducible": true,
    "cubrePICO": true
  }
}`,
    minimumScore: 75
  },

  6: {
    itemNumber: 6,
    section: "MÉTODOS",
    topic: "Fuentes de información",
    prismaCriteria: [
      "Especifica las bases de datos electrónicas consultadas",
      "Incluye las fechas de búsqueda",
      "Menciona otras fuentes si se utilizaron"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa fuentes de información.",
    validationTemplate: `Evaluar FUENTES DE INFORMACIÓN (Ítem 6 PRISMA).

TEXTO:
{content}

DEBE ESPECIFICAR:

1. BASES DE DATOS
   - Nombres completos (PubMed, IEEE, Scopus, etc.)
   - Mínimo 2-3 bases

2. FECHAS
   - Cuándo se realizó la búsqueda
   - Rango de años cubierto

3. OTRAS FUENTES (si aplica)
   - Búsqueda manual
   - Contacto con expertos
   - Literatura gris

APROBADO (>85%):
- Lista completa de bases (2+)
- Fechas claras
- Otras fuentes si se usaron

NECESITA_MEJORAS (50-85%):
- Faltan fechas
- Solo 1 base
- Nombres ambiguos

RECHAZADO (<50%):
- No especifica bases
- Muy vago

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 92,
  "reasoning": "Bases, fechas y búsqueda complementaria especificadas",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "listaBasesDatos": true,
    "fechasBusqueda": true,
    "otrasFuentes": true,
    "minimo2Bases": true
  }
}`,
    minimumScore: 70
  },

  7: {
    itemNumber: 7,
    section: "MÉTODOS",
    topic: "Estrategia de búsqueda",
    prismaCriteria: [
      "Presenta la cadena de búsqueda completa para al menos una base de datos",
      "Especifica los límites y filtros aplicados",
      "Menciona cómo se adaptó la búsqueda para otras bases"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa estrategias de búsqueda.",
    validationTemplate: `Evaluar ESTRATEGIA DE BÚSQUEDA (Ítem 7 PRISMA).

TEXTO:
{content}

DEBE INCLUIR:

1. CADENA COMPLETA (al menos 1 base)
   - Términos de búsqueda
   - Operadores booleanos (AND, OR, NOT)
   - Campos buscados

2. LÍMITES Y FILTROS
   - Idioma
   - Tipo de documento
   - Fecha
   - Otros límites

3. ADAPTACIONES
   - Mención de adaptación para otras bases

APROBADO (>85%):
- Cadena completa mostrada
- Límites especificados
- Reproducible

NECESITA_MEJORAS (50-85%):
- Cadena incompleta
- Faltan límites
- Poco clara adaptación

RECHAZADO (<50%):
- No muestra cadena
- No reproducible

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 95,
  "reasoning": "Cadena completa con operadores y límites",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "cadenaCompleta": true,
    "operadores": true,
    "limites": true,
    "adaptaciones": true
  }
}`,
    minimumScore: 75
  },

  3: {
    itemNumber: 3,
    section: "INTRODUCCIÓN",
    topic: "Justificación",
    prismaCriteria: [
      "Explica la importancia de la revisión",
      "Identifica gaps en el conocimiento actual",
      "Menciona la relevancia práctica o teórica"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa justificaciones de revisiones sistemáticas.",
    validationTemplate: `Evaluar JUSTIFICACIÓN (Ítem 3 PRISMA).

TEXTO:
{content}

DEBE INCLUIR:

1. IMPORTANCIA
   - Por qué es necesaria esta revisión
   - Problema o gap que aborda

2. CONTEXTO ACTUAL
   - Estado del conocimiento
   - Qué falta o necesita actualización

3. RELEVANCIA
   - Implicaciones prácticas
   - Contribución esperada

APROBADO (>85%):
- Justificación clara y convincente
- Gap identificado
- Relevancia evidente

NECESITA_MEJORAS (50-85%):
- Justificación vaga
- Gap no claro
- Relevancia implícita

RECHAZADO (<50%):
- Sin justificación real
- No explica necesidad

RESPONDE JSON:
{
  "decision": "APROBADO | NECESITA_MEJORAS | RECHAZADO",
  "score": 80,
  "reasoning": "Explicación",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "explicaImportancia": true,
    "identificaGap": true,
    "mencionaRelevancia": true
  }
}`,
    minimumScore: 70
  },

  4: {
    itemNumber: 4,
    section: "INTRODUCCIÓN",
    topic: "Objetivos",
    prismaCriteria: [
      "Objetivo principal claramente establecido",
      "Pregunta de investigación explícita",
      "Objetivos específicos si aplica"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa objetivos de investigación.",
    validationTemplate: `Evaluar OBJETIVOS (Ítem 4 PRISMA).

TEXTO:
{content}

DEBE INCLUIR:

1. OBJETIVO PRINCIPAL
   - Qué busca la revisión
   - Verbo claro (identificar, evaluar, comparar, sintetizar)

2. PREGUNTA DE INVESTIGACIÓN
   - Formulación explícita
   - Puede seguir formato PICO

3. OBJETIVOS ESPECÍFICOS (opcional)
   - Desglose del objetivo principal

APROBADO (>85%):
- Objetivo principal claro
- Pregunta explícita
- Específico y medible

NECESITA_MEJORAS (50-85%):
- Objetivo vago
- Pregunta implícita
- Poco específico

RECHAZADO (<50%):
- Sin objetivo claro
- Ambiguo

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 90,
  "reasoning": "Objetivo claro y pregunta bien formulada",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "objetivoPrincipal": true,
    "preguntaExplicita": true,
    "especifico": true
  }
}`,
    minimumScore: 70
  },

  8: {
    itemNumber: 8,
    section: "MÉTODOS",
    topic: "Proceso de selección",
    prismaCriteria: [
      "Describe el proceso de screening",
      "Menciona revisión independiente por dos autores",
      "Explica resolución de desacuerdos"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa procesos de selección.",
    validationTemplate: `Evaluar PROCESO DE SELECCIÓN (Ítem 8 PRISMA).

TEXTO:
{content}

DEBE INCLUIR:

1. SCREENING
   - Revisión de títulos/abstracts
   - Revisión de textos completos
   - Fases claramente descritas

2. REVISORES INDEPENDIENTES
   - Dos o más revisores
   - Trabajo independiente

3. RESOLUCIÓN DE CONFLICTOS
   - Método para desacuerdos
   - Consenso o tercer revisor

APROBADO (>85%):
- Proceso detallado
- Revisión independiente
- Resolución clara

NECESITA_MEJORAS (50-85%):
- Proceso vago
- No menciona independencia
- Resolución no clara

RECHAZADO (<50%):
- Proceso no descrito
- Un solo revisor

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 88,
  "reasoning": "Proceso completo con revisión dual",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "describeFases": true,
    "revisionIndependiente": true,
    "resolucionConflictos": true
  }
}`,
    minimumScore: 75
  },

  9: {
    itemNumber: 9,
    section: "MÉTODOS",
    topic: "Proceso de extracción de datos",
    prismaCriteria: [
      "Describe cómo se extrajeron los datos",
      "Menciona formularios o plantillas usadas",
      "Indica si hubo pilotaje"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa extracción de datos.",
    validationTemplate: `Evaluar EXTRACCIÓN DE DATOS (Ítem 9 PRISMA).

TEXTO:
{content}

DEBE INCLUIR:

1. MÉTODO DE EXTRACCIÓN
   - Cómo se extrajeron datos
   - Quién extrajo (uno o más revisores)

2. HERRAMIENTAS
   - Formulario estandarizado
   - Software usado (Excel, Covidence, etc.)

3. PILOTAJE/VALIDACIÓN
   - Prueba piloto del formulario
   - Ajustes realizados

APROBADO (>85%):
- Método claro
- Herramientas especificadas
- Pilotaje mencionado

NECESITA_MEJORAS (50-85%):
- Método vago
- Sin herramientas claras
- Sin pilotaje

RECHAZADO (<50%):
- No describe proceso
- Muy incompleto

RESPONDE JSON:
{
  "decision": "NECESITA_MEJORAS",
  "score": 65,
  "reasoning": "Describe extracción pero sin pilotaje",
  "issues": ["No menciona pilotaje"],
  "suggestions": ["Agregar: 'Se piloteó con 5 estudios'"],
  "criteriaChecklist": {
    "metodoExtraccion": true,
    "herramientas": true,
    "pilotaje": false
  }
}`,
    minimumScore: 70
  },

  10: {
    itemNumber: 10,
    section: "MÉTODOS",
    topic: "Lista de datos",
    prismaCriteria: [
      "Define qué datos se buscaron/extrajeron",
      "Lista variables específicas",
      "Menciona outcomes primarios y secundarios"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa definición de datos.",
    validationTemplate: `Evaluar LISTA DE DATOS (Ítem 10 PRISMA).

TEXTO:
{content}

DEBE LISTAR:

1. DATOS BIBLIOGRÁFICOS
   - Autor, año, título, revista

2. CARACTERÍSTICAS DEL ESTUDIO
   - Diseño, contexto, muestra

3. VARIABLES/OUTCOMES
   - Outcomes primarios
   - Outcomes secundarios
   - Medidas de efecto

APROBADO (>85%):
- Lista completa y específica
- Variables claras
- Outcomes definidos

NECESITA_MEJORAS (50-85%):
- Lista parcial
- Variables vagas
- Outcomes no claros

RECHAZADO (<50%):
- No lista datos
- Muy vago

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 85,
  "reasoning": "Lista completa de variables y outcomes",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "datosBibliograficos": true,
    "caracteristicasEstudio": true,
    "outcomes": true
  }
}`,
    minimumScore: 70
  },

  11: {
    itemNumber: 11,
    section: "MÉTODOS",
    topic: "Riesgo de sesgo en estudios individuales",
    prismaCriteria: [
      "Especifica la herramienta/escala usada",
      "Describe el proceso de evaluación",
      "Menciona dominios evaluados"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa evaluación de riesgo de sesgo.",
    validationTemplate: `Evaluar RIESGO DE SESGO (Ítem 11 PRISMA).

TEXTO:
{content}

DEBE INCLUIR:

1. HERRAMIENTA
   - Nombre (Cochrane RoB 2, Newcastle-Ottawa, etc.)
   - Apropiada para tipo de estudio

2. PROCESO
   - Quién evaluó
   - Cómo se resolvieron desacuerdos

3. DOMINIOS
   - Áreas evaluadas (selección, desempeño, etc.)

APROBADO (>85%):
- Herramienta específica
- Proceso descrito
- Dominios listados

NECESITA_MEJORAS (50-85%):
- Herramienta vaga
- Proceso incompleto
- Dominios no claros

RECHAZADO (<50%):
- No especifica herramienta
- Sin descripción

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 90,
  "reasoning": "Herramienta y proceso bien especificados",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "herramienta": true,
    "procesoDescrito": true,
    "dominios": true
  }
}`,
    minimumScore: 75
  },

  12: {
    itemNumber: 12,
    section: "MÉTODOS",
    topic: "Medidas de efecto",
    prismaCriteria: [
      "Especifica las medidas usadas",
      "Explica por qué se eligieron",
      "Menciona análisis de subgrupos si aplica"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa medidas de efecto.",
    validationTemplate: `Evaluar MEDIDAS DE EFECTO (Ítem 12 PRISMA).

TEXTO:
{content}

DEBE ESPECIFICAR:

1. MEDIDAS
   - Risk Ratio, Odds Ratio, Mean Difference, etc.
   - Intervalos de confianza

2. JUSTIFICACIÓN
   - Por qué esas medidas
   - Apropiadas para los datos

3. ANÁLISIS ADICIONALES
   - Subgrupos
   - Sensibilidad

APROBADO (>85%):
- Medidas específicas
- Justificación clara
- Análisis mencionados

NECESITA_MEJORAS (50-85%):
- Medidas vagas
- Sin justificación
- Análisis no claros

RECHAZADO (<50%):
- No especifica medidas
- Muy incompleto

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 87,
  "reasoning": "Medidas claras y justificadas",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "medidasEspecificas": true,
    "justificacion": true,
    "analisisAdicionales": true
  }
}`,
    minimumScore: 70
  },

  13: {
    itemNumber: 13,
    section: "MÉTODOS",
    topic: "Métodos de síntesis",
    prismaCriteria: [
      "Describe el método de síntesis (narrativo, meta-análisis)",
      "Explica modelo estadístico si aplica",
      "Justifica el método elegido"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa métodos de síntesis.",
    validationTemplate: `Evaluar MÉTODOS DE SÍNTESIS (Ítem 13 PRISMA).

TEXTO:
{content}

DEBE DESCRIBIR:

1. TIPO DE SÍNTESIS
   - Narrativa/cualitativa
   - Meta-análisis cuantitativo
   - Mixta

2. MODELO ESTADÍSTICO (si meta-análisis)
   - Efectos fijos o aleatorios
   - Software usado (RevMan, R, etc.)

3. JUSTIFICACIÓN
   - Por qué ese método
   - Heterogeneidad considerada

APROBADO (>85%):
- Método claro
- Justificación
- Detalles técnicos

NECESITA_MEJORAS (50-85%):
- Método vago
- Sin justificación
- Falta detalle

RECHAZADO (<50%):
- No describe síntesis
- Muy incompleto

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 92,
  "reasoning": "Método y modelo bien descritos",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "tipoSintesis": true,
    "modeloEstadistico": true,
    "justificacion": true
  }
}`,
    minimumScore: 75
  },

  14: {
    itemNumber: 14,
    section: "MÉTODOS",
    topic: "Sesgo de reporte",
    prismaCriteria: [
      "Describe cómo se evaluó el sesgo de publicación",
      "Menciona herramientas usadas (funnel plot, test de Egger)",
      "Indica umbral mínimo de estudios"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa evaluación de sesgo de reporte.",
    validationTemplate: `Evaluar SESGO DE REPORTE (Ítem 14 PRISMA).

TEXTO:
{content}

DEBE INCLUIR:

1. MÉTODO DE EVALUACIÓN
   - Funnel plot
   - Tests estadísticos (Egger, Begg)

2. APLICABILIDAD
   - Número mínimo de estudios
   - Cuándo se aplicó

3. LIMITACIONES
   - Reconocimiento de limitaciones del método

APROBADO (>85%):
- Método especificado
- Aplicabilidad clara
- Limitaciones reconocidas

NECESITA_MEJORAS (50-85%):
- Método vago
- No especifica cuándo aplica
- Sin limitaciones

RECHAZADO (<50%):
- No evalúa sesgo de reporte
- O no aplicable y no justifica

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 85,
  "reasoning": "Método claro con limitaciones",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "metodoEvaluacion": true,
    "aplicabilidad": true,
    "limitaciones": true
  }
}`,
    minimumScore: 70
  },

  15: {
    itemNumber: 15,
    section: "MÉTODOS",
    topic: "Certeza de la evidencia",
    prismaCriteria: [
      "Especifica el sistema usado (GRADE, etc.)",
      "Describe los criterios evaluados",
      "Menciona quién realizó la evaluación"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa evaluación de certeza de evidencia.",
    validationTemplate: `Evaluar CERTEZA DE LA EVIDENCIA (Ítem 15 PRISMA).

TEXTO:
{content}

DEBE ESPECIFICAR:

1. SISTEMA
   - GRADE (recomendado)
   - Otro sistema validado

2. CRITERIOS
   - Riesgo de sesgo
   - Inconsistencia
   - Imprecisión
   - Indirección
   - Sesgo de publicación

3. PROCESO
   - Quién evaluó
   - Cómo se resolvieron desacuerdos

APROBADO (>85%):
- Sistema específico (GRADE)
- Criterios descritos
- Proceso claro

NECESITA_MEJORAS (50-85%):
- Sistema vago
- Criterios incompletos
- Proceso no claro

RECHAZADO (<50%):
- No evalúa certeza
- Sin sistema definido

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 90,
  "reasoning": "GRADE aplicado correctamente",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "sistemaEspecifico": true,
    "criteriosDescrito": true,
    "procesoClaro": true
  }
}`,
    minimumScore: 75
  },

  16: {
    itemNumber: 16,
    section: "RESULTADOS",
    topic: "Selección de estudios",
    prismaCriteria: [
      "Número de estudios en cada fase",
      "Razones de exclusión",
      "Diagrama de flujo PRISMA"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa reporte de selección de estudios.",
    validationTemplate: `Evaluar SELECCIÓN DE ESTUDIOS (Ítem 16 PRISMA).

TEXTO:
{content}

DEBE REPORTAR:

1. NÚMEROS EN CADA FASE
   - Registros identificados
   - Títulos/abstracts screened
   - Textos completos evaluados
   - Estudios incluidos

2. EXCLUSIONES
   - Número excluido en cada fase
   - Razones principales de exclusión

3. DIAGRAMA DE FLUJO
   - Mención o inclusión de diagrama PRISMA

APROBADO (>85%):
- Números completos
- Razones de exclusión
- Diagrama mencionado

NECESITA_MEJORAS (50-85%):
- Números incompletos
- Razones vagas
- Sin diagrama

RECHAZADO (<50%):
- No reporta números
- Muy incompleto

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 93,
  "reasoning": "Reporte completo con todas las fases",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "numerosCompletos": true,
    "razonesExclusion": true,
    "diagramaFlujo": true
  }
}`,
    minimumScore: 75
  },

  17: {
    itemNumber: 17,
    section: "RESULTADOS",
    topic: "Características de los estudios",
    prismaCriteria: [
      "Describe características de cada estudio incluido",
      "Presenta datos en tabla",
      "Incluye población, diseño, outcomes"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa descripción de características.",
    validationTemplate: `Evaluar CARACTERÍSTICAS DE ESTUDIOS (Ítem 17 PRISMA).

TEXTO:
{content}

DEBE PRESENTAR:

1. TABLA DE CARACTERÍSTICAS
   - Autor, año
   - Diseño del estudio
   - Población/muestra
   - Intervención/exposición
   - Outcomes medidos

2. DESCRIPCIÓN NARRATIVA
   - Resumen de características
   - Rangos y patrones

3. COMPLETITUD
   - Todos los estudios incluidos descritos

APROBADO (>85%):
- Tabla completa
- Descripción narrativa
- Todos los estudios

NECESITA_MEJORAS (50-85%):
- Tabla incompleta
- Descripción vaga
- Faltan estudios

RECHAZADO (<50%):
- No describe características
- Muy incompleto

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 88,
  "reasoning": "Tabla completa con descripción",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "tablaCaracteristicas": true,
    "descripcionNarrativa": true,
    "completitud": true
  }
}`,
    minimumScore: 75
  },

  18: {
    itemNumber: 18,
    section: "RESULTADOS",
    topic: "Riesgo de sesgo en los estudios",
    prismaCriteria: [
      "Presenta resultados de evaluación de sesgo",
      "Usa gráficos o tablas",
      "Describe patrones generales"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa reporte de riesgo de sesgo.",
    validationTemplate: `Evaluar RIESGO DE SESGO EN ESTUDIOS (Ítem 18 PRISMA).

TEXTO:
{content}

DEBE PRESENTAR:

1. RESULTADOS POR ESTUDIO
   - Evaluación de cada estudio
   - Por dominio

2. VISUALIZACIÓN
   - Gráfico de riesgo de sesgo
   - Tabla resumen

3. DESCRIPCIÓN
   - Patrones generales
   - Dominios problemáticos
   - Calidad general

APROBADO (>85%):
- Resultados completos
- Gráfico/tabla
- Descripción clara

NECESITA_MEJORAS (50-85%):
- Resultados parciales
- Sin visualización
- Descripción vaga

RECHAZADO (<50%):
- No presenta resultados
- Muy incompleto

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 90,
  "reasoning": "Resultados completos con gráficos",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "resultadosPorEstudio": true,
    "visualizacion": true,
    "descripcionPatrones": true
  }
}`,
    minimumScore: 75
  },

  19: {
    itemNumber: 19,
    section: "RESULTADOS",
    topic: "Resultados de estudios individuales",
    prismaCriteria: [
      "Presenta resultados de cada estudio",
      "Incluye medidas de efecto e intervalos de confianza",
      "Usa forest plot si aplica"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa reporte de resultados individuales.",
    validationTemplate: `Evaluar RESULTADOS INDIVIDUALES (Ítem 19 PRISMA).

TEXTO:
{content}

DEBE PRESENTAR:

1. RESULTADOS POR ESTUDIO
   - Cada estudio incluido
   - Outcome principal

2. MEDIDAS DE EFECTO
   - Estimación puntual
   - Intervalo de confianza
   - Valor p si relevante

3. FOREST PLOT (si meta-análisis)
   - Visualización gráfica
   - Todos los estudios

APROBADO (>85%):
- Resultados completos
- Medidas con IC
- Forest plot si aplica

NECESITA_MEJORAS (50-85%):
- Resultados parciales
- Sin IC
- Forest plot faltante

RECHAZADO (<50%):
- No presenta resultados
- Muy incompleto

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 91,
  "reasoning": "Resultados completos con IC y forest plot",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "resultadosPorEstudio": true,
    "medidasEfectoIC": true,
    "forestPlot": true
  }
}`,
    minimumScore: 75
  },

  20: {
    itemNumber: 20,
    section: "RESULTADOS",
    topic: "Resultados de síntesis",
    prismaCriteria: [
      "Presenta resultados agregados/sintetizados",
      "Incluye medidas de heterogeneidad si aplica",
      "Describe hallazgos principales"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa síntesis de resultados.",
    validationTemplate: `Evaluar RESULTADOS DE SÍNTESIS (Ítem 20 PRISMA).

TEXTO:
{content}

DEBE PRESENTAR:

1. RESULTADOS AGREGADOS
   - Efecto combinado si meta-análisis
   - Síntesis narrativa si cualitativo

2. HETEROGENEIDAD (si meta-análisis)
   - I² estadístico
   - Chi-cuadrado
   - Interpretación

3. HALLAZGOS PRINCIPALES
   - Resumen claro
   - Dirección del efecto
   - Magnitud

APROBADO (>85%):
- Síntesis completa
- Heterogeneidad si aplica
- Hallazgos claros

NECESITA_MEJORAS (50-85%):
- Síntesis incompleta
- Sin heterogeneidad
- Hallazgos vagos

RECHAZADO (<50%):
- No sintetiza resultados
- Muy incompleto

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 89,
  "reasoning": "Síntesis completa con heterogeneidad",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "resultadosAgregados": true,
    "heterogeneidad": true,
    "hallazgosPrincipales": true
  }
}`,
    minimumScore: 75
  },

  21: {
    itemNumber: 21,
    section: "RESULTADOS",
    topic: "Sesgo de reporte (resultados)",
    prismaCriteria: [
      "Presenta evaluación de sesgo de publicación",
      "Interpreta resultados de tests",
      "Discute limitaciones"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa reporte de sesgo de publicación.",
    validationTemplate: `Evaluar SESGO DE REPORTE - RESULTADOS (Ítem 21 PRISMA).

TEXTO:
{content}

DEBE PRESENTAR:

1. RESULTADOS DE EVALUACIÓN
   - Funnel plot (si 10+ estudios)
   - Tests estadísticos
   - Interpretación

2. HALLAZGOS
   - Presencia o ausencia de sesgo
   - Magnitud si detectado

3. LIMITACIONES
   - Limitaciones de los métodos
   - Baja potencia si <10 estudios

APROBADO (>85%):
- Evaluación presentada
- Interpretación clara
- Limitaciones discutidas

NECESITA_MEJORAS (50-85%):
- Evaluación incompleta
- Interpretación vaga
- Sin limitaciones

RECHAZADO (<50%):
- No presenta evaluación
- O no aplicable sin justificación

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 86,
  "reasoning": "Evaluación completa con limitaciones",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "presentaEvaluacion": true,
    "interpretacion": true,
    "limitaciones": true
  }
}`,
    minimumScore: 70
  },

  22: {
    itemNumber: 22,
    section: "RESULTADOS",
    topic: "Certeza de la evidencia (resultados)",
    prismaCriteria: [
      "Presenta evaluación GRADE u otro sistema",
      "Muestra nivel de certeza por outcome",
      "Justifica decisiones de downgrade/upgrade"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa reporte de certeza.",
    validationTemplate: `Evaluar CERTEZA DE LA EVIDENCIA - RESULTADOS (Ítem 22 PRISMA).

TEXTO:
{content}

DEBE PRESENTAR:

1. EVALUACIÓN POR OUTCOME
   - Nivel de certeza (alta, moderada, baja, muy baja)
   - Cada outcome crítico

2. JUSTIFICACIÓN
   - Razones para downgrade
   - Razones para upgrade si aplica

3. TABLA SUMMARY OF FINDINGS
   - Tabla SoF GRADE
   - O equivalente

APROBADO (>85%):
- Evaluación completa
- Justificaciones claras
- Tabla SoF

NECESITA_MEJORAS (50-85%):
- Evaluación incompleta
- Justificaciones vagas
- Sin tabla

RECHAZADO (<50%):
- No evalúa certeza
- Muy incompleto

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 92,
  "reasoning": "GRADE completo con SoF table",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "evaluacionPorOutcome": true,
    "justificaciones": true,
    "tablaSoF": true
  }
}`,
    minimumScore: 75
  },

  23: {
    itemNumber: 23,
    section: "DISCUSIÓN",
    topic: "Interpretación",
    prismaCriteria: [
      "Interpreta hallazgos principales",
      "Considera limitaciones",
      "Discute implicaciones prácticas y teóricas"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa discusión e interpretación.",
    validationTemplate: `Evaluar DISCUSIÓN/INTERPRETACIÓN (Ítem 23 PRISMA).

TEXTO:
{content}

DEBE INCLUIR:

1. INTERPRETACIÓN DE HALLAZGOS
   - Qué significan los resultados
   - Contexto de evidencia previa

2. LIMITACIONES
   - Del cuerpo de evidencia
   - Del proceso de revisión

3. IMPLICACIONES
   - Para la práctica
   - Para la investigación futura
   - Para políticas si aplica

APROBADO (>85%):
- Interpretación clara
- Limitaciones discutidas
- Implicaciones específicas

NECESITA_MEJORAS (50-85%):
- Interpretación vaga
- Limitaciones genéricas
- Implicaciones superficiales

RECHAZADO (<50%):
- No interpreta
- Sin limitaciones
- Sin implicaciones

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 87,
  "reasoning": "Discusión completa y balanceada",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "interpretaHallazgos": true,
    "consideraLimitaciones": true,
    "discuteImplicaciones": true
  }
}`,
    minimumScore: 70
  },

  24: {
    itemNumber: 24,
    section: "OTRA INFORMACIÓN",
    topic: "Registro y protocolo",
    prismaCriteria: [
      "Indica dónde se puede acceder al protocolo",
      "Número de registro (PROSPERO, etc.)",
      "Menciona desviaciones del protocolo si las hubo"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa registro y protocolo.",
    validationTemplate: `Evaluar REGISTRO Y PROTOCOLO (Ítem 24 PRISMA).

TEXTO:
{content}

DEBE INCLUIR:

1. REGISTRO
   - Número de registro
   - Plataforma (PROSPERO, OSF, etc.)
   - URL o identificador

2. PROTOCOLO
   - Dónde acceder
   - Publicación si aplica

3. DESVIACIONES
   - Cambios respecto al protocolo
   - Justificación de cambios

APROBADO (>85%):
- Registro especificado
- Acceso a protocolo claro
- Desviaciones mencionadas si aplican

NECESITA_MEJORAS (50-85%):
- Registro vago
- Acceso no claro
- No menciona desviaciones

RECHAZADO (<50%):
- No registrado
- Sin protocolo
- Sin justificación

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 90,
  "reasoning": "Registro PROSPERO con acceso al protocolo",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "numeroRegistro": true,
    "accesoProtocolo": true,
    "desviaciones": true
  }
}`,
    minimumScore: 75
  },

  25: {
    itemNumber: 25,
    section: "OTRA INFORMACIÓN",
    topic: "Financiamiento",
    prismaCriteria: [
      "Especifica fuentes de financiamiento",
      "Menciona rol de financiadores",
      "Declara si no hubo financiamiento"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa declaración de financiamiento.",
    validationTemplate: `Evaluar FINANCIAMIENTO (Ítem 25 PRISMA).

TEXTO:
{content}

DEBE DECLARAR:

1. FUENTES
   - Quién financió (organización, grant)
   - Número de grant si aplica

2. ROL DE FINANCIADORES
   - Participación en diseño/análisis
   - O declarar no participación

3. AUTO-FINANCIADO
   - Si no hubo financiamiento externo, declararlo

APROBADO (>85%):
- Fuentes especificadas claramente
- Rol descrito
- O "sin financiamiento" declarado

NECESITA_MEJORAS (50-85%):
- Fuentes vagas
- Rol no claro
- Ambiguo

RECHAZADO (<50%):
- No declara financiamiento
- Omite información

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 88,
  "reasoning": "Financiamiento y rol claramente declarados",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "fuentesEspecificadas": true,
    "rolDescrito": true,
    "declaracionCompleta": true
  }
}`,
    minimumScore: 70
  },

  26: {
    itemNumber: 26,
    section: "OTRA INFORMACIÓN",
    topic: "Conflictos de interés",
    prismaCriteria: [
      "Declara conflictos de interés de autores",
      "Especifica naturaleza de conflictos",
      "O declara ausencia de conflictos"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa declaración de conflictos.",
    validationTemplate: `Evaluar CONFLICTOS DE INTERÉS (Ítem 26 PRISMA).

TEXTO:
{content}

DEBE DECLARAR:

1. POR AUTOR
   - Conflictos de cada autor
   - O ausencia individual

2. NATURALEZA
   - Financieros
   - Académicos
   - Personales
   - Tipo específico

3. DECLARACIÓN COMPLETA
   - Todos los autores cubiertos
   - O "ningún conflicto" explícito

APROBADO (>85%):
- Declaración completa
- Por autor
- Naturaleza especificada o "ninguno"

NECESITA_MEJORAS (50-85%):
- Declaración genérica
- No por autor
- Vaga

RECHAZADO (<50%):
- No declara conflictos
- Omite información

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 85,
  "reasoning": "Conflictos declarados por autor",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "declaracionPorAutor": true,
    "naturalezaEspecificada": true,
    "completa": true
  }
}`,
    minimumScore: 70
  },

  27: {
    itemNumber: 27,
    section: "OTRA INFORMACIÓN",
    topic: "Disponibilidad de datos, código y materiales",
    prismaCriteria: [
      "Indica dónde acceder a datos",
      "Menciona código de análisis si aplica",
      "Especifica limitaciones de acceso si las hay"
    ],
    systemPrompt: "Eres evaluador experto en PRISMA 2020. Evalúa disponibilidad de datos.",
    validationTemplate: `Evaluar DISPONIBILIDAD DE DATOS (Ítem 27 PRISMA).

TEXTO:
{content}

DEBE ESPECIFICAR:

1. DATOS
   - Dónde acceder (repositorio, URL)
   - Formatos disponibles

2. CÓDIGO/SCRIPTS
   - Scripts de análisis
   - Software usado

3. LIMITACIONES
   - Restricciones de acceso
   - Razones si no disponible

APROBADO (>85%):
- Datos disponibles con ubicación
- Código si aplica
- O razones válidas de no disponibilidad

NECESITA_MEJORAS (50-85%):
- Ubicación vaga
- Sin código
- Limitaciones no claras

RECHAZADO (<50%):
- No menciona disponibilidad
- Sin acceso ni justificación

RESPONDE JSON:
{
  "decision": "APROBADO",
  "score": 90,
  "reasoning": "Datos y código disponibles en OSF",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "datosDisponibles": true,
    "codigoDisponible": true,
    "limitacionesEspecificadas": true
  }
}`,
    minimumScore: 70
  }
};

/**
 * Obtener configuración de validación para un ítem específico
 */
function getValidationPrompt(itemNumber) {
  const config = PRISMA_VALIDATION_PROMPTS[itemNumber];
  if (!config) {
    throw new Error(`No existe configuración de validación para el ítem ${itemNumber}`);
  }
  return config;
}

/**
 * Construir prompt completo con el contenido del usuario
 */
function buildValidationPrompt(itemNumber, content) {
  const config = getValidationPrompt(itemNumber);
  return {
    systemPrompt: config.systemPrompt,
    userPrompt: config.validationTemplate.replace('{content}', content),
    minimumScore: config.minimumScore
  };
}

/**
 * Validar respuesta JSON de la IA
 */
function validateAIResponse(response, itemNumber) {
  const required = ['decision', 'score', 'reasoning', 'issues', 'suggestions', 'criteriaChecklist'];
  const missing = required.filter(field => !(field in response));
  
  if (missing.length > 0) {
    throw new Error(`Respuesta de IA inválida. Faltan campos: ${missing.join(', ')}`);
  }
  
  const validDecisions = ['APROBADO', 'NECESITA_MEJORAS', 'RECHAZADO'];
  if (!validDecisions.includes(response.decision)) {
    throw new Error(`Decisión inválida: ${response.decision}. Debe ser: ${validDecisions.join(' | ')}`);
  }
  
  if (typeof response.score !== 'number' || response.score < 0 || response.score > 100) {
    throw new Error(`Score inválido: ${response.score}. Debe ser 0-100`);
  }
  
  return true;
}

module.exports = {
  PRISMA_VALIDATION_PROMPTS,
  getValidationPrompt,
  buildValidationPrompt,
  validateAIResponse
};
