# 🎯 SISTEMA DE CRIBADO AUTOMÁTICO DE REFERENCIAS - DOCUMENTACIÓN TÉCNICA

## 📋 TABLA DE CONTENIDOS
1. [Descripción General](#descripción-general)
2. [Flujo Completo del Sistema](#flujo-completo-del-sistema)
3. [Arquitectura Técnica](#arquitectura-técnica)
4. [Implementación Backend](#implementación-backend)
5. [Implementación Frontend](#implementación-frontend)
6. [Algoritmos de Clasificación](#algoritmos-de-clasificación)
7. [Guía de Uso](#guía-de-uso)
8. [Troubleshooting](#troubleshooting)

---

## 📖 DESCRIPCIÓN GENERAL

El sistema de cribado automático permite clasificar referencias científicas de manera automática o manual siguiendo la metodología PRISMA y los criterios PICO definidos en el protocolo.

### **Características Principales:**
- ✅ **Clasificación automática** con IA (Embeddings o LLM)
- ✅ **Revisión manual** con recomendaciones de IA
- ✅ **Importación masiva** (BibTeX, RIS, CSV)
- ✅ **Exportación** de resultados
- ✅ **Estadísticas en tiempo real**
- ✅ **Rankings por relevancia**
- ✅ **Explicaciones de decisiones**

---

## 🔄 FLUJO COMPLETO DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. USUARIO CARGA REFERENCIAS                 │
│  - Importa archivo (BibTeX, RIS, CSV)                          │
│  - Sistema parsea y almacena en DB                             │
│  - Estado inicial: "Pendiente"                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│              2. USUARIO VE TABLA DE REFERENCIAS                 │
│  - Filtros: palabra clave, año, estado                         │
│  - Búsqueda por título/autor/abstract                         │
│  - Botones: Importar, Exportar, Cribado Automático           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ├──────────────────┬─────────────────────┐
                         │                  │                     │
┌────────────────────────▼─────┐  ┌────────▼─────┐  ┌───────────▼────┐
│   3A. CRIBADO AUTOMÁTICO     │  │ 3B. REVISIÓN │  │ 3C. ACCIONES   │
│          CON IA              │  │    MANUAL    │  │   MASIVAS      │
│                              │  │              │  │                │
│ • Seleccionar método:        │  │ • Click en   │  │ • Seleccionar  │
│   - Embeddings (rápido)      │  │   referencia │  │   múltiples    │
│   - LLM (preciso)            │  │ • Ver detalles│  │ • Incluir todas│
│                              │  │ • Ver recomen│  │ • Excluir todas│
│ • Configurar umbral (0.7)    │  │   dación IA  │  │                │
│ • Ejecutar clasificación     │  │ • Cambiar    │  │                │
│                              │  │   estado     │  │                │
└────────────────┬─────────────┘  └──────┬───────┘  └───────┬────────┘
                 │                       │                   │
                 │                       │                   │
┌────────────────▼───────────────────────▼───────────────────▼────────┐
│            4. SISTEMA ACTUALIZA ESTADÍSTICAS                        │
│  - Total: 150                                                       │
│  - Pendientes: 50                                                   │
│  - Incluidas: 75                                                    │
│  - Excluidas: 25                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ ARQUITECTURA TÉCNICA

### **Stack Tecnológico:**
```
Frontend: Next.js 14 + React 19 + TypeScript + Tailwind CSS
Backend:  Node.js + Express.js
Database: PostgreSQL
IA:       Google Gemini AI + OpenAI ChatGPT + Transformers.js
```

### **Estructura de Carpetas:**

```
backend/
├── src/
│   ├── domain/
│   │   └── use-cases/
│   │       ├── run-project-screening.use-case.js          ← NUEVO
│   │       ├── screen-references-embeddings.use-case.js    (EXISTENTE)
│   │       └── screen-references-with-ai.use-case.js      (EXISTENTE)
│   ├── api/
│   │   ├── controllers/
│   │   │   └── ai.controller.js                            (ACTUALIZADO)
│   │   └── routes/
│   │       └── ai.routes.js                                (ACTUALIZADO)
│   └── infrastructure/
│       └── repositories/
│           ├── protocol.repository.js
│           └── reference.repository.js

frontend/
├── app/
│   └── projects/
│       └── [id]/
│           └── screening/
│               └── page.tsx                                 (FUNCIONAL)
├── components/
│   └── screening/
│       ├── ai-screening-panel.tsx                          (FUNCIONAL)
│       └── reference-table.tsx                             (FUNCIONAL)
└── lib/
    └── api-client.ts                                       (ACTUALIZADO)
```

---

## 🔧 IMPLEMENTACIÓN BACKEND

### **1. Use Case Principal: `run-project-screening.use-case.js`**

Este caso de uso orquesta todo el proceso de cribado automático:

```javascript
class RunProjectScreeningUseCase {
  async executeEmbeddings({ projectId, threshold }) {
    // 1. Obtener protocolo del proyecto
    const protocol = await this.protocolRepository.findByProjectId(projectId);
    
    // 2. Obtener referencias pendientes
    const references = await this.referenceRepository.findByProject(
      projectId, 
      { screeningStatus: 'pending' }
    );
    
    // 3. Ejecutar screening con embeddings
    const results = await this.screeningUseCase.execute({
      references,
      protocol,
      threshold
    });
    
    // 4. Actualizar referencias en DB
    await Promise.all(results.map(result => 
      this.referenceRepository.update(result.referenceId, {
        screeningStatus: result.decision,
        aiClassification: result.decision,
        aiConfidenceScore: result.similarity,
        aiReasoning: result.reasoning
      })
    ));
    
    // 5. Retornar resultados + estadísticas
    return { success: true, results, summary };
  }
}
```

**Flujo interno:**
1. ✅ Valida que existe protocolo PICO
2. ✅ Obtiene solo referencias con `status='pending'`
3. ✅ Genera embeddings del protocolo y referencias
4. ✅ Calcula similitud coseno
5. ✅ Clasifica según umbral (threshold)
6. ✅ Actualiza DB con resultados
7. ✅ Retorna estadísticas actualizadas

### **2. Controladores: `ai.controller.js`**

Dos nuevos endpoints agregados:

#### **POST `/api/ai/run-project-screening-embeddings`**
```javascript
Body: {
  "projectId": "uuid-del-proyecto",
  "threshold": 0.7  // opcional, default 0.7
}

Response: {
  "success": true,
  "message": "Se clasificaron 50 referencias exitosamente",
  "results": [
    {
      "referenceId": "ref-123",
      "decision": "included",
      "similarity": 0.85,
      "reasoning": "Alta similitud con criterios PICO..."
    }
  ],
  "summary": {
    "total": 100,
    "included": 65,
    "excluded": 25,
    "pending": 10
  }
}
```

#### **POST `/api/ai/run-project-screening-llm`**
```javascript
Body: {
  "projectId": "uuid-del-proyecto",
  "llmProvider": "gemini"  // opcional: "gemini" o "chatgpt"
}

Response: {
  "success": true,
  "message": "Se clasificaron 50 referencias con gemini",
  "results": [
    {
      "referenceId": "ref-123",
      "decision": "included",
      "confidence": 0.92,
      "reasoning": "El artículo aborda machine learning en healthcare..."
    }
  ],
  "summary": { ... }
}
```

### **3. Rutas: `ai.routes.js`**

Agregadas dos rutas protegidas con JWT:

```javascript
router.post(
  '/run-project-screening-embeddings',
  authMiddleware,
  runProjectScreeningEmbeddings
);

router.post(
  '/run-project-screening-llm',
  authMiddleware,
  runProjectScreeningLLM
);
```

---

## 💻 IMPLEMENTACIÓN FRONTEND

### **1. API Client: `lib/api-client.ts`**

Dos nuevos métodos agregados:

```typescript
class ApiClient {
  // Cribado con embeddings (rápido)
  async runScreeningEmbeddings(projectId: string, options: { threshold?: number }) {
    return this.request('/api/ai/run-project-screening-embeddings', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        threshold: options.threshold || 0.7
      })
    });
  }

  // Cribado con LLM (preciso)
  async runScreeningLLM(projectId: string, options: { llmProvider?: 'gemini' | 'chatgpt' }) {
    return this.request('/api/ai/run-project-screening-llm', {
      method: 'POST',
      body: JSON.stringify({
        projectId,
        llmProvider: options.llmProvider || 'gemini'
      })
    });
  }
}
```

### **2. Página de Screening: `app/projects/[id]/screening/page.tsx`**

Ya implementado el handler:

```typescript
const handleRunScreening = async (
  threshold: number, 
  method: 'embeddings' | 'llm', 
  llmProvider?: 'gemini' | 'chatgpt'
) => {
  // 1. Validar referencias pendientes
  const pending = references.filter(r => r.status === 'pending');
  if (pending.length === 0) {
    toast({ title: "Sin referencias pendientes" });
    return;
  }

  // 2. Llamar al método correspondiente
  if (method === 'embeddings') {
    const result = await apiClient.runScreeningEmbeddings(params.id, { threshold });
    // Actualizar tabla con resultados
    setReferences(prev => prev.map(ref => 
      updatedRefs.find(u => u.id === ref.id) || ref
    ));
  } else {
    const result = await apiClient.runScreeningLLM(params.id, { llmProvider });
    // Actualizar tabla con resultados
  }

  // 3. Mostrar notificación con estadísticas
  toast({ 
    title: "Cribado completado", 
    description: `${toInclude} incluidas, ${toExclude} excluidas` 
  });
}
```

### **3. Panel de IA: `components/screening/ai-screening-panel.tsx`**

Ya existe y funciona con los nuevos endpoints:

```tsx
<AIScreeningPanel 
  onRunScreening={handleRunScreening}  // ← Ya conectado
  totalReferences={stats.total}
  pendingReferences={stats.pending}
/>
```

**UI del Panel:**
```
┌─────────────────────────────────────────────┐
│  🤖 Cribado Automático con IA               │
├─────────────────────────────────────────────┤
│                                             │
│  📊 Método de Clasificación:                │
│   ○ Embeddings (Rápido)                     │
│   ● LLM (Preciso)                           │
│                                             │
│  🎯 Proveedor LLM:                          │
│   [ ] Gemini (Recomendado) ✓               │
│   [ ] ChatGPT GPT-4o-mini                  │
│                                             │
│  📏 Umbral de similitud: [0.7] ━━━━●━━━    │
│                                             │
│  📈 Estado actual:                          │
│   • Total: 150 referencias                  │
│   • Pendientes: 50                         │
│   • Ya clasificadas: 100                   │
│                                             │
│  [   Ejecutar Cribado Automático   ]       │
└─────────────────────────────────────────────┘
```

---

## 🧮 ALGORITMOS DE CLASIFICACIÓN

### **Método 1: Embeddings (Rápido - 3 min/1000 refs)**

**Basado en el notebook ACEDE-ECN**

```python
# 1. Generar embeddings del protocolo PICO
protocol_text = f"""
  Pregunta: {researchQuestion}
  Población: {population}
  Intervención: {intervention}
  Comparación: {comparison}
  Resultados: {outcomes}
  Criterios inclusión: {inclusionCriteria}
  Criterios exclusión: {exclusionCriteria}
"""
protocol_embedding = model.encode(protocol_text)

# 2. Generar embeddings de cada referencia
for ref in references:
  ref_text = f"{ref.title} {ref.abstract}"
  ref_embedding = model.encode(ref_text)
  
  # 3. Calcular similitud coseno
  similarity = cosine_similarity(protocol_embedding, ref_embedding)
  
  # 4. Clasificar según umbral
  if similarity >= threshold:
    decision = "included"
  else:
    decision = "excluded"
```

**Ventajas:**
- ✅ Muy rápido (3 min para 1000 referencias)
- ✅ No requiere API keys de pago
- ✅ Consistente y reproducible
- ✅ Funciona offline con Transformers.js

**Desventajas:**
- ⚠️ Menos preciso que LLM
- ⚠️ No entiende contexto complejo
- ⚠️ Requiere buen abstract

### **Método 2: LLM - Large Language Model (Preciso pero lento)**

**Usa Gemini o ChatGPT para análisis profundo**

```javascript
// Prompt enviado al LLM
const prompt = `
Eres un experto en revisión sistemática de literatura siguiendo metodología PRISMA.

**PREGUNTA DE INVESTIGACIÓN:**
${researchQuestion}

**CRITERIOS DE INCLUSIÓN:**
${inclusionCriteria.join('\n')}

**CRITERIOS DE EXCLUSIÓN:**
${exclusionCriteria.join('\n')}

**REFERENCIA A EVALUAR:**
Título: ${reference.title}
Abstract: ${reference.abstract}
Autores: ${reference.authors}
Año: ${reference.year}

**TAREA:**
Analiza si esta referencia debe ser INCLUIDA o EXCLUIDA según los criterios PICO.

Responde en formato JSON:
{
  "decision": "included" | "excluded",
  "confidence": 0.0 - 1.0,
  "reasoning": "Explicación detallada de 2-3 líneas",
  "picoMatch": {
    "population": true/false,
    "intervention": true/false,
    "comparison": true/false,
    "outcomes": true/false
  }
}
`;

const response = await gemini.generateContent(prompt);
```

**Ventajas:**
- ✅ Muy preciso y contextual
- ✅ Entiende matices del lenguaje
- ✅ Explica decisiones claramente
- ✅ Identifica componentes PICO

**Desventajas:**
- ⚠️ Lento (5-10 seg por referencia)
- ⚠️ Requiere API key de pago
- ⚠️ Puede tener alucinaciones
- ⚠️ Costo por request

### **Comparación de Métodos:**

| Característica | Embeddings | LLM Gemini | LLM ChatGPT |
|----------------|------------|------------|-------------|
| **Velocidad** | ⚡⚡⚡ Muy rápido | 🐌 Lento | 🐌🐌 Muy lento |
| **Precisión** | 📊 75-85% | 🎯 90-95% | 🎯 92-97% |
| **Costo** | 💰 Gratis | 💰💰 $0.001/req | 💰💰💰 $0.005/req |
| **Explicación** | ❌ No | ✅ Sí | ✅ Sí |
| **Offline** | ✅ Sí | ❌ No | ❌ No |
| **Recomendado para** | Primera pasada | Revisión final | Casos complejos |

---

## 📖 GUÍA DE USO

### **Paso 1: Crear Proyecto y Protocolo**

```
1. Login → Dashboard → "Nuevo Proyecto"
2. Llenar asistente:
   - Pregunta de investigación
   - Generar PICO (con IA)
   - Definir criterios inclusión/exclusión
   - Matriz Es/No Es
3. Guardar protocolo
```

### **Paso 2: Importar Referencias**

```
Opción A: Subir archivo
  - Click "Importar Referencias"
  - Seleccionar archivo (.bib, .ris, .csv)
  - Sistema parsea automáticamente
  - Referencias aparecen con estado "Pendiente"

Opción B: Búsqueda académica (futuro)
  - Ir a fase "Búsqueda"
  - Ejecutar query en Scopus/IEEE
  - Importar resultados directamente
```

### **Paso 3: Ejecutar Cribado Automático**

```
1. Ir a "Cribado de Referencias"
2. Ver estadísticas:
   - Total: 150
   - Pendientes: 150
   - Incluidas: 0
   - Excluidas: 0

3. Abrir panel "Cribado Automático con IA"

4. Elegir método:
   OPCIÓN A: Embeddings (Primera Pasada Rápida)
     - Seleccionar "Embeddings"
     - Ajustar umbral: 0.7 (default)
     - Click "Ejecutar Cribado"
     - Esperar 2-3 minutos
     - Ver resultados actualizados

   OPCIÓN B: LLM (Revisión Precisa)
     - Seleccionar "LLM"
     - Elegir "Gemini" o "ChatGPT"
     - Click "Ejecutar Cribado"
     - Esperar 10-15 minutos (150 refs)
     - Ver resultados con explicaciones

5. Revisar estadísticas actualizadas:
   - Total: 150
   - Pendientes: 0
   - Incluidas: 95
   - Excluidas: 55
```

### **Paso 4: Revisión Manual**

```
1. Filtrar tabla por "Incluidas" o "Excluidas"

2. Click en una referencia:
   - Ver detalles completos
   - Ver recomendación de IA
   - Ver explicación de la decisión
   - Ver puntaje de similitud

3. Cambiar estado si necesario:
   - "Incluir" → Verde
   - "Excluir" → Rojo
   - "Pendiente" → Gris

4. Agregar notas de revisión manual
```

### **Paso 5: Acciones Masivas**

```
1. Seleccionar múltiples referencias (checkbox)
2. Usar barra de acciones:
   - "Incluir Todas"
   - "Excluir Todas"
   - "Limpiar Selección"
```

### **Paso 6: Exportar Resultados**

```
1. Click "Exportar"
2. Elegir formato:
   - BibTeX (.bib)
   - RIS (.ris)
   - CSV (.csv)
3. Descargar archivo con referencias clasificadas
```

---

## 🔧 TROUBLESHOOTING

### **Problema 1: "No hay referencias pendientes"**

**Causa:** Ya clasificaste todas las referencias.

**Solución:**
```sql
-- Resetear estados en DB (si necesario)
UPDATE references 
SET screening_status = 'pending',
    ai_classification = NULL,
    ai_confidence_score = NULL
WHERE project_id = 'tu-project-id';
```

### **Problema 2: "Error al cargar modelo de embeddings"**

**Causa:** Transformers.js no pudo descargar el modelo.

**Solución:**
```bash
# Backend
cd backend
npm install @xenova/transformers

# Verificar que existe el archivo
ls node_modules/@xenova/transformers
```

### **Problema 3: "Gemini API key no configurada"**

**Causa:** Falta la variable de entorno.

**Solución:**
```bash
# backend/.env
GEMINI_API_KEY=AIzaSyA...tu-key-aqui
```

### **Problema 4: Cribado muy lento**

**Causa:** Estás usando LLM con muchas referencias.

**Solución:**
- Usa Embeddings primero (3 min vs 15 min)
- Luego revisa manualmente las "borderline"
- O filtra por año antes de cribar

### **Problema 5: Resultados inconsistentes**

**Causa:** Protocolo PICO mal definido.

**Solución:**
- Verifica que el protocolo tenga:
  ✅ Pregunta de investigación clara
  ✅ Criterios inclusión específicos
  ✅ Criterios exclusión explícitos
  ✅ Abstract de referencias completo

---

## 📊 ESTADÍSTICAS Y MÉTRICAS

El sistema rastrea automáticamente:

```typescript
interface ScreeningStats {
  total: number           // Total de referencias
  pending: number         // Aún sin clasificar
  included: number        // Aprobadas
  excluded: number        // Rechazadas
  manualReviewed: number  // Revisadas manualmente
  aiClassified: number    // Clasificadas por IA
}
```

**Gráficas disponibles (futuro):**
- 📈 Progreso de cribado (timeline)
- 🥧 Distribución inclusión/exclusión
- 📊 Ranking de relevancia
- 🎯 Coincidencia con criterios PICO

---

## 🚀 PRÓXIMAS MEJORAS

### **Corto Plazo:**
1. ✅ Filtros avanzados (año, revista, autores)
2. ✅ Búsqueda full-text en abstract
3. ✅ Paginación de tabla
4. ✅ Ordenamiento por columnas

### **Mediano Plazo:**
1. 🔄 Cribado por duplicados automático
2. 🔄 Inter-rater reliability (Cohen's Kappa)
3. 🔄 Exportar reporte PRISMA
4. 🔄 Gráficas y visualizaciones

### **Largo Plazo:**
1. 🔮 Machine Learning propio (entrenar modelo)
2. 🔮 Integración con Rayyan/Covidence
3. 🔮 Colaboración en tiempo real
4. 🔮 Screening por equipos

---

## 📚 REFERENCIAS

- **Notebook original:** `ACEDE_ECN_dic24_cribado_LLMhiwp_embeddingsv2_shared.ipynb`
- **PRISMA Guidelines:** http://www.prisma-statement.org/
- **Transformers.js:** https://huggingface.co/docs/transformers.js
- **Sentence Transformers:** https://www.sbert.net/
- **Google Gemini API:** https://ai.google.dev/docs
- **OpenAI API:** https://platform.openai.com/docs

---

**Autor:** Sistema RSL Manager  
**Fecha:** Noviembre 13, 2025  
**Versión:** 1.0
