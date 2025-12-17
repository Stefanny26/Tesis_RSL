# Evaluación Completa del Frontend

**Fecha**: Diciembre 2024  
**Objetivo**: Revisión sistemática de todas las funcionalidades del frontend, evaluación de completitud, y alineación con estándares PRISMA 2020

---

## 📋 Índice

1. [Inventario Completo de Componentes](#inventario)
2. [Matriz de Completitud de Funcionalidades](#matriz)
3. [Integración IA (Gemini/ChatGPT)](#ia)
4. [Alineación con PRISMA 2020](#prisma)
5. [Calidad de Código](#calidad)
6. [Flujo de Datos](#flujo)
7. [Hallazgos Críticos](#hallazgos)
8. [Recomendaciones](#recomendaciones)

---

## 1. Inventario Completo de Componentes {#inventario}

### 1.1 Páginas Principales (`app/`)

| Página | Ruta | Propósito | Estado |
|--------|------|-----------|---------|
| Dashboard | `/dashboard` | Gestión de proyectos, estadísticas | ✅ Completo |
| Project Detail | `/projects/[id]` | Vista general del proyecto | ✅ Completo |
| Screening | `/projects/[id]/screening` | Cribado de referencias | ⚠️ 70% (falta dual review) |
| Protocol | `/projects/[id]/protocol` | Gestión de protocolo | ✅ Completo |
| PRISMA | `/projects/[id]/prisma` | Checklist PRISMA 2020 | ✅ Completo |
| Article | `/projects/[id]/article` | Editor de artículo | ⚠️ Mock data |

### 1.2 Wizard de Proyecto (7 pasos)

| Paso | Archivo | Funcionalidad | Estado | AI Integrada |
|------|---------|---------------|--------|--------------|
| 1 | `1-proposal-step.tsx` | Propuesta inicial | ✅ | ❌ |
| 2 | `2-pico-matrix-step.tsx` | Marco PICO + Matriz Es/No Es | ✅ | ✅ `generateProtocolAnalysis` |
| 3 | `3-titles-step.tsx` | Generación de títulos | ✅ | ✅ `generateTitles` |
| 4 | `4-criteria-step.tsx` | Criterios inclusión/exclusión | ✅ | ✅ `generateInclusionExclusionCriteria` |
| 5 | `5-protocol-definition-step.tsx` | Términos del protocolo | ✅ | ✅ `generateProtocolTerms` |
| 6 | `6-search-plan-step.tsx` | Plan de búsqueda | ✅ | ✅ `generateSearchQueries` |
| 7 | `7-prisma-check-step.tsx` | Validación PRISMA | ✅ | ❌ |

**Hallazgos**:
- ⚠️ Pasos duplicados/renombrados: `4-search-plan-step.tsx`, `5-screening-step.tsx`, `5-search-plan-step.tsx`
- 🔍 Posible código legacy o pasos obsoletos
- ✅ Integración IA funcional en 5 de 7 pasos

### 1.3 Componentes de Screening (17 archivos)

| Componente | Propósito | Estado |
|------------|-----------|--------|
| `ai-screening-panel.tsx` | Clasificación IA (Embeddings + ChatGPT) | ✅ Funcional |
| `individual-review-enhanced.tsx` | Revisión manual individual | ⚠️ Solo 1 revisor |
| `duplicate-detection-dialog.tsx` | Detección de duplicados | ✅ Funcional |
| `full-text-review.tsx` | Revisión de texto completo | ✅ Funcional |
| `full-text-evaluation-form.tsx` | Formulario de evaluación | ✅ Funcional |
| `hybrid-screening-stats.tsx` | Estadísticas del cribado | ✅ Funcional |
| `exclusion-reasons-table.tsx` | Razones de exclusión | ✅ Funcional |
| `prisma-flow-diagram.tsx` | Diagrama PRISMA | ✅ Funcional |
| `reference-table.tsx` | Tabla de referencias | ✅ Funcional |
| `reference-detail-dialog.tsx` | Detalle de referencia | ✅ Funcional |
| `classified-references-view.tsx` | Vista de clasificados | ✅ Funcional |
| `bulk-actions-bar.tsx` | Acciones masivas | ✅ Funcional |
| `import-references-button.tsx` | Importar referencias | ✅ Funcional |
| `screening-analysis-panel.tsx` | Panel de análisis | ✅ Funcional |
| `screening-filters.tsx` | Filtros | ✅ Funcional |
| `similarity-distribution-analysis.tsx` | Distribución de similitud | ✅ Funcional |

**❌ FALTANTES CRÍTICOS**:
- `dual-review-panel.tsx` - Panel de revisión dual independiente
- `conflict-resolution-dialog.tsx` - Resolución de conflictos
- `reviewer-assignment-modal.tsx` - Asignación de revisores
- `inter-rater-agreement.tsx` - Cohen's Kappa / Acuerdo entre revisores
- `screening-workflow-manager.tsx` - Gestor de flujo de trabajo

### 1.4 Componentes de Artículo (4 archivos)

| Componente | Propósito | Estado | IA |
|------------|-----------|--------|-----|
| `ai-generator-panel.tsx` | Generación con IA | ⚠️ Mock | ❌ No conectado a backend |
| `article-editor.tsx` | Editor de artículo | ✅ | ❌ |
| `article-stats.tsx` | Estadísticas (palabras, completitud) | ✅ | ❌ |
| `version-history.tsx` | Control de versiones | ⚠️ Mock | ❌ |

**Hallazgo Crítico**: 
- 🚨 Generador IA **NO está conectado a backend**
- Usa `mockVersions` en lugar de datos reales
- Progreso simulado con `setInterval` en lugar de llamadas API reales

### 1.5 Componentes PRISMA (4 archivos)

| Componente | Propósito | Estado |
|------------|-----------|--------|
| `prisma-item-card.tsx` | Tarjeta de ítem individual | ✅ |
| `prisma-progress.tsx` | Progreso del checklist | ✅ |
| `ai-validation-panel.tsx` | Validación asistida por IA | ✅ |
| `section-filter.tsx` | Filtro por sección | ✅ |

**Hallazgo**: 
- ✅ Auto-generación de contenido basado en protocolo (`generateItemContent`)
- ✅ Integración con datos del wizard

### 1.6 Componentes de Protocolo

| Componente | Propósito | Estado |
|------------|-----------|--------|
| `protocol-wizard.tsx` | Wizard de edición de protocolo | ❓ No evaluado |
| `protocol/steps/` | Pasos del wizard de protocolo | ❓ No evaluado |

**Nota**: Existe un wizard de protocolo **separado** del wizard de proyecto. Requiere evaluación.

### 1.7 Dashboard (4 archivos)

| Componente | Propósito | Estado |
|------------|-----------|--------|
| `dashboard-nav.tsx` | Navegación principal | ✅ |
| `project-card.tsx` | Tarjeta de proyecto | ✅ |
| `stats-card.tsx` | Tarjeta de estadísticas | ✅ |
| Dashboard Page | Gestión de proyectos | ✅ |

**Hallazgo**:
- ✅ Carga de estadísticas de referencias en tiempo real
- ✅ Handler para eliminar proyectos

---

## 2. Matriz de Completitud de Funcionalidades {#matriz}

| Funcionalidad | Completitud | Crítico | Notas |
|---------------|-------------|---------|-------|
| **Wizard de Proyecto** | 95% | 🔴 | Pasos duplicados, 5/7 con IA |
| **Gestión de Protocolo** | 90% | 🟡 | Dos wizards (proyecto + protocolo) |
| **Importación Referencias** | 100% | 🟢 | RIS, CSV, BibTeX |
| **Detección Duplicados** | 100% | 🟢 | Funcional |
| **Cribado IA (Embeddings)** | 100% | 🟢 | Fase 1 completa |
| **Cribado IA (ChatGPT)** | 100% | 🟢 | Fase 2 completa |
| **Revisión Manual Individual** | 100% | 🟢 | Funcional |
| **Revisión Dual Independiente** | 0% | 🔴 | **CRÍTICO - FALTA IMPLEMENTAR** |
| **Resolución de Conflictos** | 0% | 🔴 | **CRÍTICO - FALTA IMPLEMENTAR** |
| **Acuerdo Inter-evaluador** | 0% | 🔴 | Cohen's Kappa ausente |
| **Revisión Texto Completo** | 100% | 🟢 | Upload PDF + evaluación |
| **Evaluación de Calidad (CASP)** | 0% | 🔴 | **FALTA IMPLEMENTAR** |
| **Extracción de Datos** | 0% | 🔴 | **FALTA IMPLEMENTAR** |
| **Síntesis de Resultados** | 0% | 🔴 | **FALTA IMPLEMENTAR** |
| **Checklist PRISMA** | 100% | 🟢 | 27 ítems con auto-generación |
| **Diagrama Flujo PRISMA** | 100% | 🟢 | Con datos reales |
| **Estadísticas Cribado** | 100% | 🟢 | Completo |
| **Generación Artículo IA** | 10% | 🔴 | **MOCK - NO FUNCIONAL** |
| **Editor de Artículo** | 80% | 🟡 | Funcional pero con mock data |
| **Control de Versiones** | 20% | 🟡 | Mock - no persiste |
| **Exportar Artículo** | 0% | 🟡 | Botón presente, sin funcionalidad |

**Resumen**:
- ✅ **Completo**: 11 funcionalidades (55%)
- ⚠️ **Parcial**: 3 funcionalidades (15%)
- ❌ **Ausente**: 6 funcionalidades (30%)

---

## 3. Integración IA (Gemini/ChatGPT) {#ia}

### 3.1 Endpoints IA Implementados

| Endpoint | Uso | Archivo | Estado |
|----------|-----|---------|--------|
| `generateProtocolAnalysis` | Analizar propuesta | `2-pico-matrix-step.tsx` | ✅ |
| `generateTitles` | Generar títulos | `3-titles-step.tsx` | ✅ |
| `generateInclusionExclusionCriteria` | Criterios | `4-criteria-step.tsx` | ✅ |
| `generateSearchStrategies` | Estrategias búsqueda | `4-search-plan-step.tsx` | ✅ |
| `generateProtocolTerms` | Términos protocolo | `5-protocol-definition-step.tsx` | ✅ |
| `generateSearchQueries` | Queries búsqueda | `6-search-plan-step.tsx` | ✅ |
| `generateArticleSection` | Generar artículo | ❌ **NO EXISTE** | 🔴 |
| `generateArticleFull` | Artículo completo | ❌ **NO EXISTE** | 🔴 |

### 3.2 Hallazgos Críticos

**✅ Funcionando**:
- Wizard usa 6 endpoints IA para generación de protocolo
- Screening usa embeddings + ChatGPT para clasificación híbrida
- PRISMA usa IA para validación de ítems

**🚨 PROBLEMA CRÍTICO**:
```tsx
// ai-generator-panel.tsx - Líneas 22-37
const handleGenerateSection = async () => {
  setIsGenerating(true)
  setProgress(0)

  const interval = setInterval(() => {  // ❌ SIMULACIÓN, NO REAL
    setProgress((prev) => {
      if (prev >= 100) {
        clearInterval(interval)
        setIsGenerating(false)
        onGenerateDraft(selectedSection)  // ❌ No llama al backend
        return 100
      }
      return prev + 10
    })
  }, 300)
}
```

**Solución Requerida**:
```tsx
const handleGenerateSection = async () => {
  setIsGenerating(true)
  setProgress(0)
  
  try {
    const result = await apiClient.generateArticleSection({
      projectId: params.id,
      section: selectedSection,
      protocol: protocolData,
      references: includedReferences,
      prismaItems: prismaChecklist
    })
    
    onGenerateDraft(selectedSection, result.content)
  } catch (error) {
    toast({
      title: "Error",
      description: "No se pudo generar la sección",
      variant: "destructive"
    })
  } finally {
    setIsGenerating(false)
  }
}
```

---

## 4. Alineación con PRISMA 2020 {#prisma}

### 4.1 Cobertura por Fase

| Fase PRISMA | Completitud | Componentes | Faltantes |
|-------------|-------------|-------------|-----------|
| **A. Título** | 100% | Wizard paso 3 | Ninguno |
| **B. Resumen** | 50% | Editor mock | Generación IA real |
| **C. Introducción** | 60% | Wizard paso 1-2 | Revisión literatura previa |
| **D. Protocolo (PICO)** | 100% | Wizard paso 2-6 | Ninguno |
| **E. Criterios Elegibilidad** | 100% | Wizard paso 4 | Ninguno |
| **F. Búsqueda** | 100% | Wizard paso 5-6 | Ninguno |
| **G. Cribado** | 70% | 17 componentes | Dual review, conflictos, Kappa |
| **H. Evaluación Calidad** | 0% | ❌ | **Todo** |
| **I. Extracción Datos** | 0% | ❌ | **Todo** |
| **J. Síntesis Resultados** | 0% | ❌ | **Todo** |
| **K. Limitaciones** | 40% | Editor mock | Sección explícita |
| **L. Financiamiento** | 0% | ❌ | Campo en protocolo |
| **M. Diagrama Flujo** | 100% | `prisma-flow-diagram.tsx` | Ninguno |

**PRISMA Compliance Score**: **49.2%** (antes era 22% - mejorado por cobertura wizard/checklist)

### 4.2 Compliance Detallada por Ítem

#### Items PRISMA 2020 Completos ✅
1. Título (Item 1)
2. PICO (Items 3-4)
3. Criterios elegibilidad (Item 5)
4. Fuentes información (Item 6)
5. Estrategia búsqueda (Item 7)
6. Cribado automático (Item 8 parcial)
7. Diagrama flujo (Item 17)
8. Checklist completo (Item 27)

#### Items PRISMA 2020 Críticos Faltantes ❌
- **Item 8**: Proceso de selección → Falta dual review + consenso
- **Item 9-11**: Evaluación calidad → Todo ausente
- **Item 13-14**: Extracción datos → Todo ausente
- **Item 20-21**: Síntesis resultados → Todo ausente

---

## 5. Calidad de Código {#calidad}

### 5.1 Problemas Identificados

#### 🔴 Críticos

1. **Archivos Duplicados en Wizard**
   ```
   frontend/components/project-wizard/steps/
   ├── 4-search-plan-step.tsx         ❓ Duplicado o legacy?
   ├── 5-screening-step.tsx           ❓ No debería estar aquí
   ├── 5-search-plan-step.tsx         ❓ Duplicado
   └── 6-search-plan-step.tsx         ✅ ¿Cuál es el correcto?
   ```
   **Acción**: Identificar versión correcta, eliminar duplicados

2. **Mock Data en Producción**
   - `article/page.tsx`: Usa `mockVersions` en lugar de API real
   - `ai-generator-panel.tsx`: Simula progreso en lugar de llamar API
   - `version-history.tsx`: No persiste versiones en DB

3. **Separación Wizard Proyecto vs Protocolo**
   - Existen dos wizards: `/components/project-wizard/` y `/components/protocol/`
   - No está claro cuándo usar uno u otro
   - Posible duplicación de lógica

#### 🟡 Moderados

4. **Falta Manejo de Errores**
   - Muchos componentes no tienen `try-catch` en llamadas API
   - No hay fallbacks visuales para errores de red

5. **TypeScript Warnings**
   - Algunos props con `any` en lugar de types específicos
   - Interfaces incompletas en algunos componentes

#### 🟢 Menores

6. **Console.logs en Producción**
   - Debug logs agregados en sesión anterior (`🔍 DEBUG - ...`)
   - Deben removerse antes de deploy

7. **Componentes Grandes**
   - `article/page.tsx`: 173 líneas (acceptable)
   - `prisma/page.tsx`: 336 líneas (considerar refactor)

### 5.2 Buenas Prácticas Observadas ✅

- ✅ Componentes bien organizados por feature
- ✅ Uso consistente de shadcn/ui
- ✅ TypeScript en toda la aplicación
- ✅ Hooks personalizados (`use-toast`, `useAuth`)
- ✅ Context API para estado del wizard
- ✅ Nomenclatura clara y descriptiva

---

## 6. Flujo de Datos {#flujo}

### 6.1 Pipeline Principal

```
┌──────────────────┐
│  Wizard (7 pasos)│
│                  │
│ 1. Propuesta     │──┐
│ 2. PICO/Matrix   │  │
│ 3. Títulos       │  │ AI Integration ✅
│ 4. Criterios     │  │ (6/7 endpoints)
│ 5. Protocolo     │  │
│ 6. Búsqueda      │  │
│ 7. PRISMA Check  │──┘
└────────┬─────────┘
         │
         │ apiClient.createProject()
         │ apiClient.updateProtocol()
         ▼
┌──────────────────┐
│    Protocolo     │
│   (PostgreSQL)   │
│                  │
│ - PICO framework │
│ - Criterios      │
│ - Search plan    │
│ - Key terms      │
└────────┬─────────┘
         │
         │ generateItemContent()
         ▼
┌──────────────────┐
│  PRISMA Checklist│──► Auto-generación contenido ✅
│   (27 items)     │
└──────────────────┘
         │
         │ Manual: Import references
         ▼
┌──────────────────┐
│   Referencias    │
│   (RIS/CSV/BIB)  │
└────────┬─────────┘
         │
         │ AI Screening
         ▼
┌──────────────────┐
│ Screening Híbrido│
│                  │
│ Fase 1: Embeddings (pgvector)   ✅
│ Fase 2: ChatGPT (zona gris)     ✅
│ Fase 3: Manual (individual)     ✅
│ Fase 4: Dual Review             ❌ FALTA
│ Fase 5: Conflicts               ❌ FALTA
└────────┬─────────┘
         │
         │ ⚠️ AQUÍ SE ROMPE EL FLUJO
         │
         ▼
┌──────────────────┐
│  Artículo IA     │──► ❌ MOCK - NO CONECTADO
│                  │
│ - Editor         │──► ✅ Funciona
│ - Versiones      │──► ❌ Mock
│ - Export         │──► ❌ No implementado
└──────────────────┘
```

### 6.2 Puntos de Ruptura Críticos

1. **Screening → Artículo**: No hay conexión entre referencias incluidas y generación de artículo
2. **Protocolo → Artículo**: Artículo no usa datos del protocolo
3. **PRISMA → Artículo**: Checklist no informa secciones del artículo

### 6.3 Integraciones Faltantes

```typescript
// REQUERIDO: Endpoint para generación de artículo
interface GenerateArticleRequest {
  projectId: string
  section: 'abstract' | 'introduction' | 'methods' | 'results' | 'discussion' | 'conclusions' | 'full'
  protocolData: Protocol           // ✅ Disponible
  includedReferences: Reference[]  // ✅ Disponible  
  prismaChecklist: PrismaItem[]    // ✅ Disponible
  qualityAssessment?: any          // ❌ No existe
  extractedData?: any              // ❌ No existe
}

// REQUERIDO: Sistema de versiones real
interface ArticleVersion {
  id: string
  projectId: string
  version: number
  title: string
  content: ArticleContent
  createdAt: Date
  createdBy: string
  changeDescription: string
  // Persistir en DB, no en memoria
}
```

---

## 7. Hallazgos Críticos {#hallazgos}

### 🚨 Bloquean PRISMA Compliance

| # | Hallazgo | Impacto | Prioridad |
|---|----------|---------|-----------|
| 1 | **No hay revisión dual independiente** | PRISMA Item 8 - 0% | 🔴 Crítico |
| 2 | **No hay resolución de conflictos** | PRISMA Item 8 - 0% | 🔴 Crítico |
| 3 | **No hay evaluación de calidad** | PRISMA Items 9-11 - 0% | 🔴 Crítico |
| 4 | **No hay extracción de datos** | PRISMA Items 13-14 - 0% | 🔴 Crítico |
| 5 | **No hay síntesis de resultados** | PRISMA Items 20-21 - 0% | 🔴 Crítico |
| 6 | **Generador artículo IA no funciona** | PRISMA Item 2 - 0% | 🔴 Crítico |

### ⚠️ Afectan Funcionalidad

| # | Hallazgo | Impacto | Prioridad |
|---|----------|---------|-----------|
| 7 | **Versiones de artículo son mock** | No se guardan cambios | 🟡 Alto |
| 8 | **Archivos duplicados en wizard** | Confusión, posible código muerto | 🟡 Alto |
| 9 | **Dos wizards separados** | Duplicación lógica | 🟡 Medio |
| 10 | **Falta exportar artículo** | No se puede generar documento final | 🟡 Medio |
| 11 | **Console.logs en producción** | Expone información sensible | 🟢 Bajo |

### ✅ Funcionando Correctamente

- ✅ Wizard de proyecto con IA (6 endpoints)
- ✅ Importación de referencias (RIS, CSV, BibTeX)
- ✅ Screening híbrido (Embeddings + ChatGPT)
- ✅ Revisión manual individual
- ✅ Detección de duplicados
- ✅ Revisión de texto completo
- ✅ Checklist PRISMA con auto-generación
- ✅ Diagrama flujo PRISMA con datos reales
- ✅ Dashboard con estadísticas en tiempo real

---

## 8. Recomendaciones {#recomendaciones}

### Opción A: Priorizar PRISMA Compliance (8-12 semanas)

**Fases**:
1. **Semana 1-2**: Implementar dual review + conflicts (ver `IMPLEMENTATION-PLAN-PHASE-1.md`)
2. **Semana 3-4**: Evaluación de calidad (CASP/JBI)
3. **Semana 5-6**: Extracción de datos estructurada
4. **Semana 7-8**: Síntesis de resultados (meta-análisis)
5. **Semana 9-10**: Conectar generador IA de artículos
6. **Semana 11-12**: Testing y refinamiento

**Resultado**: PRISMA Compliance ≈ 95%

### Opción B: Priorizar Experiencia de Usuario (4-6 semanas)

**Fases**:
1. **Semana 1**: Conectar generador IA de artículos (backend + frontend)
2. **Semana 2**: Implementar sistema de versiones real
3. **Semana 3**: Implementar exportación de artículos (PDF/DOCX)
4. **Semana 4**: Limpiar archivos duplicados en wizard
5. **Semana 5**: Refactorizar código, eliminar mocks
6. **Semana 6**: Testing y pulido UI/UX

**Resultado**: Sistema funcional end-to-end, PRISMA Compliance ≈ 50%

### Opción C: Enfoque Balanceado (6-8 semanas)

**Fase 1 (2 semanas)**: Quick Wins
- Conectar generador IA de artículos
- Implementar versiones reales
- Limpiar duplicados del wizard

**Fase 2 (2 semanas)**: PRISMA Crítico
- Dual review + resolución conflictos
- Cohen's Kappa

**Fase 3 (2 semanas)**: Calidad
- Evaluación CASP básica
- Extracción datos simplificada

**Fase 4 (2 semanas)**: Refinamiento
- Exportación artículos
- Testing integral

**Resultado**: Sistema funcional con PRISMA ≈ 75%

### Opción D: Solo Documentar (1 semana)

**Actividades**:
- Crear prototipos de interfaces faltantes
- Documentar especificaciones técnicas
- Estimar esfuerzo detallado
- Priorizar por ROI

**Resultado**: Roadmap claro para futuro desarrollo

---

## 📊 Resumen Ejecutivo

### Estado Actual

| Categoría | Completitud | Notas |
|-----------|-------------|-------|
| **Wizard + Protocolo** | 95% | Funcional, con IA integrada |
| **Screening (Fase 1-3)** | 100% | Embeddings + ChatGPT + Manual |
| **Screening (Fase 4-5)** | 0% | Dual review + conflictos ausentes |
| **PRISMA Tracking** | 100% | Checklist + diagrama completos |
| **Generación Artículo** | 10% | Mock, sin backend |
| **Evaluación Calidad** | 0% | No implementado |
| **Extracción Datos** | 0% | No implementado |
| **Síntesis Resultados** | 0% | No implementado |

### Prioridades Recomendadas

1. 🔴 **URGENTE**: Conectar generador IA de artículos (bloqueante para usuarios)
2. 🔴 **CRÍTICO**: Implementar dual review (PRISMA compliance)
3. 🟡 **IMPORTANTE**: Limpiar duplicados del wizard (deuda técnica)
4. 🟡 **IMPORTANTE**: Implementar versiones reales (pérdida de datos)
5. 🟢 **DESEABLE**: Evaluación de calidad CASP (PRISMA)
6. 🟢 **DESEABLE**: Extracción de datos (PRISMA)

### Tiempo Estimado por Opción

- **Opción A** (PRISMA Total): 8-12 semanas (320-480 horas)
- **Opción B** (UX Focus): 4-6 semanas (160-240 horas)
- **Opción C** (Balanceado): 6-8 semanas (240-320 horas)
- **Opción D** (Solo docs): 1 semana (40 horas)

---

**Última actualización**: Diciembre 2024  
**Próxima revisión**: Después de decisión de usuario sobre Opción A/B/C/D
