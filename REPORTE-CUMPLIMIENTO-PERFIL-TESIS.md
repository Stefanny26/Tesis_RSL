# 📊 REPORTE DE CUMPLIMIENTO DEL PERFIL DE TESIS

**Fecha de Análisis:** 4 de enero de 2026  
**Proyecto:** Sistema Web para Gestión de Revisiones Sistemáticas con Validación Automatizada mediante IA  
**Estudiantes:** Hernández Buenaño Stefanny Mishel, González Orellana Adriana Pamela  
**Tutor:** Paulo César Galarza Sánchez

---

## 🎯 RESUMEN EJECUTIVO

| Categoría | Estado Global | Completitud |
|-----------|---------------|-------------|
| **Objetivo Específico 1** | ✅ COMPLETO | 100% |
| **Objetivo Específico 2** | ⚠️ PARCIAL | 75% |
| **Marco Teórico** | ✅ DOCUMENTADO | 95% |
| **Metodología** | ⚠️ PARCIAL | 60% |
| **Arquitectura Técnica** | ✅ IMPLEMENTADA | 100% |

**Nivel de cumplimiento general:** **82%** - El sistema está funcional y cumple los objetivos principales, pero requiere completar la evaluación experimental para la tesis.

---

## 📋 ANÁLISIS DETALLADO POR OBJETIVOS

## OBJETIVO ESPECÍFICO 1: Módulo Central de Gestión y Cribado

### **Estado: ✅ COMPLETO (100%)**

### Actividad 1: Diseñar arquitectura del sistema
✅ **CUMPLIDO**
- **Evidencia:**
  - [ARQUITECTURA-SISTEMA.md](docs/ARQUITECTURA-SISTEMA.md) - Diagrama completo con Mermaid
  - Arquitectura de 3 capas implementada: Frontend (Next.js) + Backend (Express) + Database (PostgreSQL)
  - Integración con servicios externos (Google Gemini, OpenAI)
  
### Actividad 2: Implementar gestión de proyectos y PICO
✅ **CUMPLIDO**
- **Evidencia:**
  - [project.controller.js](backend/src/api/controllers/project.controller.js)
  - [protocol.repository.js](backend/src/infrastructure/repositories/protocol.repository.js) - Campos PICO mapeados:
    ```javascript
    population, intervention, comparison, outcomes
    ```
  - [search-query-generator.use-case.js](backend/src/domain/use-cases/search-query-generator.use-case.js) - Generación de cadenas de búsqueda con IA
  - Asistencia por IA implementada con Google Gemini API

### Actividad 3: Carga y procesamiento de referencias
✅ **CUMPLIDO**
- **Evidencia:**
  - [reference.repository.js](backend/src/infrastructure/repositories/reference.repository.js)
  - Soporte para formatos BibTeX y RIS
  - Sistema de detección de duplicados implementado
  - [detect-duplicates.use-case.js](backend/src/domain/use-cases/detect-duplicates.use-case.js)

### Actividad 4: Integrar LLM para cribado semiautomático
✅ **CUMPLIDO**
- **Evidencia:**
  - [EMBEDDINGS-SCREENING.md](docs/EMBEDDINGS-SCREENING.md) - Documentación completa del sistema
  - Dos métodos implementados:
    1. **Embeddings semánticos** con `all-MiniLM-L6-v2` (384 dimensiones)
    2. **Análisis con LLM** (Google Gemini)
  - [screening.controller.js](backend/src/api/controllers/screening.controller.js)
  - [ai.service.js](backend/src/infrastructure/services/ai.service.js) - Servicio unificado de IA
  - Cribado híbrido con similitud de coseno
  - Interfaz de validación por pares
  - Generación de diagrama de flujo PRISMA

---

## OBJETIVO ESPECÍFICO 2: Flujo de Validación PRISMA con IA

### **Estado: ⚠️ PARCIAL (75%)**

### Actividad 1: Interfaz del checklist PRISMA
✅ **CUMPLIDO**
- **Evidencia:**
  - [prisma-item-card.tsx](frontend/components/prisma/prisma-item-card.tsx)
  - [page.tsx](frontend/app/projects/[id]/prisma/page.tsx)
  - Sistema de 27 ítems implementado
  - Filtrado por sección (Título, Abstract, Métodos, etc.)
  - Badges de estado: `automated`, `human`, `hybrid`
  - [GUIA-USUARIO-PRISMA.md](GUIA-USUARIO-PRISMA.md) - Guía completa de usuario

### Actividad 2: Integrar IA como "gatekeeper"
⚠️ **PARCIALMENTE IMPLEMENTADO**
- **Lo que SÍ está:**
  - [prisma.controller.js](backend/src/api/controllers/prisma.controller.js)
  - Campos en base de datos:
    ```sql
    ai_validated BOOLEAN
    ai_suggestions TEXT
    ai_issues JSONB
    ```
  - [generate-prisma-content.use-case.js](backend/src/domain/use-cases/generate-prisma-content.use-case.js) - Generación automática de contenido
  - [GeneratePrismaContextUseCase](backend/src/domain/use-cases/generate-prisma-context.use-case.js) - Contexto para validación

- **Lo que FALTA:**
  - ❌ **Prompts específicos de validación por ítem** (Los prompts actuales son de generación, no de validación tipo APROBADO/RECHAZADO)
  - ❌ **Lógica de aprobación/rechazo** con feedback estructurado
  - ⚠️ **Interfaz de validación** (existe campo `ai_validated` pero no el flujo de gatekeeper)

### Actividad 3: Mecanismo de desbloqueo secuencial
⚠️ **PARCIALMENTE IMPLEMENTADO**
- **Lo que SÍ está:**
  - Campo `prisma_locked` en el modelo de protocolo
  - Campo `fase2_unlocked` para control de fases
  - [protocol.model.js](backend/src/domain/models/protocol.model.js):
    ```javascript
    this.prismaLocked = data.prisma_locked
    this.fase2Unlocked = data.fase2_unlocked
    ```

- **Lo que FALTA:**
  - ❌ **Lógica de desbloqueo secuencial ítem por ítem** (El sistema actual bloquea/desbloquea fases completas, no ítems individuales)
  - ❌ **Validación que requiera aprobación de ítem N-1 para desbloquear ítem N**

### Actividad 4: Sistema de retroalimentación
✅ **PARCIALMENTE IMPLEMENTADO**
- **Lo que SÍ está:**
  - Campo `ai_suggestions` almacena sugerencias textuales
  - [ai-validation-panel.tsx](frontend/components/prisma/ai-validation-panel.tsx) - Panel de validación
  - Sistema de generación de contenido automatizado funcional

- **Lo que FALTA:**
  - ❌ **Retroalimentación estructurada post-validación** (ej. "Este ítem necesita incluir metodología de búsqueda detallada")
  - ⚠️ **Sugerencias de mejora específicas** por tipo de problema detectado

---

## 📚 MARCO TEÓRICO - COBERTURA

### **Estado: ✅ DOCUMENTADO (95%)**

### 2.1 La Investigación Basada en Evidencia y las RSL
✅ **CUBIERTO**
- **Evidencia:**
  - [CAPITULO-III-METODOLOGIA.md](docs/CAPITULO-III-METODOLOGIA.md) - Sección completa sobre RSL
  - Definición del problema en perfil de tesis
  - Justificación de la metodología PRISMA 2020

**Contenido existente:**
- ✅ Definición y propósito de RSL
- ✅ Fases metodológicas (PICO, búsqueda, cribado, extracción)
- ✅ Desafíos del proceso manual (justifica el proyecto)

### 2.2 Estándares para Calidad y Transparencia
✅ **CUBIERTO**
- **Evidencia:**
  - Implementación completa de PRISMA 2020 (27 ítems)
  - [GUIA-USUARIO-PRISMA.md](GUIA-USUARIO-PRISMA.md)
  - Referencias a metodología Cochrane en documentación

**Lo que FALTA para la tesis:**
- ⚠️ **Sección formal comparando Cochrane vs PRISMA** (existe conocimiento pero no documento académico)
- ⚠️ **Análisis de herramientas existentes** (Covidence, Rayyan) - Mencionado en perfil pero no documentado a fondo

### 2.3 Fundamentos de IA para Análisis de Texto
✅ **CUBIERTO**
- **Evidencia:**
  - [EMBEDDINGS-SCREENING.md](docs/EMBEDDINGS-SCREENING.md) - Explicación técnica completa
  - [PROMPTS-Y-REGLAS-IA.md](docs/PROMPTS-Y-REGLAS-IA.md) - Ingeniería de prompts documentada
  - [COMPARACION-EMBEDDINGS-VS-LLM.md](docs/COMPARACION-EMBEDDINGS-VS-LLM.md)

**Contenido existente:**
- ✅ Procesamiento del Lenguaje Natural (PLN)
- ✅ Modelos de Lenguaje Grandes (LLMs) - Gemini y GPT-4o-mini usados
- ✅ Ingeniería de Prompts - 10+ prompts documentados
- ✅ Sentence-Transformers para embeddings
- ✅ Explicación de similitud de coseno

### 2.4 Tecnologías de IA Aplicadas
✅ **CUBIERTO**
- **Evidencia:**
  - Implementación técnica de:
    - `all-MiniLM-L6-v2` (384 dimensiones) para clasificación
    - Google Gemini API para generación y análisis contextual
    - OpenAI API para embeddings alternativos
  - [ai.service.js](backend/src/infrastructure/services/ai.service.js) - Servicio unificado con fallback

**Contenido existente:**
- ✅ Modelos de clasificación para cribado
- ✅ Embeddings semánticos
- ✅ Modelos generativos para asistencia
- ✅ Justificación técnica de cada modelo

---

## 🔬 METODOLOGÍA - CUMPLIMIENTO

### **Estado: ⚠️ PARCIAL (60%)**

### Enfoque de la Investigación
✅ **DEFINIDO**
- Mixto (Cualitativo + Cuantitativo) como se requiere
- Cualitativo: Análisis de requerimientos PRISMA
- Cuantitativo: **PENDIENTE** de implementar completamente

### Alcance
✅ **CUMPLIDO**
- Prototipo funcional desarrollado ✅
- Dos módulos implementados ✅
- Asistencia IA para cadenas de búsqueda ✅
- Procesamiento de BibTeX/RIS ✅
- Validación de 27 ítems PRISMA ⚠️ (estructura sí, gatekeeper parcial)

### Diseño: Design Science Research (DSR)
✅ **ALINEADO**
- **Fase 1 - Identificación del Problema:** ✅ Documentado en perfil
- **Fase 2 - Diseño y Desarrollo:** ✅ Sistema funcional
- **Fase 3 - Demostración (Caso de Uso):** ⚠️ **FALTA DOCUMENTAR**
- **Fase 4 - Evaluación:** ❌ **FALTA IMPLEMENTAR**

### Fuentes de Información
✅ **DEFINIDAS**
- **Fuentes Primarias:**
  - ⚠️ Datos del caso de uso - **Existe pero no documentado formalmente**
  - ❌ Datos de rendimiento del gatekeeper - **NO RECOLECTADO**
  - ✅ Código fuente - Disponible

- **Fuentes Secundarias:**
  - ✅ Artículos científicos sobre RSL, PRISMA, PLN
  - ✅ Documentación oficial PRISMA 2020
  - ✅ Documentación técnica de APIs (Gemini, Sentence-Transformers)

### Procedimiento para Recolección de Datos
❌ **FALTA IMPLEMENTAR**

**Lo que se requiere según el perfil:**
1. **Ejecución de Caso de Uso:**
   - Ejecutar una RSL completa de demostración
   - Registrar: cadena de búsqueda, resultados iniciales, cribado, diagrama PRISMA
   - **Estado:** ⚠️ Sistema puede hacerlo, pero **no hay caso documentado**

2. **Experimento de Validación del Gatekeeper:**
   - Crear dataset de prueba (20 ejemplos buenos + 20 malos de ítems PRISMA)
   - Etiquetar por experto humano (ground truth)
   - Procesar con gatekeeper de IA
   - Registrar predicciones
   - **Estado:** ❌ **NO IMPLEMENTADO** (el gatekeeper no está completo)

### Procesamiento de Datos: Matriz de Confusión
❌ **NO IMPLEMENTADO**

**Lo que se necesita:**
```
                     Realidad
                 Bueno    Malo
Predicción  
  Bueno       VP        FP
  Malo        FN        VN
```

- VP (Verdaderos Positivos): IA aprobó texto bueno ✓
- VN (Verdaderos Negativos): IA rechazó texto malo ✓
- FP (Falsos Positivos): IA aprobó texto malo ✗ (Error Tipo I)
- FN (Falsos Negativos): IA rechazó texto bueno ✗ (Error Tipo II)

**Estado:** ❌ Sin gatekeeper funcional, no se pueden recolectar estos datos

### Técnicas Estadísticas
❌ **NO CALCULADAS**

**Métricas requeridas por el perfil:**
- **Exactitud (Accuracy):** `(VP+VN) / Total`
- **Precisión (Precision):** `VP / (VP+FP)`
- **Sensibilidad (Recall):** `VP / (VP+FN)`
- **Puntuación F1 (F1-Score):** `2 * (Precision * Recall) / (Precision + Recall)`

**Nota:** Existe documentación teórica sobre estas métricas en [PROMPTS-Y-REGLAS-IA.md](docs/PROMPTS-Y-REGLAS-IA.md) líneas 868-888, pero **no hay implementación ni cálculo real**.

---

## 🧪 INSTRUMENTOS DE VALIDACIÓN

### Kit de Validación por Expertos
✅ **PREPARADO**
- **Evidencia:** [KIT-DE-INSTRUMENTOS-DE-VALIDACION.md](docs/KIT-DE-INSTRUMENTOS-DE-VALIDACION.md)
- Fichas de evaluación con escala Likert (1-5)
- Módulos evaluables:
  - P01: Generación de Título
  - P02: Análisis PICO + Matriz
  - P03-P06: Términos, Criterios, Búsqueda
  - P07: Cribado con LLM
  - P08: Cribado con Embeddings
- Formato compatible con Google Forms o formularios físicos

**Estado:** ✅ **Listo para usar** - Solo falta ejecutar las evaluaciones con expertos

---

## 📊 PROPUESTA DE ÍNDICE (CAPÍTULOS) - COBERTURA

### Capítulo I: Introducción y Estado del Arte
**Estado:** ✅ 90% Preparado

**Contenido existente:**
- ✅ 1.1-1.4: Introducción, problema, justificación, objetivos (En perfil de tesis)
- ⚠️ 1.5: Estado del Arte
  - ✅ Herramientas mencionadas (Covidence, Rayyan, RobotReviewer)
  - ❌ **Falta análisis comparativo detallado con evidencia bibliográfica**

### Capítulo II: Marco Teórico
**Estado:** ✅ 95% Documentado (Ver sección Marco Teórico arriba)

**Contenido existente:**
- ✅ 2.1: RSL y desafíos
- ✅ 2.2: Cochrane y PRISMA 2020
- ✅ 2.3: PLN, LLMs, Prompt Engineering
- ✅ 2.4: Tecnologías de IA aplicadas

**Falta:**
- ⚠️ Redacción académica formal (existe documentación técnica, no formato tesis)

### Capítulo III: Metodología
**Estado:** ✅ 80% Documentado

**Contenido existente:**
- ✅ 3.1-3.4: DSR, enfoque mixto, alcance, fases
- ✅ 3.5: Fuentes definidas
- ⚠️ 3.6: Procesamiento y análisis (conceptual, no implementado)

**Lo que está:** [CAPITULO-III-METODOLOGIA.md](docs/CAPITULO-III-METODOLOGIA.md) - 1100+ líneas de contenido

### Capítulo IV: Resultados
**Estado:** ⚠️ 40% Listo

**Contenido existente:**
- ✅ 4.1: Arquitectura documentada ([ARQUITECTURA-SISTEMA.md](docs/ARQUITECTURA-SISTEMA.md))
- ✅ 4.2: Módulo 1 implementado
- ✅ 4.3: Módulo 2 parcialmente implementado
- ❌ 4.4: Evaluación **NO REALIZADA**
- ⚠️ 4.5: Pruebas
  - ✅ Guía de pruebas funcionales ([TESTING-GUIDE.md](docs/TESTING-GUIDE.md))
  - ⚠️ Pruebas de rendimiento (solo conceptuales)
  - ❌ Pruebas de aceptación (no documentadas)

### Capítulo V: Conclusiones
**Estado:** ❌ 0% - No se puede redactar sin resultados experimentales

### Capítulo VI: Referencias
**Estado:** ⚠️ Parcial
- ✅ Referencias técnicas implícitas en código
- ❌ Bibliografía académica formal **no compilada**

### Capítulo VII: Apéndice
**Estado:** ✅ 70% Preparado

**Contenido existente:**
- ✅ Anexo A: Manual de Usuario ([USER-GUIDE.md](docs/USER-GUIDE.md), [GUIA-USUARIO-PRISMA.md](GUIA-USUARIO-PRISMA.md))
- ⚠️ Anexo B: Prompts del Gatekeeper (parcial en [PROMPTS-Y-REGLAS-IA.md](docs/PROMPTS-Y-REGLAS-IA.md))
- ❌ Anexo C: Dataset de validación **no creado**

---

## 🔧 REQUERIMIENTOS TÉCNICOS - CUMPLIMIENTO

### Hardware y Software
✅ **CUMPLIDO**
- Computadora con especificaciones mínimas (i5, 8GB RAM, 256GB SSD) ✅
- APIs de IA:
  - ✅ Google Gemini API (nivel gratuito activo)
  - ✅ OpenAI API (opcional, configurado)
- ✅ Servidor Cloud (Railway/Vercel - desplegables)

### Stack Tecnológico Implementado
✅ **COMPLETO AL 100%**

**Frontend:**
- ✅ Next.js 14.2.x
- ✅ React 19.x
- ✅ TypeScript 5.x
- ✅ shadcn/ui
- ✅ TailwindCSS

**Backend:**
- ✅ Node.js 20.x
- ✅ Express.js
- ✅ PostgreSQL 15.x
- ✅ Passport.js (autenticación)
- ✅ JWT

**IA:**
- ✅ Google Gemini API
- ✅ OpenAI API
- ✅ @xenova/transformers (Sentence-Transformers)
- ✅ all-MiniLM-L6-v2

---

## 📅 CRONOGRAMA - ESTADO

| Mes | Actividades Planificadas | Estado Actual | Faltante |
|-----|-------------------------|---------------|----------|
| **Octubre** | Bibliografía, problema, objetivos, Cap. 1-2 | ✅ COMPLETO | Redacción formal |
| **Noviembre** | Diseño arquitectura, Módulo 1 | ✅ COMPLETO | - |
| **Febrero** | Análisis estadístico, Cap. 4-5, Artículo | ⚠️ EN RIESGO | Evaluación experimental |
| **Marzo** | Revisión integral, formato UDED, defensa | ⏳ PENDIENTE | Todo |

**Análisis:**
- Los meses de desarrollo (Oct-Nov) están completos ✅
- **CRÍTICO:** Febrero 2026 requiere completar evaluación experimental
- Sin métricas cuantitativas, no se puede redactar Cap. IV completo ni Cap. V

---

## 🚨 BRECHAS CRÍTICAS PARA LA TESIS

### 🔴 CRÍTICO - Impiden entregar tesis

1. **Evaluación Experimental del Gatekeeper** (Metodología - Fase 4)
   - ❌ No hay dataset de validación (20 buenos + 20 malos)
   - ❌ No hay ground truth etiquetado por experto
   - ❌ No hay métricas calculadas (Accuracy, Precision, Recall, F1)
   - ❌ No hay matriz de confusión
   - **Impacto:** Sin esto, no cumple metodología cuantitativa del perfil

2. **Caso de Uso Documentado** (Metodología - Fase 3)
   - ⚠️ Sistema funciona, pero no hay RSL de demostración completa documentada
   - ⚠️ No hay diagrama PRISMA final generado y registrado
   - **Impacto:** Sin demostración formal, no se puede validar utilidad

3. **Completar Gatekeeper de Validación PRISMA** (Objetivo 2 - Actividad 2)
   - ❌ Falta lógica de APROBADO/RECHAZADO con feedback estructurado
   - ❌ Falta desbloqueo secuencial ítem por ítem
   - **Impacto:** Funcionalidad central del perfil incompleta

### 🟡 IMPORTANTE - Mejoran calidad de tesis

4. **Estado del Arte Formal** (Capítulo I)
   - ⚠️ Falta análisis comparativo con herramientas existentes
   - ⚠️ Falta revisión bibliográfica sistemática de sistemas similares
   - **Impacto:** Debilita justificación de originalidad

5. **Bibliografía Académica** (Capítulo VI)
   - ❌ No hay lista formal de referencias en formato APA/IEEE
   - ⚠️ Falta integrar citaciones en documentos existentes
   - **Impacto:** No cumple estándares académicos

### 🟢 OPCIONAL - Mejoras adicionales

6. **Artículo Científico** (Producto Acreditable)
   - ❌ No redactado
   - **Nota:** Requiere resultados experimentales primero

7. **Pruebas de Aceptación de Usuario** (Capítulo IV)
   - ⚠️ No formalizadas
   - **Impacto:** Menor, existe guía de pruebas funcionales

---

## ✅ FORTALEZAS DEL PROYECTO

1. **Arquitectura Sólida y Documentada**
   - Código limpio, modular, bien organizado
   - Separación de capas (Controllers, Use Cases, Repositories)
   - Documentación técnica extensa (30+ archivos .md)

2. **Implementación Técnica Avanzada**
   - Uso de embeddings semánticos (estado del arte)
   - Integración de múltiples APIs de IA
   - Sistema híbrido (LLM + Embeddings)

3. **Cobertura PRISMA 2020 Completa**
   - 27 ítems implementados
   - Generación automática de contenido
   - Interfaz de usuario funcional

4. **Innovación Metodológica**
   - Combina validación automática con supervisión humana
   - Enfoque educativo (no solo automatización)

5. **Documentación Abundante**
   - Más de 30 documentos técnicos
   - Guías de usuario completas
   - Instrumentos de validación preparados

---

## 📋 PLAN DE ACCIÓN RECOMENDADO

### Prioridad 1: CRÍTICO (Antes de Feb 2026)

#### Tarea 1.1: Completar Gatekeeper de IA (5-7 días)
**Responsable:** Stefanny/Adriana  
**Entregable:** Endpoint de validación funcional

**Pasos:**
1. Crear endpoint `POST /api/projects/:id/prisma/:itemNumber/validate`
2. Implementar prompts de validación por ítem:
   ```javascript
   PROMPT_VALIDACION_ITEM_1 = `
   Evalúa si el siguiente título cumple con PRISMA 2020 ítem 1:
   - Debe identificarse como revisión sistemática
   - Debe mencionar el tema
   - Debe ser claro y conciso
   
   Título: {{content}}
   
   Responde en JSON:
   {
     "decision": "APROBADO" | "RECHAZADO",
     "score": 0-10,
     "feedback": "Explicación detallada",
     "suggestions": ["Sugerencia 1", "Sugerencia 2"]
   }
   ```
3. Implementar lógica de desbloqueo secuencial en frontend
4. Agregar pruebas unitarias

#### Tarea 1.2: Crear Dataset de Validación (3-4 días)
**Responsable:** Stefanny/Adriana + Tutor  
**Entregable:** Archivo CSV con 40+ ejemplos etiquetados

**Pasos:**
1. Recolectar 20 ejemplos BUENOS de ítems PRISMA de papers reales
2. Crear 20 ejemplos MALOS (deliberadamente deficientes)
3. Etiquetar con tutor (ground truth)
4. Documentar en `dataset-validacion-prisma.csv`:
   ```csv
   item_number,content,label,expert_notes
   1,"Título sin mención de RS",MALO,"Falta identificación"
   1,"Revisión Sistemática de ML en Salud",BUENO,"Cumple todos los criterios"
   ```

#### Tarea 1.3: Ejecutar Experimento y Calcular Métricas (2-3 días)
**Responsable:** Stefanny/Adriana  
**Entregable:** Matriz de confusión + métricas documentadas

**Pasos:**
1. Procesar dataset con gatekeeper
2. Comparar con ground truth
3. Generar matriz de confusión
4. Calcular Accuracy, Precision, Recall, F1-Score
5. Crear visualizaciones (gráficos de barras)
6. Documentar en `RESULTADOS-EVALUACION-GATEKEEPER.md`

#### Tarea 1.4: Ejecutar y Documentar Caso de Uso (2 días)
**Responsable:** Stefanny/Adriana  
**Entregable:** RSL de demostración completa

**Pasos:**
1. Elegir tema sencillo (ej. "Gamificación en educación primaria")
2. Ejecutar protocolo completo en el sistema
3. Registrar screenshots de cada fase
4. Capturar datos:
   - Cadena de búsqueda generada
   - Número de resultados iniciales
   - Resultados tras cribado
   - Diagrama PRISMA final
5. Documentar en `CASO-DE-USO-DEMOSTRACION.md`

### Prioridad 2: IMPORTANTE (Antes de mediados de Feb)

#### Tarea 2.1: Estado del Arte Formal (3-4 días)
**Responsable:** Adriana  
**Entregable:** Sección 1.5 del Capítulo I

**Pasos:**
1. Buscar papers sobre sistemas automatizados de RSL
2. Analizar Covidence, Rayyan, RobotReviewer (características, limitaciones)
3. Crear tabla comparativa
4. Redactar análisis crítico identificando gaps
5. Justificar originalidad del proyecto

#### Tarea 2.2: Compilar Bibliografía (2 días)
**Responsable:** Stefanny  
**Entregable:** `references.bib` + Capítulo VI

**Pasos:**
1. Extraer referencias de documentos existentes
2. Buscar papers citables:
   - PRISMA 2020 (Page et al., 2021)
   - Cochrane Handbook
   - Papers sobre embeddings semánticos
   - Papers sobre LLMs en revisiones sistemáticas
3. Formatear en BibTeX/APA
4. Integrar citaciones en capítulos

### Prioridad 3: OPCIONAL (Después de tener resultados)

#### Tarea 3.1: Redactar Artículo Científico (5-7 días)
**Responsable:** Ambas + Tutor  
**Entregable:** Manuscrito para conferencia/revista

**Estructura sugerida:**
- Abstract
- Introduction (problema + objetivos)
- Related Work (estado del arte)
- Methodology (DSR + arquitectura)
- Results (evaluación experimental)
- Discussion
- Conclusion

---

## 📊 RESUMEN DE BRECHAS POR SECCIÓN

| Sección | Completitud | Crítico Faltante |
|---------|-------------|------------------|
| **Objetivo 1** | 100% ✅ | - |
| **Objetivo 2** | 75% ⚠️ | Gatekeeper completo |
| **Marco Teórico** | 95% ✅ | Redacción formal |
| **Metodología DSR** | 60% ⚠️ | Fase 3 y 4 |
| **Evaluación Experimental** | 0% ❌ | TODO |
| **Caso de Uso** | 20% ⚠️ | Documentación formal |
| **Capítulo I** | 70% ⚠️ | Estado del arte |
| **Capítulo II** | 95% ✅ | Formato académico |
| **Capítulo III** | 80% ✅ | - |
| **Capítulo IV** | 40% ⚠️ | Resultados experimentales |
| **Capítulo V** | 0% ❌ | Requiere Cap. IV |
| **Capítulo VI** | 20% ⚠️ | Bibliografía formal |
| **Capítulo VII** | 70% ✅ | Dataset validación |

---

## 🎯 CONCLUSIONES Y RECOMENDACIONES

### Lo que está EXCELENTE ✨
1. Sistema funcional con arquitectura profesional
2. Implementación técnica avanzada (embeddings + LLMs)
3. Documentación técnica abundante
4. Objetivo 1 cumplido al 100%

### Lo que está EN RIESGO ⚠️
1. **Evaluación experimental inexistente** - Sin esto no hay tesis
2. **Gatekeeper incompleto** - Funcionalidad central del perfil
3. **Falta de datos cuantitativos** - Necesarios para metodología mixta

### Recomendación Final 🎓

**VIABLE con trabajo concentrado en febrero:**
- El sistema base está sólido (80%+ completo)
- Las brechas críticas son alcanzables en 2-3 semanas
- La infraestructura para evaluación ya existe (instrumentos listos)

**Ruta crítica:**
```
Semana 1-2 Feb: Completar gatekeeper + crear dataset + ejecutar experimento
Semana 3 Feb: Documentar resultados + redactar Cap. IV
Semana 4 Feb: Redactar Cap. V + revisar Cap. I-III
Marzo: Formato final + defensa
```

**Riesgo principal:** Si no se completa evaluación experimental en febrero, será difícil defender la tesis en marzo con solo resultados cualitativos.

---

## 📞 CONTACTO PARA DUDAS

**Tutor:** Paulo César Galarza Sánchez  
**Email:** pcgalarza@espe.edu.ec  
**Teléfono:** 0980228166

**Estudiantes:**
- Stefanny Hernández: smhernandez2@espe.edu.ec / 095 899 0447
- Adriana González: apgonzales1@espe.edu.ec / 098 266 5833

---

**Última actualización:** 4 de enero de 2026  
**Próxima revisión:** Después de completar Tarea 1.1-1.3
