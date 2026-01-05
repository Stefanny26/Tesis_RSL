# 🔬 Sistema PRISMA + Artículo Científico - Implementación Completa

## 📋 Resumen de Implementación

Se ha implementado un sistema robusto y metodológicamente correcto para completar PRISMA 2020 y generar artículos científicos, siguiendo las especificaciones académicas A→B→C.

---

## 🏗️ Arquitectura Implementada

### 1️⃣ PRISMA Context Object
**Archivo:** `generate-prisma-context.use-case.js`

Objeto unificado que consolida:
- Protocolo PICO completo
- Conteos del diagrama PRISMA
- Método de cribado (embeddings + IA + manual)
- Datos extraídos de PDFs
- Métricas de screening

**Propósito:** Fuente única de verdad para generación de contenido.

---

### 2️⃣ Completitud PRISMA por Bloques
**Archivo:** `complete-prisma-by-blocks.use-case.js`

Genera los 14 ítems PRISMA pendientes mediante prompts académicos estructurados:

**Bloques:**
1. **MÉTODOS** (Ítems 11-12)
   - Evaluación de riesgo de sesgo
   - Medidas de efecto

2. **RESULTADOS** (Ítems 16-20)
   - Selección de estudios
   - Características
   - Riesgo de sesgo
   - Resultados individuales
   - Síntesis

3. **DISCUSIÓN** (Ítem 23)
   - Interpretación
   - Limitaciones
   - Implicaciones

4. **OTRA INFORMACIÓN** (Ítems 24-27)
   - Registro
   - Financiamiento
   - Conflictos
   - Disponibilidad

**Reglas estrictas:**
- ❌ No inventa datos
- ❌ No hace inferencias
- ✅ Solo describe lo existente
- ✅ Lenguaje académico formal
- ✅ Pasado metodológico

---

### 3️⃣ Generación de Artículo Científico
**Archivo:** `generate-article-from-prisma.use-case.js`

Transforma PRISMA cerrado en artículo IMRaD:

**Estructura:**
- **Título:** PRISMA ítem 1
- **Resumen:** PRISMA ítem 2
- **Introducción:** PRISMA ítems 3-4 (reexpresados)
- **Métodos:** PRISMA ítems 5-15
- **Resultados:** PRISMA ítems 16-22
- **Discusión:** PRISMA ítem 23
- **Conclusiones:** Derivadas de discusión
- **Referencias:** Estudios incluidos

**Validaciones:**
- ✅ PRISMA debe estar 27/27 completo
- ✅ No introduce datos nuevos
- ✅ Coherencia total con PRISMA

---

## 📡 Endpoints Implementados

### PRISMA

#### `POST /api/projects/:projectId/prisma/complete-by-blocks`
Completar ítems PRISMA por bloques académicos.

**Body:**
```json
{
  "block": "all" | "methods" | "results" | "discussion" | "other"
}
```

**Respuesta:**
```json
{
  "success": true,
  "blocksProcessed": ["methods", "results", "discussion", "other"],
  "results": {
    "methods": { "itemsGenerated": 2, "items": [...] },
    "results": { "itemsGenerated": 5, "items": [...] },
    "discussion": { "itemsGenerated": 1, "items": [...] },
    "other": { "itemsGenerated": 4, "items": [...] }
  },
  "stats": {
    "completed": 27,
    "total": 27,
    "completionPercentage": 100
  }
}
```

#### `GET /api/projects/:projectId/prisma/status`
Verificar si PRISMA está completo.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "completed": 27,
    "total": 27,
    "isPrismaComplete": true,
    "canGenerateArticle": true,
    "completionPercentage": 100,
    "message": "PRISMA completo. Puede generar el artículo científico."
  }
}
```

---

### ARTÍCULO

#### `GET /api/projects/:projectId/article/status`
Verificar si el artículo puede ser generado.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "canGenerate": true,
    "prismaCompleted": 27,
    "prismaTotal": 27,
    "message": "PRISMA completo. El artículo puede ser generado.",
    "blockingReason": null
  }
}
```

**Si PRISMA incompleto:**
```json
{
  "success": true,
  "data": {
    "canGenerate": false,
    "prismaCompleted": 20,
    "prismaTotal": 27,
    "message": "Debe completar PRISMA primero: 20/27 ítems completados.",
    "blockingReason": "PRISMA_INCOMPLETE"
  }
}
```

#### `POST /api/projects/:projectId/article/generate`
Generar artículo científico completo desde PRISMA cerrado.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "title": "...",
    "abstract": "...",
    "introduction": "...",
    "methods": "...",
    "results": "...",
    "discussion": "...",
    "conclusions": "...",
    "references": "...",
    "metadata": {
      "generatedAt": "2026-01-05T...",
      "wordCount": 4500,
      "version": 1,
      "prismaCompliant": true
    }
  },
  "message": "Artículo científico generado exitosamente"
}
```

#### `POST /api/projects/:projectId/article/generate-section`
Generar una sección específica del artículo.

**Body:**
```json
{
  "section": "introduction" | "methods" | "results" | "discussion" | "conclusions"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "section": "introduction",
    "content": "...",
    "wordCount": 650
  },
  "message": "Sección introduction generada exitosamente"
}
```

---

## 🔒 Flujo Secuencial (Bloqueante)

```
1. PROTOCOLO completo
   ↓
2. CRIBADO cerrado (screening.includedFinal > 0)
   ↓
3. PRISMA Context generado
   ↓
4. Completar PRISMA por bloques
   ↓
5. PRISMA 27/27 completo
   ↓ (BLOQUEO HASTA AQUÍ)
6. ARTÍCULO habilitado
```

**Reglas de bloqueo:**
- ❌ No se puede generar artículo si PRISMA < 27/27
- ❌ No se puede completar PRISMA sin protocolo
- ❌ No se pueden completar bloques fuera de orden (si se requiere)

---

## 🧪 Validaciones Implementadas

### PRISMA
1. **Context validation:**
   - Protocolo existe
   - Screening tiene datos
   - Referencias incluidas > 0

2. **Content validation:**
   - Números coherentes con diagrama PRISMA
   - Sin términos especulativos ("probablemente", "se estima")
   - Lenguaje académico formal

### Artículo
1. **Pre-generation:**
   - PRISMA 27/27 completo
   - Todos los ítems tienen contenido

2. **Post-generation:**
   - Word count calculado
   - Secciones completas
   - Coherencia con PRISMA

---

## 📊 Diferencias vs Implementación Anterior

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Prompts** | Genérico, inventaba datos | Académico, solo describe |
| **Ítems** | Generación masiva inconsistente | Por bloques con reglas estrictas |
| **Validación** | Sin validación real | Validación académica completa |
| **Artículo** | No existía | Mapeo IMRaD desde PRISMA |
| **Bloqueo** | No bloqueante | Secuencial bloqueante |
| **Context** | Datos dispersos | PRISMA Context Object unificado |

---

## 🚀 Flujo de Uso Recomendado

### Para Completar PRISMA:

```javascript
// 1. Verificar estado actual
GET /api/projects/:id/prisma/status

// 2. Completar todos los bloques
POST /api/projects/:id/prisma/complete-by-blocks
Body: { "block": "all" }

// 3. Verificar completitud
GET /api/projects/:id/prisma/status
// Response: { isPrismaComplete: true, canGenerateArticle: true }
```

### Para Generar Artículo:

```javascript
// 1. Verificar que puede generarse
GET /api/projects/:id/article/status

// 2a. Generar artículo completo
POST /api/projects/:id/article/generate

// 2b. O generar por secciones
POST /api/projects/:id/article/generate-section
Body: { "section": "introduction" }

POST /api/projects/:id/article/generate-section
Body: { "section": "methods" }

// etc...
```

---

## 🔧 Configuración de IA

**Temperatura:** 0.3-0.4 (baja para consistencia académica)
**Max tokens:** 1200-2000 según sección
**Model:** Usa el configurado en AIService (Gemini/OpenAI)

---

## 📝 Próximos Pasos (Frontend)

1. Actualizar página PRISMA para llamar a `/complete-by-blocks`
2. Mostrar progreso por bloques (4 bloques)
3. Indicador visual de bloqueo si PRISMA incompleto
4. Página de artículo que verifique `/status` antes de mostrar
5. Editor de artículo con secciones IMRaD
6. Export a PDF/Word del artículo generado

---

## 🎓 Conformidad Académica

✅ **PRISMA 2020 compliant**
✅ **No inventa datos**
✅ **Lenguaje académico formal**
✅ **Transparencia metodológica**
✅ **Trazabilidad (dataSource)**
✅ **Defensa ante jurado**

---

## 📞 Soporte

Para dudas sobre la implementación, revisar:
- `complete-prisma-by-blocks.use-case.js` - Lógica de prompts
- `generate-article-from-prisma.use-case.js` - Mapeo IMRaD
- `generate-prisma-context.use-case.js` - Construcción de contexto
