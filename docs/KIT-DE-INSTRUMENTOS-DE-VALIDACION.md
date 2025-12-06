# KIT DE INSTRUMENTOS DE VALIDACIÓN POR JUICIO DE EXPERTOS

**Proyecto: Sistema RSL Potenciado por IA**

---

## 📄 OPCIÓN A: FORMATO PARA DOCUMENTO (Google Docs / Word)

**Instrucciones de uso:** Copie y pegue este contenido en un documento de texto. Imprima o envíe una ficha por cada caso de prueba que el experto deba evaluar.

---

### **FICHA DE EVALUACIÓN DE CALIDAD DE IA (PRUEBA DE TURING)**

**Nombre del Experto Evaluador:** _________________________________________________
**Fecha:** _______________________
**Módulo Evaluado:** 
- [ ] P01: Generación de Título
- [ ] P02: Análisis PICO + Matriz
- [ ] P03: Términos del Protocolo
- [ ] P04: Criterios I/E
- [ ] P05: Estrategias de Búsqueda
- [ ] P06: Refinamiento de Búsqueda
- [ ] P07: Cribado con LLM
- [ ] P08: Cribado con Embeddings

---

#### **PARTE 1: CONTEXTO DEL CASO (Input)**

*(Aquí el investigador debe pegar lo que el usuario ingresó originalmente)*

**Descripción del Proyecto:**
> "Se requiere investigar el impacto de la gamificación en la enseñanza de matemáticas para niños con TDAH en escuelas primarias..."

---

#### **PARTE 2: EVALUACIÓN DE LA RESPUESTA DE LA IA (Output)**

##### **A. Evaluación del Módulo P01: Generación de Título**

Revise el título académico generado por la IA.

**Input (Pregunta de Investigación):**
> _[Pegar aquí la pregunta original del usuario]_

**Output (Título Generado por IA):**
> _[Pegar aquí el título generado]_

| Criterio de Calidad | 1 (Muy Pobre) | 2 (Deficiente) | 3 (Aceptable) | 4 (Bueno) | 5 (Experto/Humano) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Claridad:** ¿El título es comprensible sin leer la pregunta original? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Rigor Académico:** ¿Es formal y apropiado para una tesis o paper? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Especificidad:** ¿Incluye términos clave del dominio de estudio? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Neutralidad:** ¿Evita sesgos y resultados anticipados? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |

**Comentarios Cualitativos (Obligatorio si calificó 1 o 2):**
________________________________________________________________

---

##### **B. Evaluación del Módulo P02: Análisis PICO + Matriz Es/No Es**

Revise la estructura PICO y la matriz generada por la IA.

**Output de la IA:**
```
Población: [Pegar aquí]
Intervención: [Pegar aquí]
Comparación: [Pegar aquí]
Outcome: [Pegar aquí]

ES: [Listar elementos]
NO ES: [Listar elementos]
```

| Criterio de Calidad | 1 (Muy Pobre) | 2 (Deficiente) | 3 (Aceptable) | 4 (Bueno) | 5 (Experto/Humano) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Precisión PICO:** ¿Separó correctamente P, I, C, O sin mezclarlos? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Cero Alucinaciones:** ¿Se limitó al texto provisto sin inventar datos? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Exhaustividad:** ¿La matriz cubre los límites conceptuales del estudio? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Coherencia:** ¿No hay solapamiento entre "ES" y "NO ES"? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |

**Comentarios Cualitativos:**
________________________________________________________________

---

### **Estructura de Columnas (Matriz de Recolección Completa)**

**Tabla A: Datos Generales**

| ID_Caso | Experto_ID | Modulo_ID | Modulo_Nombre | Fecha_Evaluacion | Proveedor_IA | Comentarios_Generales |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| CASO-001 | EXP-01 | P01 | Generación de Título | 2024-12-02 | ChatGPT | "Título muy apropiado" |
| CASO-002 | EXP-01 | P02 | Análisis PICO | 2024-12-02 | Gemini | "Buena separación de conceptos" |

**Tabla B: Evaluaciones por Módulo**

| ID_Caso | Experto_ID | Modulo_ID | Criterio_1 (1-5) | Criterio_2 (1-5) | Criterio_3 (1-5) | Criterio_4 (1-5) | Acuerdo_Decision (Si/No) | Nivel_Turing (1-5) | Usaria_Resultado (Si/Ajustes/No) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| CASO-001 | EXP-01 | P01 | 5 | 4 | 5 | 4 | N/A | 5 | Si |
| CASO-002 | EXP-01 | P02 | 5 | 5 | 4 | 5 | N/A | 5 | Si |
| CASO-003 | EXP-01 | P05 | 4 | 5 | 4 | 4 | N/A | 4 | Ajustes |
| CASO-004 | EXP-02 | P07 | 4 | 5 | 5 | 5 | SI | 5 | Si |
| CASO-005 | EXP-02 | P08 | 4 | 4 | 4 | N/A | SI | 4 | Si |

### **Diccionario de Variables (Para el análisis de datos)**

#### Variables Generales
- **ID_Caso:** Identificador único de la ejecución de IA (CASO-001, CASO-002, etc.).
- **Experto_ID:** Código anónimo del experto evaluador (EXP-01, EXP-02, EXP-03).
- **Modulo_ID:** Código del módulo evaluado (P01 a P10).
- **Modulo_Nombre:** Nombre descriptivo del módulo.
- **Fecha_Evaluacion:** Fecha en que se realizó la evaluación.
- **Proveedor_IA:** Modelo usado (ChatGPT, Gemini, Embeddings, Local).

#### Variables de Evaluación (Específicas por Módulo)

**Para P01 (Generación de Título):**
- **Criterio_1:** Claridad (1-5)
- **Criterio_2:** Rigor Académico (1-5)
- **Criterio_3:** Especificidad (1-5)
- **Criterio_4:** Neutralidad (1-5)

**Para P02 (Análisis PICO + Matriz):**
- **Criterio_1:** Precisión PICO (1-5)
- **Criterio_2:** Cero Alucinaciones (1-5)
- **Criterio_3:** Exhaustividad (1-5)
- **Criterio_4:** Coherencia (1-5)

**Para P03 (Términos del Protocolo):**
- **Criterio_1:** Relevancia (1-5)
- **Criterio_2:** Cobertura (1-5)
- **Criterio_3:** Especificidad (1-5)
- **Criterio_4:** Utilidad MeSH (1-5)

**Para P04 (Criterios I/E):**
- **Criterio_1:** Especificidad (1-5)
- **Criterio_2:** Exhaustividad (1-5)
- **Criterio_3:** Justificación (1-5)
- **Criterio_4:** Consistencia (1-5)

**Para P05 (Estrategias de Búsqueda):**
- **Criterio_1:** Sintaxis (1-5)
- **Criterio_2:** Lógica Booleana (1-5)
- **Criterio_3:** Cobertura (1-5)
- **Criterio_4:** Expansión de Términos (1-5)

**Para P06 (Refinamiento):**
- **Criterio_1:** Ajuste Dirigido (1-5)
- **Criterio_2:** Conservación (1-5)
- **Criterio_3:** Justificación (1-5)
- **Criterio_4:** Sintaxis (1-5)

**Para P07 (Cribado LLM):**
- **Criterio_1:** Acuerdo con decisión (1-5)
- **Criterio_2:** Lógica del razonamiento (1-5)
- **Criterio_3:** Fidelidad al texto (1-5)
- **Criterio_4:** Calidad Humana (1-5)
- **Acuerdo_Decision:** Binario (SI/NO) - ¿Concuerda con la decisión de incluir/excluir?

**Para P08 (Cribado Embeddings):**
- **Criterio_1:** Acuerdo con decisión (1-5)
- **Criterio_2:** Sensibilidad del puntaje (1-5)
- **Criterio_3:** Consistencia (1-5)
- **Criterio_4:** N/A (solo 3 criterios para embeddings)

#### Variables Transversales
- **Nivel_Turing:** Pregunta subjetiva general (1-5): "¿Qué tan humano pareció el resultado?".
- **Usaria_Resultado:** Escala categórica (Si / Ajustes / No): "¿Usaría este resultado en su investigación?".
- **Comentarios_Generales:** Campo de texto libre para observaciones.
| **Especificidad:** ¿Evita términos demasiado generales? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Utilidad MeSH:** ¿Los términos MeSH son apropiados y verificables? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |

**Comentarios Cualitativos:**
________________________________________________________________

---

##### **D. Evaluación del Módulo P04: Criterios de Inclusión/Exclusión**

Revise los criterios generados por la IA.

**Output de la IA:**
```
INCLUSIÓN:
I1: [Criterio] - [Razonamiento]
I2: [Criterio] - [Razonamiento]

EXCLUSIÓN:
E1: [Criterio] - [Razonamiento]
E2: [Criterio] - [Razonamiento]
```

| Criterio de Calidad | 1 (Muy Pobre) | 2 (Deficiente) | 3 (Aceptable) | 4 (Bueno) | 5 (Experto/Humano) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Especificidad:** ¿Los criterios son medibles y verificables? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Exhaustividad:** ¿Cubren aspectos temporales, metodológicos y poblacionales? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Justificación:** ¿Cada criterio tiene un razonamiento claro? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Consistencia:** ¿No hay contradicciones entre criterios? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |

**Comentarios Cualitativos:**
________________________________________________________________

---

##### **E. Evaluación del Módulo P05: Estrategias de Búsqueda**

Revise las cadenas de búsqueda generadas para bases de datos académicas.

**Output de la IA (Ejemplo para Scopus):**
```
TITLE-ABS-KEY("term1" OR "term2") AND TITLE-ABS-KEY("term3") AND ...
```

| Criterio de Calidad | 1 (Muy Pobre) | 2 (Deficiente) | 3 (Aceptable) | 4 (Bueno) | 5 (Experto/Humano) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Sintaxis:** ¿Los operadores (AND/OR, comillas, campos) son correctos? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Lógica Booleana:** ¿La estructura (OR para sinónimos, AND para conceptos) es correcta? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Cobertura:** ¿Incluye todos los términos clave del PICO? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Expansión:** ¿Incluye sinónimos y términos MeSH/DeCS relevantes? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |

**¿Usaría esta cadena de búsqueda en su propia investigación?**
- [ ] Sí, tal cual.
- [ ] Sí, con ajustes menores.
- [ ] No, requiere reescritura total.

**Comentarios Cualitativos:**
________________________________________________________________

---

##### **F. Evaluación del Módulo P06: Refinamiento de Búsqueda**

Revise el refinamiento propuesto por la IA.

**Input (Cadena Original + Problema):**
> Original: [Pegar query]
> Problema: "Muy pocos resultados" / "Demasiados resultados irrelevantes"

**Output de la IA:**
```
Cadena Refinada: [Pegar query refinada]
Cambios Realizados:
1. [Cambio 1]
2. [Cambio 2]
Razonamiento: [Explicación]
```

| Criterio de Calidad | 1 (Muy Pobre) | 2 (Deficiente) | 3 (Aceptable) | 4 (Bueno) | 5 (Experto/Humano) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Ajuste Dirigido:** ¿El cambio responde al problema identificado? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Conservación:** ¿Mantiene los conceptos clave del PICO original? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Justificación:** ¿Explica claramente por qué hizo cada cambio? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Sintaxis:** ¿La cadena refinada mantiene sintaxis válida? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |

**Comentarios Cualitativos:**
________________________________________________________________

---

##### **G. Evaluación del Módulo P07: Cribado con LLM**

Lea el abstract presentado y juzgue la decisión de la IA.

**Input (Abstract del Artículo):**
> _[Pegar aquí el abstract completo]_

**Criterios de Inclusión Usados:**
> _[Listar los criterios I1, I2, I3...]_

**Criterios de Exclusión Usados:**
> _[Listar los criterios E1, E2, E3...]_

**Output de la IA:**
```
Decisión: INCLUIR / EXCLUIR
Razonamiento: [Pegar explicación de la IA]
Criterios Coincidentes: [I1, I3] / [E2]
Confianza: 0.85
```

| Criterio de Calidad | 1 (Muy Pobre) | 2 (Deficiente) | 3 (Aceptable) | 4 (Bueno) | 5 (Experto/Humano) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Acuerdo:** ¿Está de acuerdo con la decisión de la IA? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Lógica:** ¿El razonamiento es coherente con los criterios? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Fidelidad:** ¿La IA basó su decisión solo en el abstract provisto? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Calidad Humana:** ¿Parece escrito por un investigador humano? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |

**Pregunta Crítica:**
Si este abstract viola UN SOLO criterio de exclusión, ¿la decisión fue correctamente "EXCLUIR"?
- [ ] SÍ (Correcto)
- [ ] NO (Error crítico)

**Comentarios Cualitativos:**
**Paso 4: Calcular Métricas de Validación**
En tu Excel, usa fórmulas simples para obtener tus métricas finales de tesis/proyecto:

#### **Métricas Generales (Todas las IA)**
```excel
=PROMEDIO(Criterio_1:Criterio_4)          // Calidad Promedio General
=PROMEDIO(Nivel_Turing)                    // Índice de Turing (Humanidad Percibida)
=CONTAR.SI(Usaria_Resultado, "Si")        // Tasa de Aceptación Directa
=CONTAR.SI(Usaria_Resultado, "Ajustes")   // Tasa de Aceptación con Ajustes
```

#### **Métricas por Módulo Específico**

**P01 - Generación de Título:**
```excel
=PROMEDIO(Criterio_2)  // Rigor Académico Promedio (>4.0 = válido)
=PROMEDIO(Criterio_4)  // Neutralidad Promedio (>4.0 = sin sesgos)
```

**P02 - Análisis PICO:**
```excel
=PROMEDIO(Criterio_1)  // Precisión PICO (>4.0 = separación correcta)
=CONTAR.SI(Criterio_2, ">=4") / TOTAL  // % Sin Alucinaciones
```

**P05 - Estrategias de Búsqueda:**
```excel
=PROMEDIO(Criterio_1)  // Sintaxis Correcta (>4.0 = válido para bases)
=CONTAR.SI(Usaria_Resultado, "Si") / TOTAL  // % Usables Directamente
```

**P07 - Cribado LLM:**
```excel
=CONTAR.SI(Acuerdo_Decision, "SI") / TOTAL  // Tasa de Acuerdo (>85% = confiable)
=PROMEDIO(Criterio_3)  // Fidelidad al Texto (>4.5 = sin alucinaciones)
```

**P08 - Cribado Embeddings:**
```excel
=CONTAR.SI(Acuerdo_Decision, "SI") / TOTAL  // Tasa de Acuerdo
=PROMEDIO(Criterio_2)  // Sensibilidad del Modelo (>4.0 = bien calibrado)
```

#### **Métricas de Confiabilidad Inter-Evaluador (Si hay 2+ expertos)**
```excel
=COEFICIENTE.CORRELACION(EXP01_Criterio1, EXP02_Criterio1)  // Correlación Pearson
// Para Cohen's Kappa, usar herramienta estadística externa (SPSS, R)
```

#### **Umbrales de Aceptación para Tesis**
- **Calidad Promedio General:** > 4.0 = Excelente, 3.5-4.0 = Bueno, < 3.5 = Requiere mejoras
- **Índice de Turing:** > 4.0 = Indistinguible de humano
- **Tasa de Acuerdo (Cribado):** > 85% = Confiable para uso clínico
- **% Sin Alucinaciones:** > 90% = Sistema seguro para uso académico

---

## 📋 ANEXO: PLANTILLA DE CUADERNO DE CASOS

Para entregar a los expertos, genera un documento con este formato para cada caso:

---

### **CASO-001: [Nombre Descriptivo]**

**Módulo:** P02 - Análisis PICO + Matriz Es/No Es
**Proveedor de IA:** ChatGPT (GPT-4o-mini)
**Fecha de Ejecución:** 2024-12-02

#### **INPUT (Lo que el usuario ingresó):**
```
Título del Proyecto:
"Prácticas de desarrollo con Mongoose ODM en aplicaciones Node.js: 
Una revisión sistemática"

Descripción Adicional:
"Se busca analizar las prácticas de desarrollo, patrones de diseño 
y rendimiento del uso de Mongoose en el contexto de Node.js..."
```

#### **OUTPUT (Lo que la IA generó):**
```json
{
  "titulo_propuesto": "...",
  "fase1_marco_pico": {
    "poblacion": "Aplicaciones backend desarrolladas en Node.js",
    "intervencion": "Uso de Mongoose ODM para gestión de datos con MongoDB",
    "comparacion": "Otras estrategias de acceso a datos (drivers nativos, ORMs)",
    "outcome": "Prácticas de desarrollo, patrones de diseño, rendimiento"
  },
  "fase2_matriz_es_no_es": {
    "es": [
      "Estudios sobre Mongoose en Node.js",
      "Análisis de rendimiento de ODMs",
      "Patrones de diseño con Mongoose"
    ],
    "no_es": [
      "Estudios sobre MongoDB sin Node.js",
      "Tutoriales sin evaluación metodológica",
      "Frameworks frontend (React, Angular)"
    ]
  }
}
```

**INSTRUCCIONES PARA EL EXPERTO:**
Por favor, complete la **Ficha B** (Evaluación del Módulo P02) para este caso.

---

*[Repetir este formato para cada caso de prueba]*

---

## 🎯 RECOMENDACIONES FINALES

1. **Número de Casos:** Evalúa al menos **10 casos por módulo crítico** (P02, P05, P07, P08).
2. **Número de Expertos:** Al menos **2 expertos independientes** para calcular confiabilidad inter-evaluador.
3. **Selección de Casos:** Incluye casos fáciles, medios y difíciles para evaluar robustez.
4. **Anonimización:** Los expertos NO deben saber qué proveedor de IA generó cada resultado (ChatGPT vs Gemini).
5. **Registro de Tiempo:** Anota cuánto tiempo toma cada evaluación para estimar carga de trabajo.
6. **Feedback Cualitativo:** Los comentarios de texto libre son TAN importantes como las puntuaciones numéricas.
##### **H. Evaluación del Módulo P08: Cribado con Embeddings**

Revise la similitud calculada y la decisión.

**Input (Abstract del Artículo):**
> _[Pegar aquí el abstract]_

**Output de la IA:**
```
Similitud Semántica: 0.7856
Umbral Configurado: 0.70
Decisión: INCLUIR / EXCLUIR
Razonamiento: "La similitud de 78.6% supera el umbral..."
```

| Criterio de Calidad | 1 (Muy Pobre) | 2 (Deficiente) | 3 (Aceptable) | 4 (Bueno) | 5 (Experto/Humano) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Acuerdo:** ¿Coincide con su juicio sobre la relevancia del artículo? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Sensibilidad:** ¿El puntaje refleja la cercanía temática al protocolo? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |
| **Consistencia:** ¿Artículos similares obtienen puntajes similares? | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ |

**Pregunta de Calibración:**
¿Considera que el umbral de 0.70 es apropiado, o debería ajustarse?
- [ ] Apropiado
- [ ] Debería subirse (muy permisivo)
- [ ] Debería bajarse (muy restrictivo)

**Comentarios Cualitativos:**
________________________________________________________________

---

## 📊 OPCIÓN B: FORMATO PARA HOJA DE CÁLCULO (Google Sheets / Excel)

**Instrucciones de uso:** Copie la tabla siguiente y péguela en la celda A1 de Excel. Esto le permitirá tabular los resultados de múltiples evaluaciones rápidamente.

### **Estructura de Columnas (Matriz de Recolección)**

| ID_Caso | Experto_ID | Modulo_Evaluado | P1_Precision_PICO (1-5) | P2_Cero_Alucinaciones (1-5) | P3_Rigor_Titulo (1-5) | P4_Sintaxis_Busqueda (1-5) | P5_Logica_Booleana (1-5) | P6_Acuerdo_Cribado (Si/No) | P7_Nivel_Turing (1-5) | Comentarios_Texto |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| CASO-001 | EXP-01 | PICO | 5 | 5 | 4 | N/A | N/A | N/A | 5 | "Excelente definición de la población." |
| CASO-001 | EXP-02 | PICO | 4 | 5 | 3 | N/A | N/A | N/A | 4 | "El título podría ser más corto." |
| CASO-002 | EXP-01 | BUSQUEDA | N/A | N/A | N/A | 2 | 5 | N/A | 2 | "Error de sintaxis en el campo [MeSH]." |
| CASO-003 | EXP-03 | CRIBADO | N/A | N/A | N/A | N/A | N/A | SI | 5 | "Razonamiento idéntico al humano." |

### **Diccionario de Variables (Para el análisis de datos)**

- **ID_Caso:** Identificador único de la ejecución de la IA.
- **P1...P5:** Escala Likert (1=Pésimo, 5=Excelente).
- **P6_Acuerdo_Cribado:** Variable binaria (1=Sí, 0=No). Útil para calcular la Tasa de Acuerdo (Agreement Rate).
- **P7_Nivel_Turing:** Pregunta subjetiva general: "¿Qué tan humano pareció el resultado?".

---

## 🛠️ CÓMO VALIDAR USANDO ESTOS FORMATOS

**Paso 1: Generar el "Cuaderno de Prueba"**
No entregues el software al experto. Entrega un documento (PDF o Doc) que contenga 10 casos resueltos por la IA (Input + Output).

**Paso 2: Entregar el Instrumento**
Entrega el Formato A junto con el cuaderno de prueba. Pídeles que llenen una ficha por cada caso.

**Paso 3: Tabular en el Formato B**
Una vez te devuelvan las fichas en papel o digital, pasa los datos al Formato B (Excel).

**Paso 4: Calcular Métricas de Validación**
En tu Excel, usa fórmulas simples para obtener tus métricas finales de tesis/proyecto:
- **Precisión Semántica:** `=PROMEDIO(Columna_P1_Precision_PICO)` (Si es > 4.0, el prompt es válido).
- **Tasa de Éxito en Cribado:** `=CONTAR.SI(Columna_P6, "SI") / TOTAL_CASOS` (Si es > 85%, el sistema es confiable).
