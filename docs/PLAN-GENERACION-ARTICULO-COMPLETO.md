# Plan de Implementación: Generación Completa de Artículos Científicos

## 📋 Estado Actual del Sistema

### ✅ Funcionalidades Existentes:
1. **PRISMA Flow Diagram** - Ya implementado
2. **Scree Plot** (distribución de scores de relevancia) - Ya implementado  
3. **Search Strategy Table** - Ya implementado
4. **Generación básica de artículo** (Abstract, Intro, Methods, Results, Discussion)
5. **Template LaTeX** básico

### ❌ Funcionalidades Faltantes:

#### 1. Gráficos Estadísticos Adicionales
- [ ] **Distribución Temporal** (Timeline/Bar Chart)
  - Años de publicación de los estudios incluidos
  - Identificar tendencias y picos
  - Matplotlib/Seaborn
  
- [ ] **Evaluación de Calidad** (Stacked Bar Chart)
  - Criterios de Kitchenham (preguntas de calidad)
  - Visualización de cumplimiento (Sí/No/Parcial)
  - Plotly para barras apiladas  
  
- [ ] **Mapeo de Dimensiones** (Bubble Chart)
  - Correlación entre métricas y herramientas
  - 3 dimensiones: Métrica (X), Herramienta (Y), # Estudios (tamaño)
  - Plotly Express  
  
- [ ] **Síntesis Técnica** (Tablas Comparativas)
  - Datos extraídos de RQS (latencia, throughput, CPU, memoria)
  - Pandas con formato LaTeX/HTML
  - Exportable a CSV/Excel

#### 2. Mejoras en la Estructura del Artículo
- [ ] **Abstract IMRaD** estructurado
  - Introduction (problema)
  - Methods (fuentes y criterios)
  - Results (hallazgos cuantitativos)
  - Discussion (implicaciones)
  
- [ ] **Introducción** con RQs explícitas
  - Lista numerada de preguntas de investigación
  - Derivadas del marco PICO
  
- [ ] **Metodología** detallada
  - Flujo de selección asistida por IA
  - Validación del umbral de corte (Elbow Method)
  - Explicación de cómo se evitaron sesgos algorítmicos
  
- [ ] **Resultados** con redacción automática
  - Interpretación de gráficos (uno por uno)
  - Solo datos objetivos, sin opiniones
  - Referencias a figuras/tablas
  
- [ ] **Discusión** académica
  - Comparación con estudios previos
  - Amenazas a la validez
  - Limitaciones del estudio
  
- [ ] **Conclusiones** estructuradas
  - Respuestas directas a cada RQ
  - Contribución principal (hallazgo clave + métrica)
  - Implicaciones para la práctica (recomendaciones)
  - Trabajos futuros (huecos identificados)

#### 3. Sistema de Exportación Completo
- [ ] **LaTeX (.tex)**
  - Código fuente con secciones estructuradas
  - Llamadas a figuras/tablas (\includegraphics, \ref{})
  - Listo para compilar en Overleaf/Texmaker
  
- [ ] **BibTeX (.bib)**
  - Referencias de estudios incluidos perfectamente formateadas
  - Generación automática desde datos de referencias
  
- [ ] **Gráficos Vectoriales** (PDF/EPS)
  - Alta resolución para revistas Q1
  - Sin pérdida de calidad al ampliar
  
- [ ] **Tablas de Datos** (CSV/Excel)
  - Datos crudos para análisis estadístico adicional
  - Pivotaje de datos si se cambia el enfoque
  
- [ ] **Scripts Python** (.py/.ipynb)
  - Código que generó los gráficos
  - Modificable (colores, etiquetas, fuentes) si el editor lo solicita

---

## 🎯 Plan de Implementación (Fases)

### **FASE 1: Ampliación del Script Python para Gráficos**
**Objetivo:** Generar todos los gráficos estadísticos requeridos

#### Tareas:
1. **Distribución Temporal (temporal_distribution.png)**
   ```python
   def draw_temporal_distribution(data, output_path):
       # Bar chart o line plot de años de publicación
       # data = { years: [2019, 2020, 2021, ...], counts: [2, 5, 8, ...] }
       # Identificar picos y tendencias
   ```

2. **Evaluación de Calidad (quality_assessment.png)**
   ```python
   def draw_quality_assessment(data, output_path):
       # Stacked bar chart con Plotly
       # data = { questions: ["Q1", "Q2", ...], 
       #          yes: [12, 10, ...], no: [2, 4, ...], partial: [1, 1, ...] }
   ```

3. **Mapeo de Dimensiones (bubble_chart.png)**
   ```python
   def draw_bubble_chart(data, output_path):
       # Bubble chart con Plotly Express
       # data = [{ metric: "latency", tool: "Mongoose", studies: 5 }, ...]
   ```

4. **Síntesis Técnica (technical_synthesis.csv/png)**
   ```python
   def generate_technical_table(data, output_path):
       # Tabla comparativa con Pandas
       # data = [{ study: "Smith 2021", tool: "Mongoose", 
       #           latency: 45, throughput: 1200, cpu: 65 }, ...]
   ```

**Archivos a modificar:**
- `backend/scripts/generate_charts.py` (ampliar)
- `backend/src/infrastructure/services/python-graph.service.js` (pasar nuevos datos)

---

### **FASE 2: Extracción de Datos para Gráficos**
**Objetivo:** Obtener los datos necesarios desde la BD para los nuevos gráficos

#### Tareas:
1. **Años de publicación** (desde RQS entries)
   ```sql
   SELECT year, COUNT(*) FROM rqs_entries 
   WHERE project_id = ? GROUP BY year ORDER BY year
   ```

2. **Preguntas de calidad** (desde RQS entries)
   ```sql
   SELECT json_extract(quality_assessment, '$.Q1') as q1_response, ... 
   FROM rqs_entries WHERE project_id = ?
   ```

3. **Métricas técnicas** (desde RQS entries)
   ```sql
   SELECT json_extract(data, '$.metrics') as metrics, 
          json_extract(data, '$.tools') as tools
   FROM rqs_entries WHERE project_id = ?
   ```

**Archivos a modificar:**
- `backend/src/domain/use-cases/generate-article-from-prisma.use-case.js` (agregar queries)

---

### **FASE 3: Redacción Automática de Resultados**
**Objetivo:** Generar interpretaciones textuales de cada gráfico

#### Tareas:
1. **Prompts mejorados para cada gráfico:**
   ```
   - PRISMA: "De un total de X registros identificados, el proceso resultó..."
   - Temporal: "La distribución anual muestra una tendencia ascendente..."
   - Calidad: "El análisis de calidad revela que el 80% de los estudios..."
   - Bubble Chart: "El gráfico evidencia una concentración de estudios en..."
   - Síntesis: "Los datos consolidados muestran que [herramienta] supera..."
   ```

2. **Integración en sección Results:**
   - Párrafo intro
   - Figura 1 + interpretación
   - Figura 2 + interpretación
   - ...
   - Párrafo cierre

**Archivos a modificar:**
- `backend/src/domain/use-cases/generate-article-from-prisma.use-case.js` (método `generateProfessionalResults`)

---

### **FASE 4: Conclusiones Estructuradas**
**Objetivo:** Generar conclusiones académicas rigurosas siguiendo formato estandarizado

#### Tareas:
1. **Prompt mejorado para conclusiones:**
   ```plaintext
   Generate a structured Conclusions section (500-800 words) with these MANDATORY subsections:
   
   1. Answers to Research Questions (RQs):
      For each RQ stated in the Introduction, provide a direct, quantitative answer.
      Example: "RQ1: Which techniques are most applied? Answer: X% of studies use Y..."
   
   2. Main Contribution:
      State the single most significant technical finding with exact metrics.
      Example: "This review establishes that [Tool A] reduces latency by 22% compared to [Tool B]..."
   
   3. Implications for Practice:
      Provide actionable recommendations for software engineers.
      Example: "Engineers should prefer [Tool] when [condition], as evidenced by..."
   
   4. Future Work:
      Identify research gaps from the bubble chart analysis.
      Example: "No studies examined memory consumption in microservices architectures..."
   ```

**Archivos a modificar:**
- `backend/src/domain/use-cases/generate-article-from-prisma.use-case.js` (método `generateProfessionalConclusions`)

---

### **FASE 5: Exportación de Activos**
**Objetivo:** Permitir descarga de todos los formatos requeridos

#### Tareas:
1. **Endpoint: GET /api/projects/:id/article/export/latex**
   ```javascript
   async exportLatex(req, res) {
     const article = await getArticleData(projectId);
     const latex = latexTemplate.generate(article);
     res.setHeader('Content-Type', 'application/x-latex');
     res.setHeader('Content-Disposition', 'attachment; filename="article.tex"');
     res.send(latex);
   }
   ```

2. **Endpoint: GET /api/projects/:id/article/export/bibtex**
   ```javascript
   async exportBibtex(req, res) {
     const references = await getIncludedStudies(projectId);
     const bibtex = generateBibtex(references);
     res.setHeader('Content-Type', 'application/x-bibtex');
     res.send(bibtex);
   }
   ```

3. **Endpoint: GET /api/projects/:id/article/export/charts-pdf**
   ```javascript
   async exportChartsPDF(req, res) {
     // Convertir PNG a PDF vectorial o regenerar desde Python
     const zip = await createZipWithCharts(projectId);
     res.send(zip);
   }
   ```

4. **Endpoint: GET /api/projects/:id/article/export/data-csv**
   ```javascript
   async exportRQSData(req, res) {
     const rqsData = await getRQSEntries(projectId);
     const csv = generateCSV(rqsData);
     res.setHeader('Content-Type', 'text/csv');
     res.send(csv);
   }
   ```

5. **Endpoint: GET /api/projects/:id/article/export/scripts**
   ```javascript
   async exportPythonScripts(req, res) {
     // Copiar generate_charts.py + notebook ejemplo
     const zip = await createZipWithScripts();
     res.send(zip);
   }
   ```

**Archivos a crear/modificar:**
- `backend/src/api/controllers/article.controller.js` (nuevos métodos)
- `backend/src/api/routes/article.routes.js` (nuevas rutas)
- `backend/templates/article-latex.template.js` (mejorar)
- `backend/src/domain/use-cases/export-bibtex.use-case.js` (nuevo)

---

### **FASE 6: Interfaz de Descarga en Frontend**
**Objetivo:** Botones de descarga para todos los activos

#### Tareas:
1. **Panel de Exportación en ArticlePage:**
   ```tsx
   <Card>
     <CardHeader>
       <CardTitle>📥 Descargar Activos del Artículo</CardTitle>
     </CardHeader>
     <CardContent>
       <div className="grid grid-cols-2 gap-3">
         <Button onClick={downloadLatex}>LaTeX (.tex)</Button>
         <Button onClick={downloadBibtex}>BibTeX (.bib)</Button>
         <Button onClick={downloadChartsPDF}>Gráficos (PDF)</Button>
         <Button onClick={downloadDataCSV}>Datos (CSV)</Button>
         <Button onClick={downloadScripts}>Scripts Python</Button>
         <Button onClick={downloadAll}>Descargar Todo (ZIP)</Button>
       </div>
     </CardContent>
   </Card>
   ```

**Archivos a modificar:**
- `frontend/app/projects/[id]/article/page.tsx`
- `frontend/lib/api-client.ts` (nuevos métodos)

---

## 📊 Resumen de Archivos a Crear/Modificar

### Backend:
1. `backend/scripts/generate_charts.py` - ⚡ AMPLIAR (4 nuevas funciones)
2. `backend/src/infrastructure/services/python-graph.service.js` - ⚡ AMPLIAR
3. `backend/src/domain/use-cases/generate-article-from-prisma.use-case.js` - ⚡ AMPLIAR
4. `backend/src/api/controllers/article.controller.js` - ⚡ AMPLIAR (5 nuevos endpoints)
5. `backend/src/api/routes/article.routes.js` - ⚡ AMPLIAR
6. `backend/templates/article-latex.template.js` - ⚡ MEJORAR
7. `backend/src/domain/use-cases/export-bibtex.use-case.js` - 🆕 CREAR

### Frontend:
1. `frontend/app/projects/[id]/article/page.tsx` - ⚡ AMPLIAR (panel de exportación)
2. `frontend/lib/api-client.ts` - ⚡ AMPLIAR (5 nuevos métodos)
3. `frontend/components/article/export-panel.tsx` - 🆕 CREAR

---

## ⏱️ Estimación de Tiempo

| Fase | Descripción | Tiempo Estimado |
|------|-------------|-----------------|
| 1 | Ampliación Script Python (4 gráficos) | 6-8 horas |
| 2 | Extracción de datos desde BD | 2-3 horas |
| 3 | Redacción automática de resultados | 4-5 horas |
| 4 | Conclusiones estructuradas | 2-3 horas |
| 5 | Exportación de activos (5 endpoints) | 5-6 horas |
| 6 | Interfaz frontend | 2-3 horas |
| **TOTAL** | | **21-28 horas** |

---

## 🚀 Próximos Pasos Inmediatos

### Opción A: Implementación Completa (Todo de una vez)
- Ventaja: Funcionalidad completa al final
- Desventaja: Requiere 20+ horas de trabajo continuo
- Recomendado si: Tienes un deadline cercano y necesitas todo YA

### Opción B: Implementación Incremental (Fase por fase)
- Ventaja: Iteraciones más cortas, pruebas incrementales
- Desventaja: Funcionalidad parcial al inicio
- Recomendado si: Prefieres ir validando con tu docente paso a paso

---

## 💡 Recomendación

Sugiero empezar con **FASE 1 + FASE 2** (Gráficos estadísticos) porque:
1. Son los más visibles y apreciados por docentes
2. Demuestran rigor metodológico
3. Las demás fases dependen de estos datos

Una vez tengas los 4 gráficos nuevos funcionando, podemos continuar con las fases 3-6.

**¿Te parece bien este plan? ¿Quieres que empiece con la Fase 1 (gráficos) o prefieres otro enfoque?**
