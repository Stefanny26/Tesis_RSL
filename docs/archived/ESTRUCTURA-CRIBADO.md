# 📊 Estructura del Sistema de Cribado

**Fecha**: Diciembre 2024  
**Estado**: 70% PRISMA Compliant (falta dual review + resolución de conflictos)

---

## 📋 Índice

1. [Arquitectura General](#arquitectura)
2. [Flujo de Trabajo Actual](#flujo)
3. [Componentes Frontend](#frontend)
4. [Backend (API + Lógica)](#backend)
5. [Base de Datos](#database)
6. [Fases del Cribado](#fases)
7. [Problemas Identificados](#problemas)
8. [Próximos Pasos](#proximos)

---

## 1. Arquitectura General {#arquitectura}

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIO (Frontend)                       │
├─────────────────────────────────────────────────────────────┤
│  Página Principal: /projects/[id]/screening/page.tsx        │
│                                                              │
│  5 Tabs:                                                    │
│  ├─ Fase 1: AI Screening (Embeddings + ChatGPT)            │
│  ├─ Fase 2: Revisión Individual Manual                     │
│  ├─ Fase 3: Revisión Texto Completo (PDF)                  │
│  ├─ Fase 4: Exclusiones y Razones                          │
│  └─ Fase 5: PRISMA Flow Diagram                            │
└─────────────────────────────────────────────────────────────┘
                            ↓ API Calls
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                      │
├─────────────────────────────────────────────────────────────┤
│  Routes:                                                     │
│  ├─ reference.routes.js                                     │
│  │   └─ CRUD referencias + clasificación                    │
│  └─ screening.routes.js                                     │
│      └─ Evaluación texto completo + estadísticas            │
│                                                              │
│  Use Cases:                                                 │
│  ├─ run-project-screening.use-case.js                       │
│  │   └─ Fase 1 (Embeddings) + Fase 2 (ChatGPT)             │
│  ├─ evaluate-fulltext.use-case.js                           │
│  │   └─ Fase 3 (Evaluación 7 criterios)                    │
│  ├─ analyze-screening-results.use-case.js                   │
│  │   └─ Estadísticas y análisis                            │
│  └─ detect-duplicates.use-case.js                           │
│      └─ Detección de duplicados                             │
└─────────────────────────────────────────────────────────────┘
                            ↓ Queries
┌─────────────────────────────────────────────────────────────┐
│                   BASE DE DATOS (PostgreSQL)                 │
├─────────────────────────────────────────────────────────────┤
│  Tablas:                                                     │
│  ├─ references                                               │
│  │   ├─ id, title, authors, abstract                        │
│  │   ├─ classification (included/excluded/pending)          │
│  │   ├─ ai_classification, similarity_score                 │
│  │   ├─ reviewed_by (single reviewer ID) ⚠️                │
│  │   └─ full_text_url, full_text_path                      │
│  │                                                           │
│  ├─ screening_records                                        │
│  │   ├─ id, reference_id, project_id                        │
│  │   ├─ stage (title-abstract / fulltext)                   │
│  │   ├─ decision (include/exclude/uncertain)                │
│  │   ├─ scores (JSONB con 7 criterios)                      │
│  │   ├─ user_id (single reviewer) ⚠️                       │
│  │   └─ created_at                                          │
│  │                                                           │
│  └─ protocols                                                │
│      ├─ screening_results (JSONB)                            │
│      │   ├─ summary (totales)                               │
│      │   ├─ phase1 (embeddings stats)                       │
│      │   └─ phase2 (chatgpt stats)                          │
│      └─ fase2_unlocked (boolean)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Flujo de Trabajo Actual {#flujo}

### Flujo Completo de Cribado

```
1️⃣ IMPORTACIÓN
   └─ Usuario importa referencias (RIS/CSV/BibTeX)
      └─ import-references-button.tsx
      └─ Endpoint: POST /api/projects/:id/references/import

2️⃣ DETECCIÓN DE DUPLICADOS (Opcional)
   └─ duplicate-detection-dialog.tsx
   └─ Usa: detect-duplicates.use-case.js
   └─ Método: Similitud de títulos (Levenshtein)

3️⃣ FASE 1: AI SCREENING (Embeddings)
   └─ ai-screening-panel.tsx
   └─ Endpoint: POST /api/projects/:id/run-screening
   └─ Lógica: run-project-screening.use-case.js
   
   Proceso:
   a) Genera embeddings de protocolo (keyTerms)
   b) Calcula similitud coseno con cada referencia
   c) Clasifica automáticamente:
      • Similitud > 30% → INCLUIR (alta confianza)
      • Similitud < 10% → EXCLUIR (alta confianza)
      • 10-30% → ZONA GRIS (requiere Fase 2)

4️⃣ FASE 2: AI SCREENING (ChatGPT)
   └─ Analiza solo referencias en "zona gris"
   └─ Usa: ChatGPT para análisis contextual
   └─ Criterios: relevancia, metodología, población
   └─ Resultado: INCLUIR / EXCLUIR con justificación

5️⃣ FASE 3: REVISIÓN MANUAL INDIVIDUAL ⚠️
   └─ individual-review-enhanced.tsx
   └─ Un solo revisor revisa manualmente
   └─ Endpoint: PATCH /api/references/:id
   └─ Guarda: classification + reviewed_by (1 usuario)
   
   ❌ PROBLEMA: PRISMA requiere 2 revisores independientes

6️⃣ FASE 4: REVISIÓN TEXTO COMPLETO
   └─ full-text-review.tsx + full-text-evaluation-form.tsx
   └─ Usuario sube PDF de referencia
   └─ Evalúa 7 criterios (0-12 puntos totales):
      1. Relevancia (0-2)
      2. Intervención presente (0-2)
      3. Validez metodológica (0-2)
      4. Datos reportados (0-2)
      5. Texto accesible (0-1)
      6. Rango de fechas (0-1)
      7. Calidad metodológica (0-2)
   └─ Umbral configurable (default: 8/12)
   └─ Endpoint: POST /api/screening/projects/:id/references/:refId/evaluate-fulltext

7️⃣ FASE 5: ESTADÍSTICAS Y PRISMA
   └─ hybrid-screening-stats.tsx
   └─ exclusion-reasons-table.tsx
   └─ prisma-flow-diagram.tsx
   └─ Genera diagrama de flujo PRISMA 2020
```

---

## 3. Componentes Frontend {#frontend}

### Página Principal
**Archivo**: `frontend/app/projects/[id]/screening/page.tsx` (1257 líneas)

**Estados principales**:
```typescript
- references: Reference[]           // Todas las referencias del proyecto
- selectedIds: string[]             // Referencias seleccionadas para acciones masivas
- statusFilter: "all" | "pending" | "included" | "excluded"
- methodFilter: "all" | "ai" | "manual"
- searchQuery: string
- activeTab: "fase1" | "fase2" | "fase3" | "exclusiones" | "prisma"
- stats: { total, pending, included, excluded }
- duplicatesStats: { groups, total }
- lastScreeningResult: { summary, phase1, phase2, classifications }
- fase2Unlocked: boolean            // Si se puede usar Fase 2 (ChatGPT)
```

### Componentes de Cribado (17 archivos)

| Componente | Propósito | Estado |
|------------|-----------|--------|
| **ai-screening-panel.tsx** | Panel principal de IA (Embeddings + ChatGPT) | ✅ Funcional |
| **individual-review-enhanced.tsx** | Revisión manual individual | ⚠️ Solo 1 revisor |
| **bulk-actions-bar.tsx** | Acciones masivas (incluir/excluir múltiples) | ✅ Funcional |
| **reference-table.tsx** | Tabla de referencias con filtros | ✅ Funcional |
| **reference-detail-dialog.tsx** | Detalle de una referencia | ✅ Funcional |
| **duplicate-detection-dialog.tsx** | Detección y gestión de duplicados | ✅ Funcional |
| **full-text-review.tsx** | Revisión de texto completo (upload PDF) | ✅ Funcional |
| **full-text-evaluation-form.tsx** | Formulario 7 criterios | ✅ Funcional |
| **classified-references-view.tsx** | Vista de referencias clasificadas | ✅ Funcional |
| **hybrid-screening-stats.tsx** | Estadísticas del cribado híbrido | ✅ Funcional |
| **exclusion-reasons-table.tsx** | Tabla de razones de exclusión | ✅ Funcional |
| **prisma-flow-diagram.tsx** | Diagrama flujo PRISMA 2020 | ✅ Funcional |
| **screening-filters.tsx** | Filtros de búsqueda | ✅ Funcional |
| **screening-analysis-panel.tsx** | Panel de análisis | ✅ Funcional |
| **similarity-distribution-analysis.tsx** | Análisis distribución similitud | ✅ Funcional |
| **import-references-button.tsx** | Importar referencias | ✅ Funcional |

**❌ COMPONENTES FALTANTES** (para PRISMA Compliance):
```
- dual-review-panel.tsx              // Panel de revisión dual
- reviewer-assignment-modal.tsx      // Asignar revisores a referencias
- conflict-resolution-dialog.tsx     // Resolver conflictos entre revisores
- inter-rater-agreement.tsx          // Cálculo Cohen's Kappa
- screening-workflow-manager.tsx     // Gestor de flujo dual
```

---

## 4. Backend (API + Lógica) {#backend}

### Rutas de Screening

**Archivo**: `backend/src/api/routes/screening.routes.js`

```javascript
// Evaluación de texto completo
POST   /api/projects/:projectId/references/:referenceId/evaluate-fulltext
PUT    /api/projects/:projectId/references/:referenceId/evaluate-fulltext/:recordId
DELETE /api/projects/:projectId/references/:referenceId/evaluate-fulltext/:recordId

// Historial y estadísticas
GET    /api/projects/:projectId/references/:referenceId/evaluation-history
GET    /api/projects/:projectId/references/:referenceId/latest-evaluation
GET    /api/projects/:projectId/screening-records
GET    /api/projects/:projectId/screening-statistics
```

**Archivo**: `backend/src/api/routes/reference.routes.js`

```javascript
// CRUD de referencias
GET    /api/projects/:projectId/references          // Lista paginada
GET    /api/projects/:projectId/references/all      // Todas sin paginación
POST   /api/projects/:projectId/references/import   // Importar RIS/CSV/BibTeX
GET    /api/references/:id                          // Detalle
PATCH  /api/references/:id                          // Actualizar (clasificación)
DELETE /api/references/:id                          // Eliminar

// IA Screening
POST   /api/projects/:projectId/run-screening       // Ejecutar cribado híbrido

// Duplicados
POST   /api/projects/:projectId/detect-duplicates   // Detectar duplicados
POST   /api/projects/:projectId/merge-duplicates    // Fusionar duplicados
```

### Use Cases Principales

#### 1. `run-project-screening.use-case.js`
**Propósito**: Ejecutar cribado híbrido (Fase 1 + Fase 2)

**Proceso**:
```javascript
execute({ projectId, protocolData }) {
  // 1. Generar embeddings del protocolo (keyTerms)
  const protocolEmbedding = await generateEmbedding(keyTerms)
  
  // 2. Para cada referencia sin clasificar:
  for (reference of unclassifiedReferences) {
    // 2.1 Calcular similitud coseno
    const similarity = cosineSimilarity(
      reference.embedding, 
      protocolEmbedding
    )
    
    // 2.2 Clasificación automática por umbral
    if (similarity > 0.30) {
      classification = 'included'
      confidence = 'high'
    } else if (similarity < 0.10) {
      classification = 'excluded'
      confidence = 'high'
    } else {
      // ZONA GRIS: requiere Fase 2 (ChatGPT)
      classification = 'pending'
      confidence = 'uncertain'
    }
    
    // 2.3 Guardar clasificación
    await referenceRepository.update(reference.id, {
      ai_classification: classification,
      similarity_score: similarity,
      classification_method: 'embeddings'
    })
  }
  
  // 3. FASE 2: Analizar zona gris con ChatGPT
  const greyZoneRefs = references.filter(r => 
    r.similarity_score >= 0.10 && r.similarity_score <= 0.30
  )
  
  for (reference of greyZoneRefs) {
    // 3.1 Prompt estructurado a ChatGPT
    const prompt = buildScreeningPrompt(reference, protocol)
    const analysis = await chatgpt.analyze(prompt)
    
    // 3.2 Actualizar con decisión de IA
    await referenceRepository.update(reference.id, {
      ai_classification: analysis.decision, // 'included' | 'excluded'
      ai_justification: analysis.reasoning,
      classification_method: 'chatgpt'
    })
  }
  
  // 4. Guardar resultados en protocolo
  await protocolRepository.update(projectId, {
    screeningResults: {
      summary: { total, included, excluded },
      phase1: { embeddings stats },
      phase2: { chatgpt stats }
    },
    fase2Unlocked: true
  })
}
```

#### 2. `evaluate-fulltext.use-case.js`
**Propósito**: Evaluar texto completo con 7 criterios

**Proceso**:
```javascript
execute({ referenceId, projectId, userId, scores, threshold }) {
  // 1. Validar scores (0-12 puntos totales)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
  
  // 2. Determinar decisión
  const decision = totalScore >= (threshold || 8) ? 'include' : 'exclude'
  
  // 3. Crear screening record
  const record = await screeningRecordRepository.create({
    reference_id: referenceId,
    project_id: projectId,
    user_id: userId,
    stage: 'fulltext',
    decision,
    scores,
    total_score: totalScore,
    threshold
  })
  
  // 4. Actualizar referencia
  await referenceRepository.update(referenceId, {
    classification: decision === 'include' ? 'included' : 'excluded',
    reviewed_by: userId // ⚠️ PROBLEMA: solo 1 revisor
  })
  
  return record
}
```

#### 3. `detect-duplicates.use-case.js`
**Propósito**: Detectar duplicados por similitud de títulos

**Método**:
```javascript
// Levenshtein distance + DOI comparison
for (ref1 of references) {
  for (ref2 of references.slice(i+1)) {
    // 1. Comparar DOIs (100% match)
    if (ref1.doi && ref1.doi === ref2.doi) {
      duplicates.push([ref1, ref2])
    }
    
    // 2. Similitud de títulos (> 85%)
    const similarity = levenshteinSimilarity(
      ref1.title.toLowerCase(),
      ref2.title.toLowerCase()
    )
    
    if (similarity > 0.85) {
      duplicates.push([ref1, ref2])
    }
  }
}
```

---

## 5. Base de Datos {#database}

### Tabla: `references`

```sql
CREATE TABLE references (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  
  -- Metadatos bibliográficos
  title TEXT NOT NULL,
  authors TEXT,
  abstract TEXT,
  publication_year INTEGER,
  doi TEXT,
  source TEXT, -- revista/conferencia
  
  -- Clasificación
  classification VARCHAR(50), -- 'pending' | 'included' | 'excluded'
  classification_method VARCHAR(50), -- 'embeddings' | 'chatgpt' | 'manual'
  
  -- IA Screening
  ai_classification VARCHAR(50),
  ai_justification TEXT,
  similarity_score FLOAT, -- 0.0 - 1.0
  embedding vector(1536), -- pgvector
  
  -- Revisión manual (PROBLEMA: solo 1 revisor)
  reviewed_by UUID REFERENCES users(id), -- ⚠️ Debería ser reviewed_by_1, reviewed_by_2
  review_notes TEXT,
  exclusion_reason TEXT,
  
  -- Texto completo
  full_text_url TEXT,
  full_text_path TEXT, -- Path local del PDF
  full_text_available BOOLEAN DEFAULT false,
  
  -- Duplicados
  is_duplicate BOOLEAN DEFAULT false,
  duplicate_of UUID REFERENCES references(id),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_references_project_id ON references(project_id);
CREATE INDEX idx_references_classification ON references(classification);
CREATE INDEX idx_references_similarity_score ON references(similarity_score);
CREATE INDEX idx_references_embedding ON references USING ivfflat (embedding vector_cosine_ops);
```

### Tabla: `screening_records`

```sql
CREATE TABLE screening_records (
  id UUID PRIMARY KEY,
  reference_id UUID REFERENCES references(id),
  project_id UUID REFERENCES projects(id),
  
  -- Revisor (PROBLEMA: solo 1 revisor)
  user_id UUID REFERENCES users(id), -- ⚠️ Debería ser reviewer_id
  
  -- Etapa de cribado
  stage VARCHAR(50) NOT NULL, -- 'title-abstract' | 'fulltext'
  
  -- Decisión
  decision VARCHAR(50) NOT NULL, -- 'include' | 'exclude' | 'uncertain'
  comment TEXT,
  
  -- Evaluación de texto completo (7 criterios)
  scores JSONB, -- { relevance, interventionPresent, methodValidity, ... }
  total_score INTEGER,
  threshold INTEGER DEFAULT 8,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_screening_records_reference_id ON screening_records(reference_id);
CREATE INDEX idx_screening_records_project_id ON screening_records(project_id);
CREATE INDEX idx_screening_records_user_id ON screening_records(user_id);
CREATE INDEX idx_screening_records_stage ON screening_records(stage);
```

### Tabla: `protocols` (campos relacionados)

```sql
ALTER TABLE protocols ADD COLUMN screening_results JSONB;
-- Estructura:
-- {
--   summary: { total, pending, included, excluded },
--   phase1: { highConfidenceInclude, highConfidenceExclude, greyZone },
--   phase2: { analyzed, totalTime, estimatedCost },
--   classifications: [{ referenceId, decision, method, score }]
-- }

ALTER TABLE protocols ADD COLUMN fase2_unlocked BOOLEAN DEFAULT false;
```

---

## 6. Fases del Cribado {#fases}

### Fase 1: AI Screening (Embeddings) ✅
**Estado**: COMPLETO (100%)

**Tecnología**: OpenAI Embeddings (text-embedding-3-small) + pgvector

**Proceso**:
1. Generar embedding del protocolo (keyTerms)
2. Calcular similitud coseno con cada referencia
3. Clasificación automática por umbral:
   - `> 30%` → INCLUIR (alta confianza)
   - `< 10%` → EXCLUIR (alta confianza)
   - `10-30%` → ZONA GRIS (requiere Fase 2)

**Ventajas**:
- ✅ Rápido (< 5 segundos para 1000 referencias)
- ✅ Económico ($0.002 / 1000 referencias)
- ✅ Consistente (sin variabilidad humana)

**Limitaciones**:
- ⚠️ No entiende contexto profundo
- ⚠️ Puede tener falsos positivos en zona gris

---

### Fase 2: AI Screening (ChatGPT) ✅
**Estado**: COMPLETO (100%)

**Tecnología**: ChatGPT-4o-mini (análisis contextual)

**Proceso**:
1. Analizar solo referencias en "zona gris" (10-30% similitud)
2. Prompt estructurado con:
   - Protocolo PICO completo
   - Criterios de inclusión/exclusión
   - Abstract de la referencia
3. ChatGPT decide: INCLUIR / EXCLUIR con justificación
4. Guarda decisión + razonamiento

**Ventajas**:
- ✅ Análisis contextual profundo
- ✅ Identifica sutilezas metodológicas
- ✅ Justifica decisiones

**Limitaciones**:
- ⚠️ Más lento (~2 seg por referencia)
- ⚠️ Más costoso ($0.01 por análisis)
- ⚠️ Solo analiza zona gris (típicamente 20-30% del total)

---

### Fase 3: Revisión Manual Individual ⚠️
**Estado**: PARCIAL (50%) - **PROBLEMA CRÍTICO**

**Proceso actual**:
1. Usuario revisa referencias manualmente
2. Marca como INCLUIR / EXCLUIR
3. Agrega notas/razones de exclusión
4. Se guarda `reviewed_by` (ID del usuario)

**❌ PROBLEMA PRISMA**:
- PRISMA 2020 **REQUIERE** 2 revisores independientes
- Actual: solo 1 revisor
- Falta: sistema de dual review
- Falta: resolución de conflictos
- Falta: cálculo de Cohen's Kappa (acuerdo inter-evaluador)

**Implementación requerida**:
```typescript
// Cambios en DB
ALTER TABLE references 
  ADD COLUMN reviewed_by_1 UUID REFERENCES users(id),
  ADD COLUMN reviewed_by_2 UUID REFERENCES users(id),
  ADD COLUMN reviewer1_decision VARCHAR(50),
  ADD COLUMN reviewer2_decision VARCHAR(50),
  ADD COLUMN conflict_resolved BOOLEAN DEFAULT false,
  ADD COLUMN final_decision VARCHAR(50);

// Nuevo flujo
1. Asignar Revisor 1 a referencias
2. Revisor 1 clasifica
3. Asignar Revisor 2 a referencias
4. Revisor 2 clasifica (sin ver decisión R1)
5. Detectar conflictos (R1 ≠ R2)
6. Revisor 3 o consenso resuelve conflictos
7. Calcular Cohen's Kappa
```

---

### Fase 4: Revisión Texto Completo ✅
**Estado**: COMPLETO (100%)

**Proceso**:
1. Usuario sube PDF de referencia
2. Evalúa 7 criterios (escala 0-2 o 0-1):
   ```
   1. Relevancia (0-2)
   2. Intervención presente (0-2)
   3. Validez metodológica (0-2)
   4. Datos reportados (0-2)
   5. Texto accesible (0-1)
   6. Rango de fechas (0-1)
   7. Calidad metodológica (0-2)
   
   Total: 0-12 puntos
   Umbral default: 8/12
   ```
3. Se crea `screening_record` con scores
4. Decisión final: INCLUIR (≥8) / EXCLUIR (<8)

**Ventajas**:
- ✅ Evaluación estructurada y cuantificable
- ✅ Almacena evidencia de cada criterio
- ✅ Umbral configurable

**Limitaciones**:
- ⚠️ Requiere PDFs (no siempre disponibles)
- ⚠️ Tiempo intensivo
- ⚠️ Solo 1 evaluador (debería ser 2 para PRISMA)

---

### Fase 5: Estadísticas y PRISMA ✅
**Estado**: COMPLETO (100%)

**Componentes**:
1. **Diagrama Flujo PRISMA** (`prisma-flow-diagram.tsx`)
   - Identificación: # referencias importadas
   - Cribado Fase 1: alta confianza (incluir/excluir)
   - Cribado Fase 2: zona gris analizada
   - Elegibilidad: texto completo evaluado
   - Incluidas: referencias finales

2. **Estadísticas del Cribado** (`hybrid-screening-stats.tsx`)
   - Total procesado
   - Incluidas / Excluidas
   - Zona gris
   - Tiempo total
   - Costo estimado

3. **Razones de Exclusión** (`exclusion-reasons-table.tsx`)
   - Tabla con motivos agrupados
   - Frecuencia de cada motivo

**Ventajas**:
- ✅ Genera diagrama PRISMA automáticamente
- ✅ Visualización clara de estadísticas
- ✅ Cumple con reporte PRISMA Item 17

---

## 7. Problemas Identificados {#problemas}

### 🔴 CRÍTICOS (Bloquean PRISMA Compliance)

#### 1. **No hay Revisión Dual Independiente**
**Impacto**: PRISMA Item 8 - Proceso de selección

**Problema actual**:
```sql
-- DB actual
reviewed_by UUID  -- ❌ Solo 1 revisor

-- DB requerida
reviewed_by_1 UUID
reviewed_by_2 UUID
reviewer1_decision VARCHAR(50)
reviewer2_decision VARCHAR(50)
conflict_resolved BOOLEAN
final_decision VARCHAR(50)
```

**Componentes faltantes**:
- Panel de asignación de revisores
- Vista de revisión independiente (ocultar decisión del otro)
- Sistema de detección de conflictos

#### 2. **No hay Resolución de Conflictos**
**Impacto**: PRISMA Item 8 - Consenso

**Requerido**:
- Dialog para resolver conflictos (R1 ≠ R2)
- Revisor 3 o consenso entre R1 y R2
- Registro de resolución con justificación

#### 3. **No hay Cálculo de Cohen's Kappa**
**Impacto**: PRISMA Item 8 - Acuerdo inter-evaluador

**Requerido**:
```javascript
// Calcular acuerdo entre R1 y R2
function calculateCohensKappa(decisions1, decisions2) {
  const agreements = decisions1.filter((d, i) => 
    d === decisions2[i]
  ).length
  
  const po = agreements / decisions1.length
  const pe = calculateExpectedAgreement(decisions1, decisions2)
  
  return (po - pe) / (1 - pe)
}

// Interpretar Kappa
// 0.81-1.00: Excelente
// 0.61-0.80: Sustancial
// 0.41-0.60: Moderado
// 0.21-0.40: Aceptable
// 0.00-0.20: Pobre
// < 0.00: Sin acuerdo
```

### 🟡 IMPORTANTES (Afectan Funcionalidad)

#### 4. **Screening de Texto Completo es Manual**
**Problema**: No hay asistencia IA para extraer texto del PDF

**Mejora sugerida**:
- OCR automático de PDFs
- IA lee PDF y sugiere puntajes
- Usuario valida/ajusta

#### 5. **Detección de Duplicados es Básica**
**Método actual**: Levenshtein distance en títulos

**Mejora sugerida**:
- Comparar DOIs (ya implementado ✅)
- Comparar autores + año
- Embeddings de abstract (similitud semántica)

#### 6. **Fase 2 (ChatGPT) No es Configurable**
**Problema**: Umbrales fijos (10-30%)

**Mejora sugerida**:
- Permitir configurar umbrales por proyecto
- Opción de analizar toda la base (no solo zona gris)
- Elegir modelo (GPT-4o-mini vs GPT-4o)

### 🟢 MENORES (Mejoras UX)

#### 7. **No hay Exportación de Resultados**
**Falta**: Exportar referencias clasificadas a CSV/Excel

#### 8. **No hay Historial de Cambios**
**Falta**: Ver quién cambió la clasificación y cuándo

#### 9. **Búsqueda es Básica**
**Actual**: Solo por título
**Mejora**: Buscar por autor, año, DOI, abstract

---

## 8. Próximos Pasos {#proximos}

### Opción A: Implementar Dual Review (8-12 semanas)

**Fase 1: Modificar Base de Datos** (1 semana)
```sql
-- Migration script
ALTER TABLE references 
  ADD COLUMN reviewed_by_1 UUID REFERENCES users(id),
  ADD COLUMN reviewed_by_2 UUID REFERENCES users(id),
  ADD COLUMN reviewer1_decision VARCHAR(50),
  ADD COLUMN reviewer1_notes TEXT,
  ADD COLUMN reviewer2_decision VARCHAR(50),
  ADD COLUMN reviewer2_notes TEXT,
  ADD COLUMN conflict_resolved BOOLEAN DEFAULT false,
  ADD COLUMN resolved_by UUID REFERENCES users(id),
  ADD COLUMN final_decision VARCHAR(50),
  ADD COLUMN final_decision_notes TEXT;

-- Mantener compatibilidad con sistema actual
UPDATE references 
SET reviewed_by_1 = reviewed_by 
WHERE reviewed_by IS NOT NULL;
```

**Fase 2: Backend - API Endpoints** (2 semanas)
```javascript
// Nuevos endpoints
POST   /api/projects/:id/assign-reviewers
       Body: { referenceIds, reviewer1Id, reviewer2Id }

GET    /api/projects/:id/reviewer-assignments
       Query: reviewerId (filtrar por revisor)

POST   /api/references/:id/review
       Body: { reviewerId, decision, notes }

GET    /api/projects/:id/conflicts
       Response: Referencias con R1 ≠ R2

POST   /api/references/:id/resolve-conflict
       Body: { resolvedBy, finalDecision, notes }

GET    /api/projects/:id/inter-rater-agreement
       Response: { kappa, agreements, disagreements, ... }
```

**Fase 3: Frontend - Componentes** (3 semanas)
```typescript
// Nuevos componentes
1. reviewer-assignment-modal.tsx
   - Seleccionar revisores del equipo
   - Asignar referencias (manual o automático)
   - Ver carga de trabajo de cada revisor

2. dual-review-panel.tsx
   - Dos columnas: R1 y R2
   - Cada revisor ve solo su columna
   - Ocultar decisión del otro hasta que ambos terminen

3. conflict-resolution-dialog.tsx
   - Lista de conflictos (R1 ≠ R2)
   - Ver ambas decisiones + notas
   - Resolver (R3 decide o consenso)

4. inter-rater-agreement.tsx
   - Cálculo de Cohen's Kappa
   - Visualización de acuerdos/desacuerdos
   - Análisis por categoría
```

**Fase 4: Testing y Refinamiento** (2 semanas)
- Unit tests para cálculo de Kappa
- Integration tests para flujo completo
- User testing con investigadores reales

**Fase 5: Documentación** (1 semana)
- Guía de usuario para dual review
- Video tutorial
- Actualizar PRISMA compliance score

**Resultado**: PRISMA Compliance ≈ 85%

---

### Opción B: Mejoras Incrementales (4-6 semanas)

**Prioridad 1**: Exportación de resultados (1 semana)
- CSV con todas las referencias clasificadas
- Incluir: título, autores, decisión, revisor, notas

**Prioridad 2**: Historial de cambios (1 semana)
- Tabla `reference_history`
- Trigger para registrar cambios
- Vista en UI

**Prioridad 3**: Búsqueda avanzada (1 semana)
- Buscar por múltiples campos
- Filtros combinados
- Búsqueda semántica con embeddings

**Prioridad 4**: Configuración de umbrales (1 semana)
- Permitir configurar umbrales de Fase 1 y 2
- Guardar en protocolo
- UI para ajustar

**Resultado**: Sistema más usable, PRISMA Compliance ≈ 70%

---

### Opción C: Solo Documentar (1 semana)

**Actividades**:
1. Crear especificaciones técnicas para dual review
2. Prototipos de interfaces (Figma)
3. Estimar esfuerzo detallado por feature
4. Priorizar por ROI
5. Roadmap para Q1 2025

**Resultado**: Claridad para futura implementación

---

## 📊 Resumen Ejecutivo

### Estado Actual del Cribado

| Componente | Completitud | PRISMA Compliance |
|------------|-------------|-------------------|
| **Importación Referencias** | 100% | ✅ |
| **Detección Duplicados** | 100% | ✅ |
| **IA Screening (Embeddings)** | 100% | ✅ |
| **IA Screening (ChatGPT)** | 100% | ✅ |
| **Revisión Manual Individual** | 100% | ⚠️ Parcial |
| **Revisión Dual Independiente** | 0% | ❌ |
| **Resolución Conflictos** | 0% | ❌ |
| **Cohen's Kappa** | 0% | ❌ |
| **Texto Completo** | 100% | ✅ |
| **PRISMA Diagram** | 100% | ✅ |
| **Estadísticas** | 100% | ✅ |

**PRISMA Compliance Total**: **70%**

### Fortalezas ✅
- Sistema híbrido IA (Embeddings + ChatGPT) muy eficiente
- Evaluación estructurada de texto completo
- Generación automática de diagrama PRISMA
- Importación múltiples formatos (RIS, CSV, BibTeX)
- Detección de duplicados funcional
- UI intuitiva y bien organizada

### Debilidades Críticas ❌
- **No hay revisión dual independiente** (requerida por PRISMA)
- **No hay resolución de conflictos**
- **No hay cálculo de Cohen's Kappa**
- Solo 1 revisor en DB (arquitectura no soporta dual review)

### Recomendación

**Para tesis/investigación académica**: Implementar **Opción A** (Dual Review completo)
- Justificación: PRISMA 2020 es estándar internacional
- Credibilidad: Sin dual review, la RSL no es válida
- Tiempo: 8-12 semanas es razonable para alcance de tesis

**Para MVP/producto**: **Opción B** (Mejoras incrementales)
- Justificación: Sistema ya es funcional y útil
- Monetización: Dual review puede ser feature premium
- Tiempo: 4-6 semanas para quick wins

---

**Última actualización**: Diciembre 2024  
**Próxima revisión**: Después de decisión sobre Opción A/B/C
