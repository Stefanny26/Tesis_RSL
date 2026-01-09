# ANEXO C: CONJUNTO DE DATOS PARA VALIDACIÓN DEL GATEKEEPER IA

> **Dataset de Evaluación Experimental del Sistema de Validación PRISMA**  
> Protocolo de Recolección, Etiquetado y Análisis

---

## 📋 TABLA DE CONTENIDOS

1. [Objetivo del Dataset](#objetivo-del-dataset)
2. [Diseño Experimental](#diseño-experimental)
3. [Estructura del Dataset](#estructura-del-dataset)
4. [Protocolo de Recolección](#protocolo-de-recolección)
5. [Protocolo de Etiquetado](#protocolo-de-etiquetado)
6. [Ejecución del Experimento](#ejecución-del-experimento)
7. [Análisis de Resultados](#análisis-de-resultados)
8. [Formato de Archivos](#formato-de-archivos)

---

## 1. OBJETIVO DEL DATASET

### 1.1 Propósito

Evaluar cuantitativamente la **precisión del gatekeeper de IA** en validar el cumplimiento de los 27 ítems PRISMA 2020, comparando sus decisiones contra un estándar de referencia (gold standard) establecido por evaluadores humanos expertos.

### 1.2 Pregunta de Investigación

> **RQ:** ¿Con qué precisión puede un sistema basado en IA generativa (Gemini 1.5) validar el cumplimiento de los ítems PRISMA 2020 en comparación con evaluadores humanos expertos?

### 1.3 Hipótesis

- **H1:** El gatekeeper IA alcanzará un F1-Score ≥ 0.80 en la validación de ítems PRISMA
- **H0:** El gatekeeper IA tendrá un F1-Score < 0.80 (no suficientemente preciso)

---

## 2. DISEÑO EXPERIMENTAL

### 2.1 Alcance

**Enfoque:** Evaluar **10 ítems críticos** en profundidad (en lugar de los 27 superficialmente)

**Ítems Seleccionados:**

| # | Ítem | Sección | Justificación |
|---|------|---------|---------------|
| 1 | Título | TÍTULO | Primer filtro, crítico para identificación |
| 2 | Resumen | RESUMEN | Resumen estructurado, múltiples componentes |
| 5 | Criterios elegibilidad | MÉTODOS | Core metodológico, reproducibilidad |
| 6 | Fuentes información | MÉTODOS | Búsqueda exhaustiva, transparencia |
| 7 | Estrategia búsqueda | MÉTODOS | Técnico, requiere detalle específico |
| 16 | Selección estudios | RESULTADOS | Diagrama PRISMA, reporte de flujo |
| 17 | Características estudios | RESULTADOS | Tabulación de datos extraídos |
| 20 | Resultados síntesis | RESULTADOS | Integración de hallazgos |
| 23 | Discusión | DISCUSIÓN | Interpretación, limitaciones |
| 24 | Registro protocolo | OTRA INFO | Transparencia, pre-registro |

### 2.2 Tamaño de Muestra

**Por ítem:** 200 ejemplos (100 APROBADOS + 100 RECHAZADOS)  
**Total:** 10 ítems × 200 ejemplos = **2,000 textos**

**Justificación estadística:**
- 200 ejemplos por ítem permite detectar diferencias de ±5% en accuracy con 95% confianza
- Distribución balanceada (50/50) evita sesgo hacia clase mayoritaria

### 2.3 Fuentes de Datos

**Ejemplos APROBADOS (buenos):**
- Revisiones sistemáticas publicadas en journals **Q1** (JCR 2022-2024)
- Fuentes:
  - PubMed Central (PMC)
  - Cochrane Library
  - JMIR (Journal of Medical Internet Research)
  - Frontiers in Psychology
- Criterio: RSL que citan explícitamente seguir PRISMA 2020

**Ejemplos RECHAZADOS (malos):**
- 50% de RSL con problemas documentados (revisiones antiguas pre-PRISMA 2020)
- 50% sintéticos con errores específicos introducidos manualmente

---

## 3. ESTRUCTURA DEL DATASET

### 3.1 Esquema de Datos

```
dataset-validacion-gatekeeper/
├── raw/                          # Datos sin procesar
│   ├── item-01-titulo/
│   │   ├── approved/             # 100 ejemplos buenos
│   │   │   ├── ejemplo_001.txt
│   │   │   ├── ejemplo_002.txt
│   │   │   └── ...
│   │   └── rejected/             # 100 ejemplos malos
│   │       ├── ejemplo_101.txt
│   │       └── ...
│   ├── item-02-resumen/
│   └── ...
│
├── labeled/                      # Etiquetado por expertos
│   ├── dataset-item-01.csv
│   ├── dataset-item-02.csv
│   └── ...
│
├── predictions/                  # Resultados del gatekeeper
│   ├── predictions-item-01.csv
│   └── ...
│
├── analysis/                     # Análisis de resultados
│   ├── confusion-matrices/
│   ├── metrics-summary.xlsx
│   └── error-analysis.md
│
└── metadata/
    ├── sources.csv               # Fuente de cada ejemplo
    ├── inter-rater-reliability.csv
    └── experiment-log.md
```

### 3.2 Formato de Archivo CSV

**Archivo:** `labeled/dataset-item-01.csv`

```csv
id,item_number,text,source,label_human,confidence,rater_1,rater_2,notes
001,1,"Aplicaciones de IA en Educación: Revisión Sistemática",PMC_2024_001,APROBADO,HIGH,APROBADO,APROBADO,"Claro y cumple"
002,1,"Estado del Arte de Machine Learning",Synthetic,RECHAZADO,HIGH,RECHAZADO,RECHAZADO,"Falta 'revisión sistemática'"
003,1,"Revisión Sistemática del Uso de Realidad Virtual...",Cochrane_2023_045,APROBADO,MEDIUM,APROBADO,NECESITA_MEJORAS,"Rater 2 sugiere más específico"
...
```

**Campos:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String | Identificador único (001-200 por ítem) |
| `item_number` | Int | Número de ítem PRISMA (1-27) |
| `text` | String | Contenido a evaluar (título, resumen, etc.) |
| `source` | String | Fuente del ejemplo (journal_año_id o "Synthetic") |
| `label_human` | Enum | **APROBADO \| NECESITA_MEJORAS \| RECHAZADO** |
| `confidence` | Enum | HIGH \| MEDIUM \| LOW (confianza en etiqueta) |
| `rater_1` | Enum | Decisión del evaluador 1 |
| `rater_2` | Enum | Decisión del evaluador 2 |
| `notes` | String | Observaciones, razones de decisión |

### 3.3 Archivo de Predicciones

**Archivo:** `predictions/predictions-item-01.csv`

```csv
id,item_number,ai_decision,ai_score,ai_reasoning,ai_issues,ai_suggestions,execution_time_ms,ai_provider,timestamp
001,1,APROBADO,95,"Título cumple todos los criterios PRISMA","[]","[]",1523,gemini-1.5-flash,2026-01-15T10:23:45Z
002,1,RECHAZADO,35,"No identifica como revisión sistemática","[\"Falta palabra clave\"]","[\"Agregar 'Revisión Sistemática'\"]",1687,gemini-1.5-flash,2026-01-15T10:23:47Z
...
```

---

## 4. PROTOCOLO DE RECOLECCIÓN

### 4.1 Fase 1: Recolectar Ejemplos APROBADOS (Semanas 1-2)

**Objetivo:** 1,000 ejemplos de RSL de alta calidad

**Pasos:**

1. **Búsqueda en PubMed Central**
   ```
   Query: "systematic review"[Title] AND "PRISMA 2020"[Text] 
          AND ("2022"[DP] OR "2023"[DP] OR "2024"[DP])
   Filters: Free full text, English/Spanish
   ```

2. **Selección de Artículos**
   - Descargar PDF de 100-150 RSL
   - Priorizar: Medicina, Educación, Tecnología, Psicología
   - Verificar que citen PRISMA 2020 en metodología

3. **Extracción Manual por Ítem**
   - Para cada RSL seleccionada:
     - Extraer el título → `item-01-titulo/approved/RSL_xxx.txt`
     - Copiar el resumen → `item-02-resumen/approved/RSL_xxx.txt`
     - Copiar sección de criterios → `item-05-criterios/approved/RSL_xxx.txt`
     - (Y así sucesivamente para los 10 ítems)

4. **Documentación de Fuentes**
   - Registrar en `sources.csv`:
     ```csv
     example_id,item,source_journal,doi,year,quartile
     001,1,JMIR,10.2196/12345,2024,Q1
     ```

### 4.2 Fase 2: Crear Ejemplos RECHAZADOS (Semana 3)

**Estrategia Mixta:**

**A) 50% de RSL Pre-PRISMA 2020 (problemas reales)**

- Buscar RSL publicadas 2010-2019 (antes de PRISMA 2020)
- Extraer secciones que no cumplirían estándar actual
- Común: títulos sin "revisión sistemática", métodos vagos

**B) 50% Sintéticos (errores controlados)**

Modificar ejemplos APROBADOS introduciendo errores específicos:

**Para Ítem 1 (Título):**
- Quitar "Revisión Sistemática" del título
- Hacer título vago ("Aspectos de la IA")
- Título demasiado largo (>30 palabras)

**Para Ítem 5 (Criterios):**
- Omitir criterios de exclusión
- Criterios ambiguos ("estudios relevantes")
- No mencionar idiomas ni fechas

**Para Ítem 16 (Selección):**
- No reportar número de duplicados
- Omitir estudios excluidos con razón
- No mencionar diagrama PRISMA

**Documentar errores introducidos:**
```csv
example_id,item,error_type,description
101,1,missing_key_term,"Removed 'systematic review' from title"
102,1,too_vague,"Changed to generic title without specificity"
103,5,incomplete_criteria,"Removed exclusion criteria section"
```

---

## 5. PROTOCOLO DE ETIQUETADO (Gold Standard)

### 5.1 Evaluadores

**Rol: Evaluador 1 (Investigador Principal)**
- Tutor de tesis (experto en metodología de investigación)
- Familiarizado con PRISMA 2020

**Rol: Evaluador 2 (Investigador Secundario)**
- Investigador con experiencia en RSL
- O las estudiantes (tras capacitación en PRISMA)

### 5.2 Proceso de Etiquetado Ciego

**Setup:**
1. Aleatorizar orden de ejemplos (no agrupados por fuente)
2. Cada evaluador trabaja independientemente
3. Sin ver etiquetas del otro evaluador
4. Usar herramienta de etiquetado estandarizada

**Herramienta:** Planilla Excel con macros o app web simple

**Por cada ejemplo:**
1. Leer el texto del ítem
2. Revisar criterios PRISMA 2020 del ítem (tener guía a mano)
3. Decidir:
   - ✅ **APROBADO**: Cumple todos los criterios obligatorios
   - ⚠️ **NECESITA_MEJORAS**: Cumple parcialmente o con deficiencias menores
   - ❌ **RECHAZADO**: No cumple criterios obligatorios
4. Anotar justificación breve
5. Indicar confianza: HIGH / MEDIUM / LOW

### 5.3 Resolución de Discrepancias

**Cálculo de Acuerdo Inter-Evaluador (Kappa de Cohen):**

```python
from sklearn.metrics import cohen_kappa_score

kappa = cohen_kappa_score(rater_1_labels, rater_2_labels)
# Objetivo: κ > 0.80 (acuerdo casi perfecto)
```

**Proceso de Consenso:**

- Si κ < 0.75: Revisar guía de evaluación, re-entrenar
- Para casos con desacuerdo:
  1. Reunión de consenso
  2. Discutir razones de cada evaluador
  3. Re-leer ítem PRISMA oficial
  4. Decidir etiqueta final por mayoría (o agregar 3er evaluador)

**Registro:**
```csv
example_id,rater_1,rater_2,final_label,resolution_method
045,APROBADO,NECESITA_MEJORAS,APROBADO,"Consensus after discussion"
```

---

## 6. EJECUCIÓN DEL EXPERIMENTO

### 6.1 Script de Procesamiento

**Archivo:** `backend/scripts/run-validation-experiment.js`

```javascript
/**
 * Script para ejecutar el experimento de validación del gatekeeper
 * 
 * USO:
 *   node scripts/run-validation-experiment.js --item 1 --dataset ./dataset-validacion-gatekeeper/labeled/dataset-item-01.csv
 */

const fs = require('fs');
const csv = require('csv-parser');
const AIService = require('../src/infrastructure/services/ai.service');
const PROMPTS = require('../src/config/prisma-validation-prompts');

async function runExperiment(itemNumber, datasetPath) {
  console.log(`🧪 Iniciando experimento para Ítem ${itemNumber}...`);
  
  const aiService = new AIService();
  const results = [];
  let processed = 0;
  
  // Leer dataset
  const examples = [];
  await new Promise((resolve) => {
    fs.createReadStream(datasetPath)
      .pipe(csv())
      .on('data', (row) => examples.push(row))
      .on('end', resolve);
  });
  
  console.log(`📊 Total de ejemplos: ${examples.length}`);
  
  // Procesar cada ejemplo
  for (const example of examples) {
    try {
      const startTime = Date.now();
      
      // Obtener prompt de validación
      const promptConfig = PROMPTS[itemNumber];
      const fullPrompt = promptConfig.validationTemplate.replace(
        '{content}',
        example.text
      );
      
      // Llamar a IA
      const aiResponse = await aiService.generateText(
        promptConfig.systemPrompt,
        fullPrompt,
        'gemini'
      );
      
      // Parsear respuesta
      const validation = JSON.parse(aiResponse);
      
      const executionTime = Date.now() - startTime;
      
      // Registrar resultado
      results.push({
        id: example.id,
        item_number: itemNumber,
        text_preview: example.text.substring(0, 50) + '...',
        label_human: example.label_human,
        ai_decision: validation.decision,
        ai_score: validation.score,
        ai_reasoning: validation.reasoning,
        match: example.label_human === validation.decision,
        execution_time_ms: executionTime,
        timestamp: new Date().toISOString()
      });
      
      processed++;
      if (processed % 10 === 0) {
        console.log(`✅ Procesados: ${processed}/${examples.length}`);
      }
      
      // Rate limiting: esperar 2 segundos entre llamadas
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Error procesando ejemplo ${example.id}:`, error.message);
      results.push({
        id: example.id,
        error: error.message
      });
    }
  }
  
  // Guardar resultados
  const outputPath = `./dataset-validacion-gatekeeper/predictions/predictions-item-${itemNumber.toString().padStart(2, '0')}.csv`;
  const csvWriter = require('csv-writer').createObjectCsvWriter({
    path: outputPath,
    header: Object.keys(results[0]).map(key => ({ id: key, title: key }))
  });
  
  await csvWriter.writeRecords(results);
  console.log(`💾 Resultados guardados en: ${outputPath}`);
  
  // Calcular métricas preliminares
  const matches = results.filter(r => r.match).length;
  const accuracy = (matches / results.length * 100).toFixed(2);
  console.log(`\n📈 ACCURACY PRELIMINAR: ${accuracy}%`);
  
  return results;
}

// Ejecutar
const args = process.argv.slice(2);
const itemNumber = parseInt(args[args.indexOf('--item') + 1]);
const datasetPath = args[args.indexOf('--dataset') + 1];

runExperiment(itemNumber, datasetPath)
  .then(() => console.log('✅ Experimento completado'))
  .catch(err => console.error('❌ Error:', err));
```

### 6.2 Ejecución Paso a Paso

**Día 1: Ítems 1-2**
```bash
node scripts/run-validation-experiment.js --item 1 --dataset ./dataset/labeled/dataset-item-01.csv
node scripts/run-validation-experiment.js --item 2 --dataset ./dataset/labeled/dataset-item-02.csv
```

**Día 2: Ítems 5-6**
```bash
node scripts/run-validation-experiment.js --item 5 --dataset ./dataset/labeled/dataset-item-05.csv
node scripts/run-validation-experiment.js --item 6 --dataset ./dataset/labeled/dataset-item-06.csv
```

(Y así sucesivamente...)

**Consideraciones:**
- ⏱️ 200 ejemplos × 2 seg = ~7 minutos por ítem
- 💵 Costo API: ~$0.05-0.10 por ítem (Gemini Flash)
- 📊 Total experimento: 10 ítems × 7 min = **70 minutos**

---

## 7. ANÁLISIS DE RESULTADOS

### 7.1 Matriz de Confusión

Para cada ítem, calcular:

```
                  Predicción IA
                APROBADO  RECHAZADO
Humano  APROBADO    TP        FN
        RECHAZADO   FP        TN
```

**Leyenda:**
- **TP (True Positive)**: IA dijo APROBADO, humano también → ✅ Acierto
- **TN (True Negative)**: IA dijo RECHAZADO, humano también → ✅ Acierto
- **FP (False Positive)**: IA dijo APROBADO, humano dijo RECHAZADO → ❌ Error Tipo I (aprueba algo malo)
- **FN (False Negative)**: IA dijo RECHAZADO, humano dijo APROBADO → ❌ Error Tipo II (rechaza algo bueno)

### 7.2 Métricas Calculadas

```python
# Script: analysis/calculate-metrics.py

import pandas as pd
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score, confusion_matrix

def calculate_metrics(predictions_csv, item_number):
    df = pd.read_csv(predictions_csv)
    
    # Mapear a binario: APROBADO=1, RECHAZADO=0
    # (Simplificación: NECESITA_MEJORAS → 0)
    y_true = df['label_human'].apply(lambda x: 1 if x == 'APROBADO' else 0)
    y_pred = df['ai_decision'].apply(lambda x: 1 if x == 'APROBADO' else 0)
    
    # Calcular métricas
    metrics = {
        'item_number': item_number,
        'accuracy': accuracy_score(y_true, y_pred),
        'precision': precision_score(y_true, y_pred),
        'recall': recall_score(y_true, y_pred),
        'f1_score': f1_score(y_true, y_pred)
    }
    
    # Matriz de confusión
    cm = confusion_matrix(y_true, y_pred)
    metrics['TP'] = cm[1,1]
    metrics['TN'] = cm[0,0]
    metrics['FP'] = cm[0,1]
    metrics['FN'] = cm[1,0]
    
    return metrics

# Procesar todos los ítems
results = []
for i in [1, 2, 5, 6, 7, 16, 17, 20, 23, 24]:
    metrics = calculate_metrics(f'predictions/predictions-item-{i:02d}.csv', i)
    results.append(metrics)
    
# Guardar resultados
df_results = pd.DataFrame(results)
df_results.to_excel('analysis/metrics-summary.xlsx', index=False)
print(df_results)
```

**Output Esperado:**

```
   item  accuracy  precision  recall  f1_score   TP  TN  FP  FN
0     1      0.92       0.94    0.90      0.92   90  94   6  10
1     2      0.88       0.89    0.87      0.88   87  89  11  13
2     5      0.85       0.83    0.88      0.85   88  82  18  12
...
```

### 7.3 Análisis Cualitativo de Errores

**Para cada error (FP y FN):**

1. Revisar el texto original
2. Leer razonamiento de la IA
3. Comparar con decisión humana
4. Categorizar el error:
   - **Ambigüedad en texto**: Texto genuinamente difícil de clasificar
   - **Prompt insuficiente**: IA no captó criterio específico
   - **Error humano**: Evaluador humano se equivocó
   - **Caso límite**: Frontera entre APROBADO/NECESITA_MEJORAS

**Ejemplo de Análisis:**

```markdown
### Error FP #3 (Ítem 1)

**Texto:** "Revisión de Estrategias de IA en Salud Digital"

**Decisión IA:** APROBADO (score: 75)
**Razonamiento IA:** "Título menciona 'revisión' y el tema es claro"

**Decisión Humana:** RECHAZADO
**Justificación:** "Falta palabra 'sistemática' explícita"

**Análisis:**
- Error de la IA: No fue suficientemente estricta con el requisito de "revisión sistemática"
- Acción: Reforzar en el prompt que "revisión" solo NO es suficiente
- Categoría: Prompt insuficiente

**Mejora del Prompt:**
Agregar: "CRÍTICO: El título DEBE incluir explícitamente 'Revisión Sistemática', 
'Systematic Review', o 'Meta-analysis'. Simplemente 'Revisión' NO es suficiente."
```

---

## 8. FORMATO DE ARCHIVOS

### 8.1 Plantilla de Recolección

**Archivo:** `data-collection-template.xlsx`

| ID | Ítem | Texto Completo | Fuente | DOI | Año | Notas |
|----|------|----------------|--------|-----|-----|-------|
| 001 | 1 | [Título completo] | JMIR | 10.2196/... | 2024 | Q1 journal |

### 8.2 Plantilla de Etiquetado

**Archivo:** `labeling-template.xlsx`

| ID | Texto (primeros 100 chars) | Tu Decisión | Confianza | Justificación |
|----|----------------------------|-------------|-----------|---------------|
| 001 | "Aplicaciones de IA..." | [ ] APROBADO<br>[ ] NECESITA_MEJORAS<br>[ ] RECHAZADO | [ ] HIGH<br>[ ] MEDIUM<br>[ ] LOW | [Explicación] |

### 8.3 Reporte Final de Resultados

**Archivo:** `RESULTADOS-EXPERIMENTALES.md`

```markdown
# Resultados del Experimento de Validación

## Resumen Ejecutivo

- **Dataset:** 2,000 ejemplos (10 ítems × 200 ejemplos)
- **Período:** 15-25 Enero 2026
- **Modelo IA:** Google Gemini 1.5 Flash
- **Inter-rater Reliability:** κ = 0.87 (casi perfecto)

## Métricas Globales

| Métrica | Valor | Interpretación |
|---------|-------|----------------|
| **Accuracy** | 88.5% | Aciertos generales |
| **Precision** | 87.2% | De lo que aprueba, % correcto |
| **Recall** | 89.8% | De lo bueno real, % detectado |
| **F1-Score** | **0.885** | ✅ Supera objetivo (>0.80) |

## Resultados por Ítem

[Tabla detallada...]

## Análisis de Errores

### Falsos Positivos (N=126)
- 45% Ambigüedad en texto original
- 30% Prompt puede mejorarse
- 15% Casos límite APROBADO/NECESITA_MEJORAS
- 10% Error humano

### Falsos Negativos (N=104)
[Análisis...]

## Conclusiones

El gatekeeper IA demostró una precisión de **F1=0.885**, superando el umbral 
objetivo de 0.80. Esto valida su uso como herramienta de asistencia en la 
validación PRISMA, aunque con supervisión humana recomendada para casos límite.
```

---

## 📊 CRONOGRAMA DE EJECUCIÓN

| Fase | Actividad | Duración | Responsable |
|------|-----------|----------|-------------|
| **Semana 1** | Recolección ejemplos APROBADOS (ítems 1-5) | 3 días | Stefanny |
| **Semana 1** | Recolección ejemplos APROBADOS (ítems 6-10) | 3 días | Adriana |
| **Semana 2** | Creación ejemplos RECHAZADOS (sintéticos) | 2 días | Ambas |
| **Semana 2** | Etiquetado por Evaluador 1 (tutor) | 3 días | Tutor |
| **Semana 2** | Etiquetado por Evaluador 2 | 3 días | Estudiante |
| **Semana 3** | Resolución de discrepancias | 1 día | Equipo |
| **Semana 3** | Ejecución del experimento (script) | 2 horas | Stefanny |
| **Semana 3** | Cálculo de métricas | 1 día | Adriana |
| **Semana 3** | Análisis cualitativo de errores | 2 días | Ambas |
| **Semana 4** | Redacción de resultados (Cap 4.4) | 3 días | Ambas |

**Total: 3-4 semanas**

---

## ✅ CHECKLIST DE VALIDACIÓN

Antes de considerar el dataset completo:

- [ ] 2,000 ejemplos recolectados (10 ítems × 200)
- [ ] Balance 50/50 (APROBADO/RECHAZADO) en cada ítem
- [ ] Fuentes documentadas en `sources.csv`
- [ ] Doble etiquetado ciego completado
- [ ] Kappa de Cohen calculado (κ > 0.75)
- [ ] Discrepancias resueltas por consenso
- [ ] Script de experimento ejecutado sin errores
- [ ] Predicciones guardadas en CSV
- [ ] Matrices de confusión calculadas
- [ ] Métricas (Precision, Recall, F1) documentadas
- [ ] Análisis cualitativo de errores completado
- [ ] Resultados redactados para Capítulo 4

---

**Contacto para dudas:**
- Stefanny Hernández: smhernandez2@espe.edu.ec
- Adriana González: apgonzales1@espe.edu.ec
- Tutor: Paulo Galarza - pcgalarza@espe.edu.ec

**Última actualización:** Enero 8, 2026
