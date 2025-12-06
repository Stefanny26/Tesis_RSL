# Análisis: Cribado Automático con IA - Estado Actual

## 🔍 Problema Identificado

El botón **"Ejecutar Cribado con Embeddings"** en la fase de screening está generando error:

```
TypeError: this.referenceRepository.getPendingReferences is not a function
```

## 📍 Ubicación del Componente

### Frontend
- **Componente**: `AIScreeningPanel` 
- **Ruta**: `frontend/components/screening/ai-screening-panel.tsx`
- **Tab**: "Cribado Manual" en página de screening
- **Sidebar derecha**: Panel colapsable de IA

### Flujo del Botón

```
Usuario hace clic en "Ejecutar Cribado con Embeddings"
    ↓
AIScreeningPanel.handleRunScreening()
    ↓
screening/page.tsx → handleRunScreening()
    ↓
POST /api/ai/run-project-screening-embeddings
    ↓
ai.controller.js → runProjectScreeningEmbeddings()
    ↓
RunProjectScreeningUseCase.executeEmbeddings()
    ↓
❌ ERROR: getPendingReferences no existe
```

## 🎯 Funcionalidad del Cribado Automático

### Paso Actual: SCREENING (Paso 2-3)

El cribado automático con embeddings es parte de **PASOS 2-3** de la metodología:

**Paso 2**: Eliminación de duplicados ✅ (YA IMPLEMENTADO)
**Paso 3**: Revisión de título y abstract con IA

### ¿Qué hace el cribado con embeddings?

1. **Obtiene referencias pendientes** del proyecto
2. **Obtiene protocolo PICO** (población, intervención, comparación, outcome)
3. **Genera embeddings semánticos**:
   - Vectores de 384 dimensiones con modelo `all-MiniLM-L6-v2`
   - Para cada referencia (título + abstract)
   - Para el protocolo PICO completo
4. **Calcula similitud de coseno** entre referencia y protocolo
5. **Clasifica automáticamente**:
   - Si similitud ≥ umbral (15%) → `included`
   - Si similitud < umbral → `excluded`
6. **Guarda score** en campo `screening_score`

### Ventajas del Método Embeddings

✅ **Sin costo**: No usa APIs de pago (Gemini/ChatGPT)
✅ **Rápido**: ~3 minutos por 1000 referencias
✅ **Consistente**: Mismos resultados cada vez
✅ **Escalable**: Funciona con miles de referencias
✅ **Sin cuotas**: No depende de límites de API

### Ajuste Importante: Umbral Multilingüe

⚠️ **Protocolo en español vs artículos en inglés**:
- Umbral recomendado: **15-20%** (más permisivo)
- Mismo idioma: **70%+** (más estricto)

Esto porque los embeddings funcionan mejor con mismo idioma.

## 🔧 Problemas a Resolver

### 1. Método Faltante: `getPendingReferences`

**Ubicación**: `backend/src/infrastructure/repositories/reference.repository.js`

**Métodos existentes similares**:
```javascript
findByProjectId(projectId, filters, limit, offset) // Con paginación
findByProject(projectId, filters) // Sin paginación
```

**Necesitamos crear**:
```javascript
async getPendingReferences(projectId) {
  const query = `
    SELECT * FROM "references" 
    WHERE project_id = $1 
    AND screening_status = 'pending'
    ORDER BY created_at DESC
  `;
  const result = await database.query(query, [projectId]);
  return result.rows.map(row => new Reference(row));
}
```

### 2. Verificar Dependencias del Use Case

**Archivo**: `backend/src/domain/use-cases/run-project-screening.use-case.js`

Necesita:
- ✅ ReferenceRepository (crear método)
- ✅ ScreenReferencesWithEmbeddingsUseCase (verificar que existe)
- ✅ Protocolo del proyecto

## 📊 Relación con Notebook de Embeddings

Tu notebook `ACEDE_ECN_dic24_cribado_LLMhiwp_embeddingsv2_shared.ipynb` hace exactamente esto:

```python
# Usa modelo all-MiniLM-L6-v2
model = SentenceTransformer('all-MiniLM-L6-v2')

# Genera embeddings
object_embeddings = model.encode(object_texts)
category_embeddings = model.encode(category_texts)

# Calcula similitud coseno
similarity_matrix = util.cos_sim(object_embeddings, category_embeddings)

# Clasifica por ranking de similitud
```

**Tu sistema RSL replica este proceso pero integrado**:
- Frontend: Botón para ejecutar
- Backend: API que procesa
- Base de datos: Guarda resultados
- No manual: Todo automático

## 🎯 Plan de Acción

### Opción 1: Arreglar el Cribado Automático (Recomendado)

1. ✅ Agregar método `getPendingReferences` al repository
2. ✅ Verificar que `ScreenReferencesWithEmbeddingsUseCase` funcione
3. ✅ Probar flujo completo
4. ✅ Documentar configuración de umbral

**Ventaja**: Funcionalidad muy útil para screening masivo

### Opción 2: Documentar y Continuar con Paso 4

1. ❌ Deshabilitar botón temporalmente
2. ✅ Documentar que es feature pendiente
3. ✅ Continuar con Paso 4 (Análisis texto completo)

**Ventaja**: Avanzar más rápido en otros pasos

## 💡 Recomendación

**Arreglar primero el cribado automático** porque:

1. Es parte del **Paso 3** que acabamos de mejorar
2. Complementa perfectamente el componente `IndividualReviewEnhanced`:
   - **Automático**: Procesa todo con embeddings
   - **Manual mejorado**: Revisa uno por uno con resaltado
3. Es una **funcionalidad diferenciadora** de tu sistema
4. Solo requiere **agregar 1 método** al repository
5. Ya tienes la lógica del notebook, solo falta integrarla

## 📝 Flujo Completo del Paso 3

```
PASO 3: REVISIÓN DE TÍTULO Y ABSTRACT

┌─────────────────────────────────────────────────┐
│  1. Cribado Automático (NUEVO - por arreglar)  │
│     - Botón: "Ejecutar Cribado con Embeddings" │
│     - Procesa todas las pendientes              │
│     - Usa similitud semántica                   │
│     - Guarda score automático                   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  2. Revisión Manual (NUEVO - implementado ✅)   │
│     - Tab: "Revisión Individual"                │
│     - Resalta términos clave                    │
│     - Atajos de teclado                         │
│     - Estadísticas en tiempo real               │
│     - Razón de exclusión                        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  3. Tabla de Referencias (existente)            │
│     - Vista de todas las referencias            │
│     - Filtros por estado                        │
│     - Acciones en batch                         │
└─────────────────────────────────────────────────┘
```

## 🚀 Siguiente Acción

**¿Qué prefieres hacer?**

A) ✅ **Arreglar el cribado automático ahora** (10-15 min)
   - Agregar método getPendingReferences
   - Probar flujo completo
   - Tener Paso 3 100% funcional

B) 📋 **Documentar como pendiente y continuar**
   - Deshabilitar botón
   - Continuar con Paso 4
   - Volver después al cribado automático

**Mi recomendación: Opción A** - Es rápido y deja el Paso 3 completo antes de avanzar.
