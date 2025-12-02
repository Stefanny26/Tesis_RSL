# Sistema de Cribado con Embeddings - Thesis RSL

## 📊 Descripción

Este sistema implementa cribado automático de referencias bibliográficas utilizando **embeddings semánticos** y **similitud de coseno**, basado en la metodología descrita en el notebook ACEDE-ECN.

## 🎯 Características

### Dos Métodos de Cribado

1. **Embeddings Semánticos** (Recomendado)
   - Modelo: `all-MiniLM-L6-v2` (384 tokens)
   - Velocidad: ~3 minutos por 1000 referencias
   - Sin costo de API
   - Resultados consistentes y reproducibles

2. **Análisis con LLM** (Gemini)
   - Análisis contextual profundo
   - Genera explicaciones detalladas
   - Mayor precisión en casos ambiguos
   - Consume cuota de API

## 🔬 Cómo Funciona (Embeddings)

### 1. Generación de Embeddings

El sistema convierte texto en vectores numéricos de 384 dimensiones:

```javascript
// Texto del protocolo PICO
const categoryText = `
  Pregunta: ${researchQuestion}
  Población: ${population}
  Intervención: ${intervention}
  Comparación: ${comparison}
  Resultado: ${outcome}
  Criterios de inclusión: ${inclusionCriteria.join('; ')}
  Criterios de exclusión: ${exclusionCriteria.join('; ')}
`

// Texto de la referencia
const referenceText = `
  ${reference.title}
  ${reference.abstract}
  Keywords: ${reference.keywords.join(', ')}
`

// Generar embeddings
const categoryEmbedding = await model.encode(categoryText)
const referenceEmbedding = await model.encode(referenceText)
```

### 2. Cálculo de Similitud de Coseno

```javascript
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
```

### 3. Clasificación por Umbral

```javascript
const similarity = cosineSimilarity(categoryEmbedding, referenceEmbedding)
const recommendation = similarity >= threshold ? 'include' : 'exclude'
```

## 📡 Endpoints API

### 1. Cribado Individual con Embeddings

```http
POST /api/ai/screen-reference-embeddings
Content-Type: application/json
Authorization: Bearer <token>

{
  "reference": {
    "id": "ref-123",
    "title": "Machine Learning in Healthcare",
    "abstract": "This study investigates...",
    "keywords": ["ML", "healthcare", "AI"]
  },
  "protocol": {
    "researchQuestion": "How does ML improve healthcare?",
    "population": "Healthcare providers",
    "intervention": "Machine Learning systems",
    "comparison": "Traditional methods",
    "outcome": "Patient outcomes",
    "inclusionCriteria": ["Published 2015-2024", "Peer-reviewed"],
    "exclusionCriteria": ["Non-English", "Opinion pieces"]
  },
  "threshold": 0.7
}
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "referenceId": "ref-123",
    "similarity": 0.8456,
    "threshold": 0.7,
    "recommendation": "include",
    "confidence": 0.485,
    "reasoning": "La similitud semántica es de 84.6%, superando el umbral del 70%..."
  }
}
```

### 2. Cribado en Lote con Embeddings

```http
POST /api/ai/screen-references-batch-embeddings
Content-Type: application/json
Authorization: Bearer <token>

{
  "references": [/* array de referencias */],
  "protocol": {/* protocolo PICO */},
  "threshold": 0.7
}
```

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "success": true,
      "referenceId": "ref-1",
      "similarity": 0.8456,
      "recommendation": "include",
      "reasoning": "..."
    },
    // ...más resultados
  ],
  "summary": {
    "total": 150,
    "successful": 150,
    "failed": 0,
    "toInclude": 45,
    "toExclude": 105,
    "avgSimilarity": 0.6234,
    "percentageToInclude": "30.0"
  }
}
```

### 3. Ranking de Referencias

```http
POST /api/ai/ranking-embeddings
Content-Type: application/json
Authorization: Bearer <token>

{
  "references": [/* array de referencias */],
  "protocol": {/* protocolo PICO */},
  "models": ["Xenova/all-MiniLM-L6-v2"] // opcional
}
```

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "referenceId": "ref-42",
      "referenceTitle": "Deep Learning for Medical Diagnosis",
      "avgSimilarity": 0.9123,
      "rankings": [
        {
          "model": "Xenova/all-MiniLM-L6-v2",
          "similarity": 0.9123
        }
      ]
    },
    // ...más referencias ordenadas por similitud
  ],
  "modelsUsed": ["Xenova/all-MiniLM-L6-v2"]
}
```

## 🎨 Componentes Frontend

### 1. AIScreeningPanel

Panel con dos pestañas para seleccionar método:

```tsx
<AIScreeningPanel
  totalReferences={150}
  pendingReferences={100}
  onRunScreening={(threshold, method) => {
    // 'embeddings' o 'llm'
  }}
/>
```

### 2. RankingView

Vista de ranking con referencias ordenadas por similitud:

```tsx
<RankingView
  rankings={rankingData}
  threshold={0.7}
  onAccept={(refId) => handleInclude(refId)}
  onReject={(refId) => handleExclude(refId)}
/>
```

## 🔧 Configuración

### Variables de Entorno

```env
# Backend (.env)
OPENAI_API_KEY=sk-proj-...  # Para método LLM (opcional)
GEMINI_API_KEY=...           # Para método LLM (opcional)
```

### Instalación de Dependencias

```bash
# Backend
cd backend
npm install

# El paquete @xenova/transformers se instala automáticamente
```

## 📈 Métricas de Rendimiento

| Método | Velocidad | Costo | Reproducibilidad | Explicación |
|--------|-----------|-------|------------------|-------------|
| **Embeddings** | 3 min/1000 refs | Gratis | 100% | No |
| **LLM (Gemini)** | 10-15 min/1000 refs | $0.01/1000 refs | ~95% | Sí |

## 🎯 Umbrales Recomendados

| Umbral | Uso Recomendado | Precisión | Recall |
|--------|-----------------|-----------|--------|
| **0.8-0.95** | Primera criba (conservador) | Alta | Baja |
| **0.7-0.8** | Balance óptimo (recomendado) | Media | Media |
| **0.5-0.7** | Segunda criba (liberal) | Baja | Alta |

## 🔍 Ejemplo de Uso Completo

### Paso 1: Definir Protocolo PICO

```javascript
const protocol = {
  researchQuestion: "¿Cómo afecta el machine learning a los diagnósticos médicos?",
  selectedTitle: "Machine Learning en Diagnóstico Médico: RSL",
  population: "Profesionales de la salud",
  intervention: "Sistemas de ML",
  comparison: "Métodos tradicionales",
  outcome: "Precisión diagnóstica",
  inclusionCriteria: [
    "Publicaciones 2015-2024",
    "Revisión por pares",
    "Estudios empíricos"
  ],
  exclusionCriteria: [
    "No publicados",
    "Opiniones sin datos",
    "Idioma no inglés"
  ]
}
```

### Paso 2: Ejecutar Cribado

```typescript
const result = await apiClient.screenReferencesBatchWithEmbeddings({
  references: myReferences,
  protocol: protocol,
  threshold: 0.7
})

console.log(`Procesadas: ${result.summary.total}`)
console.log(`A incluir: ${result.summary.toInclude}`)
console.log(`A excluir: ${result.summary.toExclude}`)
console.log(`Similitud promedio: ${(result.summary.avgSimilarity * 100).toFixed(1)}%`)
```

### Paso 3: Revisar Ranking

```typescript
const ranking = await apiClient.generateRankingWithEmbeddings({
  references: myReferences,
  protocol: protocol
})

// Top 10 referencias más relevantes
ranking.data.slice(0, 10).forEach((item, idx) => {
  console.log(`${idx + 1}. ${item.referenceTitle}`)
  console.log(`   Similitud: ${(item.avgSimilarity * 100).toFixed(1)}%`)
})
```

## 📚 Referencias

- **Modelo:** [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- **Librería:** [@xenova/transformers](https://www.npmjs.com/package/@xenova/transformers)
- **Metodología:** Basado en notebook ACEDE-ECN workshop dic-2024

## 🐛 Troubleshooting

### Error: "No se pudo inicializar el modelo de embeddings"

**Solución:** El modelo se descarga automáticamente la primera vez. Asegúrate de tener:
- Conexión a internet
- Espacio en disco (~100MB para el modelo)
- Permisos de escritura en el directorio cache

### Error: "Los vectores deben tener la misma dimensión"

**Solución:** Esto indica que se intentaron comparar embeddings de diferentes modelos. Asegúrate de usar el mismo modelo para generar todos los embeddings.

### Rendimiento lento

**Solución:**
- El modelo se descarga solo la primera vez
- Procesamiento en batch es más eficiente
- Para miles de referencias, considera ejecutar por lotes de 500-1000

## 🎓 Créditos

Implementado por: Stefanny Hernández  
Basado en: Metodología ACEDE-ECN workshop dic-2024  
Modelo: Sentence Transformers (Hugging Face)  
Framework: Next.js + Express + PostgreSQL
