# 📋 Análisis Completo: Componentes de Screening

**Fecha:** 3 de Diciembre, 2025  
**Carpeta Analizada:** `frontend/components/screening/`

---

## 🎯 Resumen Ejecutivo

Tu sistema de cribado tiene **5 FASES** implementadas en tabs:

1. **Fase 1**: Clasificación Automática con IA (Embeddings + ChatGPT)
2. **Fase 2**: Revisión Manual (confirmar recomendaciones IA)
3. **Fase 3**: Texto Completo (subir PDFs y evaluar)
4. **Exclusiones**: Tabla de motivos de exclusión
5. **PRISMA**: Diagrama de flujo

### Estado de Componentes

| Componente | Estado | Uso Actual | Acción |
|------------|--------|------------|--------|
| ✅ `ai-screening-panel.tsx` | **ACTIVO** | Fase 1 - Panel de control | Mantener |
| ✅ `screening-filters.tsx` | **ACTIVO** | Filtros de búsqueda | Mantener |
| ✅ `reference-table.tsx` | **ACTIVO** | Tabla de referencias | Mantener |
| ✅ `full-text-review.tsx` | **ACTIVO** | Fase 3 - Subir PDFs | **MEJORAR** |
| ✅ `hybrid-screening-stats.tsx` | **ACTIVO** | Stats Fase 1 | Mantener |
| ✅ `prisma-flow-diagram.tsx` | **ACTIVO** | Fase 5 - Diagrama | Mantener |
| ✅ `exclusion-reasons-table.tsx` | **ACTIVO** | Fase 4 - Motivos | Mantener |
| ✅ `duplicate-detection-dialog.tsx` | **ACTIVO** | Pre-fase - Duplicados | Mantener |
| ✅ `similarity-distribution-analysis.tsx` | **ACTIVO NUEVO** | Análisis Elbow | Mantener |
| ⚠️ `individual-review-enhanced.tsx` | **PARCIAL** | Fase 2 - Revisar | **MEJORAR** |
| ⚠️ `classified-references-view.tsx` | **PARCIAL** | Mostrar clasificadas | Mantener |
| ⚠️ `screening-analysis-panel.tsx` | **POCO USO** | Stats alternativo | Consolidar |
| ⚠️ `ranking-view.tsx` | **POCO USO** | Vista ranking | Consolidar |
| ❌ **`rayyan-integration.tsx`** | **OBSOLETO** | ~~Integración Rayyan~~ | **ELIMINAR** |
| ❌ `individual-review.tsx` | **OBSOLETO** | ~~Vieja versión~~ | **ELIMINAR** |
| ❌ `import-references-button.tsx` | **REDUNDANTE** | Ya está en otra parte | **ELIMINAR** |
| ❌ `academic-search-dialog.tsx` | **REDUNDANTE** | Ya en protocolo | **ELIMINAR** |
| ⚠️ `reference-detail-dialog.tsx` | **UTIL** | Ver detalles | Mantener |
| ⚠️ `bulk-actions-bar.tsx` | **UTIL** | Acciones masivas | Mantener |

---

## 📊 ANÁLISIS DETALLADO POR COMPONENTE

### ✅ **COMPONENTES ACTIVOS Y FUNCIONALES**

#### 1. `ai-screening-panel.tsx` ✅ **EXCELENTE**
```typescript
// Ubicación: Fase 1 - Sidebar izquierdo
// Funcionalidad: Panel de control para cribado automático
```

**Lo que hace:**
- Tabs: Embeddings vs LLM
- Slider de umbral (threshold) ajustable
- Muestra total referencias y pendientes
- Botón "Ejecutar Cribado Híbrido"
- Integración con análisis de distribución (RECIÉN AGREGADO)
- Badge "Recomendado" cuando usa threshold del análisis Elbow

**Estado:** ✅ **100% funcional y actualizado**

**Mejoras recientes:**
- ✅ Integrado con `similarity-distribution-analysis.tsx`
- ✅ Callback `onThresholdRecommended` para actualizar slider
- ✅ Recibe `projectId` como prop
- ✅ Muestra mensaje cuando usa umbral recomendado

---

#### 2. `reference-table.tsx` ✅ **MUY BUENO**
```typescript
// Ubicación: Todas las fases
// Funcionalidad: Tabla principal de referencias
```

**Lo que hace:**
- Tabla con checkboxes de selección
- Columnas: Título, Autores, Año, Fuente, Score IA, Estado, Acciones
- Badges que muestran:
  - Estado (pending, included, excluded, duplicate)
  - Método IA (🔀 Híbrido, 🧠 ChatGPT, 🤖 Embeddings)
  - Clasificación IA (✅ Incluir, ❌ Excluir, 🤔 Revisar)
- Botones de acción condicionales
- Integrado con `ReferenceDetailDialog`

**Estado:** ✅ **100% funcional**

**Props importantes:**
- `showActions`: Si false, solo muestra botón de ver detalles
- `enableSelection`: Si false, oculta checkboxes

---

#### 3. `screening-filters.tsx` ✅ **PERFECTO**
```typescript
// Ubicación: Encima de reference-table
// Funcionalidad: Filtros de búsqueda y clasificación
```

**Lo que hace:**
- Input de búsqueda (título, autor, abstract)
- Select de estado (all, pending, included, excluded, duplicate)
- Select de clasificación (all, embeddings, chatgpt, hybrid, manual)

**Estado:** ✅ **100% funcional**

---

#### 4. `full-text-review.tsx` ⚠️ **PARCIAL - NECESITA MEJORAS**
```typescript
// Ubicación: Fase 3
// Funcionalidad: Subir PDFs para revisión de texto completo
```

**Lo que hace actualmente:**
- ✅ UI para subir PDFs por referencia
- ✅ Validación de tipo archivo (solo PDF)
- ✅ Progress bar general (X de Y con PDF)
- ✅ Botón "Cargar PDF" por referencia
- ✅ Botón "Ver PDF" cuando está cargado
- ✅ Estados visuales (con PDF / sin PDF)
- ✅ Integrado con `ReferenceDetailDialog`

**Lo que FALTA (según requerimientos del docente):**
- ❌ **Backend endpoint para almacenar PDFs**
- ❌ **Sistema de puntuación 0-12 con checklist**
- ❌ **Formulario de evaluación con 7 criterios**
- ❌ **Decisión automática (threshold >= 7)**
- ❌ **Guardar screening_record en DB**

**PRIORIDAD: 🔴 CRÍTICA**

**Acción requerida:**
Ver `docs/ANALISIS-IMPLEMENTACION-CRIBADO.md` Fase 3 para implementación completa.

---

#### 5. `hybrid-screening-stats.tsx` ✅ **BUENO**
```typescript
// Ubicación: Fase 1 - Sidebar debajo del panel
// Funcionalidad: Muestra estadísticas del último cribado híbrido
```

**Lo que hace:**
- Muestra resultados de Fase 1 (Embeddings): incluidas, excluidas
- Muestra resultados de Fase 2 (ChatGPT): analizadas en zona gris
- Total general: incluidas, excluidas, para revisión manual
- Duración del proceso

**Estado:** ✅ **100% funcional**

---

#### 6. `similarity-distribution-analysis.tsx` ✅ **NUEVO Y EXCELENTE**
```typescript
// Ubicación: Fase 1 - Análisis estadístico
// Funcionalidad: Análisis Elbow para determinar umbral óptimo
```

**Lo que hace:**
- Calcula estadísticas: min, max, mean, median, percentiles
- Detecta punto de codo (Elbow point) automáticamente
- Simula 11 umbrales diferentes (0.3 a 0.8)
- Muestra recomendaciones: Top 5%, Top 10%, Top 25%
- Callback para actualizar threshold en `ai-screening-panel`
- Grid de estadísticas (4x2)
- Tabla de simulación de umbrales

**Estado:** ✅ **100% funcional - RECIÉN IMPLEMENTADO**

**Integración:**
- ✅ Backend use case: `screen-references-embeddings.use-case.js`
- ✅ Backend controller: `ai.controller.js`
- ✅ Backend route: `/api/ai/analyze-similarity-distribution`
- ✅ Frontend API client: `apiClient.analyzeSimilarityDistribution()`
- ✅ Props en `AIScreeningPanel`

---

#### 7. `prisma-flow-diagram.tsx` ✅ **MUY BUENO**
```typescript
// Ubicación: Fase 5 (Tab "PRISMA")
// Funcionalidad: Diagrama de flujo PRISMA 2020
```

**Lo que hace:**
- Visualiza las 4 fases: Identificación → Dedup → Cribado → Elegibilidad
- Números dinámicos actualizados desde stats
- Porcentajes calculados automáticamente
- Cards con colores por fase (azul, gris, morado, naranja, verde)
- Arrows entre fases

**Lo que FALTA:**
- ❌ **Exportar como PNG** (para tesis)
- ❌ **Botón de descarga**

**Estado:** ✅ **95% funcional**

---

#### 8. `exclusion-reasons-table.tsx` ✅ **BUENO**
```typescript
// Ubicación: Fase 4 (Tab "Exclusiones")
// Funcionalidad: Tabla de motivos de exclusión con frecuencias
```

**Lo que hace:**
- Muestra motivos de exclusión agrupados
- Frecuencia por motivo
- Porcentaje sobre total excluidos
- Badge con color por motivo

**Estado:** ✅ **100% funcional**

---

#### 9. `duplicate-detection-dialog.tsx` ✅ **EXCELENTE**
```typescript
// Ubicación: Pre-fase (Resumen de datos)
// Funcionalidad: Detectar y resolver duplicados
```

**Lo que hace:**
- Botón "Detectar duplicados"
- Diálogo con grupos de duplicados encontrados
- Muestra original + duplicados en cada grupo
- Similitud por par
- Botón "Mantener esta referencia" por cada opción
- Resuelve grupos y actualiza estadísticas

**Estado:** ✅ **100% funcional**

**Backend:**
- ✅ Use case: `detect-duplicates.use-case.js`
- ✅ Algoritmo Levenshtein implementado
- ✅ Comparación por DOI, título, autores

---

#### 10. `classified-references-view.tsx` ⚠️ **PARCIAL**
```typescript
// Ubicación: Fase 1 - Debajo de reference-table
// Funcionalidad: Mostrar referencias clasificadas por IA
```

**Lo que hace:**
- Organiza referencias en 3 grupos:
  - Alta confianza INCLUIR (verde)
  - Zona gris (amarillo)
  - Alta confianza EXCLUIR (rojo)
- Cuenta por grupo
- Muestra lista de títulos

**Estado:** ⚠️ **70% funcional**

**Mejoras sugeridas:**
- Agregar mini tabla en lugar de lista
- Mostrar score por referencia
- Botones de acción rápida

---

### ⚠️ **COMPONENTES PARCIALES / POCO USO**

#### 11. `individual-review-enhanced.tsx` ⚠️ **MEJORAR**
```typescript
// Ubicación: Fase 2 - Revisión manual
// Funcionalidad: Revisar referencias una por una
```

**Lo que hace:**
- Navegación prev/next
- Muestra título, abstract, autores, año
- Recomendación de IA destacada
- Razonamiento de IA
- Botones: Incluir / Excluir / Tal vez
- Progress bar

**Lo que FALTA (según requerimientos del docente):**
- ❌ **Resaltar términos INCLUDE/EXCLUDE del protocolo** en abstract
- ❌ **Badge con "X keywords matched"**
- ❌ **Función `highlightKeywords()`**

**Estado:** ⚠️ **75% funcional**

**Acción:**
Ver `docs/ANALISIS-IMPLEMENTACION-CRIBADO.md` Fase 2 para mejoras.

---

#### 12. `screening-analysis-panel.tsx` ⚠️ **ALTERNATIVO**
```typescript
// Ubicación: Posible alternativa a hybrid-screening-stats
// Funcionalidad: Panel de análisis estadístico
```

**Observación:**
- Similar a `similarity-distribution-analysis.tsx` pero más antiguo
- Tiene charts con Recharts
- Stats descriptivas
- Recomendaciones

**Estado:** ⚠️ **Redundante con nuevo componente**

**Acción:** CONSOLIDAR o ELIMINAR (usar solo `similarity-distribution-analysis.tsx`)

---

#### 13. `ranking-view.tsx` ⚠️ **POCO USO**
```typescript
// Ubicación: No claro
// Funcionalidad: Vista ranking de referencias
```

**Observación:**
- Similar a tabla pero con ordenamiento por score
- Podría ser útil en Fase 1

**Estado:** ⚠️ **50% funcional**

**Acción:** CONSOLIDAR con `reference-table.tsx` (agregar ordenamiento)

---

### ❌ **COMPONENTES OBSOLETOS - ELIMINAR**

#### 14. `rayyan-integration.tsx` ❌ **OBSOLETO - ELIMINAR**
```typescript
// ⚠️ RAYYAN NO SE USA EN TU SISTEMA
```

**Qué hace:**
- Integración con Rayyan (herramienta externa de cribado)
- UI para revisar referencias estilo Rayyan
- Navegación prev/next
- Decisiones include/exclude/maybe
- Notas por referencia

**Por qué eliminarlo:**
1. ❌ Tu sistema NO usa Rayyan
2. ❌ Ya tienes `individual-review-enhanced.tsx` que hace lo mismo
3. ❌ El texto "¡Hurra! 🎉 ¡Has importado datos con éxito a Rayyan!" está hardcoded en `screening/page.tsx` (línea 574)
4. ❌ Confunde a los usuarios
5. ❌ Duplica funcionalidad

**ACCIÓN: 🗑️ ELIMINAR ESTE ARCHIVO**

---

#### 15. `individual-review.tsx` ❌ **OBSOLETO - ELIMINAR**
```typescript
// Versión antigua de individual-review-enhanced.tsx
```

**Por qué eliminarlo:**
- ❌ Ya existe la versión `enhanced`
- ❌ No se usa en ninguna parte
- ❌ Código viejo

**ACCIÓN: 🗑️ ELIMINAR ESTE ARCHIVO**

---

#### 16. `import-references-button.tsx` ❌ **REDUNDANTE**
```typescript
// Botón para importar referencias
```

**Por qué eliminarlo:**
- ❌ La importación ya se hace desde el protocolo
- ❌ La búsqueda académica ya se ejecuta desde protocolo
- ❌ En screening solo se usa "Buscar y Guardar" desde search queries
- ❌ No se necesita otro botón de importación aquí

**ACCIÓN: 🗑️ ELIMINAR ESTE ARCHIVO**

---

#### 17. `academic-search-dialog.tsx` ❌ **REDUNDANTE**
```typescript
// Diálogo para búsqueda académica
```

**Por qué eliminarlo:**
- ❌ La búsqueda académica ya está en protocolo (paso 5)
- ❌ En screening solo se ejecutan las búsquedas guardadas
- ❌ No se necesita abrir otro diálogo aquí

**ACCIÓN: 🗑️ ELIMINAR ESTE ARCHIVO**

---

### ✅ **COMPONENTES ÚTILES - MANTENER**

#### 18. `reference-detail-dialog.tsx` ✅ **MANTENER**
```typescript
// Diálogo modal para ver detalles completos de una referencia
```

**Lo que hace:**
- Modal con título, abstract, autores, año, DOI, etc.
- Botones de acción: Incluir / Excluir
- Usado en múltiples componentes

**Estado:** ✅ **100% funcional y necesario**

---

#### 19. `bulk-actions-bar.tsx` ✅ **MANTENER**
```typescript
// Barra de acciones masivas cuando hay referencias seleccionadas
```

**Lo que hace:**
- Muestra "X referencias seleccionadas"
- Botones: Incluir todas / Excluir todas / Eliminar
- Aparece flotante cuando hay selección

**Estado:** ✅ **100% funcional y necesario**

---

## 🎯 ESTRUCTURA DE FASES EN SCREENING

### Tal como está implementado en `screening/page.tsx`:

```typescript
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="fase1">Fase 1 - Clasificación IA</TabsTrigger>
    <TabsTrigger value="fase2">Fase 2 - Revisión Manual</TabsTrigger>
    <TabsTrigger value="fase3">Fase 3 - Texto Completo</TabsTrigger>
    <TabsTrigger value="exclusiones">Exclusiones</TabsTrigger>
    <TabsTrigger value="prisma">PRISMA</TabsTrigger>
  </TabsList>

  {/* FASE 1: Clasificación Automática con IA */}
  <TabsContent value="fase1">
    <AIScreeningPanel />                      // Panel de control
    <HybridScreeningStats />                  // Stats del último cribado
    <ReferenceTable />                        // Todas las referencias
    <ClassifiedReferencesView />              // Agrupadas por clasificación
    <SimilarityDistributionAnalysis />        // Análisis Elbow (NUEVO)
  </TabsContent>

  {/* FASE 2: Revisión Manual */}
  <TabsContent value="fase2">
    <IndividualReviewEnhanced />              // Revisar una por una
    // ❌ AQUÍ SE USABA rayyan-integration.tsx (OBSOLETO)
  </TabsContent>

  {/* FASE 3: Texto Completo */}
  <TabsContent value="fase3">
    <FullTextReview />                        // Subir PDFs
    // ❌ FALTA: Formulario de evaluación con puntuación
  </TabsContent>

  {/* EXCLUSIONES */}
  <TabsContent value="exclusiones">
    <ExclusionReasonsTable />                 // Tabla de motivos
  </TabsContent>

  {/* PRISMA */}
  <TabsContent value="prisma">
    <PrismaFlowDiagram />                     // Diagrama de flujo
  </TabsContent>
</Tabs>
```

---

## 📋 PLAN DE ACCIÓN INMEDIATO

### 🔴 **PRIORIDAD 1: LIMPIAR ARCHIVOS OBSOLETOS**

```bash
# Eliminar componentes obsoletos
rm frontend/components/screening/rayyan-integration.tsx
rm frontend/components/screening/individual-review.tsx
rm frontend/components/screening/import-references-button.tsx
rm frontend/components/screening/academic-search-dialog.tsx
```

### 🔴 **PRIORIDAD 2: CORREGIR TEXTO DE RAYYAN**

En `frontend/app/projects/[id]/screening/page.tsx` línea ~574:

```typescript
// ❌ ELIMINAR ESTO:
<CardDescription className="mt-1">
  {duplicatesStats ? 
    "¡Hurra! 🎉 ¡Has importado datos con éxito a Rayyan! Ahora es hora de detectar duplicados." :
    "Importa referencias y detecta duplicados automáticamente"
  }
</CardDescription>

// ✅ CAMBIAR POR:
<CardDescription className="mt-1">
  {duplicatesStats ? 
    "✅ Referencias importadas. Detecta duplicados para limpiar tu base de datos." :
    "Importa referencias desde el protocolo y luego detecta duplicados automáticamente"
  }
</CardDescription>
```

### 🟠 **PRIORIDAD 3: COMPLETAR FASE 3 - FULL TEXT**

**Implementar sistema de puntuación (ver `docs/ANALISIS-IMPLEMENTACION-CRIBADO.md`):**

1. Backend:
   - ✅ Modelo `ScreeningRecord` (MongoDB)
   - ✅ Use Case `EvaluateFullTextUseCase`
   - ✅ Endpoint `/api/evaluate-fulltext`

2. Frontend:
   - ✅ Componente `FullTextEvaluationForm` con 7 sliders
   - ✅ Integrar en `full-text-review.tsx`

### 🟡 **PRIORIDAD 4: MEJORAR FASE 2 - REVISIÓN MANUAL**

**Agregar resaltado de keywords:**

1. En `individual-review-enhanced.tsx`:
   - Función `highlightKeywords(text, keywords)`
   - Obtener keywords del protocolo
   - Resaltar en abstract
   - Badge "X keywords matched"

### 🟢 **PRIORIDAD 5: CONSOLIDAR COMPONENTES SIMILARES**

**Decisión:**
- ❓ Mantener `screening-analysis-panel.tsx` O `similarity-distribution-analysis.tsx`?
  - **Recomendación:** Eliminar `screening-analysis-panel.tsx` y usar solo el nuevo
  
- ❓ Mantener `ranking-view.tsx`?
  - **Recomendación:** Eliminar y agregar ordenamiento a `reference-table.tsx`

---

## 🎓 SOBRE PRISMA Y LOS 27 ITEMS

### Pregunta del usuario:
> "no se si eso deba aparecer aqui o en la seccion Prisma donde estan los 27 items del check list de Prisma"

### Respuesta:

**PRISMA tiene 2 cosas diferentes:**

1. **Diagrama de Flujo PRISMA** (lo que tienes en Fase 5 - Screening)
   - ✅ Ya lo tienes: `prisma-flow-diagram.tsx`
   - ✅ Muestra: Identificados → Dedup → Cribado → Texto Completo → Incluidos
   - ✅ Ubicación correcta: Tab "PRISMA" en Screening
   - ✅ Esto es para el **Methodology** de tu tesis

2. **Checklist PRISMA 27 items** (sección PRISMA del proyecto)
   - ✅ Ya lo tienes: `frontend/app/projects/[id]/prisma/page.tsx`
   - ✅ 27 items para validar calidad de tu RSL
   - ✅ Ubicación correcta: Sección separada "PRISMA" (no en screening)
   - ✅ Esto es para **validar** que tu metodología cumple estándares

**CONCLUSIÓN:**
- ✅ Están en los lugares correctos
- ✅ El diagrama de flujo va en Screening (Fase 5)
- ✅ Los 27 items van en la sección PRISMA separada
- ✅ Son dos herramientas diferentes con propósitos diferentes

---

## 📊 RESUMEN VISUAL

```
frontend/components/screening/
├── ✅ ai-screening-panel.tsx              → MANTENER (Fase 1)
├── ✅ bulk-actions-bar.tsx                → MANTENER
├── ✅ classified-references-view.tsx      → MANTENER (Fase 1)
├── ✅ duplicate-detection-dialog.tsx      → MANTENER (Pre-fase)
├── ✅ exclusion-reasons-table.tsx         → MANTENER (Fase 4)
├── ⚠️  full-text-review.tsx               → MEJORAR (Fase 3) 🔴
├── ✅ hybrid-screening-stats.tsx          → MANTENER (Fase 1)
├── ⚠️  individual-review-enhanced.tsx     → MEJORAR (Fase 2) 🟠
├── ✅ prisma-flow-diagram.tsx             → MANTENER (Fase 5)
├── ✅ reference-detail-dialog.tsx         → MANTENER
├── ✅ reference-table.tsx                 → MANTENER
├── ⚠️  ranking-view.tsx                   → CONSOLIDAR 🟡
├── ⚠️  screening-analysis-panel.tsx       → CONSOLIDAR 🟡
├── ✅ screening-filters.tsx               → MANTENER
├── ✅ similarity-distribution-analysis.tsx → MANTENER (NUEVO) ✨
│
├── ❌ rayyan-integration.tsx              → ELIMINAR 🗑️
├── ❌ individual-review.tsx               → ELIMINAR 🗑️
├── ❌ import-references-button.tsx        → ELIMINAR 🗑️
└── ❌ academic-search-dialog.tsx          → ELIMINAR 🗑️
```

**TOTAL:**
- ✅ Mantener: 11 componentes
- ⚠️ Mejorar: 4 componentes
- ❌ Eliminar: 4 componentes

---

## ✅ CHECKLIST DE TAREAS

### Limpieza Inmediata (30 min)
- [ ] Eliminar `rayyan-integration.tsx`
- [ ] Eliminar `individual-review.tsx`
- [ ] Eliminar `import-references-button.tsx`
- [ ] Eliminar `academic-search-dialog.tsx`
- [ ] Corregir texto "Rayyan" en `screening/page.tsx`
- [ ] Consolidar/eliminar `screening-analysis-panel.tsx`
- [ ] Consolidar/eliminar `ranking-view.tsx`

### Fase 3 - Full Text (8-10 horas)
- [ ] Backend: Modelo `ScreeningRecord`
- [ ] Backend: Use Case `EvaluateFullTextUseCase`
- [ ] Backend: Repository `ScreeningRecordRepository`
- [ ] Backend: Endpoint POST `/evaluate-fulltext`
- [ ] Frontend: Componente `FullTextEvaluationForm`
- [ ] Frontend: Integrar formulario en `full-text-review.tsx`
- [ ] Frontend: Métricas de puntajes (mean, median, histogram)

### Fase 2 - Revisión Manual (4 horas)
- [ ] Función `highlightKeywords()` en `individual-review-enhanced.tsx`
- [ ] Obtener keywords del protocolo (INCLUDE/EXCLUDE)
- [ ] Resaltar términos en abstract
- [ ] Badge "X keywords matched"

### Exportaciones (2 horas)
- [ ] Botón "Exportar PRISMA como PNG" en `prisma-flow-diagram.tsx`
- [ ] Usar librería `html2canvas` o `react-to-png`

---

## 🎯 PRÓXIMO PASO

**¿Quieres que:**
1. ✂️ Elimine los archivos obsoletos (rayyan, etc.)?
2. 📝 Corrija el texto de "Rayyan" en screening/page.tsx?
3. 🏗️ Empiece a implementar el sistema de puntuación Fase 3?

**Dime cuál quieres primero y procedemos.** 🚀
