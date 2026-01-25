# ANEXO B: PROMPTS DEL GATEKEEPER DE VALIDACIÓN PRISMA

**Fecha**: Enero 25, 2026  
**Autores**: Stefanny Mishel Hernández Buenaño, Adriana Pamela González Orellana  
**Tutor**: Ing. Paulo César Galarza Sánchez, MSc.  
**Institución**: Universidad de las Fuerzas Armadas ESPE

> **Sistema de Validación IA para Cumplimiento PRISMA 2020**  
> 27 Prompts Especializados para Validación Automática con OpenAI ChatGPT

---

## 📋 ÍNDICE DE ÍTEMS PRISMA

| # | Sección | Ítem | Página |
|---|---------|------|--------|
| 1 | TÍTULO | Identificación como revisión sistemática | [Ver](#ítem-1-título) |
| 2 | RESUMEN | Resumen estructurado | [Ver](#ítem-2-resumen) |
| 3 | INTRODUCCIÓN | Justificación | [Ver](#ítem-3-justificación) |
| 4 | INTRODUCCIÓN | Objetivos | [Ver](#ítem-4-objetivos) |
| 5 | MÉTODOS | Criterios de elegibilidad | [Ver](#ítem-5-criterios-de-elegibilidad) |
| 6 | MÉTODOS | Fuentes de información | [Ver](#ítem-6-fuentes-de-información) |
| 7 | MÉTODOS | Estrategia de búsqueda | [Ver](#ítem-7-estrategia-de-búsqueda) |
| 8 | MÉTODOS | Proceso de selección | [Ver](#ítem-8-proceso-de-selección) |
| 9 | MÉTODOS | Proceso de extracción de datos | [Ver](#ítem-9-extracción-de-datos) |
| 10 | MÉTODOS | Lista de datos | [Ver](#ítem-10-lista-de-datos) |
| 11 | MÉTODOS | Riesgo de sesgo | [Ver](#ítem-11-riesgo-de-sesgo) |
| 12 | MÉTODOS | Medidas de efecto | [Ver](#ítem-12-medidas-de-efecto) |
| 13 | MÉTODOS | Métodos de síntesis | [Ver](#ítem-13-métodos-de-síntesis) |
| 14 | MÉTODOS | Sesgo de reporte | [Ver](#ítem-14-sesgo-de-reporte) |
| 15 | MÉTODOS | Certeza de la evidencia | [Ver](#ítem-15-certeza-de-evidencia) |
| 16 | RESULTADOS | Selección de estudios | [Ver](#ítem-16-selección-de-estudios) |
| 17 | RESULTADOS | Características de estudios | [Ver](#ítem-17-características-de-estudios) |
| 18 | RESULTADOS | Riesgo de sesgo en estudios | [Ver](#ítem-18-riesgo-de-sesgo-estudios) |
| 19 | RESULTADOS | Resultados individuales | [Ver](#ítem-19-resultados-individuales) |
| 20 | RESULTADOS | Resultados de síntesis | [Ver](#ítem-20-resultados-de-síntesis) |
| 21 | RESULTADOS | Sesgo de reporte | [Ver](#ítem-21-sesgo-de-reporte-resultados) |
| 22 | RESULTADOS | Certeza de evidencia | [Ver](#ítem-22-certeza-de-evidencia) |
| 23 | DISCUSIÓN | Interpretación | [Ver](#ítem-23-discusión) |
| 24 | OTRA INFO | Registro y protocolo | [Ver](#ítem-24-registro-y-protocolo) |
| 25 | OTRA INFO | Financiamiento | [Ver](#ítem-25-financiamiento) |
| 26 | OTRA INFO | Conflictos de interés | [Ver](#ítem-26-conflictos-de-interés) |
| 27 | OTRA INFO | Disponibilidad de datos | [Ver](#ítem-27-disponibilidad-de-datos) |

---

## RESUMEN EJECUTIVO

**Estado de implementación:** 27/27 items PRISMA 2020 (100% completado)

**Archivo técnico:** [backend/src/config/prisma-validation-prompts.js](../backend/src/config/prisma-validation-prompts.js)

**Modelo de IA:** OpenAI ChatGPT (gpt-4o-mini)  
**API**: OpenAI Chat Completions API  
**Temperature**: 0.3 (alta precisión para validación)  
**Max tokens**: 1000-1500 por validación  
**Costo estimado**: ~$0.0002-0.0005 por ítem validado

**Formato de respuesta:** JSON estructurado con decision, score, reasoning, issues, suggestions, criteriaChecklist

---

## ITEMS IMPLEMENTADOS

### TITULO Y RESUMEN
- Item 1: Título - IMPLEMENTADO
- Item 2: Resumen estructurado - IMPLEMENTADO

### INTRODUCCIÓN
- Item 3: Justificación - IMPLEMENTADO
- Item 4: Objetivos - IMPLEMENTADO

### MÉTODOS (Items 5-15)
- Item 5: Criterios de elegibilidad - IMPLEMENTADO
- Item 6: Fuentes de información - IMPLEMENTADO
- Item 7: Estrategia de búsqueda - IMPLEMENTADO
- Item 8: Proceso de selección - IMPLEMENTADO
- Item 9: Proceso de extracción de datos - IMPLEMENTADO
- Item 10: Lista de datos - IMPLEMENTADO
- Item 11: Riesgo de sesgo en estudios individuales - IMPLEMENTADO
- Item 12: Medidas de efecto - IMPLEMENTADO
- Item 13: Métodos de síntesis - IMPLEMENTADO
- Item 14: Sesgo de reporte - IMPLEMENTADO
- Item 15: Certeza de la evidencia - IMPLEMENTADO

### RESULTADOS (Items 16-22)
- Item 16: Selección de estudios - IMPLEMENTADO
- Item 17: Características de los estudios - IMPLEMENTADO
- Item 18: Riesgo de sesgo en los estudios - IMPLEMENTADO
- Item 19: Resultados de estudios individuales - IMPLEMENTADO
- Item 20: Resultados de síntesis - IMPLEMENTADO
- Item 21: Sesgo de reporte (resultados) - IMPLEMENTADO
- Item 22: Certeza de la evidencia (resultados) - IMPLEMENTADO

### DISCUSIÓN
- Item 23: Interpretación - IMPLEMENTADO

### OTRA INFORMACIÓN (Items 24-27)
- Item 24: Registro y protocolo - IMPLEMENTADO
- Item 25: Financiamiento - IMPLEMENTADO
- Item 26: Conflictos de interés - IMPLEMENTADO
- Item 27: Disponibilidad de datos - IMPLEMENTADO

---

## SECCIÓN 1: TÍTULO Y RESUMEN

### Ítem 1: TÍTULO

**Criterios PRISMA 2020:**
1. Debe identificar el reporte como una revisión sistemática
2. Puede incluir palabras como "revisión sistemática", "meta-análisis", "scoping review"
3. Debe mencionar el tema o pregunta de investigación

**Prompt de Validación:**

```markdown
Eres un evaluador experto en el estándar PRISMA 2020 para revisiones sistemáticas.

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

⚠️ OPCIONALES (recomendados pero no obligatorios):
- Mencionar población o contexto
- Incluir outcomes esperados
- Especificar tipo de estudios (ej: "ensayos controlados")

EVALUACIÓN POR NIVELES:

APROBADO (100%):
- Cumple los 3 criterios obligatorios
- Título claro y profesional

NECESITA_MEJORAS (50-90%):
- Cumple 2 de 3 criterios obligatorios
- O cumple todos pero con problemas menores (ej: demasiado largo, ambiguo)

RECHAZADO (<50%):
- NO identifica como revisión sistemática
- O tema no claro
- O formato no académico

FORMATO DE RESPUESTA (JSON válido):
{
  "decision": "APROBADO | NECESITA_MEJORAS | RECHAZADO",
  "score": 85,
  "reasoning": "Breve explicación de 2-3 líneas",
  "issues": [
    "Problema específico si aplica"
  ],
  "suggestions": [
    "Sugerencia concreta de mejora"
  ],
  "criteriaChecklist": {
    "identificaComoRevisionSistematica": true,
    "mencionaTema": true,
    "formatoAcademico": true
  }
}

IMPORTANTE:
- Sé estricto con el criterio de "Revisión Sistemática" en el título
- Si dice solo "Revisión de Literatura" sin "Sistemática" → RECHAZADO
- Si cumple lo mínimo pero puede mejorar → NECESITA_MEJORAS con sugerencias
- Responde SOLO con el JSON, sin texto adicional
```

**Ejemplo de Aplicación:**

**Entrada:**
```
"Aplicaciones de Inteligencia Artificial en Educación Superior"
```

**Salida Esperada:**
```json
{
  "decision": "RECHAZADO",
  "score": 30,
  "reasoning": "El título no identifica este trabajo como una revisión sistemática. Aunque el tema es claro, falta la palabra clave 'revisión sistemática' requerida por PRISMA.",
  "issues": [
    "No incluye 'Revisión Sistemática' o términos equivalentes",
    "No queda claro que es un estudio secundario (revisión) vs estudio primario"
  ],
  "suggestions": [
    "Reformular como: 'Aplicaciones de Inteligencia Artificial en Educación Superior: Una Revisión Sistemática'",
    "Alternativa: 'Revisión Sistemática del Uso de IA en Educación Superior'"
  ],
  "criteriaChecklist": {
    "identificaComoRevisionSistematica": false,
    "mencionaTema": true,
    "formatoAcademico": true
  }
}
```

---

### Ítem 2: RESUMEN

**Criterios PRISMA 2020:**
1. Resumen estructurado con secciones: Objetivos, Métodos, Resultados, Conclusiones
2. Debe ser autocontenido (entendible sin leer el artículo completo)
3. Longitud típica: 250-300 palabras

**Prompt de Validación:**

```markdown
Eres un evaluador experto en el estándar PRISMA 2020 para revisiones sistemáticas.

TAREA: Evaluar si el RESUMEN cumple con el Ítem 2 de PRISMA 2020.

RESUMEN A EVALUAR:
{content}

CRITERIOS DE EVALUACIÓN:

✅ OBLIGATORIOS (estructura de resumen académico):

1. OBJETIVO / BACKGROUND
   - Debe incluir la pregunta de investigación o objetivo de la revisión
   - Debe mencionar el problema que motiva la revisión

2. MÉTODOS
   - Bases de datos consultadas (mínimo 2)
   - Criterios de inclusión/exclusión (resumen)
   - Período de búsqueda (años)
   - Número inicial de estudios identificados

3. RESULTADOS
   - Número final de estudios incluidos
   - Principales hallazgos o características de los estudios
   - Outcomes medidos

4. CONCLUSIONES
   - Interpretación de los hallazgos
   - Implicaciones prácticas o para investigación futura
   - (Opcional) Limitaciones principales

⚠️ REQUISITOS ADICIONALES:
- Autocontenido: Debe entenderse sin leer el resto del artículo
- Longitud: 200-400 palabras (flexible)
- Sin referencias bibliográficas en el resumen
- Sin abreviaturas sin definir

EVALUACIÓN POR NIVELES:

APROBADO (>85%):
- Incluye las 4 secciones claramente
- Toda la información clave presente
- Autocontenido y claro

NECESITA_MEJORAS (50-85%):
- Falta 1 sección o está incompleta
- Información presente pero desorganizada
- Falta algún dato clave (ej: número de estudios)

RECHAZADO (<50%):
- Faltan 2+ secciones
- No es autocontenido (hace referencia a "ver sección X")
- Muy breve (<150 palabras) o sin estructura

FORMATO DE RESPUESTA (JSON válido):
{
  "decision": "APROBADO | NECESITA_MEJORAS | RECHAZADO",
  "score": 75,
  "reasoning": "Explicación de 2-3 líneas",
  "issues": [
    "Problema detectado"
  ],
  "suggestions": [
    "Cómo mejorar"
  ],
  "criteriaChecklist": {
    "incluyeObjetivo": true,
    "incluyeMetodos": true,
    "incluyeResultados": false,
    "incluyeConclusiones": true,
    "esAutocontenido": true,
    "longitudAprop": true
  }
}

Responde SOLO con el JSON, sin texto adicional.
```

---

## SECCIÓN 2: INTRODUCCIÓN

### Ítem 3: JUSTIFICACIÓN

**Criterios PRISMA 2020:**
1. Debe explicar la razón fundamental para la revisión
2. Debe mencionar el contexto (qué se conoce sobre el tema)
3. Debe identificar gaps o necesidades no cubiertas

**Prompt de Validación:**

```markdown
Eres un evaluador experto en el estándar PRISMA 2020 para revisiones sistemáticas.

TAREA: Evaluar si la JUSTIFICACIÓN cumple con el Ítem 3 de PRISMA 2020.

TEXTO A EVALUAR:
{content}

CRITERIOS DE EVALUACIÓN:

✅ COMPONENTES OBLIGATORIOS:

1. CONTEXTO / ANTECEDENTES
   - ¿Qué se conoce actualmente sobre el tema?
   - Estado del arte resumido
   - Magnitud del problema (si aplica)

2. GAP / NECESIDAD
   - ¿Qué NO se conoce o no está claro?
   - ¿Qué controversias existen?
   - ¿Por qué es necesaria OTRA revisión sobre este tema?

3. RELEVANCIA
   - ¿Por qué es importante responder esta pregunta?
   - Implicaciones potenciales (práctica, política, investigación)

⚠️ SEÑALES DE ALERTA:
- Justificación genérica sin especificidad
- No menciona revisiones previas (¿por qué esta es necesaria?)
- Solo describe el tema sin justificar la revisión

EVALUACIÓN:

APROBADO (>85%):
- Incluye los 3 componentes claramente
- Argumentación lógica y convincente
- Referencias a literatura existente (implícitas o explícitas)

NECESITA_MEJORAS (50-85%):
- Falta 1 componente o está débil
- Justificación presente pero no convincente
- Puede mejorarse la claridad

RECHAZADO (<50%):
- Falta justificación real (solo describe el tema)
- No explica por qué se necesita la revisión
- Muy breve o genérica

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
    "explicaRelevancia": true,
    "mencionaRevisionesPrevias": false
  }
}
```

---

### Ítem 4: OBJETIVOS

**Criterios PRISMA 2020:**
1. Debe declarar explícitamente el objetivo de la revisión
2. Idealmente en formato PICO (Population, Intervention, Comparison, Outcome)
3. Puede incluir hipótesis o preguntas de investigación específicas

**Prompt de Validación:**

```markdown
Eres un evaluador experto en el estándar PRISMA 2020 para revisiones sistemáticas.

TAREA: Evaluar si los OBJETIVOS cumplen con el Ítem 4 de PRISMA 2020.

TEXTO A EVALUAR:
{content}

CRITERIOS DE EVALUACIÓN:

✅ COMPONENTES OBLIGATORIOS:

1. DECLARACIÓN CLARA DEL OBJETIVO
   - Usar verbos como: "identificar", "evaluar", "sintetizar", "comparar"
   - No ambiguo
   - Específico (no "explorar aspectos generales de...")

2. COMPONENTES PICO (cuando aplique)
   - Population: ¿En quién/qué contexto?
   - Intervention: ¿Qué se está evaluando?
   - Comparison: ¿Contra qué se compara? (opcional)
   - Outcome: ¿Qué se mide/evalúa?

3. ALINEACIÓN CON JUSTIFICACIÓN
   - El objetivo debe responder al gap identificado
   - Coherencia con la pregunta de investigación

⚠️ SEÑALES DE ALERTA:
- Objetivo demasiado amplio ("explorar todo sobre X")
- Múltiples objetivos inconexos
- No queda claro qué se va a evaluar exactamente

EVALUACIÓN:

APROBADO (>85%):
- Objetivo claro y específico
- Componentes PICO identificables (cuando relevante)
- Alineado con la justificación

NECESITA_MEJORAS (50-85%):
- Objetivo presente pero puede ser más específico
- Faltan algunos componentes PICO
- Redacción mejorable

RECHAZADO (<50%):
- Objetivo ausente o extremadamente vago
- No queda claro qué se va a revisar
- Desalineado con la justificación

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
```

---

## SECCIÓN 3: MÉTODOS (Ítems 5-15)

### Ítem 5: CRITERIOS DE ELEGIBILIDAD

**Prompt de Validación:**

```markdown
Eres un evaluador experto en el estándar PRISMA 2020.

TAREA: Evaluar CRITERIOS DE ELEGIBILIDAD (Ítem 5).

TEXTO A EVALUAR:
{content}

CRITERIOS PRISMA 2020:

✅ DEBE INCLUIR:

1. CRITERIOS DE INCLUSIÓN (explícitos)
   - Tipos de estudios (ej: RCTs, observacionales, revisiones)
   - Población/contexto
   - Intervención/fenómeno de interés
   - Outcomes medidos
   - Período temporal (años)
   - Idiomas

2. CRITERIOS DE EXCLUSIÓN (explícitos)
   - Qué tipos de estudios NO se incluyen
   - Poblaciones excluidas
   - Razones de exclusión claras

3. CLARIDAD Y REPRODUCIBILIDAD
   - Otro investigador podría replicar la selección
   - Sin ambigüedades
   - Justificación de decisiones no obvias

EVALUACIÓN:

APROBADO (>85%):
- Inclusión y exclusión bien definidos
- Reproducible
- Cubre todas las dimensiones PICO

NECESITA_MEJORAS (50-85%):
- Falta alguna dimensión (ej: no menciona idiomas)
- Algunos criterios vagos
- Puede mejorarse la claridad

RECHAZADO (<50%):
- Criterios ausentes o muy incompletos
- Ambigüedades que impedirían reproducción
- Solo inclusión O solo exclusión (falta el otro)

FORMATO DE RESPUESTA:
{
  "decision": "APROBADO | NECESITA_MEJORAS | RECHAZADO",
  "score": 88,
  "reasoning": "Los criterios son claros y reproducibles, cubren inclusión/exclusión",
  "issues": [
    "No especifica criterios de idioma explícitamente"
  ],
  "suggestions": [
    "Agregar: 'Se incluyeron estudios en inglés y español'"
  ],
  "criteriaChecklist": {
    "incluyeCriteriosInclusión": true,
    "incluyeCriteriosExclusión": true,
    "esReproducible": true,
    "cubrePICO": true,
    "mencionaIdiomas": false,
    "mencionaPeriodoTemporal": true
  }
}
```

---

### Ítem 6: FUENTES DE INFORMACIÓN

**Prompt de Validación:**

```markdown
Eres un evaluador experto en PRISMA 2020.

TAREA: Evaluar FUENTES DE INFORMACIÓN (Ítem 6).

TEXTO:
{content}

CRITERIOS PRISMA:

✅ DEBE ESPECIFICAR:

1. BASES DE DATOS ELECTRÓNICAS
   - Nombres completos (ej: PubMed, IEEE Xplore, Scopus)
   - Plataforma de acceso (si relevante)
   - Mínimo 2-3 bases recomendadas

2. FECHAS DE BÚSQUEDA
   - Cuándo se realizó cada búsqueda
   - Rango de años cubierto (ej: 2010-2024)

3. OTRAS FUENTES (si aplica)
   - Búsqueda manual en referencias
   - Contacto con expertos
   - Literatura gris

⚠️ NO ES NECESARIO incluir las cadenas de búsqueda aquí (eso es Ítem 7)

EVALUACIÓN:

APROBADO (>85%):
- Lista completa de bases de datos (2+)
- Fechas claras
- Otras fuentes mencionadas si se usaron

NECESITA_MEJORAS (50-85%):
- Faltan fechas específicas
- Solo 1 base de datos (insuficiente)
- Nombres de bases ambiguos

RECHAZADO (<50%):
- No especifica bases de datos
- Información muy vaga o incompleta

RESPUESTA:
{
  "decision": "APROBADO",
  "score": 92,
  "reasoning": "Especifica bases de datos, fechas y búsqueda complementaria",
  "issues": [],
  "suggestions": [
    "Considerar mencionar si se actualizó la búsqueda antes de finalizar"
  ],
  "criteriaChecklist": {
    "listaBasesdeDatos": true,
    "fechasBusqueda": true,
    "otrasFuentes": true,
    "minimo2Bases": true
  }
}
```

---

### Ítem 7: ESTRATEGIA DE BÚSQUEDA

**Prompt de Validación:**

```markdown
Eres un evaluador experto en PRISMA 2020.

TAREA: Evaluar ESTRATEGIA DE BÚSQUEDA (Ítem 7).

TEXTO:
{content}

CRITERIOS PRISMA:

✅ DEBE INCLUIR:

1. CADENA DE BÚSQUEDA COMPLETA
   - Para al menos UNA base de datos (ejemplo completo)
   - Términos de búsqueda (keywords)
   - Operadores booleanos (AND, OR, NOT)
   - Campos buscados (título, abstract, keywords)

2. LÍMITES Y FILTROS
   - Filtros de idioma
   - Filtros de tipo de documento
   - Filtros de fecha
   - Otros límites aplicados

3. ADAPTACIONES
   - Mencionar si se adaptó para otras bases
   - Diferencias según las bases

⚠️ COMÚN: Referir a anexo para cadenas completas de todas las bases

EVALUACIÓN:

APROBADO (>85%):
- Cadena completa mostrada (al menos 1 base)
- Límites especificados
- Reproducible

NECESITA_MEJORAS (50-85%):
- Cadena incompleta o solo términos generales
- Faltan límites/filtros
- Poco claro cómo se adaptó

RECHAZADO (<50%):
- No muestra cadena de búsqueda
- Solo dice "se buscó en X base"
- No reproducible

RESPUESTA:
{
  "decision": "APROBADO",
  "score": 95,
  "reasoning": "Muestra cadena completa con operadores, campos y límites",
  "issues": [],
  "suggestions": [],
  "criteriaChecklist": {
    "muestraCadenaCompleta": true,
    "incluyeOperadores": true,
    "especificaLimites": true,
    "mencionaAdaptaciones": true
  }
}
```

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### Estructura de Datos en el Sistema

```javascript
// backend/src/config/prisma-validation-prompts.js

const PRISMA_VALIDATION_PROMPTS = {
  1: {
    itemNumber: 1,
    section: "TÍTULO",
    topic: "Identificación",
    prismaCriteria: [
      "Identifica el reporte como revisión sistemática",
      "Menciona el tema central",
      "Formato académico apropiado"
    ],
    systemPrompt: "Eres un evaluador experto en PRISMA 2020...",
    validationTemplate: `[El prompt completo del ítem 1]`,
    requiredFields: ["identificaComoRevisionSistematica", "mencionaTema"],
    minimumScore: 70
  },
  
  2: {
    itemNumber: 2,
    // ... prompt del ítem 2
  }
  
  // ... 27 ítems
};

module.exports = PRISMA_VALIDATION_PROMPTS;
```

### Uso en el Controlador

```javascript
// prisma.controller.js - validateWithAI()

const PROMPTS = require('../config/prisma-validation-prompts');

async validateWithAI(req, res) {
  const { itemNumber } = req.params;
  const item = await this.prismaItemRepository.findByNumber(itemNumber);
  
  // Obtener prompt específico
  const promptConfig = PROMPTS[itemNumber];
  
  // Construir prompt con contenido del usuario
  const fullPrompt = promptConfig.validationTemplate.replace(
    '{content}',
    item.content
  );
  
  // Llamar a IA
  const response = await this.aiService.generateText(
    promptConfig.systemPrompt,
    fullPrompt,
    'gemini'
  );
  
  // Parsear JSON
  const validation = JSON.parse(response);
  
  // Guardar resultado
  await this.prismaItemRepository.updateAIValidation(
    projectId,
    itemNumber,
    validation
  );
  
  return res.json({ success: true, data: validation });
}
```

---

## 📊 MÉTRICAS DE VALIDACIÓN

### Criterios de Decisión

| Decision | Score Range | Acción Sistema |
|----------|-------------|----------------|
| **APROBADO** | 85-100% | ✅ Desbloquea siguiente ítem |
| **NECESITA_MEJORAS** | 50-84% | ⚠️ Permite editar, muestra sugerencias |
| **RECHAZADO** | 0-49% | ❌ Requiere reescritura, bloquea siguiente |

### Tracking de Validaciones

```sql
-- Tabla para auditoría
CREATE TABLE prisma_validation_log (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  item_number INT,
  validation_date TIMESTAMP DEFAULT NOW(),
  ai_decision VARCHAR(20), -- APROBADO/NECESITA_MEJORAS/RECHAZADO
  ai_score INT,
  ai_provider VARCHAR(20), -- gemini/chatgpt
  user_override BOOLEAN DEFAULT FALSE,
  override_reason TEXT
);
```

---

## 📝 NOTAS PARA EXPERIMENTACIÓN

### Conjunto de Datos de Validación

Para el experimento (Anexo C), cada ítem necesita:

- **100 ejemplos BUENOS**: Extraídos de RSL publicadas en journals Q1
- **100 ejemplos MALOS**: Creados con errores específicos

**Proceso:**
1. Recolectar textos de RSL reales
2. Etiquetar con experto (gold standard)
3. Ejecutar gatekeeper
4. Comparar: decisión IA vs decisión humana
5. Calcular: Precision, Recall, F1, Accuracy

---

## INFORMACIÓN DEL DOCUMENTO

**Última actualización**: Enero 25, 2026  
**Versión del sistema**: 1.0.0  
**Modelo de IA**: OpenAI ChatGPT (gpt-4o-mini)  
**Backend**: Node.js 20.x, Express 4.18.2  
**Base de datos**: PostgreSQL 15+

**Estado de implementación**:
- ✅ 27/27 prompts PRISMA implementados
- ✅ Validación JSON estructurada
- ✅ Integración con sistema de artículos
- ✅ Tracking de uso de API

**Contacto**:
- Stefanny Hernández: smhernandez2@espe.edu.ec
- Adriana González: apgonzales1@espe.edu.ec
- Tutor: Paulo Galarza - pcgalarza@espe.edu.ec

**Institución**: Universidad de las Fuerzas Armadas ESPE - Departamento de Ciencias de la Computación
