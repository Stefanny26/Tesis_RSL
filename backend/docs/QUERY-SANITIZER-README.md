# Sistema de Generación y Sanitización de Queries Académicas

## 📋 Resumen

Sistema robusto para generar, validar y sanitizar cadenas de búsqueda académica optimizadas para múltiples bases de datos (Scopus, IEEE Xplore, PubMed, Web of Science, ACM, Google Scholar, etc.).

## 🏗️ Arquitectura

### Archivos Principales

1. **`query-sanitizer.js`** - Módulo de sanitización y validación
2. **`search-query-generator.use-case.js`** - Generador de queries con IA
3. **`academic-databases.js`** - Configuración de 29 bases de datos

## 🔧 Funcionalidades

### 1. Sanitización de Términos

```javascript
sanitizeTerm(term)
```
- Decodifica entidades HTML
- Normaliza Unicode (NFKC)
- Remueve caracteres de control
- Elimina caracteres problemáticos: `{ } [ ] ^ ~ ? < >`
- Agrega comillas automáticamente a frases

### 2. Validación por Base de Datos

#### IEEE Xplore
```javascript
validateIEEE(query)
```
- Máximo 3 grupos AND
- Máximo 2 OR por grupo
- Sin campos (TI:, AB:, "Document Title")
- Solo términos libres

#### Scopus
```javascript
validateScopus(query)
```
- Verifica estructura `TITLE-ABS-KEY(...)`
- Paréntesis balanceados

#### PubMed
```javascript
validatePubMed(query)
```
- Verifica campos `[Title/Abstract]` o `[MeSH Terms]`

### 3. Generación Automática

```javascript
generateQueriesFromGroups(groups, databases)
```

Genera queries optimizadas por base de datos desde arrays de términos:

**Entrada:**
```javascript
const groups = [
  ["Internet of Things", "IoT"],
  ["digital health", "telehealth"],
  ["privacy", "security"]
];
const databases = ["ieee", "scopus", "pubmed"];
```

**Salida:**
```javascript
[
  {
    database: "ieee",
    query: '("Internet of Things" OR IoT) AND ("digital health" OR telehealth) AND (privacy OR security)',
    explanation: "Cadena optimizada para IEEE Xplore..."
  },
  {
    database: "scopus",
    query: 'TITLE-ABS-KEY(("Internet of Things" OR IoT) AND ("digital health" OR telehealth) AND (privacy OR security))',
    explanation: "Query para Scopus usando TITLE-ABS-KEY..."
  },
  ...
]
```

## 📚 Bases de Datos Soportadas

### 🟦 Ingeniería y Tecnología (8)
- ✅ **IEEE Xplore** (API)
- ✅ **ACM Digital Library** (API)
- ✅ **Scopus** (API)
- ✅ **ScienceDirect** (API)
- ✅ **SpringerLink** (API)
- ❌ **Web of Science** (Manual)
- ❌ **Wiley Online Library** (Manual)

### 🟥 Medicina y Ciencias de la Salud (7)
- ✅ **PubMed/MEDLINE** (API)
- ✅ **Scopus** (API)
- ❌ **CINAHL** (Manual)
- ❌ **Cochrane Library** (Manual)
- ❌ **Embase** (Manual)

### 🟩 Ciencias Sociales (8)
- ✅ **ERIC** (API)
- ✅ **Scopus** (API)
- ❌ **JSTOR** (Manual)
- ❌ **SAGE Journals** (Manual)
- ❌ **PsycINFO** (Manual)

### 🟪 Arquitectura y Diseño (6)
- ✅ **Scopus** (API)
- ✅ **ScienceDirect** (API)
- ❌ **Avery Index** (Manual)

**Total: 29 bases de datos únicas**

## 🤖 Prompt para IA (Gemini)

El sistema usa un prompt optimizado que:

1. Define reglas estrictas por base de datos
2. Solicita queries en inglés únicamente
3. Evita comodines y caracteres especiales
4. Agrupa sinónimos con OR, conceptos con AND
5. Formato de salida: texto plano sin markdown

```
DATABASE: nombre_base_datos
QUERY: tu query completa aqui
EXPLANATION: breve explicacion en espanol
```

## ✅ Validación Automática

El sistema aplica validación específica después de generar cada query:

### Para IEEE:
- Si la query tiene más de 3 AND, reduce automáticamente
- Si un grupo tiene más de 2 OR, ajusta
- Remueve campos si los detecta

### Para Scopus:
- Agrega `TITLE-ABS-KEY(...)` si falta
- Verifica paréntesis balanceados

### Para PubMed:
- Agrega `[Title/Abstract]` a términos sin campo
- Valida formato de MeSH

### Para todas:
- Remueve backticks
- Limpia espacios múltiples
- Elimina caracteres problemáticos

## 📊 Ejemplo de Uso Completo

```javascript
const { generateQueriesFromGroups } = require('./query-sanitizer');

const protocolTerms = {
  technologies: ["Firewall", "Antivirus", "Encryption", "IDS"],
  domains: ["Organizations", "Public sector"],
  studyTypes: ["Systematic review", "Trial"],
  themes: ["Security effectiveness", "Risk management"]
};

// Convertir términos en grupos
const groups = [
  protocolTerms.technologies,
  protocolTerms.domains,
  protocolTerms.studyTypes,
  protocolTerms.themes
];

// Generar queries
const queries = generateQueriesFromGroups(groups, ["ieee", "scopus", "pubmed"]);

console.log(queries);
/* Salida:
[
  {
    database: 'ieee',
    query: '(Firewall OR Antivirus OR Encryption OR IDS) AND (Organizations OR "Public sector") AND ("Systematic review" OR Trial)',
    explanation: 'Cadena optimizada para IEEE Xplore...'
  },
  ...
]
*/
```

## 🔍 APIs Implementadas

### Scopus
- **Archivo:** `scopus-search.use-case.js`
- **Funciones:** `validateConnection`, `count`, `search`, `importToProject`
- **API Key:** `process.env.SCOPUS_API_KEY`

### Google Scholar
- **Archivo:** `google-scholar-search.use-case.js`
- **Función:** `count`
- **Proveedor:** SerpApi
- **API Key:** `process.env.GOOGLE_SCHOLAR_API_KEY`

### IEEE
- **Estado:** Solo generación de queries (sin API de búsqueda)
- **Requiere:** Carga manual de archivos

## 📦 Dependencias

```json
{
  "he": "^1.2.0",            // Decodificación de entidades HTML
  "@google/generative-ai": "^0.1.0",  // Gemini AI
  "axios": "^1.6.0"          // HTTP requests para APIs
}
```

## 🧪 Testing

### Validación IEEE
```javascript
const { validateIEEE } = require('./query-sanitizer');

// Válida
validateIEEE('("IoT") AND ("health") AND (security)'); // true

// Inválida (4 AND)
validateIEEE('("IoT") AND ("health") AND (security) AND (privacy)'); // false
```

### Sanitización
```javascript
const { sanitizeTerm } = require('./query-sanitizer');

sanitizeTerm('Internet of Things');           // "Internet of Things"
sanitizeTerm('IoT');                          // IoT
sanitizeTerm('security & privacy');           // "security privacy"
sanitizeTerm('machine\nlearning');            // "machine learning"
```

## 📝 Logs del Sistema

El sistema genera logs detallados:

```
🔍 Generando queries de búsqueda...
📄 Respuesta COMPLETA de IA para búsquedas
🔍 Parseando queries de búsqueda...
📍 Nueva base de datos detectada: ieee
✅ Query parseada para: ieee
🔧 Validando IEEE query...
✅ IEEE query validada
📊 Total queries parseadas: 2
```

## 🚀 Estado del Sistema

✅ **Completado:**
- Sanitizador de términos con normalización Unicode
- Validadores específicos por base de datos (IEEE, Scopus, PubMed)
- Generador automático desde arrays de términos
- Prompt optimizado para IA con reglas estrictas
- Parser robusto con sanitización automática
- Integración con Scopus API (count + search)
- Integración con Google Scholar API (count)
- Configuración de 29 bases de datos académicas

⚠️ **Pendiente:**
- Tests automatizados (Jest)
- Exportación BSON para MongoDB
- Endpoint de validación en frontend
- Integración IEEE API (si disponible)

## 📖 Documentación Adicional

- **SOLUCION-QUERIES-SCOPUS.md** - Troubleshooting Scopus
- **MODELOS-GEMINI-DISPONIBLES.md** - Modelos Gemini soportados
- **IMPLEMENTACION-COMPLETA.md** - Guía de implementación

## 👥 Uso en Frontend

El frontend recibe las queries en formato JSON y muestra:

1. **Tabla de queries** con columnas:
   - Base de Datos
   - Cadena de Búsqueda
   - # Artículos
   - Acciones (Copiar, Contar, Subir)

2. **Botón "Contar"** para bases con API:
   - Scopus → `apiClient.scopusCount(query)`
   - Google Scholar → `apiClient.googleScholarCount(query, startYear, endYear)`

3. **Botón "Copiar"** para copiar query al portapapeles

4. **Botón "Subir"** para carga manual (IEEE, ACM, etc.)

---

**Fecha:** 30 de noviembre de 2025  
**Versión:** 1.0.0  
**Autor:** Sistema de Tesis RSL
