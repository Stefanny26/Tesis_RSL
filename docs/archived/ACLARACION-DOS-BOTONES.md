# 📊 Aclaración: Dos Botones Diferentes en el Sistema

## 1️⃣ Botón de Importación de Referencias (Protocolo)
**Ubicación**: Wizard paso 6 y Protocol Wizard  
**Archivo**: `import-references-button.tsx`  
**Icono**: 📤 Upload

### Propósito
Importar referencias bibliográficas **SIN texto completo** al inicio del proyecto.

### Formatos Aceptados
- ✅ RIS (`.ris`) - Mendeley, Zotero, EndNote
- ✅ CSV (`.csv`) - Exportaciones de bases de datos
- ✅ BibTeX (`.bib`) - LaTeX

### Datos Importados
```typescript
{
  title: string              // Título del artículo
  authors: string            // Autores
  abstract: string           // Resumen
  publication_year: number   // Año
  doi: string               // DOI
  source: string            // Revista/Conferencia
  // NO incluye PDF ni texto completo
}
```

### Tabla de Base de Datos
```sql
INSERT INTO references (
  project_id,
  title,
  authors,
  abstract,
  publication_year,
  doi,
  source,
  classification  -- 'pending' inicialmente
)
```

### Flujo
```
Usuario → Importa RIS/CSV/BibTeX → Backend parsea → Guarda en `references`
    ↓
Referencias aparecen en tabla de cribado
    ↓
Listas para Fase 1 (AI Screening)
```

---

## 2️⃣ Botón de Carga de PDF (Cribado Fase 3)
**Ubicación**: Página de screening, tab "Fase 3: Texto Completo"  
**Archivo**: `full-text-review.tsx`  
**Icono**: 📄 FileText / Upload PDF

### Propósito
Cargar el **artículo completo en PDF** de referencias **ya incluidas** después de Fase 1 y 2.

### Formato Aceptado
- ✅ PDF (`.pdf`) únicamente

### Datos Almacenados
```typescript
{
  reference_id: UUID           // ID de la referencia existente
  full_text_path: string       // /uploads/pdfs/ref-123.pdf
  full_text_url: string        // URL alternativa
  full_text_available: true    // Flag
  uploaded_at: timestamp
}
```

### Tabla de Base de Datos
```sql
UPDATE references 
SET 
  full_text_path = '/uploads/pdfs/ref-123.pdf',
  full_text_available = true
WHERE id = reference_id;

-- Evaluación en tabla separada
INSERT INTO screening_records (
  reference_id,
  project_id,
  user_id,
  stage = 'fulltext',
  decision,
  scores = {           -- JSONB con 7 criterios
    relevance: 2,
    interventionPresent: 2,
    methodValidity: 2,
    dataReported: 1,
    textAccessible: 1,
    dateRange: 1,
    methodQuality: 1
  },
  total_score = 10,    -- Suma de scores (0-12)
  threshold = 8
)
```

### Flujo
```
Usuario → Selecciona referencia INCLUIDA en Fase 1/2
    ↓
Sube PDF del artículo completo
    ↓
Sistema guarda en /uploads/pdfs/
    ↓
Usuario evalúa con 7 criterios (0-12 puntos)
    ↓
Decisión final: INCLUIR (≥8) o EXCLUIR (<8)
```

---

## 📋 Comparación Directa

| Aspecto | Importar Referencias | Cargar PDF |
|---------|---------------------|------------|
| **Fase** | Inicio (Wizard paso 6) | Screening Fase 3 |
| **Formato** | RIS, CSV, BibTeX | PDF |
| **Cantidad** | Múltiples (bulk) | Uno a la vez |
| **Contenido** | Metadatos bibliográficos | Texto completo |
| **Tabla DB** | `references` (INSERT) | `references` (UPDATE) + `screening_records` |
| **Campo clave** | `title`, `authors`, `abstract` | `full_text_path`, `full_text_available` |
| **Propósito** | Población inicial para screening | Evaluación detallada de incluidos |
| **Momento** | Una vez al inicio | Repetido por cada artículo incluido |

---

## 🔍 Diferencia Clave

### Importar Referencias = "Cargar la lista de candidatos"
- Son las referencias **bibliográficas** que vas a cribar
- NO tienen el artículo completo
- Solo tienen: título, autores, resumen
- Equivale a: "Lista de papers que encontré en Scopus/IEEE"

### Cargar PDF = "Obtener el artículo completo para leer"
- Son los **PDFs descargados** de los artículos
- Ya pasaron Fase 1 (embeddings) y Fase 2 (ChatGPT)
- Fueron clasificados como INCLUIR
- Ahora necesitas el PDF para evaluación detallada

---

## 🎯 Flujo Temporal Correcto

```
1. Importar Referencias (Protocolo)
   └─ 31 referencias en formato RIS
   └─ Guardadas en tabla `references`
   └─ classification = 'pending'

2. Fase 1: AI Screening (Embeddings)
   └─ 23 incluidas (alta confianza)
   └─ 2 excluidas (baja confianza)
   └─ 6 zona gris

3. Fase 2: AI Screening (ChatGPT)
   └─ 6 analizadas de zona gris
   └─ 4 incluidas, 2 excluidas

4. Resultados Fase 1+2:
   └─ 23 + 4 = 27 referencias INCLUIDAS
   └─ Estas 27 necesitan evaluación de texto completo

5. **AHORA Cargar PDFs** (Fase 3)
   └─ Usuario descarga manualmente los 27 PDFs
   └─ Sube cada PDF al sistema
   └─ Evalúa con 7 criterios

6. Decisión Final:
   └─ De las 27, por ejemplo:
      - 19 cumplen umbral (≥8/12) → INCLUIR FINAL
      - 8 no cumplen (<8/12) → EXCLUIR FINAL
```

---

## ⚠️ Error Común

**INCORRECTO**:
```
Usuario intenta importar PDFs en el wizard
❌ El botón de importación NO acepta PDFs
```

**CORRECTO**:
```
Usuario importa RIS/CSV en el wizard
  ↓
Hace screening automático (Fase 1+2)
  ↓
Luego sube PDFs UNO POR UNO en Fase 3
```

---

## 🗂️ Estructura de Archivos en Servidor

```
backend/uploads/
├── .gitignore           # Ignora los PDFs en Git
├── .gitkeep
└── pdfs/
    ├── ref-abc123.pdf   # PDF de referencia 1
    ├── ref-def456.pdf   # PDF de referencia 2
    └── ref-ghi789.pdf   # PDF de referencia 3

DB references table:
- id: abc123
  title: "Machine Learning in Software"
  full_text_path: "/uploads/pdfs/ref-abc123.pdf"
  full_text_available: true
```

---

## 📊 Estado en Base de Datos

### Después de Importar Referencias
```sql
SELECT * FROM references WHERE project_id = 'proyecto-123';

-- Resultado:
id          | title                  | abstract      | full_text_path | classification
------------|------------------------|---------------|----------------|---------------
ref-001     | "AI in Software Dev"   | "This paper..." | NULL          | pending
ref-002     | "ML for Testing"       | "We studied..." | NULL          | pending
ref-003     | "Code Generation"      | "Recent..."     | NULL          | pending
```

### Después de AI Screening (Fase 1+2)
```sql
SELECT * FROM references WHERE project_id = 'proyecto-123';

-- Resultado:
id          | title                  | classification | full_text_path
------------|------------------------|----------------|---------------
ref-001     | "AI in Software Dev"   | included       | NULL
ref-002     | "ML for Testing"       | excluded       | NULL
ref-003     | "Code Generation"      | included       | NULL
```

### Después de Cargar PDFs (Fase 3)
```sql
SELECT * FROM references WHERE project_id = 'proyecto-123';

-- Resultado:
id          | title                  | classification | full_text_path
------------|------------------------|----------------|-------------------
ref-001     | "AI in Software Dev"   | included       | /uploads/pdfs/ref-001.pdf
ref-002     | "ML for Testing"       | excluded       | NULL (no se carga, ya excluido)
ref-003     | "Code Generation"      | included       | /uploads/pdfs/ref-003.pdf
```

---

## 🔄 Resumen Ejecutivo

| Botón | Cuándo | Qué hace | Tabla afectada |
|-------|--------|----------|----------------|
| **Importar Referencias** | Inicio (1 vez) | Carga lista bibliográfica | `references` INSERT |
| **Cargar PDF** | Fase 3 (múltiples veces) | Adjunta artículo completo | `references` UPDATE |

**No confundir**:
- 📤 Importar = Metadata bibliográfica (RIS/CSV)
- 📄 Cargar PDF = Artículo completo para lectura

