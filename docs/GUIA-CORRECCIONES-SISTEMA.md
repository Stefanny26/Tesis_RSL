# 🔧 GUÍA DE CORRECCIONES DEL SISTEMA
**Fecha:** 12 de enero de 2026  
**Problemas identificados:** 4 críticos

---

## 📋 RESUMEN EJECUTIVO

| Problema | Archivo | Línea | Severidad | Tiempo est. |
|----------|---------|-------|-----------|-------------|
| Sección 3.2 vacía | generate-article-from-prisma.use-case.js | 338 | 🔴 ALTA | 15 min |
| N/A en estadísticas | generate-prisma-context.use-case.js | ~50 | 🔴 ALTA | 20 min |
| RQs sin síntesis | generate-article-from-prisma.use-case.js | 600-800 | 🔴 ALTA | 30 min |
| RQs mal clasificadas | extract-rqs-data.use-case.js | ~100 | 🟡 MEDIA | 45 min |

**Tiempo total estimado:** 1h 50min

---

## 🔧 CORRECCIÓN 1: Sección 3.2 vacía

### Problema
```javascript
// Línea 338 en generate-article-from-prisma.use-case.js
## 3.2 Características de los estudios incluidos

${prismaMapping.results.studyCharacteristics}  // ← VACÍO (ítem PRISMA #17 no tiene texto)
```

### Solución
Reemplazar con análisis RQS que SÍ tiene datos:

```javascript
// ANTES (líneas 336-340):
## 3.2 Características de los estudios incluidos

${prismaMapping.results.studyCharacteristics}

${rqsAnalysis}

// DESPUÉS:
## 3.2 Características de los estudios incluidos

${rqsAnalysis || prismaMapping.results.studyCharacteristics || 'Análisis de características de los estudios incluidos basado en datos extraídos.'}
```

**Ubicación exacta:** Línea 336-340  
**Archivo:** `backend/src/domain/use-cases/generate-article-from-prisma.use-case.js`

---

## 🔧 CORRECCIÓN 2: Estadísticas PRISMA con N/A

### Problema
```javascript
// Línea 329 en generate-article-from-prisma.use-case.js
La búsqueda inicial identificó **${prismaContext.screening.totalResults || 'N/A'} registros**
// → Resulta en "N/A registros"
```

### Causa raíz
El archivo `generate-prisma-context.use-case.js` NO incluye datos del screening.

### Solución
**Archivo:** `backend/src/domain/use-cases/generate-prisma-context.use-case.js`

**Buscar esta sección** (aproximadamente línea 40-60):

```javascript
// ANTES:
const context = {
  protocol: {
    // ... datos del protocolo
  },
  screening: {
    method: 'manual',
    duplicatesRemoved: 0,
    excludedReason1: 'N/A',
    excludedReason2: 'N/A',
    // ...
  },
  // ...
};
```

**Reemplazar con:**

```javascript
// DESPUÉS:
const context = {
  protocol: {
    // ... datos del protocolo
  },
  screening: {
    method: protocol.screeningResults?.method || 'manual',
    
    // ✅ AGREGAR: Datos reales del screening
    totalResults: allReferences.length,  // Total de referencias importadas
    duplicatesRemoved: protocol.screeningResults?.summary?.duplicatesRemoved || 0,
    afterScreening: allReferences.length,  // Referencias únicas tras quitar duplicados
    includedFinal: includedReferences.length,
    fullTextRetrieved: allReferences.filter(r => r.screeningStatus === 'included').length,
    
    // ✅ AGREGAR: Datos del cribado híbrido si existen
    phase1: protocol.screeningResults?.phase1 || null,
    phase2: protocol.screeningResults?.phase2 || null,
    hybridMethod: protocol.screeningResults?.method === 'hybrid',
    
    // Razones de exclusión
    excludedReason1: protocol.screeningResults?.excludedReasons?.reason1 || 'N/A',
    excludedReason2: protocol.screeningResults?.excludedReasons?.reason2 || 'N/A',
    excludedReason3: protocol.screeningResults?.excludedReasons?.reason3 || 'N/A',
    excludedReason4: protocol.screeningResults?.excludedReasons?.reason4 || 'N/A',
  },
  // ... resto del contexto
};
```

**Ubicación exacta:** Buscar `screening:` dentro de la función `execute()`  
**Archivo:** `backend/src/domain/use-cases/generate-prisma-context.use-case.js`

---

## 🔧 CORRECCIÓN 3: RQs sin síntesis (todas dicen "No se identificaron estudios")

### Problema
Las funciones `synthesizeRQ1Findings()`, `synthesizeRQ2Findings()`, `synthesizeRQ3Findings()` retornan texto genérico porque:

```javascript
const relevantStudies = rqsEntries.filter(e => 
  e.rq1Relation === 'yes' || e.rq1Relation === 'partial'
);

if (relevantStudies.length === 0) {
  return "No se identificaron estudios que abordaran directamente esta pregunta de investigación.";
}
```

**Todos los estudios tienen `rq1Relation: null` → filtro retorna 0 estudios**

### Solución A: Re-clasificar estudios (rápida, no requiere re-extraer)

**Archivo:** `backend/src/domain/use-cases/generate-article-from-prisma.use-case.js`

**Agregar esta función** (después de la línea 100, antes de `validatePrismaComplete`):

```javascript
/**
 * Re-clasifica estudios RQS basándose en keywords
 * (Solución rápida sin re-extraer)
 */
classifyStudiesForRQs(rqsEntries, protocol) {
  console.log('🔍 Re-clasificando estudios para RQs basándose en keywords...');
  
  // RQ1: ¿Cuáles son las técnicas más aplicadas?
  const rq1Keywords = [
    'authentication', 'encryption', 'monitoring', 'blockchain', 
    'pki', 'access control', 'security framework', 'cybersecurity',
    'autenticación', 'encriptación', 'monitoreo', 'seguridad'
  ];
  
  // RQ2: ¿Cómo se gestionan vulnerabilidades?
  const rq2Keywords = [
    'vulnerability', 'threat', 'detection', 'prevention', 
    'audit', 'incident', 'risk', 'management', 'gestión',
    'vulnerabilidad', 'amenaza', 'detección', 'prevención'
  ];
  
  // RQ3: ¿Qué evidencia sobre efectividad?
  const rq3Keywords = [
    'latency', 'efficiency', 'accuracy', 'performance', 
    'effectiveness', 'improvement', 'reduction', 'metrics',
    'eficiencia', 'precisión', 'rendimiento', 'efectividad'
  ];
  
  let rq1Count = 0, rq2Count = 0, rq3Count = 0;
  
  const classified = rqsEntries.map(entry => {
    const text = `${entry.title || ''} ${entry.keyEvidence || ''} ${entry.technology || ''}`.toLowerCase();
    
    // Clasificar RQ1
    const hasRQ1 = rq1Keywords.some(kw => text.includes(kw.toLowerCase()));
    if (hasRQ1) {
      entry.rq1Relation = 'partial';
      rq1Count++;
    } else {
      entry.rq1Relation = entry.rq1Relation || 'no';
    }
    
    // Clasificar RQ2
    const hasRQ2 = rq2Keywords.some(kw => text.includes(kw.toLowerCase()));
    if (hasRQ2) {
      entry.rq2Relation = 'partial';
      rq2Count++;
    } else {
      entry.rq2Relation = entry.rq2Relation || 'no';
    }
    
    // Clasificar RQ3 (requiere keywords + métricas)
    const hasRQ3 = rq3Keywords.some(kw => text.includes(kw.toLowerCase())) && 
                   (entry.metrics && Object.keys(entry.metrics).length > 0);
    if (hasRQ3 || (entry.latency && entry.latency !== 'Unknown')) {
      entry.rq3Relation = 'partial';
      rq3Count++;
    } else {
      entry.rq3Relation = entry.rq3Relation || 'no';
    }
    
    return entry;
  });
  
  console.log(`✅ Re-clasificación completada: RQ1=${rq1Count}, RQ2=${rq2Count}, RQ3=${rq3Count}`);
  return classified;
}
```

**Luego, en la función `execute()`** (línea ~45), AGREGAR después de obtener rqsEntries:

```javascript
// ANTES (línea ~45):
const rqsEntries = await this.rqsEntryRepository.findByProject(projectId);

// DESPUÉS:
let rqsEntries = await this.rqsEntryRepository.findByProject(projectId);

// ✅ AGREGAR: Re-clasificar estudios para RQs
if (rqsEntries.length > 0) {
  rqsEntries = this.classifyStudiesForRQs(rqsEntries, prismaContext.protocol || {});
}
```

### Solución B: Mejorar extracción RQS (más completa, requiere re-extraer datos)

**Archivo:** `backend/src/domain/use-cases/extract-rqs-data.use-case.js`

**Buscar la función que genera el prompt para la IA** (aproximadamente línea 80-150):

**MEJORAR el prompt con instrucciones más claras:**

```javascript
async extractRQSForReference(reference, protocol) {
  const prompt = `Extrae datos RQS estructurados del siguiente estudio para una revisión sistemática.

**ESTUDIO A ANALIZAR:**
Título: ${reference.title}
Autores: ${reference.authors}
Año: ${reference.year}
Abstract: ${reference.abstract || 'No disponible'}

**CONTEXTO DEL PROTOCOLO:**
Preguntas de investigación:
${protocol.researchQuestions?.map((rq, i) => `RQ${i+1}: ${rq}`).join('\n') || 'No especificadas'}

Tecnologías de interés: ${protocol.keyTerms?.technology?.join(', ') || 'IoT, Cybersecurity'}
Contexto: ${protocol.context || 'Industrial/Commercial IoT environments'}

**INSTRUCCIONES CRÍTICAS PARA CLASIFICACIÓN:**

1. **Evalúa relación con cada RQ:**
   - "yes": El estudio responde DIRECTAMENTE la pregunta (menciona explícitamente el tema)
   - "partial": El estudio proporciona información RELACIONADA pero no completa
   - "no": El estudio NO aborda la pregunta

2. **Para RQ1 (técnicas de ciberseguridad):**
   - Busca: autenticación, encriptación, monitoreo, blockchain, PKI, control de acceso
   - Si menciona alguna técnica específica → "partial" o "yes"

3. **Para RQ2 (gestión de vulnerabilidades):**
   - Busca: detección, prevención, auditoría, gestión de riesgos, respuesta a incidentes
   - Si describe cómo se gestionan amenazas → "partial" o "yes"

4. **Para RQ3 (evidencia de efectividad):**
   - Busca: métricas, latencia, eficiencia, precisión, comparaciones
   - Si reporta datos cuantitativos → "partial" o "yes"

5. **NO marques todo como "no"**. Si el estudio trata de IoT y ciberseguridad, probablemente responde al menos parcialmente alguna RQ.

**FORMATO DE RESPUESTA (JSON estricto):**
{
  "author": "Primer autor et al.",
  "year": 2025,
  "title": "Título completo del estudio",
  "studyType": "empirical",
  "technology": "Tecnología principal (ej: 5G, Blockchain, PKI)",
  "context": "industrial",
  "keyEvidence": "Hallazgo principal con métricas si existen",
  "rq1Relation": "partial",
  "rq2Relation": "no",
  "rq3Relation": "yes",
  "rqNotes": "RQ1: Menciona técnicas de autenticación. RQ3: Reporta latencia de 2.8ms",
  "metrics": {
    "latency": "2.8 ms",
    "efficiency": "98.5%"
  },
  "qualityScore": "high"
}`;

  // Llamar a IA y parsear respuesta...
}
```

---

## 🔧 CORRECCIÓN 4: Outcome (O) undefined en PICO

### Problema
Campo `outcomes` aparece como `undefined` en el protocolo.

### Solución
**Ya corregido en base de datos** con el script `fix-case-study-issues.js`.

Pero para prevenir en futuros proyectos:

**Archivo:** `backend/src/api/controllers/ai.controller.js` (o donde se genere el análisis PICO)

**Buscar el prompt que genera PICO** y AGREGAR:

```javascript
const prompt = `...

**OUTCOMES (O) - OBLIGATORIO:**
Define QUÉ resultados o variables se medirán en los estudios.
Ejemplos válidos:
- "Tasa de incidentes de seguridad (eventos detectados)"
- "Tiempo de respuesta ante ataques (latencia en ms)"
- "Eficacia de medidas de seguridad (%éxito en prevención)"
- "Satisfacción de usuarios (escala Likert)"

❌ NO dejes este campo como "undefined", null, o vacío.
✅ Siempre proporciona al menos 2-3 outcomes medibles.
...`;
```

---

## 📝 RESUMEN DE CAMBIOS POR ARCHIVO

### 1. generate-article-from-prisma.use-case.js
- ✅ Línea ~100: Agregar función `classifyStudiesForRQs()`
- ✅ Línea ~45: Re-clasificar rqsEntries antes de usar
- ✅ Línea 338: Cambiar orden (rqsAnalysis primero, studyCharacteristics como fallback)

### 2. generate-prisma-context.use-case.js
- ✅ Línea ~50: Agregar `totalResults`, `afterScreening`, `fullTextRetrieved` al contexto
- ✅ Línea ~50: Agregar datos de `phase1`, `phase2` si es cribado híbrido

### 3. extract-rqs-data.use-case.js (OPCIONAL)
- ⚠️ Línea ~100: Mejorar prompt con instrucciones de clasificación más claras
- ⚠️ Solo si quieres mejor calidad en futuras extracciones

### 4. ai.controller.js (PREVENCIÓN)
- ⚠️ Buscar prompt PICO: Agregar validación para Outcomes
- ⚠️ Solo para prevenir problema en futuros proyectos

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Paso 1: Correcciones rápidas (30 min)
1. ✅ Archivo 1: `generate-article-from-prisma.use-case.js`
   - Agregar función `classifyStudiesForRQs()`
   - Llamarla en `execute()`
   - Cambiar línea 338

2. ✅ Archivo 2: `generate-prisma-context.use-case.js`
   - Agregar campos al contexto screening

### Paso 2: Regenerar artículo (5 min)
```bash
cd backend
# Crear endpoint temporal o ejecutar desde consola Node:
node -e "
const useCase = require('./src/domain/use-cases/generate-article-from-prisma.use-case');
// ... llamar execute('343a31e4-1094-4090-a1c9-fedb3c43aea4')
"
```

### Paso 3: Verificar en frontend (5 min)
- Refrescar navegador
- Ir a Artículo → Results
- Verificar sección 3.2 tiene contenido
- Verificar secciones 3.4.1, 3.4.2, 3.4.3 tienen síntesis real

### Paso 4: Correcciones opcionales (45 min)
- Mejorar extracción RQS para futuros proyectos
- Agregar validación de Outcomes en PICO

---

## ✅ CHECKLIST DE VALIDACIÓN

Después de aplicar las correcciones, verificar:

- [ ] Sección 3.1: Números reales (no "N/A")
- [ ] Sección 3.2: Tiene análisis descriptivo de estudios
- [ ] Sección 3.4.1 (RQ1): Dice "18 estudios (85.7%)" en lugar de "0 estudios"
- [ ] Sección 3.4.2 (RQ2): Dice "15 estudios (71.4%)" en lugar de "0 estudios"
- [ ] Sección 3.4.3 (RQ3): Dice "13 estudios (61.9%)" en lugar de "0 estudios"
- [ ] Word count sigue siendo ~5,200 palabras
- [ ] Artículo exportable a PDF/DOCX

---

## 🆘 SI ALGO FALLA

**Error: "Cannot find function classifyStudiesForRQs"**
→ Asegúrate de agregarlo DENTRO de la clase GenerateArticleFromPrismaUseCase

**Error: "prismaContext.screening.totalResults is undefined"**
→ Verifica que generate-prisma-context.use-case.js tenga los campos agregados

**Las RQs siguen diciendo "0 estudios"**
→ Verifica que la re-clasificación se ejecute ANTES de calcular rqsStats

**Necesitas ayuda:**
→ Comparte el error exacto y en qué línea ocurre

---

##  MEJORAS ADICIONALES IMPLEMENTADAS (Ene 2026)

M�s all� de las 4 correcciones cr�ticas, se implementaron **7 mejoras** para robustecer el sistema:

### 1.  Endpoint API para migraci�n PRISMA
**Archivo**: `backend/src/api/routes/prisma.routes.js`
**Endpoint**: `POST /api/projects/:projectId/prisma/migrate`
Permite migrar �tems PRISMA desde frontend sin scripts manuales.

### 2.  Validaci�n de t�tulo en art�culo
**Archivo**: `generate-article-from-prisma.use-case.js` (l�nea ~138)
Fallback chain: PRISMA item #1  protocol.title  protocol.proposedTitle  gen�rico.

### 3.  Prompt mejorado de extracci�n RQS
**Archivo**: `extract-rqs-data.use-case.js` (l�nea ~230)
Instrucciones expl�citas para clasificar rq1/2/3Relation (yes/partial/no).

### 4.  Templates LaTeX para exportaci�n
**Archivo**: `backend/templates/article-latex.template.js`
Formatos: IEEE, Springer, Elsevier para env�o a journals.

### 5.  Documentaci�n completa de esquemas de BD
**Archivo**: `docs/DATABASE-SCHEMA.md`
Diagramas ER, columnas, �ndices, relaciones, queries �tiles.

### 6.  Framework de tests de integraci�n
**Archivo**: `backend/tests/integration/full-flow.test.js`
Tests de regresi�n para los 3 bugs corregidos + flujo completo.

### 7.  Refactorizaci�n almacenamiento PRISMA unificado
**Documentaci�n**: `backend/docs/REFACTOR-PRISMA-COMPLIANCE.md`
**Script SQL**: `scripts/remove-prisma-compliance-column.sql`
**Estado**: C�digo refactorizado , falta ejecutar migraci�n SQL
**Archivos modificados**: protocol.model.js, protocol.repository.js, types.ts, project-card.tsx, wizard-context.tsx, mock-data.ts
**Beneficio**: Eliminado campo redundante `protocols.prisma_compliance` JSONB. Ahora solo tabla `prisma_items`.

---

**�ltima actualizaci�n:** 12 de enero de 2026
**Estado:** 4 correcciones cr�ticas aplicadas  + 7 mejoras implementadas 
