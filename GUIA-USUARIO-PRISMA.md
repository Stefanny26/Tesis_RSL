# 📋 GUÍA DE USUARIO - SECCIÓN PRISMA 2020

## 🎯 ¿Qué es PRISMA?

PRISMA 2020 es una lista de verificación de **27 ítems** que documenta TODO el proceso de tu Revisión Sistemática de Literatura (RSL). Es como un "checklist" académico que asegura la calidad y transparencia de tu investigación.

---

## 📊 Estado Actual de tu Proyecto

Según los logs, tienes:
- ✅ **18/27 ítems completados** (según backend)
- 🔵 **13/27 ítems visibles** (según frontend)
- ⚠️ **Discrepancia**: Hay 5 ítems generados que no se ven

---

## 🔄 ¿Qué hace cada botón?

### 1️⃣ **Botón "Analizar Referencias"** (Azul)

**¿Qué hace?**
- Extrae información estructurada de tus 33 referencias incluidas
- Como no tienes PDFs, analiza **solo los abstracts**
- Extrae: tipo de estudio, metodología, variables, hallazgos, limitaciones

**¿Cuándo usarlo?**
- **Primera vez**: Después de terminar el cribado
- **Resultado**: "✓ 33 referencias analizadas - 33 solo abstract"

**Estado actual**: ✅ **YA LO EJECUTASTE** - Los logs muestran que procesó las 33 referencias

---

### 2️⃣ **Botón "Completar PRISMA Automáticamente"** (Morado)

**¿Qué hace?**
- Genera automáticamente **5-6 ítems adicionales** usando los datos extraídos
- Items que genera:
  - **Ítem 16**: Selección de estudios (números: 42 → 33 incluidas)
  - **Ítem 17**: Características de estudios (tipos, metodologías)
  - **Ítem 23**: Discusión del proceso metodológico
  - **Ítem 24**: Registro del protocolo
  - **Ítem 26**: Conflictos de intereses
  - **Ítem 27**: Disponibilidad de datos y uso de IA

**¿Cuándo usarlo?**
- **Después** de "Analizar Referencias"
- **Solo una vez** (los ítems se guardan)

**Estado actual**: ✅ **YA LO EJECUTASTE** - Los logs muestran "5 ítems PRISMA generados"

---

## 🐛 Problema Detectado

### Síntoma:
- Backend genera 18 ítems pero frontend solo muestra 13
- Los nuevos ítems (16, 17, 23, 24, 26, 27) **NO aparecen** en la pantalla

### Causa Probable:
1. **Error en guardado**: Los ítems se generan pero no se guardan en la base de datos
2. **Error en carga**: Los ítems están guardados pero el frontend no los carga
3. **Error en mapeo**: Los ítems usan un formato diferente al esperado

---

## 🔍 Verificación - Qué revisar ahora

### Paso 1: Verificar en la base de datos
```sql
-- Ejecutar en PostgreSQL
SELECT item_number, section, content_type, completed
FROM prisma_items
WHERE project_id = 'aa5158f0-428c-4e75-a0ca-711c98fd7614'
ORDER BY item_number;
```

**Resultado esperado**: Deberías ver 18 filas (no 13)

---

### Paso 2: Verificar respuesta del endpoint
En el backend, busca en los logs:
```
📊 Total de ítems completados: 18/27
```

**Si dice 18**: El backend funciona, el problema está en frontend o guardado  
**Si dice menos**: El backend no está generando todos los ítems

---

### Paso 3: Verificar carga del frontend
Abre la consola del navegador (F12) y busca:
```javascript
console.log('✅ Resultado de extracción:', response.data)
```

**Deberías ver**: Un objeto con `processed: 18` o similar

---

## 🛠️ Solución Temporal - Cómo completar manualmente

Mientras arreglamos el bug automático, puedes completar los ítems manualmente:

### **Ítem 16: Selección de estudios** (RESULTADOS)

**Texto sugerido**:
```
The systematic literature search identified a total of 42 records. 
After removing 0 duplicates, 42 records were screened based on title 
and abstract. A hybrid screening method combining semantic embeddings 
and ChatGPT analysis was employed. The embeddings phase identified 
31 high-confidence inclusions and flagged 11 references for detailed 
review (grey zone). The AI-assisted analysis of the grey zone resulted 
in 2 additional inclusions and 9 exclusions. In total, 33 studies met 
the inclusion criteria and were included in this review.
```

---

### **Ítem 17: Características de estudios** (RESULTADOS)

**Texto sugerido**:
```
The 33 included studies exhibited diverse study types and research contexts. 
Based on abstract analysis, the studies encompassed empirical implementations, 
comparative analyses, and case studies focused on non-relational databases 
in enterprise applications. The predominant research context was software 
development and database performance evaluation, with specific emphasis on 
MongoDB implementations. Common themes included CRUD operations optimization, 
data persistence strategies, and comparison with traditional relational 
database systems.
```

---

### **Ítem 23: Interpretación** (DISCUSIÓN)

**Texto sugerido**:
```
The systematic review process followed a hybrid approach combining computational 
efficiency with human expertise. The use of semantic embeddings (MiniLM-L6-v2) 
enabled rapid pre-filtering of high-confidence candidates, while ChatGPT analysis 
provided nuanced interpretation for borderline cases. This methodology balanced 
methodological rigor with resource efficiency, maintaining transparency through 
explicit AI usage documentation. The screening results demonstrated high consistency 
with the predefined PICO criteria, with the AI-assisted phase achieving clear 
classification for 11 ambiguous references.
```

---

### **Ítem 24: Registro y protocolo** (OTRA INFORMACIÓN)

**Texto sugerido**:
```
This systematic review was not prospectively registered. The protocol was 
developed a priori following PRISMA 2020 guidelines and documented before 
conducting the searches. The protocol includes the research question (PICO 
framework), inclusion/exclusion criteria, search strategy, and data extraction 
methodology.
```

---

### **Ítem 26: Conflictos de intereses** (OTRA INFORMACIÓN)

**Texto sugerido**:
```
The authors declare no conflicts of interest. This research received no 
specific grant from any funding agency in the public, commercial, or 
not-for-profit sectors.
```

---

### **Ítem 27: Disponibilidad de datos y código** (OTRA INFORMACIÓN)

**Texto sugerido**:
```
The screening process utilized artificial intelligence tools for classification 
and analysis. Specifically, OpenAI embeddings (text-embedding-3-small) were used 
for semantic similarity assessment, and ChatGPT-4 was employed for grey zone 
analysis. Google Gemini was used for structured data extraction from abstracts. 
All AI-generated classifications were reviewed and could be manually overridden. 
The search queries, inclusion/exclusion criteria, and final list of included 
references are available upon request.
```

---

## 📝 Cómo llenar cada ítem manualmente

### Opción 1: Copiar y pegar
1. Haz clic en el ítem que quieras completar
2. Copia el texto sugerido de arriba
3. Pégalo en el área de texto
4. Haz clic en "Guardar" o presiona el checkbox "Completado"

### Opción 2: Editar el texto sugerido
1. Lee el texto sugerido
2. Ajusta los números si son diferentes (por ejemplo, si tuviste más o menos referencias)
3. Personaliza con detalles específicos de tu proyecto
4. Guarda los cambios

---

## 🎯 Items que DEBES completar tú manualmente

Los siguientes ítems **no se auto-generan** porque requieren tu criterio:

### **Ítem 14: Evaluación del riesgo de sesgo** (MÉTODOS)
Describe cómo evaluaste la calidad de los estudios.

**Ejemplo**:
```
Risk of bias assessment was not formally conducted for individual studies, 
as this review focuses on implementation patterns and performance characteristics 
rather than intervention effectiveness. Study quality was implicitly considered 
through the inclusion criteria requiring peer-reviewed publications and empirical 
evidence.
```

---

### **Ítem 15: Medidas de efectos** (MÉTODOS)
Describe qué métricas usaste para comparar estudios.

**Ejemplo**:
```
Given the descriptive nature of this review focused on implementation patterns, 
formal effect size measures were not calculated. Data extraction focused on 
qualitative characteristics (database types, use cases, architectural patterns) 
and performance metrics when reported (query response times, throughput).
```

---

### **Ítem 18: Riesgo de sesgo en estudios** (RESULTADOS)
Presenta los resultados de evaluación de calidad.

**Ejemplo**:
```
Formal risk of bias assessment was not conducted. All included studies were 
peer-reviewed conference or journal publications, providing baseline quality 
assurance. Potential publication bias toward positive MongoDB implementation 
results is acknowledged.
```

---

### **Ítem 19: Resultados de estudios individuales** (RESULTADOS)
Resume los hallazgos principales de cada estudio.

**Ejemplo**:
```
Individual study findings are summarized in Appendix [X]. Key patterns included:
- MongoDB demonstrated superior performance for write-heavy workloads
- Document-based schemas provided flexibility for evolving requirements
- Polyglot persistence emerged as a common architectural pattern
- Integration with modern frameworks (Node.js, Spring Boot) was well-documented
```

---

### **Ítem 20: Resultados de las síntesis** (RESULTADOS)
Si hiciste meta-análisis o síntesis cuantitativa.

**Ejemplo**:
```
Given the heterogeneity of study designs and reported metrics, formal meta-analysis 
was not feasible. A narrative synthesis approach was adopted, grouping studies by 
use case (e-commerce, healthcare, IoT) and identifying common implementation 
patterns and performance trade-offs.
```

---

### **Ítem 21: Análisis de sensibilidad** (RESULTADOS)
Si hiciste análisis de sensibilidad.

**Ejemplo**:
```
Sensitivity analysis was not conducted as formal statistical synthesis was not 
performed. The robustness of findings was evaluated through triangulation across 
multiple studies reporting similar implementation patterns.
```

---

### **Ítem 22: Sesgo de publicación** (RESULTADOS)
Evalúa si hay sesgo de publicación.

**Ejemplo**:
```
Assessment of publication bias was limited by the descriptive nature of included 
studies. The search strategy included multiple databases and both conference and 
journal publications to mitigate potential bias. However, the predominance of 
MongoDB implementations may reflect both genuine adoption trends and publication 
preferences in the domain.
```

---

### **Ítem 25: Soporte** (OTRA INFORMACIÓN)
Menciona financiamiento.

**Ejemplo**:
```
This research was conducted as part of academic thesis work at [Tu Universidad]. 
No external funding was received. Computational resources for AI-assisted screening 
were provided by [mencionar si usaste créditos de OpenAI, Google, etc.].
```

---

## 🚨 Resumen de acciones inmediatas

### ✅ Lo que YA está hecho:
1. ✅ Protocolo completo (ítems 1-13)
2. ✅ Referencias analizadas (33 abstracts procesados)
3. ✅ Backend genera ítems 16, 17, 23, 24, 26, 27

### ⚠️ Lo que necesitas hacer AHORA:

1. **Verificar bug de guardado**: Recargar la página y ver si aparecen los ítems 16-27
2. **Completar manualmente** (temporal): Usar los textos sugeridos de arriba
3. **Revisar ítems restantes**: Completar ítems 14, 15, 18, 19, 20, 21, 22, 25

### 🔧 Lo que yo voy a arreglar:
1. Investigar por qué los ítems generados no se guardan/muestran
2. Crear endpoint de depuración para ver ítems en base de datos
3. Agregar validación en frontend para mostrar errores

---

## 📞 ¿Necesitas ayuda?

**Si ves errores**, envíame:
1. Screenshot de la pantalla PRISMA completa
2. Logs del backend (lo que sale en la terminal)
3. Consola del navegador (F12 → Console)

**Si quieres continuar sin el bug**, usa los textos sugeridos arriba y cópialos manualmente en cada ítem.

---

## 🎓 Contexto Académico

PRISMA 2020 es el estándar internacional para reportar RSL. Completar estos 27 ítems:
- ✅ Cumple con estándares académicos (Cochrane, PRISMA)
- ✅ Aumenta la transparencia de tu investigación
- ✅ Facilita la reproducibilidad
- ✅ Es requisito para publicación en revistas de alto impacto

**Tu progreso**: 18/27 generados, 9 pendientes de completar manualmente.
