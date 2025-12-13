# 🔬 ANÁLISIS CRÍTICO: Reglas Metodológicas vs Implementación Actual

## ❌ PROBLEMAS IDENTIFICADOS EN EL SISTEMA ACTUAL

### **Problema 1: Prompt Demasiado Simple y Genérico**

**Prompt Actual:**
```javascript
buildPrompt(title, description) {
  return 'Eres experto en PRISMA/Cochrane. Genera JSON con: titulo_propuesto, fase1_marco_pico {marco_pico: {population: {descripcion}, intervention: {descripcion}, comparison: {descripcion}, outcomes: {descripcion}}}, fase2_matriz_es_no_es {elementos: [{pregunta, presente, justificacion}] (7 items), es: [], no_es: [], pregunta_refinada}. Proyecto: ' + title + '. Descripcion: ' + description + '. Responde SOLO JSON valido.';
}
```

**Problemas detectados:**
- ❌ No incluye el **área de conocimiento** (dato crítico del usuario)
- ❌ No incluye el **rango temporal** (años inicio-fin)
- ❌ No proporciona **reglas metodológicas** a la IA
- ❌ No valida **coherencia entre Matriz ES/NO ES y PICO**
- ❌ No asegura las **5 dimensiones mínimas** de ES/NO ES
- ❌ No instruye sobre **validación cruzada**
- ❌ Temperatura muy baja (0.3) puede generar respuestas genéricas

---

## 🎯 REGLAS METODOLÓGICAS QUE DEBE CUMPLIR

### **MATRIZ ES / NO ES**

#### ✅ Regla 1: Derivación directa del tema
**Estado**: ❌ NO VERIFICADA
- Prompt actual no instruye a la IA sobre cómo delimitar el fenómeno
- No hay validación de que ES/NO ES derive del tema ingresado

#### ✅ Regla 2: Correspondencia ES ↔ PICO
**Estado**: ❌ NO IMPLEMENTADA
- No hay instrucción de que todo en "ES" debe reflejarse en PICO
- No hay validación cruzada post-generación

#### ✅ Regla 3: NO ES → Criterios de exclusión
**Estado**: ❌ NO IMPLEMENTADA
- La matriz NO ES se genera, pero no se valida su transformación a criterios
- Falta paso intermedio que convierta NO ES en criterios de exclusión formales

#### ✅ Regla 4: ES = alcance positivo, NO ES = límites
**Estado**: ⚠️ PARCIALMENTE IMPLEMENTADA
- Se generan ambos arrays (es[], no_es[])
- Pero no hay instrucción metodológica sobre su propósito operativo

#### ✅ Regla 5: Sin términos ambiguos
**Estado**: ❌ NO VALIDADA
- No hay instrucción explícita de evitar términos ambiguos
- No hay verificación post-generación

#### ✅ Regla 6: 5 dimensiones mínimas
**Estado**: ❌ NO IMPLEMENTADA
- Prompt no exige las 5 dimensiones:
  1. Tema/tecnología
  2. Método (tipo de estudio)
  3. Contexto/población
  4. Dominio de aplicación
  5. Tipo de evidencia

---

### **RELACIÓN MATRIZ ES/NO ES ↔ PICO**

#### ✅ Regla de integración 1: ES/NO ES define límites; PICO define pregunta
**Estado**: ❌ NO IMPLEMENTADA
- No hay instrucción de que ES marca elementos obligatorios en PICO
- No hay validación de restricciones NO ES en PICO

#### ✅ Regla de integración 2: Cada componente PICO justificado con ES/NO ES
**Estado**: ❌ NO IMPLEMENTADA
- Population (P) no se valida contra ES
- Intervention (I) no se valida contra ES
- Comparison (C) no se valida contra NO ES
- Outcomes (O) no se validan contra ES

#### ✅ Regla de integración 3: NO ES excluido explícitamente
**Estado**: ❌ NO IMPLEMENTADA
- NO ES se genera pero no se usa en fases posteriores
- No se convierte en criterios de exclusión automáticamente

#### ✅ Regla de integración 4: Validación cruzada ES/NO ES ↔ PICO
**Estado**: ❌ NO IMPLEMENTADA
- No existe paso de revisión de consistencia
- No hay verificación automática

#### ✅ Regla de integración 5: Focos temáticos derivan de ES
**Estado**: ❌ NO IMPLEMENTADA
- Focos temáticos se generan en otra fase (generate-protocol-terms)
- No hay conexión explícita con ES

---

## 📋 DATOS DE ENTRADA DEL USUARIO

Según tu descripción, el usuario ingresa:

1. ✅ **Título/Idea** → Se usa
2. ✅ **Descripción** → Se usa
3. ❌ **Área de conocimiento** → **NO SE USA EN EL PROMPT**
4. ❌ **Rango temporal (años)** → **NO SE USA EN EL PROMPT**

**Impacto**: La IA no puede generar ES/NO ES específico del área ni considerar contexto temporal.

---

## 🔧 ELEMENTOS FALTANTES EN EL PROMPT

### 1. **Contexto de Área de Conocimiento**
```
❌ Faltante: "Área disciplinaria: [salud/informática/educación/etc.]"
```
Esto es CRÍTICO porque:
- Define el tipo de metodología esperada (cuantitativa/cualitativa/mixta)
- Determina qué tipo de estudios son válidos
- Orienta la población objetivo

### 2. **Rango Temporal**
```
❌ Faltante: "Publicaciones entre [año_inicio] y [año_fin]"
```
Esto es CRÍTICO porque:
- Define criterios de inclusión/exclusión temporales
- Justifica la relevancia contemporánea del estudio
- Se debe reflejar en Matriz NO ES ("estudios anteriores a X año")

### 3. **Instrucciones Metodológicas para ES/NO ES**
```
❌ Faltante: Instrucción de 5 dimensiones mínimas
❌ Faltante: Validación de términos medibles
❌ Faltante: Formato estructurado
```

### 4. **Validación Cruzada ES/NO ES ↔ PICO**
```
❌ Faltante: Instrucción de coherencia
❌ Faltante: Verificación post-generación
```

### 5. **Matriz de 7 Preguntas de Delimitación**
```
⚠️ Parcial: Se pide "7 items" pero no se especifica QUÉ 7 preguntas
```
Según metodología PRISMA/Cochrane, debería preguntar:
1. ¿Qué fenómeno/tecnología se investiga?
2. ¿En qué población/contexto?
3. ¿Con qué intervención/método?
4. ¿Comparado con qué? (si aplica)
5. ¿Qué resultados se esperan?
6. ¿Qué tipo de estudios se incluyen?
7. ¿Qué evidencia se considera válida?

---

## ✅ PROPUESTA DE MEJORA DEL PROMPT

### **Estructura Propuesta:**

```javascript
buildPrompt({ title, description, area, yearStart, yearEnd }) {
  return `
Eres un experto en metodología PRISMA/Cochrane para revisiones sistemáticas de literatura.

═══════════════════════════════════════════════════════════════
DATOS DEL PROYECTO
═══════════════════════════════════════════════════════════════
• Título: ${title}
• Descripción: ${description}
• Área de conocimiento: ${area || 'No especificada'}
• Rango temporal: ${yearStart || 2019} - ${yearEnd || 2025}

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
- Debe derivar de la descripción del proyecto
- Debe ser ESPECÍFICA y MEDIBLE (ej: "profesionales de TI", "pacientes diabéticos tipo 2")
- Debe estar relacionada con el área: ${area}
- Incluir: rango etario, contexto geográfico/profesional si aplica

🔬 INTERVENTION (I):
- Debe ser la tecnología/método/fenómeno central del título
- Debe ser OPERACIONALIZABLE (se puede buscar en bases de datos)
- Si es tecnología: especificar versión/tipo
- Si es método: especificar características distintivas

⚖️ COMPARISON (C):
- Si NO aplica comparación, indicar: "No se compara con intervención específica"
- Si SÍ aplica: ser explícito (ej: "métodos tradicionales sin IA", "placebo", "estándar de oro")

🎯 OUTCOMES (O):
- Deben ser MEDIBLES y OBSERVABLES en estudios empíricos
- Ejemplos válidos: "rendimiento", "tasa de error", "satisfacción del usuario", "tiempo de respuesta"
- Evitar: "impacto general", "efectividad" (sin especificar qué se mide)

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
Genera exactamente 7 elementos de análisis:
[
  {
    pregunta: "¿Qué fenómeno o tecnología se investiga específicamente?",
    presente: "[respuesta basada en título/descripción]",
    justificacion: "[por qué es relevante para la RSL]"
  },
  {
    pregunta: "¿En qué población o contexto se aplica?",
    presente: "[contexto específico]",
    justificacion: "[conexión con área ${area}]"
  },
  {
    pregunta: "¿Qué tipo de intervención o método se analiza?",
    presente: "[método/tecnología]",
    justificacion: "[operacionalización]"
  },
  {
    pregunta: "¿Se compara con alguna alternativa?",
    presente: "[sí/no y cuál]",
    justificacion: "[relevancia de la comparación]"
  },
  {
    pregunta: "¿Qué resultados o variables se miden?",
    presente: "[outcomes medibles]",
    justificacion: "[por qué estos outcomes]"
  },
  {
    pregunta: "¿Qué tipos de estudios se consideran válidos?",
    presente: "[ej: experimentales, observacionales, revisiones]",
    justificacion: "[adecuación al área ${area}]"
  },
  {
    pregunta: "¿Qué tipo de evidencia se requiere?",
    presente: "[ej: datos cuantitativos, análisis cualitativo]",
    justificacion: "[coherencia metodológica]"
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
        "descripcion": "[P específica, medible, relacionada con ${area}]"
      },
      "intervention": {
        "descripcion": "[I operacionalizable, derivada del título]"
      },
      "comparison": {
        "descripcion": "[C explícita o 'No aplica']"
      },
      "outcomes": {
        "descripcion": "[O medibles y observables]"
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
      "Elemento ES 3 (dimensión: contexto/población)",
      "Elemento ES 4 (dimensión: dominio aplicación)",
      "Elemento ES 5 (dimensión: tipo de evidencia)",
      "Elemento ES 6 (adicional específico)",
      "Elemento ES 7 (adicional específico)"
    ],
    "no_es": [
      "Elemento NO ES 1 (exclusión tema/tecnología fuera de alcance)",
      "Elemento NO ES 2 (exclusión tipo de estudio no válido)",
      "Elemento NO ES 3 (exclusión contexto/población no aplicable)",
      "Elemento NO ES 4 (exclusión dominio fuera de ${area})",
      "Elemento NO ES 5 (exclusión tipo de evidencia no rigurosa)",
      "Elemento NO ES 6 (exclusión temporal: antes de ${yearStart})",
      "Elemento NO ES 7 (adicional específico)"
    ],
    "pregunta_refinada": "En [P], ¿[verbo investigativo] de [I] [comparación opcional] resulta en [O]?"
  }
}

═══════════════════════════════════════════════════════════════
VALIDACIÓN FINAL OBLIGATORIA
═══════════════════════════════════════════════════════════════

Antes de enviar el JSON, VERIFICA:
✅ Todos los elementos ES están reflejados en algún componente PICO
✅ Todos los elementos NO ES justifican exclusiones futuras
✅ Las 5 dimensiones mínimas están cubiertas en ES y NO ES
✅ No hay términos ambiguos ("muy", "poco", "relevante" sin cuantificar)
✅ La pregunta refinada puede responderse con los estudios delimitados

RESPONDE ÚNICAMENTE CON EL JSON VÁLIDO. NO AGREGUES TEXTO ADICIONAL.
`.trim();
}
```

---

## 📊 RESUMEN DE PROBLEMAS Y SOLUCIONES

| # | Problema Actual | Impacto en Calidad | Solución Propuesta |
|---|----------------|-------------------|-------------------|
| 1 | Área no incluida en prompt | Resultados genéricos, no contextualizados | Incluir área explícitamente |
| 2 | Rango temporal ausente | Criterios temporales inconsistentes | Incluir yearStart/yearEnd |
| 3 | Sin 5 dimensiones ES/NO ES | Matriz incompleta, validación imposible | Forzar 5 dimensiones mínimas |
| 4 | Sin validación ES ↔ PICO | Inconsistencias metodológicas | Instrucción de coherencia |
| 5 | Términos ambiguos permitidos | Reproducibilidad comprometida | Regla explícita de términos medibles |
| 6 | Temperatura muy baja (0.3) | Respuestas muy conservadoras | Aumentar a 0.5-0.7 |
| 7 | Sin instrucción de 7 preguntas | Elementos de delimitación arbitrarios | Especificar las 7 preguntas |
| 8 | NO ES no se convierte a exclusión | Fase posterior inconsistente | Documentar conversión automática |

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

1. ✅ **ACTUALIZAR PROMPT** con estructura metodológica completa
2. ✅ **AGREGAR PARÁMETROS** area, yearStart, yearEnd al execute()
3. ✅ **AUMENTAR TEMPERATURA** a 0.5-0.7 para respuestas más específicas
4. ✅ **IMPLEMENTAR VALIDACIÓN POST-GENERACIÓN** de coherencia ES/NO ES ↔ PICO
5. ✅ **CREAR FUNCIÓN DE CONVERSIÓN** NO ES → Criterios de Exclusión
6. ✅ **DOCUMENTAR REGLAS** en comentarios del código
7. ✅ **TESTING** con casos reales de diferentes áreas

---

## 🚨 IMPACTO ACTUAL EN LA CALIDAD

**Nivel de Riesgo Metodológico**: 🔴 **ALTO**

**Consecuencias si no se corrige:**
- ❌ Protocolos genéricos sin especificidad disciplinaria
- ❌ Matriz ES/NO ES incompleta o inválida
- ❌ Falta de coherencia entre fases del protocolo
- ❌ Imposibilidad de reproducir la búsqueda bibliográfica
- ❌ Criterios de inclusión/exclusión inconsistentes con ES/NO ES
- ❌ Rechazo en revisiones académicas por metodología débil

---

*Fecha de análisis: Diciembre 11, 2025*
*Sistema: Thesis RSL - Protocol Analysis Use Case*
