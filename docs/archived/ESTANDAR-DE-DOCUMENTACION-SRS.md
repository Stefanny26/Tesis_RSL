# ESTÁNDAR DE DOCUMENTACIÓN SRS PARA MÓDULOS DE IA

**Proyecto: Sistema RSL - Módulos P01 a P08**

---

## 📋 PARTE 1: PLANTILLA MAESTRA (Para copiar y usar)

### **[ID-DEL-MÓDULO] Nombre del Módulo**

#### **1. Ficha Técnica y Propósito**

| Campo | Descripción |
| :--- | :--- |
| **Objetivo Cognitivo** | ¿Qué problema complejo resuelve la IA aquí? (Ej. Clasificar, Resumir, Inferir) |
| **Usuario Final** | ¿Quién consume este resultado? (Ej. Investigador Senior, Estudiante) |
| **Trigger (Disparador)** | ¿Qué acción inicia el proceso? (Ej. Clic en botón "Analizar", Carga de archivo) |
| **Dependencias** | ¿Qué otros módulos deben ejecutarse antes? (Ej. Requiere salida de P02) |
| **Modelo Recomendado** | Ej. GPT-4o (Alta capacidad), Llama-3-70b, o Algoritmo Local |

#### **2. Interfaz Técnica (Inputs & Outputs)**

Definición precisa de las variables para el equipo de desarrollo Backend/Prompt Engineering.

**A. Entradas (Variables del Prompt):**
- `{input_principal}`: Descripción del dato principal (Ej. Resumen del paper).
- `{contexto_adicional}`: Datos de apoyo (Ej. Criterios de inclusión).
- `{parametros_tecnicos}`: Temperature: 0.X, MaxTokens: XXX.

**B. Salida Esperada (Schema JSON):**
```json
{
  "campo_resultado": "Tipo de dato (string/int)",
  "razonamiento": "String (Vital para validación humana)",
  "metadatos": {
    "confianza": 0.0,
    "tokens_usados": 0
  }
}
```

#### **3. Reglas de Verificación Técnica ("Hard Rules")**

Reglas binarias que el código debe validar automáticamente. Si fallan, el sistema muestra error.

- **R1 (Formato):** La salida debe ser estrictamente un JSON válido acorde al Schema.
- **R2 (Tipos):** El campo "confianza" debe ser un número flotante entre 0.0 y 1.0.
- **R3 (Seguridad):** La respuesta no debe contener inyección de código (HTML/SQL).
- **R4 (Límites):** El texto generado no debe exceder los X caracteres.

#### **4. Criterios de Calidad Cognitiva ("Soft Rules" / Turing)**

Reglas cualitativas que definen el "éxito" de la IA. Estas se validan mediante el Juicio de Expertos.

- **C1 (Veracidad):** La IA no debe inventar información no presente en la entrada (Cero Alucinaciones).
- **C2 (Coherencia):** El razonamiento debe seguir una lógica deductiva clara.
- **C3 (Tono):** El lenguaje utilizado debe ser formal y académico.

#### **5. Gestión de Riesgos y Mitigación**

| Riesgo Detectado | Estrategia de Mitigación (Prompting) | Mecanismo de Control (Validación) |
| :--- | :--- | :--- |
| Riesgo A | Instrucción negativa en el prompt... | Revisión humana en test... |

---

## 📝 PARTE 2: MÓDULOS DE IA IMPLEMENTADOS

A continuación se documentan TODOS los módulos de IA del sistema RSL, siguiendo el estándar definido.

---

### **[P01] Módulo de Generación de Título desde Pregunta de Investigación**

#### **1. Ficha Técnica y Propósito**

| Campo | Descripción |
| :--- | :--- |
| **Objetivo Cognitivo** | Transformar una pregunta de investigación informal en un título académico formal y estructurado. |
| **Usuario Final** | Investigador que inicia una RSL. |
| **Trigger** | Usuario ingresa pregunta de investigación -> Clic en "Generar Título". |
| **Dependencias** | Ninguna (módulo inicial). |
| **Modelo Recomendado** | GPT-4o-mini / Gemini 2.0 Flash. |

#### **2. Interfaz Técnica**

**A. Entradas:**
- `{researchQuestion}`: Pregunta de investigación del usuario (string).
- `{aiProvider}`: Proveedor seleccionado ('chatgpt' | 'gemini').

**B. Salida Esperada (JSON):**
```json
{
  "title": "String: Título académico formal",
  "confidence": 0.9
}
```

#### **3. Reglas de Verificación Técnica (Hard Rules)**

- **R1:** El título debe tener entre 50 y 200 caracteres.
- **R2:** No debe contener símbolos especiales ni emojis.
- **R3:** Debe seguir convenciones académicas (mayúsculas, sin abreviaturas informales).

#### **4. Criterios de Calidad Cognitiva (Soft Rules)**

- **C1 (Claridad):** El título debe ser comprensible sin necesidad de leer la pregunta original.
- **C2 (Especificidad):** Debe incluir palabras clave del dominio de estudio.
- **C3 (Neutralidad):** No debe incluir sesgos ni resultados anticipados.

#### **5. Gestión de Riesgos**

| Riesgo Detectado | Estrategia de Mitigación | Mecanismo de Control |
| :--- | :--- | :--- |
| Título demasiado genérico | Instrucción: "Incluye términos específicos del dominio". | Revisión manual del usuario. |
| Sesgo en el lenguaje | Instrucción: "Usa lenguaje neutro y objetivo". | Pregunta en validación: "¿Es neutro?". |

---

### **[P02] Módulo de Análisis de Protocolo (PICO + Matriz Es/No Es)**

#### **1. Ficha Técnica y Propósito**

| Campo | Descripción |
| :--- | :--- |
| **Objetivo Cognitivo** | Extraer y estructurar el marco PICO (Población, Intervención, Comparación, Outcome) y generar una matriz de delimitación conceptual. |
| **Usuario Final** | Investigador Principal. |
| **Trigger** | Usuario confirma el título -> Generación automática del protocolo. |
| **Dependencias** | Requiere título del proyecto (P01). |
| **Modelo Recomendado** | GPT-4o-mini / Gemini 2.0 Flash. |

#### **2. Interfaz Técnica**

**A. Entradas:**
- `{projectTitle}`: Título del proyecto (string).
- `{projectDescription}`: Descripción adicional (opcional).
- `{aiProvider}`: Proveedor de IA ('chatgpt' | 'gemini').

**B. Salida Esperada (JSON):**
```json
{
  "titulo_propuesto": "String",
  "fase1_marco_pico": {
    "poblacion": "String",
    "intervencion": "String",
    "comparacion": "String",
    "outcome": "String"
  },
  "fase2_matriz_es_no_es": {
    "es": ["String array"],
    "no_es": ["String array"]
  }
}
```

#### **3. Reglas de Verificación Técnica (Hard Rules)**

- **R1:** Todos los campos del PICO deben estar presentes y no vacíos.
- **R2:** Las matrices "es" y "no_es" deben contener al menos 3 elementos cada una.
- **R3:** No debe haber solapamiento entre "es" y "no_es".

#### **4. Criterios de Calidad Cognitiva (Soft Rules)**

- **C1 (Separación Clara):** Cada componente PICO debe ser distinto y no mezclar conceptos.
- **C2 (Exhaustividad):** La matriz debe cubrir los límites conceptuales del estudio.
- **C3 (Fidelidad):** No debe introducir conceptos no mencionados en el título.

#### **5. Gestión de Riesgos**

| Riesgo Detectado | Estrategia de Mitigación | Mecanismo de Control |
| :--- | :--- | :--- |
| Mezcla de conceptos PICO | Instrucción: "Define cada componente de forma independiente". | Validación experta: Pregunta P1. |
| Alucinación de conceptos | Instrucción: "Basate SOLO en el título proporcionado". | Validación experta: Pregunta P2. |

---

### **[P03] Módulo de Generación de Términos del Protocolo**

#### **1. Ficha Técnica y Propósito**

| Campo | Descripción |
| :--- | :--- |
| **Objetivo Cognitivo** | Expandir los conceptos PICO en términos clave, sinónimos y variantes lingüísticas para búsqueda bibliográfica. |
| **Usuario Final** | Investigador o Asistente de Investigación. |
| **Trigger** | Protocolo PICO aprobado -> Clic en "Generar Términos". |
| **Dependencias** | Requiere PICO y Matriz Es/No Es (P02). |
| **Modelo Recomendado** | GPT-4o-mini (mejor para expansión terminológica). |

#### **2. Interfaz Técnica**

**A. Entradas:**
- `{picoData}`: Objeto con Población, Intervención, Comparación, Outcome.
- `{matrixData}`: Objeto con delimitaciones Es/No Es.
- `{specificSection}`: (Opcional) Regenerar solo una sección específica.
- `{customFocus}`: (Opcional) Enfoque personalizado para refinamiento.

**B. Salida Esperada (JSON):**
```json
{
  "poblacion_terminos": {
    "terminos_principales": ["String array"],
    "sinonimos": ["String array"],
    "terminos_mesh": ["String array"]
  },
  "intervencion_terminos": { "..." },
  "comparacion_terminos": { "..." },
  "outcome_terminos": { "..." }
}
```

#### **3. Reglas de Verificación Técnica (Hard Rules)**

- **R1:** Cada sección debe tener al menos 3 términos principales.
- **R2:** Los sinónimos no deben repetir términos principales.
- **R3:** Los términos MeSH deben seguir nomenclatura oficial (verificable).

#### **4. Criterios de Calidad Cognitiva (Soft Rules)**

- **C1 (Relevancia):** Los sinónimos deben ser semánticamente equivalentes.
- **C2 (Cobertura):** Debe incluir variantes en inglés (idioma de bases académicas).
- **C3 (Especificidad):** Evitar términos demasiado generales que diluyan la búsqueda.

#### **5. Gestión de Riesgos**

| Riesgo Detectado | Estrategia de Mitigación | Mecanismo de Control |
| :--- | :--- | :--- |
| Términos irrelevantes | Instrucción: "Usa solo términos relevantes al dominio". | Revisión manual del investigador. |
| Falta de términos MeSH | Instrucción: "Prioriza términos controlados (MeSH/DeCS)". | Validación con bases de datos. |

---

### **[P04] Módulo de Generación de Criterios de Inclusión/Exclusión**

#### **1. Ficha Técnica y Propósito**

| Campo | Descripción |
| :--- | :--- |
| **Objetivo Cognitivo** | Generar criterios sistemáticos para decidir qué estudios incluir o excluir en la RSL. |
| **Usuario Final** | Investigador Principal. |
| **Trigger** | Términos del protocolo aprobados -> Clic en "Generar Criterios". |
| **Dependencias** | Requiere Términos del Protocolo (P03) y PICO (P02). |
| **Modelo Recomendado** | GPT-4o-mini / Gemini 2.0 Flash. |

#### **2. Interfaz Técnica**

**A. Entradas:**
- `{protocolTerms}`: Términos generados en P03.
- `{picoData}`: Estructura PICO.
- `{projectTitle}`: Título del proyecto.
- `{specificType}`: (Opcional) Regenerar solo "inclusion" o "exclusion".
- `{customFocus}`: (Opcional) Enfoque personalizado.

**B. Salida Esperada (JSON):**
```json
{
  "inclusion_criteria": [
    { "id": "I1", "criterion": "String", "rationale": "String" }
  ],
  "exclusion_criteria": [
    { "id": "E1", "criterion": "String", "rationale": "String" }
  ]
}
```

#### **3. Reglas de Verificación Técnica (Hard Rules)**

- **R1:** Debe haber al menos 3 criterios de inclusión y 3 de exclusión.
- **R2:** Cada criterio debe tener ID único y razonamiento.
- **R3:** Los criterios no deben ser contradictorios entre sí.

#### **4. Criterios de Calidad Cognitiva (Soft Rules)**

- **C1 (Especificidad):** Los criterios deben ser medibles y verificables.
- **C2 (Exhaustividad):** Deben cubrir aspectos temporales, metodológicos y de población.
- **C3 (Justificación):** Cada criterio debe tener una razón clara basada en el protocolo.

#### **5. Gestión de Riesgos**

| Riesgo Detectado | Estrategia de Mitigación | Mecanismo de Control |
| :--- | :--- | :--- |
| Criterios ambiguos | Instrucción: "Define criterios medibles y claros". | Validación experta en prueba piloto. |
| Sesgo de selección | Instrucción: "No excluyas basándote en resultados esperados". | Revisión por segundo investigador. |

---

### **[P05] Módulo de Generación de Estrategias de Búsqueda**

#### **1. Ficha Técnica y Propósito**

| Campo | Descripción |
| :--- | :--- |
| **Objetivo Cognitivo** | Crear cadenas de búsqueda optimizadas para bases de datos académicas (Scopus, IEEE, PubMed, etc.). |
| **Usuario Final** | Investigador o Bibliotecólogo. |
| **Trigger** | Criterios aprobados -> Selección de bases de datos -> Generar queries. |
| **Dependencias** | Requiere Términos del Protocolo (P03) y Criterios (P04). |
| **Modelo Recomendado** | GPT-4o-mini (conocimiento de sintaxis de bases). |

#### **2. Interfaz Técnica**

**A. Entradas:**
- `{databases}`: Array de bases de datos seleccionadas ['scopus', 'ieee', 'pubmed'].
- `{picoData}`: Estructura PICO.
- `{protocolTerms}`: Términos generados.
- `{matrixData}`: Delimitaciones Es/No Es.

**B. Salida Esperada (JSON):**
```json
{
  "queries": [
    {
      "database": "scopus",
      "query": "TITLE-ABS-KEY(\"term1\" OR \"term2\") AND ...",
      "validation": { "isValid": true, "errors": [] }
    }
  ]
}
```

#### **3. Reglas de Verificación Técnica (Hard Rules)**

- **R1:** La sintaxis debe ser válida para cada base de datos específica.
- **R2:** Debe usar operadores booleanos correctamente (AND, OR, NOT).
- **R3:** Los términos entre comillas deben ser frases exactas.
- **R4:** Debe validarse con funciones `validateScopus()`, `validateIEEE()`, etc.

#### **4. Criterios de Calidad Cognitiva (Soft Rules)**

- **C1 (Cobertura):** La query debe incluir todos los términos clave del PICO.
- **C2 (Precisión):** Debe usar operadores que limiten resultados irrelevantes.
- **C3 (Expansión):** Debe incluir sinónimos y variantes lingüísticas.

#### **5. Gestión de Riesgos**

| Riesgo Detectado | Estrategia de Mitigación | Mecanismo de Control |
| :--- | :--- | :--- |
| Sintaxis incorrecta | Usar módulo `query-sanitizer.js` para validación. | Pruebas automáticas en bases reales. |
| Búsqueda demasiado amplia | Instrucción: "Usa términos específicos y AND entre conceptos". | Revisión del número de resultados. |

---

### **[P06] Módulo de Refinamiento de Cadenas de Búsqueda**

#### **1. Ficha Técnica y Propósito**

| Campo | Descripción |
| :--- | :--- |
| **Objetivo Cognitivo** | Optimizar una cadena de búsqueda existente basándose en los resultados obtenidos (demasiados o muy pocos). |
| **Usuario Final** | Investigador con resultados de búsqueda previos. |
| **Trigger** | Usuario analiza resultados iniciales -> Clic en "Refinar Búsqueda". |
| **Dependencias** | Requiere cadena de búsqueda inicial (P05) y resultados de prueba. |
| **Modelo Recomendado** | GPT-4o-mini / Gemini 2.0 Flash. |

#### **2. Interfaz Técnica**

**A. Entradas:**
- `{currentSearchString}`: Cadena de búsqueda actual (string).
- `{searchResults}`: Resumen de resultados (número, relevancia estimada).
- `{researchQuestion}`: Pregunta de investigación original.
- `{databases}`: Bases de datos donde se ejecutó.

**B. Salida Esperada (JSON):**
```json
{
  "refined_query": "String: Nueva cadena optimizada",
  "changes_made": ["String array: Lista de modificaciones"],
  "rationale": "String: Explicación de cambios"
}
```

#### **3. Reglas de Verificación Técnica (Hard Rules)**

- **R1:** La cadena refinada debe mantener la sintaxis válida de la base original.
- **R2:** Debe preservar los conceptos clave del PICO.
- **R3:** Debe explicar claramente qué se cambió y por qué.

#### **4. Criterios de Calidad Cognitiva (Soft Rules)**

- **C1 (Ajuste Dirigido):** Si hay demasiados resultados, debe ser más específica; si muy pocos, más amplia.
- **C2 (Conservación):** No debe cambiar radicalmente la intención de búsqueda original.
- **C3 (Justificación):** Cada cambio debe tener una razón técnica clara.

#### **5. Gestión de Riesgos**

| Riesgo Detectado | Estrategia de Mitigación | Mecanismo de Control |
| :--- | :--- | :--- |
| Pérdida de enfoque | Instrucción: "Mantén los términos clave del PICO". | Comparación con query original. |
| Refinamiento excesivo | Instrucción: "Haz cambios incrementales, no radicales". | Limitar a 3 cambios por iteración. |

---

### **[P07] Módulo de Cribado Automático con LLM (Intelligent Screening)**

#### **1. Ficha Técnica y Propósito**

| Campo | Descripción |
| :--- | :--- |
| **Objetivo Cognitivo** | Decidir si un artículo científico es relevante para el estudio basándose en criterios predefinidos, simulando el juicio de un investigador experto. |
| **Usuario Final** | Investigador Principal / Asistente de Investigación. |
| **Trigger** | Carga de referencias -> Selección de modo LLM -> Clic en "Ejecutar Cribado". |
| **Dependencias** | Requiere Criterios de Inclusión/Exclusión (P04) y Pregunta de Investigación (P01). |
| **Modelo Recomendado** | GPT-4o-mini / Gemini 2.0 Flash (Requiere razonamiento lógico). |

#### **2. Interfaz Técnica**

**A. Entradas:**
- `{paper_title}`: Título del artículo.
- `{paper_abstract}`: Resumen del artículo.
- `{inclusion_criteria}`: Lista de criterios para aceptar.
- `{exclusion_criteria}`: Lista de criterios para rechazar.
- `{config}`: Temp=0.0 (Determinista), TopP=1.

**B. Salida Esperada (JSON):**
```json
{
  "decision": "INCLUDE" | "EXCLUDE",
  "reasoning": "Texto explicativo breve justificando la decisión basándose en el abstract.",
  "criteria_match": {
    "matched_inclusion": ["ID-Criterio"],
    "violated_exclusion": ["ID-Criterio"]
  },
  "confidence_score": 0.85
}
```

#### **3. Reglas de Verificación Técnica (Hard Rules)**

- **R1:** El campo `decision` solo puede contener los valores exactos "INCLUDE" o "EXCLUDE".
- **R2:** Si `decision` es "EXCLUDE", el array `violated_exclusion` no puede estar vacío.
- **R3:** El `confidence_score` debe ser numérico.
- **R4:** El JSON no debe contener texto antes ni después de las llaves `{ }`.

#### **4. Criterios de Calidad Cognitiva (Para Validación Experta)**

- **C1 (Fidelidad a la Fuente):** El `reasoning` no debe mencionar datos (ej. tamaño de muestra, país) que no aparezcan explícitamente en el abstract provisto.
- **C2 (Lógica de Exclusión):** Si se viola un solo criterio de exclusión, la decisión debe ser obligatoriamente "EXCLUDE", independientemente de lo interesante que parezca el paper.
- **C3 (Ambigüedad):** Si el abstract es incompleto, la IA debe penalizar el `confidence_score` (<0.7) y explicarlo en el razonamiento.

#### **5. Gestión de Riesgos**

| Riesgo Detectado | Estrategia de Mitigación | Mecanismo de Control |
| :--- | :--- | :--- |
| **Falsos Positivos** (Incluir papers irrelevantes) | Chain-of-Thought: "Analiza cada criterio paso a paso antes de decidir". | Medir Precisión en Matriz de Confusión durante validación. |
| **Alucinación de Datos** | Instrucción: "Responde solo basándote en el texto proporcionado". | Pregunta específica en la Ficha de Experto: "¿Inventó datos?". |

---

### **[P08] Módulo de Cribado con Embeddings (Semantic Screening)**

#### **1. Ficha Técnica y Propósito**

| Campo | Descripción |
| :--- | :--- |
| **Objetivo Cognitivo** | Calcular similitud semántica entre el protocolo PICO y referencias bibliográficas usando embeddings vectoriales. |
| **Usuario Final** | Investigador que busca cribado rápido y consistente. |
| **Trigger** | Carga de referencias -> Selección de modo Embeddings -> Ajuste de umbral -> Ejecutar. |
| **Dependencias** | Requiere Protocolo PICO (P02). |
| **Modelo Recomendado** | all-MiniLM-L6-v2 (384 tokens, local con Transformers.js). |

#### **2. Interfaz Técnica**

**A. Entradas:**
- `{reference}`: Objeto con título, abstract, keywords.
- `{protocol}`: Objeto PICO completo.
- `{threshold}`: Umbral de similitud (0.0 - 1.0), default: 0.7.

**B. Salida Esperada (JSON):**
```json
{
  "referenceId": "String",
  "similarity": 0.8456,
  "threshold": 0.7,
  "recommendation": "include" | "exclude",
  "confidence": 0.485,
  "reasoning": "La similitud semántica es de 84.6%, superando el umbral...",
  "model": "Xenova/all-MiniLM-L6-v2"
}
```

#### **3. Reglas de Verificación Técnica (Hard Rules)**

- **R1:** El valor de `similarity` debe estar entre 0.0 y 1.0.
- **R2:** El valor de `threshold` debe estar entre 0.0 y 1.0.
- **R3:** Si `similarity >= threshold`, `recommendation` debe ser "include".
- **R4:** El campo `confidence` debe estar normalizado entre 0.0 y 1.0.

#### **4. Criterios de Calidad Cognitiva (Soft Rules)**

- **C1 (Consistencia):** El mismo input debe producir siempre la misma similitud (modelo determinista).
- **C2 (Sensibilidad):** El sistema debe ser sensible a cambios en términos clave del PICO.
- **C3 (Calibración):** El umbral predeterminado (0.7) debe alinearse con decisiones humanas en un conjunto de validación.

#### **5. Gestión de Riesgos**

| Riesgo Detectado | Estrategia de Mitigación | Mecanismo de Control |
| :--- | :--- | :--- |
| Umbral muy bajo (demasiados incluidos) | Documentación: "Recomendado 0.7 para screening inicial". | Análisis de distribución de similitudes (elbow plot). |
| Abstracts vacíos o muy cortos | Validación: Si abstract < 50 chars, penalizar confidence. | Alertas en UI para referencias incompletas. |
| Modelo no captura contexto complejo | Ofrecer modo híbrido: Embeddings para filtro inicial, LLM para casos dudosos. | Comparación con resultados LLM en validación. |

---

### **[P09] Módulo de Detección de Duplicados**

#### **1. Ficha Técnica y Propósito**

| Campo | Descripción |
| :--- | :--- |
| **Objetivo Cognitivo** | Identificar referencias duplicadas usando similitud de títulos, DOI y autores. |
| **Usuario Final** | Investigador organizando referencias importadas. |
| **Trigger** | Importación de referencias -> Detección automática de duplicados. |
| **Dependencias** | Requiere referencias cargadas en el proyecto. |
| **Modelo Recomendado** | Algoritmo local (Levenshtein Distance + reglas heurísticas). |

#### **2. Interfaz Técnica**

**A. Entradas:**
- `{projectId}`: ID del proyecto con referencias a analizar.

**B. Salida Esperada (JSON):**
```json
{
  "duplicates": [
    {
      "referenceId": "ref-001",
      "duplicateOf": "ref-002",
      "similarity": 95,
      "reason": "Título idéntico y mismo DOI"
    }
  ],
  "groups": [
    {
      "master": { "id": "ref-002", "title": "..." },
      "duplicates": [
        { "id": "ref-001", "similarity": 95 }
      ]
    }
  ],
  "stats": {
    "total": 150,
    "unique": 142,
    "duplicates": 8,
    "duplicateGroups": 4
  }
}
```

#### **3. Reglas de Verificación Técnica (Hard Rules)**

- **R1:** Si dos referencias tienen el mismo DOI, deben marcarse como duplicadas (100% similitud).
- **R2:** Si la similitud del título es >= 90%, deben marcarse como duplicadas.
- **R3:** Si la similitud del título es >= 85% y los autores coinciden, deben marcarse como duplicadas.

#### **4. Criterios de Calidad Cognitiva (Soft Rules)**

- **C1 (Precision):** No debe marcar como duplicados artículos de la misma serie pero con contenido diferente.
- **C2 (Recall):** Debe detectar variaciones menores (mayúsculas, signos de puntuación).
- **C3 (Agrupación):** Debe agrupar todas las versiones de un mismo artículo bajo un "master" record.

#### **5. Gestión de Riesgos**

| Riesgo Detectado | Estrategia de Mitigación | Mecanismo de Control |
| :--- | :--- | :--- |
| Falsos positivos (artículos similares no duplicados) | Umbral conservador (90% similitud). | Revisión manual obligatoria antes de eliminar. |
| Falsos negativos (no detectar duplicados reales) | Normalizar títulos (minúsculas, quitar puntuación). | Logs de referencias no agrupadas para auditoría. |

---

### **[P10] Módulo de Análisis Estadístico de Resultados de Cribado**

#### **1. Ficha Técnica y Propósito**

| Campo | Descripción |
| :--- | :--- |
| **Objetivo Cognitivo** | Generar estadísticas descriptivas del proceso de cribado (tasas de inclusión, exclusión, acuerdos). |
| **Usuario Final** | Investigador preparando reporte PRISMA. |
| **Trigger** | Finalización de cribado -> Generación de reporte. |
| **Dependencias** | Requiere referencias con decisiones de screening (P07/P08). |
| **Modelo Recomendado** | Algoritmo local (cálculos estadísticos puros). |

#### **2. Interfaz Técnica**

**A. Entradas:**
- `{projectId}`: ID del proyecto.
- `{includeExclusionReasons}`: Boolean para incluir análisis de motivos de exclusión.

**B. Salida Esperada (JSON):**
```json
{
  "stats": {
    "total": 500,
    "included": 120,
    "excluded": 350,
    "pending": 30,
    "avgSimilarity": 0.623,
    "inclusionRate": 24.0
  },
  "exclusionReasons": [
    { "reason": "Población incorrecta", "count": 150 },
    { "reason": "Metodología no apropiada", "count": 100 }
  ],
  "timeline": [
    { "date": "2024-12-01", "screened": 50, "included": 12 }
  ]
}
```

#### **3. Reglas de Verificación Técnica (Hard Rules)**

- **R1:** `total` debe ser igual a `included + excluded + pending`.
- **R2:** `inclusionRate` debe calcularse como `(included / (included + excluded)) * 100`.
- **R3:** Las fechas en `timeline` deben estar ordenadas cronológicamente.

#### **4. Criterios de Calidad Cognitiva (Soft Rules)**

- **C1 (Completitud):** El reporte debe incluir todas las métricas relevantes para PRISMA.
- **C2 (Trazabilidad):** Cada estadística debe poder rastrearse a registros individuales.
- **C3 (Visualización):** Los datos deben ser exportables a formato compatible con diagramas de flujo PRISMA.

#### **5. Gestión de Riesgos**

| Riesgo Detectado | Estrategia de Mitigación | Mecanismo de Control |
| :--- | :--- | :--- |
| Datos incompletos (referencias sin decisión) | Alertar sobre referencias "pending" en el reporte. | Requiere confirmación antes de generar PRISMA final. |
| Errores de cálculo | Usar librerías matemáticas validadas. | Tests unitarios para todas las fórmulas. |

---

## 📝 PARTE 3: MÓDULOS COMPLEMENTARIOS (No-IA)

### **[C01] Importación de Referencias**
- **Propósito:** Leer archivos BibTeX, RIS, CSV y normalizar a formato interno.
- **No usa IA:** Parseo algorítmico puro.

### **[C02] Exportación de Referencias**
- **Propósito:** Exportar referencias a formatos BibTeX, RIS, CSV, Excel.
- **No usa IA:** Conversión de formato algorítmica.

### **[C03] Búsqueda en Bases Académicas**
- **Propósito:** Ejecutar queries en Scopus, IEEE, Google Scholar via APIs.
- **No usa IA:** Integración con APIs de terceros.

---

## 📊 RESUMEN DE MÓDULOS DE IA

| ID | Módulo | Tipo de IA | Modelo | Temperatura | Validación Experta |
|---|---|---|---|---|---|
| P01 | Generación de Título | LLM | GPT-4o-mini / Gemini | 0.7 | Sí |
| P02 | Análisis PICO + Matriz | LLM | GPT-4o-mini / Gemini | 0.0 | Sí |
| P03 | Términos del Protocolo | LLM | GPT-4o-mini | 0.7 | No |
| P04 | Criterios I/E | LLM | GPT-4o-mini / Gemini | 0.7 | Sí |
| P05 | Estrategias de Búsqueda | LLM | GPT-4o-mini / Gemini | 0.7 | Sí (Sintaxis) |
| P06 | Refinamiento de Búsqueda | LLM | GPT-4o-mini / Gemini | 0.7 | Sí |
| P07 | Cribado con LLM | LLM | GPT-4o-mini / Gemini | 0.0 | Sí (Turing) |
| P08 | Cribado con Embeddings | Embeddings | all-MiniLM-L6-v2 | N/A | Sí (Umbral) |
| P09 | Detección de Duplicados | Algoritmo Local | Levenshtein | N/A | No |
| P10 | Análisis Estadístico | Algoritmo Local | Ninguno | N/A | No |

---

## 🎯 NOTAS FINALES DE IMPLEMENTACIÓN

1. **Todos los módulos LLM (P01-P07)** siguen el patrón de permitir selección de proveedor (`aiProvider: 'chatgpt' | 'gemini'`).

2. **Validación en dos capas:**
   - **Hard Rules:** Validadas automáticamente por el código (schema JSON, tipos de datos).
   - **Soft Rules:** Validadas por expertos usando el Kit de Instrumentos (Archivo complementario).

3. **Trazabilidad:** Todos los módulos guardan metadatos de ejecución (modelo usado, temperatura, tokens consumidos) en la base de datos.

4. **Fallback:** Si un proveedor de IA falla, el sistema intenta con el proveedor alternativo automáticamente.

5. **Costos:** 
   - Módulos LLM consumen API credits (monitoreados en tabla `api_usage`).
   - Módulo de Embeddings (P08) es **gratuito** y **offline** (Transformers.js local).
