# 🧹 Auditoría de Componentes de Screening

## 📊 Resumen Ejecutivo

**Total de archivos en `frontend/components/screening/`:** 19 archivos

| Categoría | Cantidad | Estado |
|-----------|----------|--------|
| **Componentes en uso activo** | 14 | ✅ Mantener |
| **Componentes creados recientemente** | 2 | ✅ Mantener (nuevos) |
| **Documentación** | 2 | ✅ Mantener |
| **Componentes obsoletos** | 1 | ⚠️ Deprecado (individual-review.tsx) |

---

## ✅ Componentes en Uso Activo

### 1. `ai-screening-panel.tsx` ✅
**Estado:** EN USO  
**Ubicación de uso:** `app/projects/[id]/screening/page.tsx` (línea 8)  
**Propósito:** Panel principal para ejecutar Phase 1 (Embeddings) y Phase 2 (ChatGPT/Gemini)  
**Funcionalidad:**
- Botón "Ejecutar Phase 1" → Calcula similarity scores con embeddings
- Botón "Ejecutar Phase 2" → Analiza grey zone con LLM
- Muestra progreso de ejecución
- Estadísticas de auto-include, grey zone, auto-exclude

**Dependencias:**
- `apiClient.runProjectScreening(projectId)`
- `backend/src/domain/use-cases/run-project-screening.use-case.js`

**Acción:** ✅ **MANTENER** - Componente crítico

---

### 2. `reference-table.tsx` ✅
**Estado:** EN USO  
**Ubicación de uso:** `app/projects/[id]/screening/page.tsx` (línea 7)  
**Propósito:** Tabla principal de referencias con sorting, filtering, paginación  
**Funcionalidad:**
- Muestra título, autores, año, journal, status, AI score
- Ordenamiento por columnas (título, año, score)
- Selección múltiple para bulk actions
- Click en fila → Abre `ReferenceDetailDialog`

**Sub-componentes importados:**
- `ReferenceDetailDialog` (modal de detalles)

**Acción:** ✅ **MANTENER** - Componente crítico

---

### 3. `bulk-actions-bar.tsx` ✅
**Estado:** EN USO  
**Ubicación de uso:** `app/projects/[id]/screening/page.tsx` (línea 9)  
**Propósito:** Barra de acciones masivas para múltiples referencias  
**Funcionalidad:**
- Incluir/Excluir referencias seleccionadas
- Marcar como conflicto
- Exportar selección a CSV
- Asignar revisor (preparado para dual review)

**Acción:** ✅ **MANTENER** - Componente crítico

---

### 4. `screening-filters.tsx` ✅
**Estado:** EN USO  
**Ubicación de uso:** `app/projects/[id]/screening/page.tsx` (línea 10)  
**Propósito:** Filtros avanzados para tabla de referencias  
**Funcionalidad:**
- Filtro por status (pending, included, excluded, duplicate)
- Filtro por clasificación IA (high, medium, low priority)
- Filtro por rango de AI score
- Búsqueda de texto (título, autores)

**Acción:** ✅ **MANTENER** - Componente crítico

---

### 5. `individual-review-enhanced.tsx` ✅
**Estado:** EN USO  
**Ubicación de uso:** `app/projects/[id]/screening/page.tsx` (línea 12)  
**Propósito:** Panel de revisión individual mejorado con IA  
**Funcionalidad:**
- Muestra detalles completos de una referencia
- Recomendación de IA con justificación
- Botones de decisión (Include / Exclude / Conflict)
- Campos de notas del revisor
- **PREPARADO** para dual review (reviewer_1, reviewer_2)

**Mejoras recientes:**
- Añadido soporte para `ai_recommendation` vs `reviewer_decision`
- UI actualizada para mostrar recomendación, no decisión final

**Acción:** ✅ **MANTENER** - Componente crítico (base para dual review)

---

### 6. `duplicate-detection-dialog.tsx` ✅
**Estado:** EN USO  
**Ubicación de uso:** `app/projects/[id]/screening/page.tsx` (línea 13)  
**Propósito:** Dialog para detectar y resolver duplicados  
**Funcionalidad:**
- Detecta duplicados por DOI, título (fuzzy matching), autores + año
- Muestra grupos de duplicados con similitud > 80%
- Permite elegir registro maestro y fusionar
- Marca duplicados para exclusión

**Algoritmo:**
- Levenshtein distance para títulos
- DOI matching exacto
- Autores + año (3 campos matching)

**Acción:** ✅ **MANTENER** - Componente crítico (PRISMA Item 6)

---

### 7. `hybrid-screening-stats.tsx` ✅
**Estado:** EN USO  
**Ubicación de uso:** `app/projects/[id]/screening/page.tsx` (línea 14)  
**Propósito:** Estadísticas del sistema híbrido (Embeddings + LLM + Manual)  
**Funcionalidad:**
- Gráfico de distribución de scores
- Estadísticas de auto-include, grey zone, auto-exclude
- Métricas de Phase 1 vs Phase 2
- Porcentaje de referencias procesadas

**Visualizaciones:**
- Bar chart: Auto-include vs Grey vs Auto-exclude
- Pie chart: Distribución de clasificación IA
- Line chart: Similarity score distribution

**Acción:** ✅ **MANTENER** - Componente crítico (análisis)

---

### 8. `classified-references-view.tsx` ✅
**Estado:** EN USO  
**Ubicación de uso:** `app/projects/[id]/screening/page.tsx` (línea 15)  
**Propósito:** Vista separada por clasificación IA (High / Medium / Low priority)  
**Funcionalidad:**
- Tabs: High Priority | Medium | Low | Excluded
- Lista de referencias por categoría
- Quick review: Botones inline de Include/Exclude
- Click en referencia → Abre `ReferenceDetailDialog`

**Mejora UX:**
- Permite revisar rápidamente solo las de alta prioridad
- Evita scroll en tabla grande

**Acción:** ✅ **MANTENER** - Componente crítico (UX)

---

### 9. `exclusion-reasons-table.tsx` ✅
**Estado:** EN USO  
**Ubicación de uso:** `app/projects/[id]/screening/page.tsx` (línea 16)  
**Propósito:** Tabla de referencias excluidas con razones  
**Funcionalidad:**
- Muestra referencias con status = 'excluded'
- Categorías de exclusión (PRISMA Item 16):
  - No cumple PICO
  - No es estudio primario
  - Idioma no incluido
  - Duplicado
  - Texto completo no disponible
  - Otras razones
- Exportable a CSV para reporte PRISMA

**Acción:** ✅ **MANTENER** - Componente crítico (PRISMA Item 16)

---

### 10. `prisma-flow-diagram.tsx` ✅
**Estado:** EN USO  
**Ubicación de uso:** `app/projects/[id]/screening/page.tsx` (línea 17)  
**Propósito:** Diagrama de flujo PRISMA 2020 (Item 17)  
**Funcionalidad:**
- Genera diagrama automáticamente desde datos del proyecto
- Calcula números para cada etapa:
  - Identificación (búsqueda en bases de datos)
  - Cribado (title/abstract screening)
  - Elegibilidad (full-text screening)
  - Inclusión (estudios finales)
- Exportable como imagen PNG

**Cumplimiento PRISMA:**
- ✅ Item 17: PRISMA Flow Diagram
- Muestra números de referencias en cada etapa
- Incluye razones de exclusión

**Acción:** ✅ **MANTENER** - Componente crítico (PRISMA Item 17)

---

### 11. `full-text-review.tsx` ✅
**Estado:** EN USO  
**Ubicación de uso:** `app/projects/[id]/screening/page.tsx` (línea 18)  
**Propósito:** Panel de revisión de texto completo (Phase 4)  
**Funcionalidad:**
- Upload de PDF del artículo completo
- Extracción de texto del PDF
- Evaluación automática de 7 criterios PICO
- Muestra puntaje total (0-12 puntos)
- Decisión final del revisor

**Sub-componentes importados:**
- `FullTextEvaluationForm` (formulario de 7 criterios)
- `ReferenceDetailDialog` (detalles de referencia)

**Acción:** ✅ **MANTENER** - Componente crítico (Full Text Screening)

---

### 12. `reference-detail-dialog.tsx` ✅
**Estado:** EN USO  
**Ubicación de uso:** Importado por 4 componentes:
- `reference-table.tsx` (línea 10)
- `classified-references-view.tsx` (línea 10)
- `exclusion-reasons-table.tsx` (línea 14)
- `full-text-review.tsx` (línea 13)

**Propósito:** Modal reutilizable de detalles de referencia  
**Funcionalidad:**
- Muestra metadatos completos (título, autores, abstract, DOI)
- Muestra recomendación de IA con justificación
- Permite cambiar status (Include / Exclude / Pending)
- Muestra historial de revisiones (si dual review activo)
- Link a DOI para acceder al artículo original

**Acción:** ✅ **MANTENER** - Componente reutilizable crítico

---

### 13. `full-text-evaluation-form.tsx` ✅
**Estado:** EN USO  
**Ubicación de uso:** `full-text-review.tsx` (línea 14)  
**Propósito:** Formulario de evaluación de 7 criterios PICO  
**Funcionalidad:**
- 7 criterios evaluables:
  1. **Población** (0-2 puntos)
  2. **Intervención** (0-2 puntos)
  3. **Comparación** (0-2 puntos)
  4. **Resultados** (0-2 puntos)
  5. **Tipo de estudio** (0-2 puntos)
  6. **Tamaño de muestra** (0-2 puntos)
  7. **Reportes completos** (0-2 puntos)
- Cálculo automático de puntaje total
- Recomendación de inclusión (≥8 puntos → Include)

**Acción:** ✅ **MANTENER** - Componente crítico (Full Text)

---

### 14. `import-references-button.tsx` ✅
**Estado:** EN USO  
**Ubicación de uso:** `project-wizard/steps/6-search-plan-step.tsx` (línea 26, 718)  
**Propósito:** Botón de importación masiva de referencias (CSV/RIS/BibTeX)  
**Funcionalidad:**
- File input para CSV, RIS, BibTeX
- Llama a `apiClient.importReferences(projectId, formData)`
- Muestra toast con número de referencias importadas
- Callback `onImportSuccess` para actualizar UI

**IMPORTANTE:** 
- ⚠️ Este NO es el botón de "Upload PDF"
- Se usa en Protocol Wizard, NO en Screening page
- Ver [DIFERENCIA-IMPORTACION-REFERENCIAS-VS-PDF.md](../docs/DIFERENCIA-IMPORTACION-REFERENCIAS-VS-PDF.md)

**Acción:** ✅ **MANTENER** - Componente crítico (importación inicial)

---

## 🆕 Componentes Nuevos (Recién Creados)

### 15. `priority-distribution-analysis.tsx` 🆕
**Estado:** NUEVO (creado en esta sesión)  
**Ubicación de uso:** Pendiente de integración en `screening/page.tsx` o `screening/analysis/page.tsx`  
**Propósito:** Análisis de distribución de puntajes con Elbow Plot  
**Funcionalidad:**
- Calcula percentiles (Top 10%, Top 25%, Mediana)
- Detecta "codo" (punto de inflexión) automáticamente
- Gráfico visual de distribución (simulado con CSS)
- Recomendaciones de criterio de corte
- Muestra cuántos artículos revisar en Full Text (ej: 45 de 181)

**Metodología:**
- Segunda derivada para detectar cambio de curvatura
- Análisis estadístico de Top 10%, 25%, 50%
- Criterio de detención: 3-4 artículos consecutivos irrelevantes

**Acción:** ✅ **MANTENER** - Componente nuevo (implementa requisito del usuario)

---

### 16. `screening-analysis-panel.tsx` ✅
**Estado:** EXISTENTE (no usado actualmente)  
**Ubicación de uso:** Pendiente - Probablemente en `app/projects/[id]/screening/analysis/page.tsx`  
**Propósito:** Panel avanzado de análisis estadístico con Recharts  
**Funcionalidad:**
- Estadísticas descriptivas (mean, median, std dev)
- Gráfico de distribución (Line Chart con Recharts)
- Detección de punto de codo
- Recomendaciones de threshold
- Exportación de resultados a CSV

**Diferencia con `priority-distribution-analysis.tsx`:**
- `screening-analysis-panel.tsx`: Usa Recharts (biblioteca externa)
- `priority-distribution-analysis.tsx`: Usa CSS puro (más ligero)

**Acción:** ✅ **MANTENER** - Componente de análisis avanzado (probablemente usado en página separada)

---

## 📄 Documentación

### 17. `SCREENING-EVALUATION.md` ✅
**Estado:** DOCUMENTACIÓN  
**Propósito:** Evaluación del sistema de screening actual  
**Contenido:**
- Análisis de cumplimiento PRISMA
- Gaps identificados (dual review faltante)
- Recomendaciones de mejora

**Acción:** ✅ **MANTENER** - Documentación útil

---

### 18. `IMPLEMENTATION-PLAN-PHASE-1.md` ✅
**Estado:** DOCUMENTACIÓN  
**Propósito:** Plan de implementación de Dual Review (Phase 1)  
**Contenido:**
- Arquitectura de dual review
- Cambios en base de datos (reviewer_1, reviewer_2)
- Algoritmo de detección de conflictos
- Cálculo de Cohen's Kappa

**Acción:** ✅ **MANTENER** - Guía de implementación futura

---

## ⚠️ Componentes Deprecados u Obsoletos

### 19. `similarity-distribution-analysis.tsx` ⚠️
**Estado:** EN USO (pero puede consolidarse)  
**Ubicación de uso:** `app/projects/[id]/screening/analysis/page.tsx` (línea 4)  
**Propósito:** Análisis de distribución de similarity scores  
**Funcionalidad:**
- Gráfico de barras de distribución
- Estadísticas básicas (mean, median)
- Lista de referencias con scores

**DUPLICIDAD:**
- Funcionalidad similar a `priority-distribution-analysis.tsx` (nuevo)
- Ambos muestran distribución de scores

**Opciones:**
1. **Deprecar y migrar a nuevo componente** (recomendado)
2. **Consolidar ambos en uno solo**
3. **Mantener ambos** (uno simple, otro avanzado)

**Recomendación:** ⚠️ **DEPRECAR EN FAVOR DE `priority-distribution-analysis.tsx`**  
**Acción:** Migrar usos a componente nuevo (cuando esté integrado)

---

## ❌ Componentes Eliminados o No Encontrados

### `individual-review.tsx` ❌
**Estado:** IMPORTADO PERO NO ENCONTRADO EN DISCO  
**Ubicación de uso:** `app/projects/[id]/screening/page.tsx` (línea 11)  
**Problema:** Archivo no existe en `frontend/components/screening/`

**Diagnóstico:**
```typescript
import { IndividualReview } from "@/components/screening/individual-review"
// ❌ ERROR: Cannot find module '@/components/screening/individual-review'
```

**Solución:**
- Este componente fue reemplazado por `individual-review-enhanced.tsx`
- Eliminar import en `screening/page.tsx` (línea 11)
- Usar solo `IndividualReviewEnhanced`

**Acción:** 🗑️ **ELIMINAR IMPORT** - Componente obsoleto (ya reemplazado)

---

## 📊 Matriz de Uso de Componentes

| Componente | Usado en | Importado por | Estado | Acción |
|------------|----------|---------------|--------|--------|
| `ai-screening-panel.tsx` | ✅ | `screening/page.tsx` | Activo | ✅ Mantener |
| `reference-table.tsx` | ✅ | `screening/page.tsx` | Activo | ✅ Mantener |
| `bulk-actions-bar.tsx` | ✅ | `screening/page.tsx` | Activo | ✅ Mantener |
| `screening-filters.tsx` | ✅ | `screening/page.tsx` | Activo | ✅ Mantener |
| `individual-review.tsx` | ❌ | `screening/page.tsx` | **Obsoleto** | 🗑️ Eliminar import |
| `individual-review-enhanced.tsx` | ✅ | `screening/page.tsx` | Activo | ✅ Mantener |
| `duplicate-detection-dialog.tsx` | ✅ | `screening/page.tsx` | Activo | ✅ Mantener |
| `hybrid-screening-stats.tsx` | ✅ | `screening/page.tsx` | Activo | ✅ Mantener |
| `classified-references-view.tsx` | ✅ | `screening/page.tsx` | Activo | ✅ Mantener |
| `exclusion-reasons-table.tsx` | ✅ | `screening/page.tsx` | Activo | ✅ Mantener |
| `prisma-flow-diagram.tsx` | ✅ | `screening/page.tsx` | Activo | ✅ Mantener |
| `full-text-review.tsx` | ✅ | `screening/page.tsx` | Activo | ✅ Mantener |
| `reference-detail-dialog.tsx` | ✅ | 4 componentes | Activo | ✅ Mantener |
| `full-text-evaluation-form.tsx` | ✅ | `full-text-review.tsx` | Activo | ✅ Mantener |
| `import-references-button.tsx` | ✅ | `6-search-plan-step.tsx` | Activo | ✅ Mantener |
| `priority-distribution-analysis.tsx` | 🆕 | Pendiente integración | Nuevo | ✅ Mantener |
| `screening-analysis-panel.tsx` | ⚠️ | `screening/analysis/page.tsx` | Activo | ✅ Mantener |
| `similarity-distribution-analysis.tsx` | ⚠️ | `screening/analysis/page.tsx` | Activo | ⚠️ Deprecar |

---

## 🚀 Plan de Acción Recomendado

### 1. Limpieza Inmediata (Baja Complejidad)

#### Acción 1.1: Eliminar import obsoleto
**Archivo:** `frontend/app/projects/[id]/screening/page.tsx`  
**Línea:** 11  
**Cambio:**
```diff
- import { IndividualReview } from "@/components/screening/individual-review"
  import { IndividualReviewEnhanced } from "@/components/screening/individual-review-enhanced"
```

**Justificación:** `individual-review.tsx` no existe en disco, fue reemplazado por versión mejorada

**Tiempo estimado:** 2 minutos

---

#### Acción 1.2: Añadir comentario de deprecación
**Archivo:** `frontend/components/screening/similarity-distribution-analysis.tsx`  
**Línea:** 1 (al inicio)  
**Cambio:**
```typescript
// @deprecated - Este componente será reemplazado por priority-distribution-analysis.tsx
// TODO: Migrar usos a priority-distribution-analysis.tsx y eliminar este archivo
// Mantener hasta que se integre el nuevo componente (estimado: próxima versión 2.1.0)
```

**Justificación:** Prevenir que se use en nuevos desarrollos

**Tiempo estimado:** 5 minutos

---

### 2. Integración de Nuevo Componente (Complejidad Media)

#### Acción 2.1: Integrar `priority-distribution-analysis.tsx` en página de screening
**Archivo:** `frontend/app/projects/[id]/screening/page.tsx`  
**Cambio:** Añadir nuevo tab "Análisis de Distribución"

**Código sugerido:**
```typescript
import { PriorityDistributionAnalysis } from "@/components/screening/priority-distribution-analysis"

// En el JSX, añadir nuevo Tab:
<Tabs defaultValue="table" className="w-full">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="table">Referencias</TabsTrigger>
    <TabsTrigger value="ai-screening">IA Screening</TabsTrigger>
    <TabsTrigger value="full-text">Texto Completo</TabsTrigger>
    <TabsTrigger value="distribution">📊 Análisis</TabsTrigger> {/* NUEVO */}
  </TabsList>

  {/* Tabs existentes... */}

  <TabsContent value="distribution"> {/* NUEVO */}
    <PriorityDistributionAnalysis references={references} />
  </TabsContent>
</Tabs>
```

**Justificación:** Integrar nuevo componente de análisis de distribución según requisito del usuario

**Tiempo estimado:** 30 minutos

---

#### Acción 2.2: Actualizar página de análisis avanzado
**Archivo:** `frontend/app/projects/[id]/screening/analysis/page.tsx`  
**Cambio:** Reemplazar `similarity-distribution-analysis.tsx` con `priority-distribution-analysis.tsx`

**Código sugerido:**
```diff
- import { SimilarityDistributionAnalysis } from "@/components/screening/similarity-distribution-analysis"
+ import { PriorityDistributionAnalysis } from "@/components/screening/priority-distribution-analysis"

  // En el JSX:
- <SimilarityDistributionAnalysis references={references} />
+ <PriorityDistributionAnalysis references={references} />
```

**Justificación:** Migrar a componente nuevo con mejor análisis

**Tiempo estimado:** 15 minutos

---

### 3. Consolidación a Largo Plazo (Complejidad Alta)

#### Acción 3.1: Eliminar componente deprecado
**Archivo:** `frontend/components/screening/similarity-distribution-analysis.tsx`  
**Acción:** Eliminar archivo completo después de migración

**Prerrequisitos:**
- ✅ Acción 2.2 completada
- ✅ Pruebas de integración pasadas
- ✅ Ningún otro componente lo importa

**Tiempo estimado:** 5 minutos (después de validación)

---

## 📈 Métricas de Calidad

### Antes de Limpieza
- **Total archivos:** 19
- **Componentes activos:** 14 (73.7%)
- **Imports rotos:** 1 (`individual-review.tsx`)
- **Componentes duplicados:** 2 (`similarity-distribution-analysis` vs `priority-distribution-analysis`)
- **Cobertura de documentación:** 2/19 (10.5%)

### Después de Limpieza (Estimado)
- **Total archivos:** 18 (-1)
- **Componentes activos:** 15 (83.3%)
- **Imports rotos:** 0 (-1) ✅
- **Componentes duplicados:** 0 (-2) ✅
- **Cobertura de documentación:** 2/18 (11.1%)

### Mejora Total
- ⬆️ **+9.6% en componentes activos**
- ⬇️ **-1 import roto**
- ⬇️ **-2 componentes duplicados**

---

## 🔍 Observaciones Adicionales

### Buenas Prácticas Identificadas ✅
1. **Componentización clara:** Cada componente tiene responsabilidad única
2. **Reutilización:** `ReferenceDetailDialog` usado en 4 lugares
3. **Composición:** `full-text-review.tsx` compone `full-text-evaluation-form.tsx`
4. **Documentación:** 2 archivos MD en carpeta de componentes

### Áreas de Mejora ⚠️
1. **Import roto:** `individual-review.tsx` no existe pero se importa
2. **Duplicidad:** Dos componentes de análisis de distribución
3. **Falta de tests:** No se encontraron archivos `.test.tsx` o `.spec.tsx`
4. **Falta de Storybook:** No hay stories para desarrollo aislado

### Recomendaciones Futuras 📋
1. **Añadir tests unitarios** para cada componente (Jest + React Testing Library)
2. **Crear Storybook** para desarrollo y documentación visual
3. **Implementar PropTypes** o TypeScript strict mode
4. **Añadir JSDoc** para documentar props y funcionalidad

---

## 📝 Checklist de Limpieza

### Inmediato (Hoy)
- [ ] Eliminar import de `individual-review.tsx` en `screening/page.tsx`
- [ ] Añadir comentario `@deprecated` en `similarity-distribution-analysis.tsx`
- [ ] Integrar `priority-distribution-analysis.tsx` en página principal

### Corto Plazo (Esta Semana)
- [ ] Migrar usos de `similarity-distribution-analysis` a nuevo componente
- [ ] Probar integración del nuevo componente
- [ ] Validar que no hay imports rotos

### Largo Plazo (Próxima Versión)
- [ ] Eliminar `similarity-distribution-analysis.tsx` completamente
- [ ] Añadir tests unitarios para componentes críticos
- [ ] Documentar arquitectura de componentes en README

---

**Última actualización:** 2024-01-XX  
**Versión auditada:** 2.0.0  
**Próxima revisión:** Después de implementar dual review
