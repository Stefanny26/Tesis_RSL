# 📋 Prompts y Reglas de IA - Sistema RSL Manager

Este documento detalla todos los prompts utilizados en el sistema, sus reglas y ejemplos de uso.

---

## 📑 Índice

1. [Nuevo Proyecto - Definición del Tema](#1-nuevo-proyecto---definición-del-tema)
2. [Análisis Preliminar: Marco PICO + Matriz Es/No Es](#2-análisis-preliminar-marco-pico--matriz-esnoes-unificados)
3. [Términos del Protocolo](#3-términos-del-protocolo-antes-criterios-iniciales)
4. [Criterios de Inclusión y Exclusión](#4-criterios-de-inclusión-y-exclusión-alimentados-por-términos)
5. [Generación de Términos Clave para Búsqueda](#5-generación-de-términos-clave-para-búsqueda-pico-expandido)
6. [Generación de Estrategias de Búsqueda](#6-generación-de-estrategias-de-búsqueda-por-base-de-datos)
7. [Refinamiento de Cadenas de Búsqueda](#7-refinamiento-de-cadenas-de-búsqueda)
8. [Cribado Automático con IA](#8-cribado-automático-con-ia)
9. [Cribado con Embeddings](#9-cribado-con-embeddings)
10. [Análisis Estadístico de Resultados](#10-análisis-estadístico-de-resultados)

---

## 1. Nuevo Proyecto - Definición del Tema

### 📍 Ubicación en UI
**Paso 1**: Formulario de entrada de tema/pregunta de investigación

### 🎯 Propósito
Guiar al usuario en la correcta formulación del tema de una Revisión Sistemática de Literatura (SLR).

### 📋 Reglas para Definir un Tema de Revisión Sistemática de Literatura (SLR)

#### Reglas Generales

| # | Regla | Descripción | Ejemplo |
|---|-------|-------------|---------|
| 1 | **Intervención/Tecnología/Fenómeno** | El tema debe describir claramente qué se va a analizar | ❌ "MongoDB en aplicaciones" <br> ✅ "Object Document Mapping con Mongoose en aplicaciones Node.js" |
| 2 | **Contexto o Población** | Debe definirse el ámbito de aplicación | ❌ "Desarrollo web" <br> ✅ "Aplicaciones backend Node.js con MongoDB" |
| 3 | **Enfoque del Análisis** | Especificar qué aspecto se estudia | ❌ "Mongoose" <br> ✅ "Prácticas de desarrollo y patrones de diseño con Mongoose" |
| 4 | **Alineación Metodológica** | Debe ser compatible con PRISMA/Cochrane | ✅ "Revisión sistemática de..." <br> ✅ "Scoping review de..." |
| 5 | **Sin Resultados Anticipados** | El título no debe incluir conclusiones | ❌ "Mongoose mejora el rendimiento en Node.js" <br> ✅ "Implicaciones de rendimiento del uso de Mongoose en Node.js" |
| 6 | **Claridad y Acotación** | Tema específico, no genérico | ❌ "Bases de datos NoSQL" <br> ✅ "Mongoose ODM en aplicaciones Node.js" |
| 7 | **Orientación Técnica/Científica** | Debe apuntar a literatura académica o técnica revisada por pares | ✅ Journals, conferencias científicas <br> ❌ Blogs, tutoriales personales |

#### Estructura Recomendada del Tema

```
[TECNOLOGÍA/HERRAMIENTA] + [ASPECTO A ANALIZAR] + [CONTEXTO/POBLACIÓN] + [TIPO DE ESTUDIO]
```

**Ejemplos correctos:**

✅ **"Prácticas de desarrollo con Mongoose ODM en aplicaciones Node.js: Una revisión sistemática"**
- Tecnología: Mongoose ODM
- Aspecto: Prácticas de desarrollo
- Contexto: Aplicaciones Node.js
- Tipo: Revisión sistemática

✅ **"Implicaciones de rendimiento del uso de Object Document Mapping en entornos Node.js/MongoDB"**
- Tecnología: Object Document Mapping (ODM)
- Aspecto: Implicaciones de rendimiento
- Contexto: Node.js/MongoDB
- Tipo: Implícito (estudio analítico)

✅ **"Patrones de diseño y arquitectura en aplicaciones Node.js con Mongoose: Scoping Review"**
- Tecnología: Mongoose
- Aspecto: Patrones de diseño y arquitectura
- Contexto: Aplicaciones Node.js
- Tipo: Scoping Review

#### Checklist de Validación

Antes de continuar, verifica que tu tema cumple:

- [ ] ¿Define claramente la tecnología o fenómeno a estudiar?
- [ ] ¿Especifica el contexto o población objetivo?
- [ ] ¿Indica qué aspecto se va a analizar? (prácticas, rendimiento, diseño, etc.)
- [ ] ¿Es suficientemente específico pero no demasiado restrictivo?
- [ ] ¿Es factible encontrar literatura científica/técnica sobre el tema?
- [ ] ¿No anticipa resultados o conclusiones?
- [ ] ¿Sigue las guías PRISMA/Cochrane?

### 🔧 Selector de Modelo de IA

Al ingresar el tema, el usuario debe seleccionar el modelo de IA:

```
Seleccione el modelo de IA para generar el análisis:
( ) ChatGPT (GPT-4o-mini)
( ) Gemini (gemini-2.0-flash-exp)
```

**Recomendación**: Gemini tiene mayor cuota disponible actualmente.

---

## 2. Análisis Preliminar: Marco PICO + Matriz Es/No Es (Unificados)

### 📍 Ubicación en UI
**Paso 2**: Generación automática después de ingresar el tema

### 🎯 Propósito
Generar el análisis preliminar del tema mediante la integración del **Marco PICO** y la **Matriz Es/No Es**, con el objetivo de clarificar la población, intervención, comparadores y resultados esperados, así como validar qué elementos están presentes o ausentes en la pregunta de investigación.

### 📘 Texto Introductorio

> **En esta sección se genera el análisis preliminar del tema mediante la integración del Marco PICO y la Matriz Es/No Es**, con el objetivo de clarificar la población, intervención, comparadores y resultados esperados, así como validar qué elementos están presentes o ausentes en la pregunta de investigación.
> 
> Una vez que el usuario ingrese el tema o pregunta, se generará automáticamente la **tabla combinada** con población, contenido generado por IA y la justificación Es/No Es.

### 📝 Prompt Utilizado

```
Eres un experto metodólogo en revisiones sistemáticas de literatura con conocimiento profundo de la metodología PRISMA 2020.

Analiza el siguiente tema de revisión sistemática y genera el Marco PICO integrado con la Matriz Es/No Es:

TEMA: {question}

Tu tarea es generar una tabla unificada que contenga:

1. **Componente PICO** (Población, Intervención, Comparador, Outcomes)
2. **Contenido específico** extraído del tema
3. **Justificación Es/No Es** que valide la presencia o ausencia de cada elemento

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido con esta estructura:

{
  "pico_es_no_es": [
    {
      "componente": "Población",
      "contenido": "Texto específico identificado en el tema",
      "justificacion": "ES: Explicación de por qué está presente O NO ES: Por qué no aplica o está ausente"
    },
    {
      "componente": "Intervención",
      "contenido": "...",
      "justificacion": "..."
    },
    {
      "componente": "Comparador",
      "contenido": "...",
      "justificacion": "..."
    },
    {
      "componente": "Outcomes",
      "contenido": "...",
      "justificacion": "..."
    }
  ],
  "titulo_espanol": "Título propuesto en español",
  "titulo_ingles": "Proposed title in English",
  "justificacion_titulo": "Explicación de por qué este título es apropiado basándose en el análisis PICO y Es/No Es"
}

No incluyas explicaciones fuera del JSON.
```

### 📊 Tabla Unificada Generada

La IA genera una tabla con **tres columnas**:

| Población / Intervención / Comparador / Resultado | Contenido generado por IA | Justificación (Es / No Es) |
|---------------------------------------------------|---------------------------|----------------------------|
| **Población** | Aplicaciones Node.js con MongoDB | **ES**: El tema define claramente el contexto de aplicaciones backend Node.js que utilizan MongoDB como base de datos |
| **Intervención** | Uso de Mongoose ODM (Object Document Mapping) | **ES**: Mongoose es la tecnología específica cuyo impacto se analiza en el desarrollo |
| **Comparador** | Alternativas: ODMs diferentes, acceso directo a MongoDB | **NO ES**: El tema no especifica comparadores explícitos, se enfoca en Mongoose únicamente |
| **Outcomes** | Prácticas de desarrollo, implicaciones de rendimiento, patrones de diseño | **ES**: Los resultados esperados incluyen análisis de prácticas, performance y arquitectura |

### 📋 Reglas y Validaciones

| Regla | Descripción | Validación |
|-------|-------------|------------|
| **Marco PICO completo** | Los 4 componentes deben analizarse | Frontend valida estructura de respuesta |
| **Justificación ES/NO ES** | Cada componente debe tener justificación clara | Prompt requiere explícitamente |
| **Contenido específico** | No genérico, extraído del tema | IA debe citar elementos del tema original |
| **Coherencia** | Alineación entre componentes | Validación cruzada en backend |

### 💡 Ejemplo de Uso

**Input del Usuario:**
```
Prácticas de desarrollo con Mongoose ODM en aplicaciones Node.js: 
Una revisión sistemática
```

**Output Esperado:**
```json
{
  "pico_es_no_es": [
    {
      "componente": "Población",
      "contenido": "Aplicaciones Node.js con MongoDB utilizando Mongoose ODM",
      "justificacion": "ES: El tema define claramente el contexto de aplicaciones backend Node.js que utilizan MongoDB como base de datos y Mongoose como capa ODM"
    },
    {
      "componente": "Intervención",
      "contenido": "Uso de Mongoose ODM (Object Document Mapping) como herramienta de desarrollo",
      "justificacion": "ES: Mongoose es la tecnología específica cuyo impacto en las prácticas de desarrollo se analiza"
    },
    {
      "componente": "Comparador",
      "contenido": "Implícito: Otras formas de interactuar con MongoDB (driver nativo, otros ODMs)",
      "justificacion": "NO ES explícito: El tema no menciona comparadores directos, aunque se pueden inferir alternativas como el MongoDB driver nativo, Prisma u otros ODMs"
    },
    {
      "componente": "Outcomes",
      "contenido": "Prácticas de desarrollo, patrones de diseño, implicaciones de rendimiento",
      "justificacion": "ES: Los resultados esperados incluyen identificar prácticas recomendadas, patrones arquitectónicos y efectos en el rendimiento de las aplicaciones"
    }
  ],
  "titulo_espanol": "Prácticas de Desarrollo con Mongoose ODM en Aplicaciones Node.js: Una Revisión Sistemática",
  "titulo_ingles": "Development Practices with Mongoose ODM in Node.js Applications: A Systematic Review",
  "justificacion_titulo": "El título es apropiado porque: (1) identifica claramente la tecnología (Mongoose ODM), (2) especifica el contexto (aplicaciones Node.js), (3) define el enfoque del análisis (prácticas de desarrollo), (4) declara el tipo de estudio (revisión sistemática), y (5) está alineado con la metodología PRISMA al ser descriptivo y no anticipar resultados"
}
```

### 📄 Visualización en UI

Después de la generación, se muestra:

#### Tabla PICO + Es/No Es

| Componente | Contenido Identificado | Justificación Es/No Es |
|------------|------------------------|------------------------|
| **Población** | Aplicaciones Node.js con MongoDB utilizando Mongoose ODM | **ES**: El tema define claramente el contexto... |
| **Intervención** | Uso de Mongoose ODM como herramienta de desarrollo | **ES**: Mongoose es la tecnología específica... |
| **Comparador** | Implícito: MongoDB driver nativo, otros ODMs | **NO ES explícito**: El tema no menciona... |
| **Outcomes** | Prácticas de desarrollo, patrones, rendimiento | **ES**: Los resultados esperados incluyen... |

#### Generación de Título

📌 **Título en Español**
```
Prácticas de Desarrollo con Mongoose ODM en Aplicaciones Node.js: 
Una Revisión Sistemática
```

📌 **Título en Inglés**
```
Development Practices with Mongoose ODM in Node.js Applications: 
A Systematic Review
```

📝 **Justificación del Título**
```
El título es apropiado porque: (1) identifica claramente la tecnología 
(Mongoose ODM), (2) especifica el contexto (aplicaciones Node.js), 
(3) define el enfoque del análisis (prácticas de desarrollo), (4) declara 
el tipo de estudio (revisión sistemática), y (5) está alineado con la 
metodología PRISMA al ser descriptivo y no anticipar resultados.
```

### ⚙️ Configuración Técnica

```javascript
// Archivo: generate-protocol-analysis.use-case.js
const response = await this.geminiService.generateContent({
  prompt: prompt,
  temperature: 0.3,  // Baja creatividad, alta precisión
  maxTokens: 3000,   // Respuesta extensa
  model: 'gemini-2.0-flash-exp'
});
```

---

## 3. Términos del Protocolo (Antes: Criterios Iniciales)

### 📍 Ubicación en UI
**Paso 3**: Generación de términos ANTES de definir criterios de inclusión/exclusión

### 🎯 Propósito
Identificar y estructurar los términos fundamentales del protocolo organizados en categorías temáticas. **Estos términos alimentarán posteriormente los criterios de inclusión/exclusión**.

### 📊 Estructura de Términos (Orden Obligatorio)

Los términos deben aparecer en este orden específico:

#### 🧩 1. Tecnología / Herramientas

Términos que identifican las tecnologías, frameworks o herramientas específicas del estudio.

**Ejemplo:**
- Object Document Mapping (ODM)
- Mongoose
- Node.js
- MongoDB

#### 🧪 2. Dominio de Aplicación

Contexto o ámbito donde se aplican las tecnologías.

**Ejemplo:**
- Applications (contexto Node.js, MongoDB, backend JavaScript)
- Backend Development
- JavaScript Ecosystem
- NoSQL Databases

#### 📚 3. Tipo de Estudio

Metodología o enfoque de investigación.

**Ejemplo:**
- Systematic Literature Review (SLR)
- Scoping Review (exploratoria, cualitativa)
- Empirical Study
- Survey Research

#### 🔍 4. Focos Temáticos

Aspectos o dimensiones específicas a analizar.

**Ejemplo:**
- Development Practices
- Performance Implications
- Design Patterns
- Code Quality
- Architecture Patterns

### 📝 Prompt Utilizado

```
Eres un experto en bibliometría y definición de protocolos de revisión sistemática.

Analiza el siguiente tema y el análisis PICO generado:

TEMA: {title}
POBLACIÓN: {population}
INTERVENCIÓN: {intervention}
COMPARACIÓN: {comparison}
OUTCOMES: {outcomes}

Tu tarea es generar los términos fundamentales del protocolo organizados en 4 categorías obligatorias:

1. **Tecnología/Herramientas**: Términos técnicos específicos (frameworks, librerías, herramientas)
2. **Dominio de Aplicación**: Contexto o ámbito de aplicación
3. **Tipo de Estudio**: Metodologías de investigación relevantes
4. **Focos Temáticos**: Aspectos o dimensiones a analizar

Cada categoría debe incluir:
- Entre 3-6 términos específicos
- Términos en inglés (idioma principal de literatura académica)
- Explicación contextual cuando sea necesario

Responde ÚNICAMENTE con JSON válido:
{
  "tecnologia_herramientas": [
    "Object Document Mapping (ODM)",
    "Mongoose",
    "Node.js",
    "MongoDB"
  ],
  "dominio_aplicacion": [
    "Backend Applications",
    "JavaScript Ecosystem",
    "NoSQL Databases"
  ],
  "tipo_estudio": [
    "Systematic Literature Review (SLR)",
    "Scoping Review",
    "Empirical Study"
  ],
  "focos_tematicos": [
    "Development Practices",
    "Performance Implications",
    "Design Patterns",
    "Code Quality"
  ]
}

No incluyas explicaciones fuera del JSON.
```

### 📋 Reglas y Validaciones

| Regla | Descripción | Validación |
|-------|-------------|------------|
| **Orden obligatorio** | 1) Tecnología/Herramientas, 2) Dominio, 3) Tipo estudio, 4) Focos | Frontend sigue estructura fija |
| **Cantidad por categoría** | Entre 3-6 términos específicos | Backend valida rango |
| **Idioma inglés** | Términos en inglés (literatura académica internacional) | Prompt especifica idioma |
| **Especificidad** | Términos técnicos precisos, no genéricos | IA extrae de análisis PICO |
| **Coherencia con PICO** | Términos derivados del análisis previo | Validación cruzada |
| **Sin duplicados** | Cada término aparece una sola vez | Backend elimina duplicados |

### 💡 Ejemplo de Uso

**Input (basado en análisis PICO previo):**
```json
{
  "title": "Prácticas de desarrollo con Mongoose ODM en aplicaciones Node.js",
  "population": "Aplicaciones Node.js con MongoDB",
  "intervention": "Mongoose ODM",
  "comparison": "MongoDB driver nativo, otros ODMs",
  "outcomes": "Prácticas de desarrollo, patrones, rendimiento"
}
```

**Output Esperado:**
```json
{
  "tecnologia_herramientas": [
    "Object Document Mapping (ODM)",
    "Mongoose",
    "Node.js",
    "MongoDB",
    "JavaScript"
  ],
  "dominio_aplicacion": [
    "Backend Applications",
    "Web Development",
    "JavaScript Ecosystem",
    "NoSQL Database Systems"
  ],
  "tipo_estudio": [
    "Systematic Literature Review (SLR)",
    "Scoping Review",
    "Empirical Study",
    "Case Study"
  ],
  "focos_tematicos": [
    "Development Practices",
    "Performance Implications",
    "Design Patterns",
    "Code Quality",
    "Architecture Patterns"
  ]
}
```

### 📄 Visualización en UI

```
🧩 Tecnología / Herramientas
├─ Object Document Mapping (ODM)
├─ Mongoose
├─ Node.js
└─ MongoDB

🧪 Dominio de Aplicación
├─ Backend Applications
├─ JavaScript Ecosystem
└─ NoSQL Database Systems

📚 Tipo de Estudio
├─ Systematic Literature Review (SLR)
└─ Scoping Review

🔍 Focos Temáticos
├─ Development Practices
├─ Performance Implications
└─ Design Patterns
```

### ⚙️ Configuración Técnica

```javascript
// Archivo: generate-protocol-terms.use-case.js
const response = await this.geminiService.generateContent({
  prompt: prompt,
  temperature: 0.4,  // Moderada precisión
  maxTokens: 1000,   // Suficiente para 4 categorías
  model: 'gemini-2.0-flash-exp'
});
```

---

## 4. Criterios de Inclusión y Exclusión (Alimentados por Términos)

### 📍 Ubicación en UI
**Paso 4**: Generación automática DESPUÉS de definir términos del protocolo

### 🎯 Propósito
Generar criterios de inclusión y exclusión específicos basados en los términos del protocolo previamente definidos. Estos criterios determinan qué estudios serán considerados en la revisión sistemática.

### 📝 Prompt Utilizado

```
Eres un metodólogo experto en revisiones sistemáticas con conocimiento profundo de PRISMA 2020.

Basándote en los siguientes términos del protocolo CONFIRMADOS por el investigador, genera criterios de inclusión y exclusión específicos y precisos:

TÉRMINOS DEL PROTOCOLO CONFIRMADOS:

🧩 Tecnología/Herramientas:
{tecnologia_herramientas}

🧪 Dominio de Aplicación:
{dominio_aplicacion}

📚 Tipo de Estudio:
{tipo_estudio}

🔍 Focos Temáticos:
{focos_tematicos}

MARCO PICO (contexto adicional):
- Población: {population}
- Intervención: {intervention}
- Comparación: {comparison}
- Outcomes: {outcomes}

**INSTRUCCIONES CRÍTICAS**:

1. Los criterios DEBEN mencionar explícitamente los términos confirmados arriba
2. En "Tecnologías abordadas": Si mencionas software/herramientas genéricas, ESPECIFICA ejemplos concretos (ej: "análisis cualitativo con NVivo, ATLAS.ti, MAXQDA")
3. En "Tipo de estudio": NO incluyas metodologías como términos tecnológicos (ej: "metodología de revisión sistemática" va en Tipo de Estudio, NO en Tecnologías)
4. En criterios de exclusión cuantitativos: CLARIFICA si excluyes solo estudios puramente cuantitativos o también mixtos
5. Usa la frase "mencionen explícitamente ... en título, abstract o keywords" para mayor precisión

Genera criterios organizados en 6 categorías obligatorias:
1. Cobertura temática
2. Tecnologías abordadas
3. Tipo de estudio
4. Tipo de documento
5. Rango temporal
6. Idioma

Para cada categoría, proporciona:
- Criterios de INCLUSIÓN (qué estudios SÍ consideraremos)
- Criterios de EXCLUSIÓN (qué estudios NO consideraremos)

**FORMATO DE RESPUESTA** (JSON estricto):
{
  "criterios_inclusion": [
    {
      "categoria": "Cobertura temática",
      "criterio": "Estudios que mencionen explícitamente [términos específicos del protocolo] en título, abstract o keywords. [Descripción detallada]"
    },
    {
      "categoria": "Tecnologías abordadas",
      "criterio": "Investigaciones que utilicen [tecnologías/herramientas ESPECÍFICAS con ejemplos concretos]. Por ejemplo: [lista de ejemplos]."
    },
    {
      "categoria": "Tipo de estudio",
      "criterio": "Systematic Literature Review (SLR), [otros tipos específicos]. Incluye estudios mixtos que contengan [componente requerido]."
    },
    {
      "categoria": "Tipo de documento",
      "criterio": "Artículos peer-reviewed en journals, proceedings de conferencias académicas, [otros tipos con revisión por pares]."
    },
    {
      "categoria": "Rango temporal",
      "criterio": "Publicaciones entre [año inicio] y [año fin]. [Justificación del rango]."
    },
    {
      "categoria": "Idioma",
      "criterio": "Publicaciones en [idiomas específicos]."
    }
  ],
  "criterios_exclusion": [
    {
      "categoria": "Cobertura temática",
      "criterio": "Estudios donde los términos aparecen solo tangencialmente o no constituyen el foco principal."
    },
    {
      "categoria": "Tecnologías abordadas",
      "criterio": "Trabajos que usen exclusivamente [técnicas específicas a excluir] sin [componente requerido]. Especificar claramente qué se excluye."
    },
    {
      "categoria": "Tipo de estudio",
      "criterio": "Material editorial, opiniones, tutoriales, documentos sin metodología explícita."
    },
    {
      "categoria": "Tipo de documento",
      "criterio": "Blogs, reportes no revisados por pares, literatura gris no verificable."
    },
    {
      "categoria": "Rango temporal",
      "criterio": "Publicaciones anteriores a [año] sin relevancia para el período especificado."
    },
    {
      "categoria": "Idioma",
      "criterio": "Artículos en otros idiomas sin traducción o resumen accesible."
    }
  ]
}

No incluyas explicaciones fuera del JSON.
```

### 📊 Tabla de Criterios (Formato Obligatorio)

| Categoría | Criterios de Inclusión | Criterios de Exclusión |
|-----------|------------------------|------------------------|
| **Cobertura temática** | Estudios que mencionen Mongoose, MongoDB/NoSQL y Node.js en el resumen. | Publicaciones donde estos términos no aparecen o no son relevantes. |
| **Tecnologías abordadas** | Uso de Mongoose como ODM en entornos Node.js. | ODMs diferentes (Hibernate, SQL, etc.) o tecnologías fuera del ecosistema JavaScript. |
| **Tipo de estudio** | Artículos sobre prácticas de desarrollo, performance, patrones de diseño. | Material introductorio, tutoriales, blogs sin análisis científico. |
| **Tipo de documento** | Journals, conferencias científicas. | Literatura gris, blogs o tutoriales. |
| **Rango temporal** | 2019–2025. | Antes de 2019 o sin evidencia empírica relevante. |
| **Idioma** | Inglés. | Otros idiomas. |

### 📋 Reglas y Validaciones MEJORADAS

| Regla | Descripción | Validación | Ejemplo |
|-------|-------------|------------|---------|
| **6 categorías obligatorias** | Todas deben estar presentes | Backend valida estructura | Cobertura, Tecnologías, Tipo estudio, Tipo doc, Rango, Idioma |
| **Basados en términos confirmados** | Deben mencionar explícitamente términos del protocolo | Validación cruzada | "mencionen MongoDB, Mongoose, Node.js en título, abstract o keywords" |
| **Especificidad en tecnologías** | Software/herramientas DEBEN incluir ejemplos concretos | Backend verifica ejemplos | ❌ "análisis cualitativo" → ✅ "NVivo, ATLAS.ti, MAXQDA" |
| **Separación semántica correcta** | Metodologías en "Tipo de Estudio", NO en "Tecnologías" | Frontend categoriza | ❌ Tecnologías: "metodología SLR" → ✅ Tipo Estudio: "SLR" |
| **Claridad en exclusiones cuantitativas** | Especificar si se excluyen solo estudios puramente cuantitativos | Prompt requiere precisión | "excluir estudios puramente cuantitativos sin análisis cualitativo" |
| **Frase de búsqueda estándar** | Usar "mencionen explícitamente ... en título, abstract o keywords" | Prompt incluye template | Aumenta precisión en búsquedas bibliográficas |
| **Complementariedad** | Inclusión y exclusión son mutuamente excluyentes | Lógica de validación | Si incluye "estudios empíricos", excluye "opiniones sin datos" |
| **Alineación PRISMA 2020** | Seguir guías PRISMA actualizadas para criterios | Revisión metodológica | 27 ítems checklist PRISMA |
| **Coherencia con PICO** | Criterios derivados del análisis PICO | Trazabilidad | Población → Cobertura, Intervención → Tecnologías |

### 💡 Ejemplo de Uso (CORREGIDO según mejores prácticas)

#### Ejemplo 1: Proyecto sobre Mongoose ODM (Tecnología de Software)

**Input (términos del protocolo confirmados):**
```json
{
  "tecnologia_herramientas": ["Object Document Mapping (ODM)", "Mongoose", "Node.js", "MongoDB"],
  "dominio_aplicacion": ["Backend Applications", "JavaScript Ecosystem"],
  "tipo_estudio": ["Systematic Literature Review (SLR)", "Empirical Study"],
  "focos_tematicos": ["Development Practices", "Performance Implications", "Design Patterns"]
}
```

**Output Esperado (con mejoras aplicadas):**
```json
{
  "criterios_inclusion": [
    {
      "categoria": "Cobertura temática",
      "criterio": "Estudios que mencionen explícitamente Mongoose, MongoDB/NoSQL y Node.js en título, abstract o keywords; incluye análisis de prácticas de desarrollo, patrones de diseño o implicaciones de rendimiento en aplicaciones backend."
    },
    {
      "categoria": "Tecnologías abordadas",
      "criterio": "Uso de Mongoose como Object Document Mapping (ODM) en entornos Node.js con MongoDB. Incluye estudios que comparen Mongoose con otras herramientas específicas (por ejemplo: Prisma, TypeORM, MongoDB Native Driver)."
    },
    {
      "categoria": "Tipo de estudio",
      "criterio": "Systematic Literature Review (SLR), estudios empíricos, casos de estudio con evidencia reproducible, estudios mixtos (cuantitativos + cualitativos) que incluyan análisis de código o evaluaciones de rendimiento."
    },
    {
      "categoria": "Tipo de documento",
      "criterio": "Artículos peer-reviewed en journals científicos, proceedings de conferencias académicas (ACM, IEEE), capítulos de libros técnicos con revisión por pares."
    },
    {
      "categoria": "Rango temporal",
      "criterio": "Publicaciones entre 2019 y 2025 (Mongoose ganó adopción significativa desde 2019 con el auge de Node.js en backend)."
    },
    {
      "categoria": "Idioma",
      "criterio": "Artículos escritos en inglés o español (idiomas predominantes en literatura técnica de software)."
    }
  ],
  "criterios_exclusion": [
    {
      "categoria": "Cobertura temática",
      "criterio": "Estudios donde Mongoose, MongoDB o Node.js aparecen solo tangencialmente o no constituyen el foco principal; trabajos centrados exclusivamente en frontend o tecnologías no relacionadas con el stack JavaScript backend."
    },
    {
      "categoria": "Tecnologías abordadas",
      "criterio": "ODMs diferentes (como Hibernate, Sequelize para SQL, Entity Framework) o tecnologías fuera del ecosistema JavaScript backend; estudios sobre bases de datos relacionales sin componente NoSQL."
    },
    {
      "categoria": "Tipo de estudio",
      "criterio": "Material editorial sin datos, opiniones personales, tutoriales básicos, blogs sin análisis científico, documentación técnica oficial (no académica)."
    },
    {
      "categoria": "Tipo de documento",
      "criterio": "Literatura gris no verificable, blogs personales, tutoriales en línea sin revisión, reportes técnicos internos no publicados."
    },
    {
      "categoria": "Rango temporal",
      "criterio": "Publicaciones anteriores a 2019 sin relevancia para las versiones modernas de Mongoose o sin evidencia empírica del período especificado."
    },
    {
      "categoria": "Idioma",
      "criterio": "Publicaciones en otros idiomas sin traducción o resumen en inglés/español que impidan su evaluación."
    }
  ]
}
```

#### Ejemplo 2: Proyecto sobre Análisis Cualitativo en Medios (Ciencias Sociales)

**Input (términos del protocolo confirmados):**
```json
{
  "tecnologia_herramientas": ["Análisis de contenido de documentales", "Software de análisis cualitativo (NVivo, ATLAS.ti, MAXQDA)", "Análisis textual"],
  "dominio_aplicacion": ["Estudios de medios", "Percepción pública", "Cultura popular"],
  "tipo_estudio": ["Systematic Literature Review (SLR)", "Estudios cualitativos empíricos", "Estudios mixtos"],
  "focos_tematicos": ["Representación de animales en medios", "Influencia de documentales", "Actitudes culturales"]
}
```

**Output Esperado (MEJORADO con correcciones):**
```json
{
  "criterios_inclusion": [
    {
      "categoria": "Cobertura temática",
      "criterio": "Estudios que mencionen explícitamente 'análisis de contenido de documentales', 'representación de animales en medios', 'percepción pública' o 'influencia de la cultura popular' en título, abstract o keywords; incluye análisis de representación mediática y actitudes culturales."
    },
    {
      "categoria": "Tecnologías abordadas",
      "criterio": "Investigaciones que utilicen análisis de contenido de documentales, análisis cualitativo asistido por software específico (por ejemplo: NVivo, ATLAS.ti, MAXQDA, Dedoose) o técnicas de análisis textual relevantes para estudiar representación mediática."
    },
    {
      "categoria": "Tipo de estudio",
      "criterio": "Systematic Literature Review (SLR), revisiones de literatura sobre medios, estudios cualitativos empíricos, estudios mixtos (cualitativo + cuantitativo) que incluyan análisis de contenido o entrevistas sobre percepción pública."
    },
    {
      "categoria": "Tipo de documento",
      "criterio": "Artículos peer-reviewed en journals académicos, proceedings de conferencias de ciencias sociales, capítulos de libros académicos con revisión por pares, tesis doctorales publicadas en repositorios académicos."
    },
    {
      "categoria": "Rango temporal",
      "criterio": "Publicaciones entre 2010 y 2023 (justificado por la evolución de la producción documental y metodologías de análisis de medios en este período)."
    },
    {
      "categoria": "Idioma",
      "criterio": "Artículos en inglés o español (incluye resúmenes accesibles en estos idiomas)."
    }
  ],
  "criterios_exclusion": [
    {
      "categoria": "Cobertura temática",
      "criterio": "Estudios donde los términos del protocolo aparecen solo tangencialmente o no constituyen el foco principal; trabajos centrados exclusivamente en aspectos biológicos/ecológicos sin análisis social, cultural o mediático."
    },
    {
      "categoria": "Tecnologías abordadas",
      "criterio": "Trabajos que utilicen exclusivamente técnicas de análisis cuantitativo sin componente cualitativo ni análisis de contenido; estudios que empleen herramientas no relacionadas con análisis cualitativo (por ejemplo: solo visualización estadística sin interpretación textual)."
    },
    {
      "categoria": "Tipo de estudio",
      "criterio": "Material puramente editorial, opiniones sin datos, tutoriales, reseñas no sistemáticas, documentos sin metodología explícita o sin datos/argumentos reproducibles."
    },
    {
      "categoria": "Tipo de documento",
      "criterio": "Blogs, entradas no revisadas, reportes técnicos internos sin revisión por pares, notas de prensa, publicaciones no verificables, literatura gris no accesible públicamente."
    },
    {
      "categoria": "Rango temporal",
      "criterio": "Publicaciones anteriores a 2010 sin relevancia para la era mediática contemporánea o sin relación con los cambios en producción documental recientes."
    },
    {
      "categoria": "Idioma",
      "criterio": "Publicaciones en otros idiomas sin traducción o resumen en inglés/español que impidan la evaluación del contenido."
    }
  ]
}
```

### 🎯 Puntos Clave de las Mejoras

1. ✅ **Frase estándar de búsqueda**: "mencionen explícitamente ... en título, abstract o keywords"
2. ✅ **Especificidad en software**: "NVivo, ATLAS.ti, MAXQDA, Dedoose" (ejemplos concretos)
3. ✅ **Separación semántica**: "Systematic Literature Review (SLR)" en Tipo de Estudio, NO en Tecnologías
4. ✅ **Claridad en exclusiones**: "técnicas exclusivamente cuantitativas sin componente cualitativo"
5. ✅ **Estudios mixtos**: Permitidos si contienen análisis cualitativo o de contenido
6. ✅ **Justificación de rangos**: Explicar por qué se elige ese período temporal

### ⚙️ Configuración Técnica

```javascript
// Archivo: generate-inclusion-exclusion-criteria.use-case.js (nuevo)
const response = await this.geminiService.generateContent({
  prompt: prompt,
  temperature: 0.3,  // Alta precisión para criterios rigurosos
  maxTokens: 2000,   // Suficiente para 6 categorías detalladas
  model: 'gemini-2.0-flash-exp'
});
```

---

## 5. Generación de Términos Clave para Búsqueda (PICO Expandido)

### 📍 Ubicación en UI
**Botón**: "Generar Términos con IA" (Paso 5 - Estrategia de Búsqueda)

### 🎯 Propósito
Expandir los términos del protocolo en términos clave detallados para búsqueda bibliográfica, incluyendo sinónimos, variaciones ortográficas y traducciones.

---

## 6. Generación de Estrategias de Búsqueda por Base de Datos

### 📍 Ubicación en UI
**Botón**: "Generar Estrategias" (Paso 5 - Estrategia de Búsqueda)

### 🎯 Propósito
Generar estrategias de búsqueda específicas para diferentes bases de datos académicas (PubMed, Scopus, Web of Science, etc.)

### 📝 Prompt Utilizado

```
Eres un bibliotecario experto en búsquedas bibliográficas sistemáticas.

Genera estrategias de búsqueda específicas para las siguientes bases de datos:
{databases}

Términos clave:
{keyTerms}

Para cada base de datos, genera:
1. Cadena de búsqueda completa con operadores booleanos
2. Filtros recomendados
3. Consideraciones específicas de la base de datos

Formato de respuesta (JSON):
{
  "strategies": [
    {
      "database": "nombre",
      "search_string": "cadena completa",
      "filters": ["filtro1", "filtro2"],
      "notes": "consideraciones especiales"
    }
  ]
}
```

### 📋 Reglas de Operadores Booleanos

| Operador | Uso | Ejemplo |
|----------|-----|---------|
| **AND** | Intersección (todos los términos) | `"mutation" AND "wildlife"` |
| **OR** | Unión (cualquier término) | `"behavior" OR "behaviour"` |
| **NOT** | Exclusión | `"wild* NOT domestic*"` |
| **" "** | Frase exacta | `"genetic mutation"` |
| **\*** | Truncamiento | `genet*` (genetic, genetics, gene) |
| **( )** | Agrupación | `(wild OR feral) AND mutation` |

### 💡 Ejemplo de Estrategia para PubMed

```
((wild animal*[Title/Abstract] OR wildlife[Title/Abstract] OR 
"non-domesticated species"[Title/Abstract]) AND 
(genetic mutation*[Title/Abstract] OR "DNA variant*"[Title/Abstract] OR 
polymorphism*[Title/Abstract])) AND 
(behavior*[Title/Abstract] OR physiol*[Title/Abstract])

Filters: 
- Publication date: Last 10 years
- Article types: Journal Article, Research Support
- Species: Animals
- Languages: English, Spanish
```

---

## 5. Refinamiento de Cadenas de Búsqueda

### 📍 Ubicación en UI
**Botón**: "Refinar con IA" (Paso 4 - después de generar estrategia inicial)

### 🎯 Propósito
Mejorar y optimizar cadenas de búsqueda existentes para aumentar sensibilidad y especificidad.

### 📝 Prompt Utilizado

```
Eres un experto en optimización de estrategias de búsqueda bibliográfica.

Analiza y refina la siguiente cadena de búsqueda:

Base de datos: {database}
Cadena actual: {searchString}
Términos clave: {keyTerms}

Mejora la cadena considerando:
1. Balance entre sensibilidad (recall) y precisión (precision)
2. Uso correcto de operadores booleanos
3. Sintaxis específica de la base de datos
4. Inclusión de términos MeSH (si aplica)
5. Truncamientos y wildcards apropiados

Devuelve JSON:
{
  "refined_string": "cadena mejorada",
  "changes": ["cambio 1", "cambio 2"],
  "rationale": "explicación de mejoras"
}
```

### 📋 Criterios de Refinamiento

| Criterio | Objetivo | Métrica |
|----------|----------|---------|
| **Sensibilidad** | Capturar todos los estudios relevantes | Recall > 95% |
| **Especificidad** | Minimizar falsos positivos | Precision > 50% |
| **Balance** | Optimizar F1-score | F1 = 2 * (P * R) / (P + R) |
| **Sintaxis** | Correcta para cada BD | Validación por BD |

---

## 8. Cribado Automático con IA

### 📍 Ubicación en UI
**Botón**: "Ejecutar Cribado con IA" (Página de Screening - Tab "Cribado con IA")

### 🎯 Propósito
Evaluar automáticamente referencias contra criterios de inclusión/exclusión usando LLMs (ChatGPT o Gemini).

### 📝 Prompt Utilizado

```
Eres un investigador experto en revisiones sistemáticas de literatura.

Evalúa si la siguiente referencia debe ser INCLUIDA o EXCLUIDA según los criterios:

CRITERIOS DE INCLUSIÓN:
{inclusionCriteria}

CRITERIOS DE EXCLUSIÓN:
{exclusionCriteria}

REFERENCIA:
Título: {title}
Resumen: {abstract}
Palabras clave: {keywords}

Analiza la referencia y responde ÚNICAMENTE con un JSON:
{
  "decision": "include" o "exclude",
  "confidence": 0.0-1.0,
  "reasoning": "explicación breve (2-3 líneas)",
  "criteria_match": {
    "inclusion": ["criterio cumplido 1", ...],
    "exclusion": ["criterio violado 1", ...]
  }
}
```

### 📋 Reglas de Decisión

| Decisión | Condición | Acción |
|----------|-----------|--------|
| **Include** | Cumple ≥80% criterios inclusión Y 0% exclusión | Pasa a revisión completa |
| **Exclude** | Viola ≥1 criterio exclusión O <50% inclusión | Descartada |
| **Review** | Confidence <0.7 | Requiere revisión manual |

### ⚠️ Limitaciones Actuales

- **ChatGPT**: Cuota agotada (insufficient_quota)
- **Gemini**: 0 requests disponibles (free tier exhausted)
- **Solución**: Usar embeddings (siguiente sección)

---

## 9. Cribado con Embeddings

### 📍 Ubicación en UI
**Botón**: "Ejecutar Cribado con Embeddings" (Página de Screening)

### 🎯 Propósito
Evaluar similitud semántica entre protocolo y referencias usando embeddings vectoriales (modelo local, sin límites).

### 🔧 Modelo Utilizado
```
Modelo: Xenova/all-MiniLM-L6-v2
Dimensiones: 384
Método: Cosine Similarity
Ventajas: Local, gratuito, ilimitado
```

### 📝 Algoritmo

```javascript
// 1. Generar embedding del protocolo
const protocolText = `
  Población: ${population}
  Intervención: ${intervention}
  Outcomes: ${outcomes}
  Criterios inclusión: ${inclusionCriteria.join(', ')}
`;
const protocolEmbedding = await embed(protocolText);

// 2. Para cada referencia, generar embedding
const referenceText = `
  Título: ${title}
  Abstract: ${abstract}
  Keywords: ${keywords}
  Authors: ${authors}
`;
const referenceEmbedding = await embed(referenceText);

// 3. Calcular similitud coseno
const similarity = cosineSimilarity(protocolEmbedding, referenceEmbedding);

// 4. Decidir según umbral
const decision = similarity >= threshold ? 'include' : 'exclude';
```

### 📋 Umbrales de Similitud

| Escenario | Umbral Recomendado | Justificación |
|-----------|-------------------|---------------|
| **Mismo idioma** | 0.70 (70%) | Similitud semántica directa |
| **Idiomas diferentes** | 0.15 (15%) | Compensación por traducción |
| **Alta precisión** | 0.80+ | Minimizar falsos positivos |
| **Alta sensibilidad** | 0.50- | Capturar más candidatos |

### 🎛️ Ajuste de Umbral

La UI permite ajustar dinámicamente:
```typescript
<Slider
  min={0.05}  // 5%
  max={0.50}  // 50%
  step={0.05}
  value={[threshold]}
  onValueChange={([value]) => setThreshold(value)}
/>
```

### ⚠️ Consideración Especial: Cross-Language

**Problema detectado**: Protocolo en español, artículos en inglés
```
Similitud observada: 16%
Umbral original: 70%
Resultado: 0 incluidos, 10 excluidos
```

**Solución implementada**:
```
Umbral ajustado: 15%
Advertencia en UI: "⚠️ Protocolo en español vs artículos en inglés"
Recomendación: "Umbral bajo (10-20%)"
```

---

## 10. Análisis Estadístico de Resultados

### 📍 Ubicación en UI
**Botón**: "Analizar Resultados" (después del cribado)

### 🎯 Propósito
Generar análisis estadístico de scores de similitud, detectar punto de inflexión (elbow), y recomendar umbrales óptimos.

### 📊 Métricas Calculadas

| Métrica | Fórmula | Uso |
|---------|---------|-----|
| **Percentil 25** | P25 | Umbral conservador |
| **Mediana** | P50 | Valor central |
| **Percentil 75** | P75 | Umbral moderado |
| **Percentil 90** | P90 | Umbral liberal |
| **Percentil 95** | P95 | Referencias top |
| **Punto elbow** | Segunda derivada | Umbral óptimo automático |

### 🔍 Algoritmo de Detección de Elbow

```javascript
// 1. Ordenar scores descendente
const sortedScores = scores.sort((a, b) => b - a);

// 2. Normalizar posiciones
const normalized = sortedScores.map((score, i) => ({
  x: i / (sortedScores.length - 1),
  y: score
}));

// 3. Calcular segunda derivada
const secondDerivative = [];
for (let i = 1; i < normalized.length - 1; i++) {
  const d2 = normalized[i-1].y - 2*normalized[i].y + normalized[i+1].y;
  secondDerivative.push({ index: i, value: Math.abs(d2) });
}

// 4. Encontrar máximo = punto de inflexión
const elbowPoint = secondDerivative.reduce((max, curr) => 
  curr.value > max.value ? curr : max
);
```

### 📈 Recomendaciones Automáticas

| Nivel | Umbral | Descripción | Uso Recomendado |
|-------|--------|-------------|-----------------|
| **Alta Confianza** | P90 (10% top) | Solo referencias muy similares | Primera revisión rápida |
| **Recomendado** | Elbow point | Balance óptimo precision/recall | Screening estándar |
| **Extendido** | P75 (25% top) | Más inclusivo | Revisión exhaustiva |
| **Máximo** | P50 (50% top) | Muy inclusivo | Minimizar pérdidas |

---

## 🔐 Configuración de APIs

### Variables de Entorno (.env)

```bash
# OpenAI (ChatGPT)
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_MODEL=gpt-4o-mini

# Google (Gemini)
GEMINI_API_KEY=xxxxx
GEMINI_MODEL=gemini-2.0-flash-exp

# Límites (opcionales)
MAX_TOKENS_DEFAULT=2000
TEMPERATURE_DEFAULT=0.7
```

### Tracking de Uso

Cada llamada a la API registra:
```javascript
await apiUsageRepository.create({
  userId: userId,
  provider: 'chatgpt' | 'gemini' | 'embeddings',
  endpoint: 'chat.completions' | 'generateContent' | 'embed',
  model: 'gpt-4o-mini',
  tokensPrompt: 150,
  tokensCompletion: 300,
  tokensTotal: 450,
  success: true
});
```

Ver estadísticas en: `/profile`

---

## 📚 Referencias Metodológicas

### PRISMA 2020
- **Checklist completo**: 27 ítems
- **Documentación**: http://www.prisma-statement.org/
- **Implementación**: 13 ítems básicos en wizard

### Marco PICO/PICOS
- **P**opulation: ¿Quién?
- **I**ntervention: ¿Qué se hace?
- **C**omparison: ¿Contra qué?
- **O**utcomes: ¿Qué se mide?
- **S**tudy design: ¿Qué tipo de estudios? (opcional)

### Operadores de Búsqueda
Basados en estándares de:
- PubMed/MEDLINE
- Cochrane Handbook
- PRESS Checklist (Peer Review of Electronic Search Strategies)

---

## 🛠️ Troubleshooting

### Problema: IA no responde o error de cuota

**Solución**:
1. Verificar claves API en `.env`
2. Revisar `/profile` para ver créditos disponibles
3. Usar embeddings como alternativa (ilimitado)

### Problema: Resultados en idioma incorrecto

**Solución**:
```javascript
// Agregar instrucción explícita
prompt += `\n\nIMPORTANTE: Responde en ${language}.`;
```

### Problema: JSON inválido en respuesta

**Solución**:
```javascript
// Limpiar respuesta antes de parsear
const cleanJson = response
  .replace(/```json\n?/g, '')
  .replace(/```\n?/g, '')
  .trim();
const parsed = JSON.parse(cleanJson);
```

---

## 📝 Notas Finales

- **Temperatura**: 0.3 = preciso, 0.7 = creativo, 0.9 = muy variado
- **Max Tokens**: Ajustar según longitud esperada (title: 500, protocol: 3000)
- **Retry Logic**: Implementar para manejar errores temporales
- **Caché**: Considerar cachear responses para mismos inputs
- **Validación**: Siempre validar estructura JSON antes de usar

---

**Última actualización**: Noviembre 2025  
**Versión del sistema**: 1.0.0  
**Modelos activos**: Gemini 2.0 Flash Exp, all-MiniLM-L6-v2
