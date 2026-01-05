# 📋 Análisis de Implementación: Fase de Cribado

**Fecha:** 3 de Diciembre, 2025  
**Comparación:** Requerimientos del Docente vs Implementación Actual

---

## 🎯 Resumen Ejecutivo

Este documento analiza el estado actual del sistema de cribado comparándolo con los 4 pasos requeridos por el docente. Se identifican funcionalidades **YA IMPLEMENTADAS** ✅, **PARCIALMENTE IMPLEMENTADAS** ⚠️ y **FALTANTES** ❌.

### Estado General por Fase

| Fase | Estado | Completitud | Prioridad |
|------|--------|-------------|-----------|
| **Fase 1: Eliminar Duplicados** | ✅ COMPLETO | 95% | Baja |
| **Fase 2: Screening (Título/Resumen)** | ⚠️ PARCIAL | 70% | **ALTA** |
| **Fase 3: Full Screening (Texto Completo)** | ⚠️ PARCIAL | 40% | **CRÍTICA** |
| **Fase 4: Análisis de Resultados** | ⚠️ PARCIAL | 60% | Media |

---

## 📊 FASE 1: Eliminar Duplicados

### ✅ YA IMPLEMENTADO

**Archivo:** `backend/src/domain/use-cases/detect-duplicates.use-case.js`

#### Algoritmos Implementados:

1. **✅ Coincidencia por DOI (Prioridad 1)**
   ```javascript
   // Normaliza DOI y compara
   _normalizeDOI(doi) {
     return doi.toLowerCase().replace(/https?:\/\/(dx\.)?doi\.org\//gi, '').trim();
   }
   ```
   - ✅ Elimina prefijos HTTP
   - ✅ Case-insensitive
   - ✅ Identifica como duplicado si DOI coincide

2. **✅ Coincidencia por Título + Similitud (Prioridad 2)**
   ```javascript
   _calculateSimilarity(title1, title2) {
     const distance = this._levenshteinDistance(t1, t2);
     const similarity = ((maxLength - distance) / maxLength) * 100;
   }
   ```
   - ✅ Normaliza títulos (lowercase, sin acentos, sin caracteres especiales)
   - ✅ Algoritmo de Levenshtein implementado
   - ✅ Umbral de 90% para duplicado exacto
   - ✅ Umbral de 85% + autores coincidentes

3. **✅ Comparación de Autores**
   ```javascript
   _sameAuthors(authors1, authors2) {
     // Normaliza y compara conjuntos
     // Si >= 50% autores coinciden → duplicado
   }
   ```

4. **✅ Acciones Implementadas**
   - Marca referencias como `status: 'duplicate'`
   - Agrupa duplicados manteniendo el original con más metadatos
   - Genera reporte con grupos de duplicados

5. **✅ Frontend**
   - Componente: `frontend/components/screening/duplicate-detection-dialog.tsx`
   - Botón "Detectar Duplicados" en UI
   - Diálogo mostrando grupos y pares detectados
   - Estadísticas: total, únicos, duplicados, grupos

### ⚠️ MEJORAS RECOMENDADAS

1. **Prioridad de Metadatos**: Implementar lógica que conserve referencia con:
   - Abstract presente > sin abstract
   - PDF disponible > sin PDF
   - Más campos completos

2. **Exportación**: Crear `duplicates.csv` con:
   ```csv
   id_kept,id_removed,similarity_score,reason,doi_match,title_match
   ```

3. **Normalización Título + Autor + Año**: Añadir verificación:
   ```javascript
   if (similarity >= 80 && sameYear && firstAuthorMatch) {
     return true; // duplicado
   }
   ```

### 📈 Completitud: **95%**

**Lo que falta:**
- ❌ Exportar CSV de duplicados
- ❌ Lógica explícita de "mejor metadato"
- ❌ Coincidendia título+autor+año normalizado

---

## 📊 FASE 2: Screening (Título/Resumen) - Limpieza Rápida

### ✅ YA IMPLEMENTADO

**Archivos:**
- `backend/src/domain/use-cases/run-project-screening.use-case.js`
- `backend/src/domain/use-cases/screen-references-embeddings.use-case.js`
- `backend/src/domain/use-cases/screen-references-with-ai.use-case.js`

#### 1. **Sistema Híbrido IMPLEMENTADO** ✅

```javascript
// FASE 1: Embeddings para clasificación rápida
executeHybrid({ projectId, protocol, embeddingThreshold = 0.15 }) {
  // Clasifica:
  // - similarity >= 30% → Alta confianza INCLUIR
  // - similarity <= 10% → Alta confianza EXCLUIR  
  // - 10-30% → Zona gris (envía a ChatGPT)
}
```

**Características:**
- ✅ Modelo: `all-MiniLM-L6-v2` (384 dims)
- ✅ Similitud coseno entre embeddings
- ✅ Umbral ajustable (recomendado: 15% para inglés-español)
- ✅ Análisis de distribución con método Elbow (RECIÉN IMPLEMENTADO)
- ✅ Estadísticas automáticas (percentiles, mean, median, std dev)

#### 2. **Análisis con LLM para Zona Gris** ✅

```javascript
// FASE 2: ChatGPT/Gemini analiza solo zona gris
if (greyZone.length > 0) {
  const llmResult = await this.screenAIUseCase.executeBatch({
    references: greyZoneRefs,
    protocol,
    provider: aiProvider // 'chatgpt' o 'gemini'
  });
}
```

**Características:**
- ✅ Razonamiento contextual completo
- ✅ Evaluación de criterios PICO
- ✅ Explicaciones detalladas por referencia
- ✅ Confidence score (0-1)

#### 3. **Frontend Implementado** ✅

**Componentes:**
- `frontend/components/screening/ai-screening-panel.tsx` - Panel de control
- `frontend/components/screening/similarity-distribution-analysis.tsx` - Análisis Elbow
- `frontend/components/screening/hybrid-screening-stats.tsx` - Estadísticas
- `frontend/components/screening/reference-table.tsx` - Tabla de referencias

**Flujo UI:**
1. Usuario ejecuta "Análisis de Distribución" → Ve punto de corte óptimo
2. Acepta umbral recomendado → Slider se actualiza automáticamente
3. Ejecuta "Cribado Híbrido" → Embeddings + ChatGPT
4. Ve resultados: incluidos, excluidos, zona gris analizados

### ⚠️ PARCIALMENTE IMPLEMENTADO

#### 1. **Filtrado por Términos del Protocolo** ⚠️

**Estado Actual:**
- ✅ Protocolo genera `keyTerms` (technologies, applicationDomain, studyType, thematicFocus)
- ✅ Se usan en embeddings para calcular similitud semántica
- ❌ **NO hay filtro boolean explícito** con INCLUDE/EXCLUDE keywords

**Lo que falta implementar:**

```javascript
// NUEVO: Filtro boolean basado en términos
class KeywordScreeningUseCase {
  execute({ reference, protocol }) {
    const { inclusionCriteria, exclusionCriteria, keyTerms } = protocol;
    
    // Construir listas de keywords
    const includeKeywords = this._extractKeywords(inclusionCriteria, keyTerms);
    const excludeKeywords = this._extractKeywords(exclusionCriteria, keyTerms);
    
    // Tokenizar título + abstract
    const text = `${reference.title} ${reference.abstract}`.toLowerCase();
    
    // Verificar exclusiones (prioridad alta)
    for (const kw of excludeKeywords) {
      if (text.includes(kw)) {
        return { decision: 'exclude_auto', reason: `Keyword exclusión: ${kw}` };
      }
    }
    
    // Verificar inclusiones
    const includeMatches = includeKeywords.filter(kw => text.includes(kw));
    if (includeMatches.length >= 2) { // Al menos 2 keywords
      return { decision: 'include_auto', reason: `Keywords matched: ${includeMatches}` };
    }
    
    // Sin coincidencias claras
    return { decision: 'manual_review', reason: 'No clear keyword match' };
  }
}
```

#### 2. **UI para Revisión Manual con Términos Resaltados** ⚠️

**Actual:**
- ✅ Componente `individual-review-enhanced.tsx` existe
- ✅ Muestra título, abstract, autores, año
- ✅ Botones Incluir/Excluir con motivos
- ❌ **NO resalta términos matched** del protocolo

**Mejora Requerida:**

```tsx
// Función para resaltar keywords en abstract
function highlightKeywords(text: string, keywords: string[]) {
  let highlighted = text;
  keywords.forEach(kw => {
    const regex = new RegExp(`(${kw})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  });
  return highlighted;
}

// En el componente:
<div dangerouslySetInnerHTML={{ 
  __html: highlightKeywords(reference.abstract, matchedKeywords) 
}} />
```

#### 3. **Métricas de Concordancia** ⚠️

**Actual:**
- ✅ `analyze-screening-results.use-case.js` calcula:
  - Total procesados
  - Por estado (pending, included, excluded)
  - Con/sin IA
  - Avg confidence, avg similarity
  - **Disagreements** (cuando humano difiere de IA)
- ❌ **NO calcula % de concordancia** entre auto-match y decisión humana

**Agregar:**

```javascript
// En analyze-screening-results.use-case.js
stats.concordance = {
  autoMatchCorrect: 0,    // Humano confirmó recomendación IA
  autoMatchIncorrect: 0,  // Humano cambió decisión IA
  concordanceRate: 0      // % de acuerdo
};

// Calcular para cada referencia con IA:
if (ref.ai_recommendation && ref.screening_status !== 'pending') {
  if (ref.ai_recommendation === ref.screening_status) {
    stats.concordance.autoMatchCorrect++;
  } else {
    stats.concordance.autoMatchIncorrect++;
  }
}

stats.concordance.concordanceRate = 
  ((stats.concordance.autoMatchCorrect / stats.withAI) * 100).toFixed(1);
```

### 📈 Completitud: **70%**

**Prioridad ALTA - Implementar:**
1. ❌ Filtro boolean por keywords (INCLUDE/EXCLUDE)
2. ❌ Resaltar términos matched en UI
3. ❌ Métrica de concordancia auto-match vs humano
4. ❌ Categorización automática por tipo de estudio (si aplica PICO)

---

## 📊 FASE 3: Full Screening (Texto Completo) - Limpieza Profunda

### ✅ YA IMPLEMENTADO

**Archivos:**
- `frontend/components/screening/full-text-review.tsx`
- `backend/src/domain/models/reference.model.js`

#### 1. **Gestión de PDFs** ✅

```tsx
// Subir PDF por referencia
handleFileUpload = async (referenceId: string, file: File) => {
  const formData = new FormData();
  formData.append('pdf', file);
  formData.append('referenceId', referenceId);
  // TODO: Implementar endpoint backend
}
```

**Estado:**
- ✅ UI para subir PDFs (drag & drop / botón)
- ✅ Validación de tipo archivo (solo PDF)
- ✅ Progress bar general (X de Y artículos con PDF)
- ✅ Estados visuales (con PDF / sin PDF)
- ❌ **Backend endpoint NO implementado** (almacenamiento de archivos)

#### 2. **Modelo de Datos** ✅

```javascript
// reference.model.js tiene campos:
fullTextAvailable: boolean
fullTextUrl: string
manualReviewStatus: string
manualReviewNotes: string
reviewedBy: string
reviewedAt: timestamp
```

### ❌ NO IMPLEMENTADO

#### **Sistema de Puntuación y Checklist** ❌❌❌ **CRÍTICO**

**Requerimiento del Docente:**

```javascript
// Checklist esperado por referencia
{
  "studyId": "abc123",
  "user": "stefanny",
  "stage": "fulltext",
  "scores": {
    "relevance": 2,              // 0-2
    "intervention_present": 2,    // 0-2
    "method_validity": 1,         // 0-2
    "data_reported": 2,           // 0-2
    "text_accessible": 1,         // 0-1
    "date_range": 1,              // 0-1
    "method_quality": 1           // 0-2
  },
  "totalScore": 10,               // Suma de scores
  "decision": "include",          // include/exclude basado en threshold
  "threshold": 7,                 // Umbral mínimo (7/12)
  "reason": null,                 // Si exclude, motivo
  "comment": "Buen estudio comparativo",
  "timestamp": "2025-12-03T..."
}
```

**IMPLEMENTAR:**

### 1. **Modelo de Screening Record** (Nuevo)

```javascript
// backend/src/domain/models/screening-record.model.js
const mongoose = require('mongoose');

const screeningRecordSchema = new mongoose.Schema({
  referenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reference', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  stage: { 
    type: String, 
    enum: ['title_abstract', 'fulltext'], 
    required: true 
  },
  
  // Puntajes individuales
  scores: {
    relevance: { type: Number, min: 0, max: 2, default: 0 },
    interventionPresent: { type: Number, min: 0, max: 2, default: 0 },
    methodValidity: { type: Number, min: 0, max: 2, default: 0 },
    dataReported: { type: Number, min: 0, max: 2, default: 0 },
    textAccessible: { type: Number, min: 0, max: 1, default: 0 },
    dateRange: { type: Number, min: 0, max: 1, default: 0 },
    methodQuality: { type: Number, min: 0, max: 2, default: 0 }
  },
  
  totalScore: { type: Number, required: true },
  threshold: { type: Number, default: 7 }, // Ajustable
  
  decision: { 
    type: String, 
    enum: ['include', 'exclude'], 
    required: true 
  },
  
  exclusionReasons: [{ type: String }], // Si exclude, motivos
  comment: { type: String },
  
  reviewedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('ScreeningRecord', screeningRecordSchema);
```

### 2. **Use Case para Evaluación Full-Text**

```javascript
// backend/src/domain/use-cases/evaluate-fulltext.use-case.js
class EvaluateFullTextUseCase {
  constructor({ screeningRecordRepository, referenceRepository }) {
    this.screeningRecordRepository = screeningRecordRepository;
    this.referenceRepository = referenceRepository;
  }

  async execute({ referenceId, userId, projectId, scores, threshold = 7, comment = '' }) {
    // 1. Validar que referencia existe y tiene fulltext
    const reference = await this.referenceRepository.findById(referenceId);
    if (!reference) throw new Error('Referencia no encontrada');
    if (!reference.fullTextAvailable) {
      throw new Error('No hay texto completo disponible para evaluar');
    }

    // 2. Calcular puntaje total
    const totalScore = Object.values(scores).reduce((sum, val) => sum + val, 0);

    // 3. Determinar decisión basada en threshold
    const decision = totalScore >= threshold ? 'include' : 'exclude';

    // 4. Si es exclusión, identificar razones principales
    const exclusionReasons = [];
    if (decision === 'exclude') {
      if (scores.relevance < 1) exclusionReasons.push('Tema no relacionado');
      if (scores.methodValidity < 1) exclusionReasons.push('Metodología no válida');
      if (scores.dataReported < 1) exclusionReasons.push('No reporta datos empíricos');
      if (scores.dateRange === 0) exclusionReasons.push('Fuera de rango temporal');
      if (scores.textAccessible === 0) exclusionReasons.push('Texto completo no accesible');
    }

    // 5. Crear screening record
    const record = await this.screeningRecordRepository.create({
      referenceId,
      projectId,
      userId,
      stage: 'fulltext',
      scores,
      totalScore,
      threshold,
      decision,
      exclusionReasons,
      comment
    });

    // 6. Actualizar referencia
    await this.referenceRepository.update(referenceId, {
      screeningStatus: decision === 'include' ? 'included' : 'excluded',
      screeningScore: totalScore,
      exclusionReason: exclusionReasons.join('; '),
      manualReviewStatus: 'completed',
      reviewedBy: userId,
      reviewedAt: new Date()
    });

    return {
      success: true,
      record,
      decision,
      totalScore,
      threshold
    };
  }
}

module.exports = EvaluateFullTextUseCase;
```

### 3. **Frontend: Componente de Evaluación Full-Text**

```tsx
// frontend/components/screening/fulltext-evaluation-form.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

interface FullTextEvaluationFormProps {
  reference: Reference
  projectId: string
  onSubmit: (evaluation: any) => void
}

export function FullTextEvaluationForm({ reference, projectId, onSubmit }: FullTextEvaluationFormProps) {
  const [scores, setScores] = useState({
    relevance: 0,
    interventionPresent: 0,
    methodValidity: 0,
    dataReported: 0,
    textAccessible: 0,
    dateRange: 0,
    methodQuality: 0
  })
  const [comment, setComment] = useState("")
  const threshold = 7
  
  const totalScore = Object.values(scores).reduce((sum, val) => sum + val, 0)
  const decision = totalScore >= threshold ? 'include' : 'exclude'

  const handleSubmit = () => {
    onSubmit({
      referenceId: reference.id,
      projectId,
      scores,
      threshold,
      comment,
      decision,
      totalScore
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Evaluación de Texto Completo</span>
          <Badge variant={decision === 'include' ? 'default' : 'destructive'}>
            {decision === 'include' ? (
              <><CheckCircle className="h-3 w-3 mr-1" /> INCLUIR</>
            ) : (
              <><XCircle className="h-3 w-3 mr-1" /> EXCLUIR</>
            )}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Puntaje Total: <strong>{totalScore}/12</strong> | Umbral: {threshold}/12
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Relevancia Temática */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>1. Relevancia Temática</Label>
            <Badge variant="outline">{scores.relevance}/2</Badge>
          </div>
          <Slider
            value={[scores.relevance]}
            onValueChange={([val]) => setScores({ ...scores, relevance: val })}
            min={0}
            max={2}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            0=No relevante | 1=Parcialmente | 2=Claramente relevante
          </p>
        </div>

        {/* Intervención Presente */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>2. Intervención Presente (si aplica PICO)</Label>
            <Badge variant="outline">{scores.interventionPresent}/2</Badge>
          </div>
          <Slider
            value={[scores.interventionPresent]}
            onValueChange={([val]) => setScores({ ...scores, interventionPresent: val })}
            min={0}
            max={2}
            step={1}
          />
        </div>

        {/* Metodología Válida */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>3. Metodología Válida</Label>
            <Badge variant="outline">{scores.methodValidity}/2</Badge>
          </div>
          <Slider
            value={[scores.methodValidity]}
            onValueChange={([val]) => setScores({ ...scores, methodValidity: val })}
            min={0}
            max={2}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            Estudio empírico, revisión, caso, etc. bien diseñado
          </p>
        </div>

        {/* Datos Reportados */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>4. Datos/Resultados Reportados</Label>
            <Badge variant="outline">{scores.dataReported}/2</Badge>
          </div>
          <Slider
            value={[scores.dataReported]}
            onValueChange={([val]) => setScores({ ...scores, dataReported: val })}
            min={0}
            max={2}
            step={1}
          />
        </div>

        {/* Texto Accesible */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>5. Texto Completo Accesible y Claro</Label>
            <Badge variant="outline">{scores.textAccessible}/1</Badge>
          </div>
          <Slider
            value={[scores.textAccessible]}
            onValueChange={([val]) => setScores({ ...scores, textAccessible: val })}
            min={0}
            max={1}
            step={1}
          />
        </div>

        {/* Rango de Fecha */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>6. Fecha Dentro del Rango</Label>
            <Badge variant="outline">{scores.dateRange}/1</Badge>
          </div>
          <Slider
            value={[scores.dateRange]}
            onValueChange={([val]) => setScores({ ...scores, dateRange: val })}
            min={0}
            max={1}
            step={1}
          />
        </div>

        {/* Calidad Metodológica */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>7. Calidad Metodológica</Label>
            <Badge variant="outline">{scores.methodQuality}/2</Badge>
          </div>
          <Slider
            value={[scores.methodQuality]}
            onValueChange={([val]) => setScores({ ...scores, methodQuality: val })}
            min={0}
            max={2}
            step={1}
          />
          <p className="text-xs text-muted-foreground">
            Diseño, muestra, controles, validez interna
          </p>
        </div>

        {/* Comentarios */}
        <div className="space-y-2">
          <Label>Comentarios Adicionales</Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Notas sobre la evaluación..."
            rows={3}
          />
        </div>

        {/* Botón Submit */}
        <Button 
          onClick={handleSubmit}
          className="w-full"
          variant={decision === 'include' ? 'default' : 'destructive'}
        >
          {decision === 'include' ? (
            <><CheckCircle className="mr-2 h-4 w-4" /> Incluir Artículo ({totalScore}/12)</>
          ) : (
            <><XCircle className="mr-2 h-4 w-4" /> Excluir Artículo ({totalScore}/12)</>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 4. **Métricas de Full-Text**

```javascript
// En analyze-screening-results.use-case.js - agregar sección de full-text
async analyzeFullText(projectId) {
  const records = await this.screeningRecordRepository.findByProject(projectId, {
    stage: 'fulltext'
  });

  const stats = {
    total: records.length,
    included: records.filter(r => r.decision === 'include').length,
    excluded: records.filter(r => r.decision === 'exclude').length,
    
    // Distribución de puntajes
    scoreDistribution: {
      mean: 0,
      median: 0,
      stdDev: 0,
      histogram: [] // Bins: 0-2, 3-4, 5-6, 7-8, 9-10, 11-12
    },
    
    // Motivos de exclusión (frecuencia)
    exclusionReasons: {},
    
    // Inclusion Yield
    inclusionYield: 0 // (included / total) * 100
  };

  // Calcular estadísticas de puntajes
  const scores = records.map(r => r.totalScore);
  stats.scoreDistribution.mean = scores.reduce((a,b) => a+b, 0) / scores.length;
  stats.scoreDistribution.median = this._median(scores);
  stats.scoreDistribution.stdDev = this._stdDev(scores);

  // Histograma
  const bins = [0, 3, 5, 7, 9, 11];
  stats.scoreDistribution.histogram = bins.map((min, i) => {
    const max = bins[i + 1] || 12;
    return {
      range: `${min}-${max}`,
      count: scores.filter(s => s >= min && s <= max).length
    };
  });

  // Motivos de exclusión
  records.filter(r => r.decision === 'exclude').forEach(r => {
    r.exclusionReasons.forEach(reason => {
      stats.exclusionReasons[reason] = (stats.exclusionReasons[reason] || 0) + 1;
    });
  });

  // Inclusion Yield
  stats.inclusionYield = ((stats.included / stats.total) * 100).toFixed(2);

  return stats;
}
```

### 📈 Completitud: **40%**

**PRIORIDAD CRÍTICA - Implementar:**
1. ❌ Modelo `ScreeningRecord` (MongoDB/PostgreSQL)
2. ❌ Use Case `EvaluateFullTextUseCase`
3. ❌ Repository `ScreeningRecordRepository`
4. ❌ Componente `FullTextEvaluationForm` con sliders de puntuación
5. ❌ Endpoint POST `/api/projects/:id/references/:refId/evaluate-fulltext`
6. ❌ Integrar formulario en `full-text-review.tsx`
7. ❌ Métricas: distribución de puntajes, histograma, motivos de exclusión
8. ❌ Exportar `excluded_fulltext.csv` con motivos

---

## 📊 FASE 4: Análisis de Resultados y Preparación para el Artículo

### ✅ YA IMPLEMENTADO

#### 1. **Diagrama PRISMA** ✅

**Archivo:** `frontend/components/screening/prisma-flow-diagram.tsx`

```tsx
interface PrismaFlowDiagramProps {
  stats: {
    identified: number
    duplicates: number
    afterDedup: number
    screenedTitleAbstract: number
    excludedTitleAbstract: number
    fullTextAssessed: number
    excludedFullText: number
    includedFinal: number
  }
}
```

**Características:**
- ✅ Visualización del flujo PRISMA 2020
- ✅ 4 fases: Identificación → Dedup → Cribado → Elegibilidad
- ✅ Números actualizados dinámicamente
- ✅ Porcentajes calculados automáticamente
- ❌ **NO genera imagen PNG exportable**

#### 2. **Exportación de Referencias** ✅

**Archivo:** `backend/src/domain/use-cases/export-references.use-case.js`

```javascript
async execute(projectId, format = 'csv', filters = {}) {
  // Formatos: CSV, JSON
  // Filtros: por status, source, etc.
}
```

**Características:**
- ✅ Exporta a CSV
- ✅ Exporta a JSON
- ✅ Filtros aplicables (status, etc.)
- ✅ Escapa comillas y caracteres especiales en CSV
- ❌ **NO exporta motivos de exclusión en columna separada**
- ❌ **NO exporta screening_records** (auditoría)

#### 3. **Análisis de Resultados** ✅

**Archivo:** `backend/src/domain/use-cases/analyze-screening-results.use-case.js`

```javascript
stats = {
  total: N,
  byStatus: { pending, included, excluded, maybe },
  byAIRecommendation: { include, exclude, maybe, none },
  withAI: N,
  avgConfidence: X,
  avgSimilarity: X,
  disagreements: N,
  percentages: { ... }
}
```

**Características:**
- ✅ Estadísticas por estado
- ✅ Estadísticas de IA (confidence, similarity)
- ✅ Detecta desacuerdos humano-IA
- ✅ Calcula porcentajes

### ⚠️ PARCIALMENTE IMPLEMENTADO / FALTANTE

#### 1. **Tablas para Manuscrito** ⚠️

**Requerido:**

**Tabla 1: Resumen del Proceso de Cribado**
```
| Etapa                      | N Procesadas | N Incluidas | N Excluidas | % Inclusion |
|----------------------------|--------------|-------------|-------------|-------------|
| Identificación             | 1,282        | -           | -           | -           |
| Después de dedup           | 1,010        | -           | -           | -           |
| Cribado título/abstract    | 1,010        | 200         | 810         | 19.8%       |
| Full-text evaluado         | 200          | 45          | 155         | 22.5%       |
| **Incluidos Final**        | **45**       | **45**      | **0**       | **100%**    |
```

**Tabla 2: Motivos de Exclusión (Full-Text)**
```
| Motivo                          | Frecuencia | % sobre Excluidos |
|---------------------------------|------------|-------------------|
| Tema no relacionado             | 60         | 38.7%             |
| Tipo de estudio no válido       | 25         | 16.1%             |
| Texto completo no disponible    | 20         | 12.9%             |
| Fecha fuera de rango            | 20         | 12.9%             |
| No datos empíricos              | 30         | 19.4%             |
```

**Tabla 3: Estadísticas del Puntaje (Full-Text)**
```
| Métrica          | Valor |
|------------------|-------|
| Media            | 7.8   |
| Mediana          | 8.0   |
| Desv. Estándar   | 2.1   |
| Mínimo           | 2     |
| Máximo           | 12    |
| Umbral usado     | 7     |
```

**IMPLEMENTAR:**

```javascript
// backend/src/domain/use-cases/generate-manuscript-tables.use-case.js
class GenerateManuscriptTablesUseCase {
  async execute(projectId) {
    const references = await this.referenceRepository.findByProject(projectId);
    const screeningRecords = await this.screeningRecordRepository.findByProject(projectId);
    
    // Tabla 1: Resumen del Proceso
    const table1 = {
      identification: references.length,
      duplicates: references.filter(r => r.status === 'duplicate').length,
      afterDedup: references.filter(r => r.status !== 'duplicate').length,
      screenedTitleAbstract: references.filter(r => r.aiRecommendation).length,
      excludedTitleAbstract: references.filter(r => r.aiRecommendation === 'exclude').length,
      passedToFullText: references.filter(r => r.status !== 'duplicate' && r.fullTextAvailable).length,
      fullTextEvaluated: screeningRecords.filter(r => r.stage === 'fulltext').length,
      excludedFullText: screeningRecords.filter(r => r.stage === 'fulltext' && r.decision === 'exclude').length,
      includedFinal: screeningRecords.filter(r => r.stage === 'fulltext' && r.decision === 'include').length
    };
    
    // Tabla 2: Motivos de Exclusión
    const table2 = [];
    const excludedRecords = screeningRecords.filter(r => r.decision === 'exclude');
    const reasonCounts = {};
    
    excludedRecords.forEach(r => {
      r.exclusionReasons.forEach(reason => {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });
    });
    
    Object.entries(reasonCounts).forEach(([reason, count]) => {
      table2.push({
        motivo: reason,
        frecuencia: count,
        porcentaje: ((count / excludedRecords.length) * 100).toFixed(1)
      });
    });
    
    // Tabla 3: Estadísticas de Puntaje
    const scores = screeningRecords.map(r => r.totalScore);
    const table3 = {
      mean: (scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(1),
      median: this._median(scores),
      stdDev: this._stdDev(scores).toFixed(1),
      min: Math.min(...scores),
      max: Math.max(...scores),
      threshold: 7
    };
    
    return { table1, table2, table3 };
  }
}
```

#### 2. **Inter-Rater Reliability (IRR) / Doble Cribado** ❌

**Requerido:**

```javascript
// Modelo: Permitir que 2 usuarios revisen el mismo artículo
{
  referenceId: "abc",
  reviewer1: "user1",
  reviewer1Decision: "include",
  reviewer1Scores: { relevance: 2, ... },
  
  reviewer2: "user2",
  reviewer2Decision: "exclude",
  reviewer2Scores: { relevance: 1, ... },
  
  resolved: false,
  resolvedBy: null,
  finalDecision: null
}

// Calcular Cohen's Kappa
const kappa = this._calculateKappa(agreements, disagreements);
// kappa > 0.8 = excelente
// kappa 0.6-0.8 = bueno
// kappa < 0.6 = pobre
```

**IMPLEMENTAR:**
1. ❌ Modelo `DualReviewRecord`
2. ❌ Asignar referencias a 2 revisores
3. ❌ Detectar discrepancias
4. ❌ UI para arbitraje (3er revisor)
5. ❌ Calcular Cohen's Kappa
6. ❌ Reportar % acuerdo bruto

#### 3. **Exportaciones Específicas para Tesis** ⚠️

**Requerido:**
- ✅ `references.csv` (ya implementado)
- ❌ `duplicates.csv` (id_kept, id_removed, similarity, motivo)
- ❌ `excluded_with_reasons.csv` (id, title, stage, reasons)
- ❌ `screening_records.json` (audit trail completo)
- ❌ `prisma_flow.png` (diagrama exportable)
- ❌ `score_histogram.png` (distribución de puntajes)

**IMPLEMENTAR:**

```javascript
// backend/src/domain/use-cases/export-thesis-artifacts.use-case.js
class ExportThesisArtifactsUseCase {
  async execute(projectId) {
    return {
      'references_all.csv': await this.exportReferencesCSV(projectId),
      'duplicates.csv': await this.exportDuplicatesCSV(projectId),
      'excluded_fulltext.csv': await this.exportExcludedWithReasons(projectId),
      'screening_records.json': await this.exportScreeningRecords(projectId),
      'manuscript_tables.json': await this.generateManuscriptTables(projectId),
      'statistics_summary.json': await this.generateStatistics(projectId)
    };
  }
}
```

#### 4. **Sensibilidad/Especificidad del Auto-Match** ❌

**Requerido (si hay gold standard):**

```javascript
// Si tienes 100 referencias manualmente validadas (gold standard):
const truePositives = autoInclude ∩ goldInclude
const trueNegatives = autoExclude ∩ goldExclude
const falsePositives = autoInclude ∩ goldExclude  // IA dijo incluir pero debía excluir
const falseNegatives = autoExclude ∩ goldInclude  // IA dijo excluir pero debía incluir

const sensitivity = TP / (TP + FN)  // Recall
const specificity = TN / (TN + FP)
const precision = TP / (TP + FP)
const f1Score = 2 * (precision * sensitivity) / (precision + sensitivity)
```

### 📈 Completitud: **60%**

**PRIORIDAD MEDIA - Implementar:**
1. ⚠️ Generador de tablas para manuscrito (Tablas 1, 2, 3)
2. ❌ Sistema de doble cribado (dual review)
3. ❌ Cálculo de Cohen's Kappa (IRR)
4. ❌ Exportación `duplicates.csv`
5. ❌ Exportación `excluded_with_reasons.csv`
6. ❌ Exportación `screening_records.json`
7. ❌ Exportar PRISMA como PNG (usar librería charts)
8. ❌ Histograma de puntajes exportable
9. ❌ Sensibilidad/Especificidad (si hay gold standard)

---

## 🎯 RESUMEN DE PRIORIDADES

### 🔴 **PRIORIDAD CRÍTICA** (Implementar YA)

1. **Sistema de Puntuación Full-Text** ❌
   - Modelo `ScreeningRecord`
   - Use Case `EvaluateFullTextUseCase`
   - Componente UI con sliders (7 criterios)
   - Endpoint POST `/evaluate-fulltext`
   - **Estimado:** 8-10 horas

2. **Métricas de Full-Text** ❌
   - Distribución de puntajes (mean, median, std dev)
   - Histograma (bins)
   - Tabla de motivos de exclusión con frecuencias
   - Inclusion Yield
   - **Estimado:** 4 horas

3. **Backend para PDFs** ❌
   - Endpoint POST `/upload-pdf`
   - Almacenamiento (AWS S3, local, o MongoDB GridFS)
   - Actualizar `fullTextAvailable`, `fullTextUrl`
   - **Estimado:** 6 horas

### 🟠 **PRIORIDAD ALTA** (Siguiente Sprint)

4. **Filtro Boolean por Keywords** ❌
   - Extraer INCLUDE/EXCLUDE keywords del protocolo
   - Match exacto en título + abstract
   - Categorización: `include_auto`, `exclude_auto`, `manual_review`
   - **Estimado:** 6 horas

5. **Resaltar Términos en UI** ❌
   - Función `highlightKeywords()`
   - Mostrar términos matched en abstract durante revisión
   - **Estimado:** 2 horas

6. **Generador de Tablas para Manuscrito** ⚠️
   - Use Case `GenerateManuscriptTablesUseCase`
   - Tabla 1: Resumen del proceso
   - Tabla 2: Motivos de exclusión
   - Tabla 3: Estadísticas de puntajes
   - Endpoint GET `/manuscript-tables`
   - Componente UI para visualizar tablas
   - **Estimado:** 5 horas

### 🟡 **PRIORIDAD MEDIA** (Futuro)

7. **Exportaciones Específicas para Tesis** ⚠️
   - `duplicates.csv`
   - `excluded_with_reasons.csv`
   - `screening_records.json`
   - **Estimado:** 4 horas

8. **Doble Cribado (IRR)** ❌
   - Modelo `DualReviewRecord`
   - Asignar a 2 revisores
   - Detectar discrepancias
   - UI arbitraje
   - Calcular Cohen's Kappa
   - **Estimado:** 12 horas

9. **PRISMA Exportable como PNG** ❌
   - Usar librería: `react-to-png`, `html2canvas`, o `Chart.js`
   - Botón "Descargar Diagrama"
   - **Estimado:** 3 horas

10. **Histograma Exportable** ❌
    - Usar `Chart.js` o `Recharts`
    - Bins: 0-2, 3-4, 5-6, 7-8, 9-10, 11-12
    - Exportar como PNG
    - **Estimado:** 3 horas

### 🟢 **PRIORIDAD BAJA** (Nice to Have)

11. **Sensibilidad/Especificidad** ❌
    - Requiere gold standard (referencias validadas manualmente)
    - Calcular TP, TN, FP, FN
    - Sensitivity, Specificity, Precision, F1
    - **Estimado:** 4 horas (si hay gold standard)

12. **Mejoras a Detección de Duplicados** ⚠️
    - Lógica de "mejor metadato"
    - Exportar `duplicates.csv`
    - Match por título+autor+año normalizado
    - **Estimado:** 3 horas

---

## 📋 Plan de Implementación Sugerido

### **Sprint 1 (Esta Semana)** - Funcionalidad Crítica
**Objetivo:** Sistema de evaluación full-text operacional

```
Día 1-2: Sistema de Puntuación
- [ ] Crear modelo ScreeningRecord (MongoDB/PostgreSQL)
- [ ] Crear ScreeningRecordRepository
- [ ] Implementar EvaluateFullTextUseCase
- [ ] Endpoint POST /api/projects/:id/references/:refId/evaluate-fulltext

Día 3-4: Frontend Full-Text
- [ ] Componente FullTextEvaluationForm con 7 sliders
- [ ] Integrar en full-text-review.tsx
- [ ] Actualizar tabla de referencias con scores
- [ ] Mostrar decisión (include/exclude) y totalScore

Día 5: Métricas
- [ ] Implementar análisis de puntajes en analyze-screening-results
- [ ] Calcular distribución, histograma, motivos
- [ ] Endpoint GET /api/projects/:id/fulltext-stats
- [ ] Componente UI para mostrar métricas
```

### **Sprint 2 (Próxima Semana)** - Mejoras de Screening

```
Día 1-2: Filtro por Keywords
- [ ] Use Case KeywordScreeningUseCase
- [ ] Extraer INCLUDE/EXCLUDE del protocolo
- [ ] Integrar en executeHybrid (antes de embeddings)
- [ ] UI para mostrar términos matched

Día 3: Resaltar Términos
- [ ] Función highlightKeywords()
- [ ] Mostrar en individual-review-enhanced
- [ ] Badge con "3 keywords matched"

Día 4-5: Tablas para Manuscrito
- [ ] GenerateManuscriptTablesUseCase
- [ ] Endpoint GET /manuscript-tables
- [ ] Componente ManuscriptTablesView
- [ ] Botón "Exportar Tablas" (CSV/JSON)
```

### **Sprint 3 (Siguiente)** - Exportaciones y Análisis Avanzado

```
Día 1-2: Exportaciones Tesis
- [ ] Exportar duplicates.csv
- [ ] Exportar excluded_with_reasons.csv
- [ ] Exportar screening_records.json
- [ ] ZIP con todos los artifacts

Día 3-5: Doble Cribado (si se requiere)
- [ ] Modelo DualReviewRecord
- [ ] Asignar referencias a 2 usuarios
- [ ] UI para arbitraje
- [ ] Cálculo de Cohen's Kappa
```

---

## ✅ Checklist de Completitud

### Fase 1: Eliminar Duplicados
- [x] Algoritmo de detección por DOI
- [x] Algoritmo Levenshtein para similitud
- [x] Comparación de autores
- [x] Marcar como duplicados en DB
- [x] UI para detectar duplicados
- [x] Reporte de grupos
- [ ] Exportar duplicates.csv
- [ ] Lógica de "mejor metadato"

### Fase 2: Screening (Título/Resumen)
- [x] Sistema híbrido (Embeddings + LLM)
- [x] Modelo all-MiniLM-L6-v2
- [x] Análisis de distribución (Elbow)
- [x] Clasificación por confianza (>30%, <10%, zona gris)
- [x] ChatGPT/Gemini para zona gris
- [x] UI completa para screening
- [ ] Filtro boolean por keywords INCLUDE/EXCLUDE
- [ ] Resaltar términos matched en UI
- [ ] Métrica de concordancia auto-match vs humano

### Fase 3: Full Screening (Texto Completo)
- [x] UI para subir PDFs
- [x] Validación de tipo archivo
- [x] Progress bar
- [x] Campo fullTextAvailable en modelo
- [ ] Backend endpoint para almacenar PDFs
- [ ] Modelo ScreeningRecord con 7 criterios
- [ ] Use Case EvaluateFullTextUseCase
- [ ] Componente FullTextEvaluationForm con sliders
- [ ] Endpoint POST /evaluate-fulltext
- [ ] Cálculo automático de decisión (threshold)
- [ ] Métricas: mean, median, std dev, histogram
- [ ] Tabla de motivos de exclusión

### Fase 4: Análisis de Resultados
- [x] Componente PrismaFlowDiagram
- [x] Estadísticas básicas (total, by status, by AI)
- [x] Detecta desacuerdos humano-IA
- [x] Exportar CSV/JSON
- [ ] Generador de Tabla 1 (resumen proceso)
- [ ] Generador de Tabla 2 (motivos exclusión)
- [ ] Generador de Tabla 3 (estadísticas puntajes)
- [ ] Exportar PRISMA como PNG
- [ ] Exportar histograma como PNG
- [ ] Exportar duplicates.csv
- [ ] Exportar excluded_with_reasons.csv
- [ ] Exportar screening_records.json
- [ ] Cohen's Kappa (IRR)
- [ ] Doble cribado (dual review)
- [ ] Sensibilidad/Especificidad

---

## 💡 Recomendaciones Finales

1. **FOCO INMEDIATO:** Implementar sistema de puntuación full-text (Sprint 1). Es la pieza más crítica que falta.

2. **ITERACIÓN RÁPIDA:** Implementa funcionalidades una por una, prueba, y despliega. No intentes hacer todo a la vez.

3. **VALIDACIÓN CON EL DOCENTE:** Una vez implementes el sistema de puntuación, muéstrale el checklist y pide feedback sobre los criterios (relevance, methodValidity, etc.). Ajusta según su recomendación.

4. **DOCUMENTACIÓN:** Guarda screenshots de cada fase, tablas generadas, y estadísticas. Esto irá directo a tu tesis.

5. **GOLD STANDARD:** Si tu docente requiere calcular sensibilidad/especificidad, necesitarás crear un conjunto de ~100 referencias manualmente validadas como "gold standard".

6. **UMBRAL AJUSTABLE:** El threshold de 7/12 debe ser configurable por el usuario. Permite que tu docente decida si usa 6/12 o 8/12 según la naturaleza del estudio.

---

## 🎓 Alineación con Requerimientos del Docente

| Requerimiento | Estado | Notas |
|---------------|--------|-------|
| Eliminar duplicados (DOI, título+autor, Levenshtein) | ✅ 95% | Falta exportar CSV y lógica de metadatos |
| Screening con términos del protocolo (INCLUDE/EXCLUDE) | ⚠️ 70% | Falta filtro boolean explícito |
| Full screening con puntaje (0-12 con threshold 7) | ❌ 40% | **FALTA IMPLEMENTAR SISTEMA COMPLETO** |
| Métricas: mean, median, std dev, histograma | ❌ 0% | Requiere sistema de puntajes primero |
| PRISMA con números | ✅ 85% | Falta exportar como PNG |
| Tablas para manuscrito | ⚠️ 50% | Estructura lista, falta generador automático |
| IRR (Cohen's Kappa) | ❌ 0% | Requiere doble cribado |
| Exportaciones (CSV, JSON, audit trail) | ⚠️ 60% | CSV básico listo, faltan exports específicos |

---

## 📞 Siguiente Paso

**DECISIÓN REQUERIDA:** ¿Quieres que empiece a implementar el sistema de puntuación full-text (Sprint 1)? 

Si dices **"sí"**, procederé a crear:
1. Modelo `ScreeningRecord`
2. Use Case `EvaluateFullTextUseCase`
3. Repository `ScreeningRecordRepository`
4. Componente `FullTextEvaluationForm`
5. Endpoint `/evaluate-fulltext`

**Tiempo estimado:** 8-10 horas de desarrollo.

¿Procedemos? 🚀
