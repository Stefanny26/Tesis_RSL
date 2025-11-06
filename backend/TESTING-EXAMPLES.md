# Ejemplos de Testing - API de IA

## Variables de Entorno

```bash
export API_URL=http://localhost:3001
export JWT_TOKEN=your_jwt_token_here
```

---

## 1. Análisis Completo de Protocolo

### Request: ChatGPT

```bash
curl -X POST $API_URL/api/ai/protocol-analysis \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Object Document Mapping with Mongoose in Node.js Applications",
    "description": "Esta revisión sistemática tiene como objetivo analizar y sintetizar la literatura existente sobre el uso de Mongoose ODM en aplicaciones Node.js. Se enfocará en identificar patrones de diseño comunes, mejores prácticas de desarrollo, consideraciones de rendimiento, y casos de uso específicos. El estudio busca proporcionar una guía basada en evidencia para desarrolladores que trabajan con MongoDB y Node.js, evaluando la efectividad de Mongoose como capa de abstracción, su impacto en el rendimiento de las aplicaciones, y las estrategias de modelado de datos más efectivas.",
    "aiProvider": "chatgpt"
  }'
```

### Request: Gemini

```bash
curl -X POST $API_URL/api/ai/protocol-analysis \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Object Document Mapping with Mongoose in Node.js Applications",
    "description": "Revisión sistemática sobre patrones, prácticas y rendimiento de Mongoose ODM",
    "aiProvider": "gemini"
  }'
```

---

## 2. Generación de Título

### Request

```bash
curl -X POST $API_URL/api/ai/generate-title \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "researchQuestion": "¿Qué enfoques, patrones de diseño y consideraciones de rendimiento han sido reportados en la literatura académica y técnica sobre el uso de Mongoose ODM en aplicaciones Node.js, y cómo influyen en las prácticas de desarrollo y mantenimiento?",
    "aiProvider": "chatgpt"
  }'
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "titulo_ingles": "Object Document Mapping with Mongoose in Node.js Applications: A Systematic Literature Review on Development Practices, Performance Implications, and Design Patterns",
    "titulo_espanol": "Mapeo Objeto-Documento con Mongoose en Aplicaciones Node.js: Una Revisión Sistemática sobre Prácticas de Desarrollo, Implicaciones de Rendimiento y Patrones de Diseño",
    "titulo_corto": "Mongoose ODM in Node.js: A Systematic Review",
    "subtitulos_alternativos": [
      "Development Practices and Performance Analysis of Mongoose ODM: A Systematic Review",
      "Design Patterns and Best Practices for Mongoose in Node.js: A SLR",
      "Mongoose Object Document Mapper: A Systematic Review on Implementation and Performance"
    ],
    "justificacion": "Este título captura los tres aspectos fundamentales de la pregunta de investigación...",
    "elementos_clave": {
      "tecnologia_concepto": "Mongoose ODM",
      "contexto": "Node.js Applications",
      "aspectos_clave": ["Development Practices", "Performance Implications", "Design Patterns"]
    }
  }
}
```

---

## 3. Screening Individual de Referencia

### Request: Alta Relevancia

```bash
curl -X POST $API_URL/api/ai/screen-reference \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": {
      "title": "Performance Optimization Techniques for Mongoose ODM in Large-Scale Node.js Applications",
      "authors": "Smith, John; García, María; Chen, Wei",
      "year": 2023,
      "journal": "IEEE Transactions on Software Engineering",
      "abstract": "This paper presents a comprehensive analysis of performance optimization strategies for Mongoose ODM in production Node.js applications. We conducted empirical studies on query performance, schema design patterns, and middleware optimization. Our results show that proper indexing strategies combined with lean queries can improve performance by up to 300%. We also identify common anti-patterns that lead to performance degradation.",
      "keywords": "Mongoose, MongoDB, Node.js, Performance, Optimization, Schema Design"
    },
    "inclusionCriteria": [
      "Estudios que mencionen explícitamente Mongoose y MongoDB en el abstract",
      "Aplicaciones en entorno Node.js sobre bases NoSQL",
      "Uso de Mongoose como ODM",
      "Análisis de prácticas de desarrollo, performance o patrones de diseño",
      "Publicaciones entre 2019 y 2025",
      "Artículos en journals o conferencias académicas"
    ],
    "exclusionCriteria": [
      "Publicaciones donde Mongoose no aparece en el abstract",
      "Tecnologías fuera del stack JavaScript",
      "Artículos puramente descriptivos sin análisis técnico",
      "Tutoriales o blogs sin rigor académico",
      "Estudios anteriores a 2019",
      "Literatura gris no indexada"
    ],
    "researchQuestion": "¿Qué enfoques, patrones de diseño y consideraciones de rendimiento han sido reportados sobre el uso de Mongoose ODM en aplicaciones Node.js?",
    "aiProvider": "gemini"
  }'
```

### Expected Response: Incluida

```json
{
  "success": true,
  "data": {
    "decision": "incluida",
    "confidence": 0.95,
    "razonamiento": "Este artículo cumple perfectamente con los criterios de inclusión: menciona explícitamente Mongoose ODM y MongoDB en el título y abstract, se enfoca en Node.js, analiza rendimiento en profundidad, está publicado en 2023 (dentro del rango), y es de una fuente académica de alta calidad (IEEE Transactions). El abstract demuestra análisis técnico riguroso con estudios empíricos y métricas específicas de rendimiento.",
    "criterios_cumplidos": [
      "Menciona explícitamente Mongoose y MongoDB",
      "Contexto de Node.js claramente establecido",
      "Análisis técnico profundo de rendimiento",
      "Año 2023 dentro del rango 2019-2025",
      "Publicado en journal académico (IEEE)",
      "Incluye patrones de diseño (schema design, middleware)"
    ],
    "criterios_no_cumplidos": [],
    "aspectos_relevantes": [
      "Estudios empíricos con métricas de rendimiento concretas (300% mejora)",
      "Identificación de anti-patterns comunes",
      "Análisis de estrategias de indexación",
      "Optimización de queries y middleware",
      "Aplicaciones de producción a gran escala"
    ],
    "aspectos_preocupantes": [],
    "recomendacion_revision_manual": "no",
    "motivo_revision_manual": null
  }
}
```

### Request: Baja Relevancia

```bash
curl -X POST $API_URL/api/ai/screen-reference \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": {
      "title": "Introduction to NoSQL Databases: A Comprehensive Tutorial",
      "authors": "Johnson, Robert",
      "year": 2020,
      "abstract": "This tutorial provides a comprehensive introduction to NoSQL databases, covering MongoDB, Cassandra, and Redis. We explain the differences between SQL and NoSQL, when to use each type, and basic CRUD operations. The tutorial includes code examples for beginners learning database management.",
      "keywords": "NoSQL, MongoDB, Tutorial, Databases, CRUD"
    },
    "inclusionCriteria": [...],
    "exclusionCriteria": [...],
    "researchQuestion": "...",
    "aiProvider": "gemini"
  }'
```

### Expected Response: Excluida

```json
{
  "success": true,
  "data": {
    "decision": "excluida",
    "confidence": 0.92,
    "razonamiento": "Este artículo debe ser excluido porque no menciona Mongoose en ninguna parte del título o abstract, es un tutorial introductorio sin análisis técnico profundo, y está orientado a principiantes con operaciones CRUD básicas. No cumple con los criterios de inclusión que requieren mención explícita de Mongoose y análisis de patrones o rendimiento.",
    "criterios_cumplidos": [],
    "criterios_no_cumplidos": [
      "No menciona Mongoose en absoluto",
      "Es un tutorial sin análisis técnico riguroso",
      "Orientado a principiantes, no a prácticas avanzadas",
      "No aborda Node.js específicamente",
      "No incluye análisis de rendimiento o patrones de diseño"
    ],
    "aspectos_relevantes": [],
    "aspectos_preocupantes": [
      "Demasiado introductorio para los objetivos de la revisión",
      "Falta de enfoque en Mongoose o cualquier ODM",
      "No aporta a la pregunta de investigación"
    ],
    "recomendacion_revision_manual": "no",
    "motivo_revision_manual": null
  }
}
```

---

## 4. Screening por Lotes

### Request: 10 Referencias

```bash
curl -X POST $API_URL/api/ai/screen-references-batch \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "references": [
      {
        "title": "Scalable Data Modeling with Mongoose in Microservices Architecture",
        "authors": "Anderson, K.",
        "year": 2022,
        "abstract": "This paper explores data modeling strategies using Mongoose ODM in microservices-based applications...",
        "keywords": "Mongoose, Microservices, Data Modeling, Node.js"
      },
      {
        "title": "A Comparative Study of ORMs and ODMs for Web Development",
        "authors": "Lee, S.",
        "year": 2021,
        "abstract": "We compare different Object-Relational Mappers (ORMs) and Object-Document Mappers (ODMs) including Sequelize, TypeORM, Mongoose, and Prisma...",
        "keywords": "ORM, ODM, Mongoose, Comparison"
      },
      {
        "title": "Building RESTful APIs: A Practical Guide",
        "authors": "Brown, T.",
        "year": 2020,
        "abstract": "This practical guide teaches how to build RESTful APIs using various technologies...",
        "keywords": "REST, API, Web Development"
      }
    ],
    "inclusionCriteria": [...],
    "exclusionCriteria": [...],
    "researchQuestion": "...",
    "aiProvider": "gemini"
  }'
```

### Expected Response

```json
{
  "success": true,
  "data": [
    {
      "success": true,
      "data": {
        "decision": "incluida",
        "confidence": 0.88,
        "razonamiento": "Cumple criterios: Mongoose explícito, Node.js, análisis de modelado...",
        ...
      }
    },
    {
      "success": true,
      "data": {
        "decision": "revisar_manual",
        "confidence": 0.72,
        "razonamiento": "Menciona Mongoose pero es comparativo con otros ODMs. Puede ser útil pero requiere revisión...",
        ...
      }
    },
    {
      "success": true,
      "data": {
        "decision": "excluida",
        "confidence": 0.94,
        "razonamiento": "No menciona Mongoose. Demasiado genérico...",
        ...
      }
    }
  ],
  "summary": {
    "total": 3,
    "incluidas": 1,
    "excluidas": 1,
    "revisar_manual": 1,
    "alta_confianza": 2,
    "porcentajes": {
      "incluidas": "33.3",
      "excluidas": "33.3",
      "revisar": "33.3",
      "alta_confianza": "66.7"
    }
  }
}
```

---

## 5. Refinamiento de Cadena de Búsqueda

### Request

```bash
curl -X POST $API_URL/api/ai/refine-search-string \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentSearchString": "((\"Mongoose\" OR \"Mongoose ODM\") AND (\"MongoDB\" OR \"NoSQL\") AND (\"Node.js\" OR \"JavaScript\"))",
    "searchResults": [
      {
        "title": "Performance Optimization of Mongoose in Express Applications",
        "year": 2023,
        "source": "IEEE",
        "relevance": "alta"
      },
      {
        "title": "Getting Started with Mongoose: A Tutorial",
        "year": 2021,
        "source": "Medium",
        "relevance": "baja"
      },
      {
        "title": "Building Web Apps with MEAN Stack",
        "year": 2020,
        "source": "ACM",
        "relevance": "media"
      }
    ],
    "researchQuestion": "¿Qué enfoques, patrones de diseño y consideraciones de rendimiento han sido reportados sobre el uso de Mongoose ODM en aplicaciones Node.js?",
    "databases": ["IEEE Xplore", "ACM Digital Library", "Scopus", "Springer"],
    "aiProvider": "chatgpt"
  }'
```

### Expected Response (Resumido)

```json
{
  "success": true,
  "data": {
    "analisis": {
      "fortalezas": ["Incluye términos clave", "Operadores correctos"],
      "debilidades": ["Captura tutoriales", "Falta términos técnicos"],
      "tasa_relevancia_estimada": 0.52,
      "cobertura_pregunta": "media",
      "problemas_detectados": [
        "Alta tasa de falsos positivos (tutoriales básicos)",
        "No filtra por tipo de estudio"
      ]
    },
    "cadena_refinada": {
      "version_mejorada": "((\"Mongoose\" OR \"Mongoose ODM\") AND (\"MongoDB\" OR \"NoSQL\") AND (\"Node.js\" OR \"JavaScript\" OR \"Express\") AND (\"performance\" OR \"optimization\" OR \"design pattern\" OR \"best practice\" OR \"scalability\"))",
      "cambios_realizados": [
        "Agregado: 'Express' como framework relacionado",
        "Agregado: términos de análisis técnico"
      ],
      ...
    },
    "adaptaciones_por_base": {
      "IEEE_Xplore": "(\"Abstract\":Mongoose) AND ...",
      "ACM_Digital_Library": "...",
      "Scopus": "TITLE-ABS-KEY(...)"
    },
    ...
  }
}
```

---

## 6. Gestión de Referencias

### Crear Referencias en Lote

```bash
curl -X POST $API_URL/api/references/PROJECT_UUID/batch \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "references": [
      {
        "title": "Performance Optimization of Mongoose",
        "authors": "Smith, J.",
        "year": 2023,
        "journal": "IEEE TSE",
        "doi": "10.1109/TSE.2023.12345",
        "abstract": "This paper presents...",
        "keywords": "Mongoose, Performance",
        "url": "https://...",
        "source": "IEEE Xplore"
      }
    ]
  }'
```

### Obtener Estadísticas

```bash
curl -X GET $API_URL/api/references/PROJECT_UUID/stats \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Response

```json
{
  "success": true,
  "data": {
    "total": "124",
    "incluidas": "45",
    "excluidas": "62",
    "duplicadas": "5",
    "pendientes": "12",
    "en_revision": "0",
    "analizadas_ia": "112",
    "confianza_promedio_ia": "0.8654"
  }
}
```

---

## 7. Workflow Completo de Testing

### Script Bash Completo

```bash
#!/bin/bash

# Variables
API_URL="http://localhost:3001"
PROJECT_ID="your-project-uuid"
JWT_TOKEN="your-jwt-token"

echo "=== 1. Generar Protocolo ==="
curl -X POST $API_URL/api/ai/protocol-analysis \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d @protocol-request.json

echo "\n\n=== 2. Generar Título ==="
curl -X POST $API_URL/api/ai/generate-title \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d @title-request.json

echo "\n\n=== 3. Importar Referencias ==="
curl -X POST $API_URL/api/references/$PROJECT_ID/batch \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d @references.json

echo "\n\n=== 4. Screening con IA ==="
curl -X POST $API_URL/api/ai/screen-references-batch \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d @screening-request.json

echo "\n\n=== 5. Estadísticas ==="
curl -X GET $API_URL/api/references/$PROJECT_ID/stats \
  -H "Authorization: Bearer $JWT_TOKEN"

echo "\n\nWorkflow completado!"
```

---

## 8. Testing con diferentes proveedores

### Comparar ChatGPT vs Gemini

```bash
# Test con ChatGPT
echo "Testing con ChatGPT..."
curl -X POST $API_URL/api/ai/screen-reference \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": {...},
    "aiProvider": "chatgpt"
  }' > chatgpt-result.json

# Test con Gemini
echo "Testing con Gemini..."
curl -X POST $API_URL/api/ai/screen-reference \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": {...},
    "aiProvider": "gemini"
  }' > gemini-result.json

# Comparar resultados
echo "Comparando resultados..."
diff chatgpt-result.json gemini-result.json
```

---

## PowerShell (Windows)

### Variables

```powershell
$API_URL = "http://localhost:3001"
$JWT_TOKEN = "your-jwt-token"
$headers = @{
    "Authorization" = "Bearer $JWT_TOKEN"
    "Content-Type" = "application/json"
}
```

### Request de Protocolo

```powershell
$body = @{
    title = "Mongoose ODM in Node.js"
    description = "Revisión sistemática..."
    aiProvider = "chatgpt"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API_URL/api/ai/protocol-analysis" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

---

## Notas Importantes

1. **Rate Limits**: No hacer más de 10 requests por minuto en testing
2. **Timeouts**: Las requests de protocolo completo pueden tardar 30-60 segundos
3. **Tokens**: Renovar JWT_TOKEN si expira (default: 7 días)
4. **Errores**: Revisar logs del servidor ante cualquier error 500

---

**Happy Testing! 🚀**
