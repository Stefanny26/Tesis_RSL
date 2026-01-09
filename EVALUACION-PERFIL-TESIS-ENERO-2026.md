# 🎓 EVALUACIÓN COMPLETA DEL PERFIL DE TESIS
## Sistema Web para Gestión de RSL con Validación IA

**Fecha de Evaluación:** 8 de enero de 2026  
**Defensa:** 23-26 de febrero de 2026 (⏰ **5 semanas restantes**)  
**Evaluador:** Experto en Revisión de Tesis  
**Estudiantes:** Hernández Buenaño Stefanny Mishel, González Orellana Adriana Pamela

---

## 📊 RESUMEN EJECUTIVO

| Sección del Perfil | Estado | Completitud | Prioridad |
|---------------------|--------|-------------|-----------|
| **1. Antecedentes y Resumen** | ✅ CUMPLE | 100% | - |
| **2. Problema y Justificación** | ✅ CUMPLE | 100% | - |
| **3. Objetivos (2 obj. esp.)** | ✅ CUMPLE | 100% | - |
| **4. Marco Teórico** | ✅ CUMPLE | 100% | - |
| **5. Metodología DSR** | ⚠️ PARCIAL | 60% | 🔴 CRÍTICA |
| **6. Productos Acreditables** | ⚠️ PARCIAL | 70% | 🔴 CRÍTICA |
| **7. Índice de Capítulos** | ⚠️ PENDIENTE | 30% | 🔴 CRÍTICA |

### ⚡ ESTADO GLOBAL: **75% COMPLETO**

**Veredicto:** El sistema está 100% funcional y cumple todos los objetivos técnicos, pero **FALTA la documentación formal de la tesis** (Capítulos I-VI en LaTeX) y la **evaluación experimental cuantitativa** (experimento de validación del gatekeeper con métricas).

---

## 🔍 ANÁLISIS DETALLADO SECCIÓN POR SECCIÓN

---

## SECCIÓN 1: ANTECEDENTES Y RESUMEN DEL TIC

### ✅ ESTADO: CUMPLE (100%)

**Lo que dice el perfil:**
> "El sistema se estructura en dos módulos principales:
> 1. Planificación y gestión del proyecto con asistente IA para cadenas de búsqueda, importación y cribado con LLM local
> 2. Validación secuencial (gatekeeper) de los 27 ítems PRISMA con IA"

### ✅ EVIDENCIA DE CUMPLIMIENTO:

#### Módulo 1: ✅ IMPLEMENTADO
- [backend/src/api/controllers/project.controller.js](backend/src/api/controllers/project.controller.js) - Gestión completa de proyectos
- [backend/src/domain/use-cases/search-query-generator.use-case.js](backend/src/domain/use-cases/search-query-generator.use-case.js) - Asistente IA para búsquedas
- [backend/src/infrastructure/services/ai.service.js](backend/src/infrastructure/services/ai.service.js) - Servicio de IA unificado
- [backend/src/domain/use-cases/screen-with-llm.use-case.js](backend/src/domain/use-cases/screen-with-llm.use-case.js) - Cribado con LLM
- Formatos soportados: BibTeX, RIS, CSV

#### Módulo 2: ✅ IMPLEMENTADO
- [backend/src/config/prisma-validation-prompts.js](backend/src/config/prisma-validation-prompts.js) - **27/27 ítems PRISMA completos**
- [backend/src/api/controllers/prisma.controller.js](backend/src/api/controllers/prisma.controller.js) - Endpoint `validateWithAI()` funcional
- Sistema de validación con:
  - Decisión: `APROBADO`, `NECESITA_MEJORAS`, `RECHAZADO`
  - Score numérico (0-100%)
  - Reasoning (explicación)
  - Issues detectados
  - Suggestions de mejora
  - Checklist de criterios

### 📄 DOCUMENTACIÓN:
- ✅ [docs/ANEXO-A-MANUAL-USUARIO.md](docs/ANEXO-A-MANUAL-USUARIO.md)
- ✅ [docs/ANEXO-B-PROMPTS-GATEKEEPER.md](docs/ANEXO-B-PROMPTS-GATEKEEPER.md)
- ✅ [docs/ARQUITECTURA-SISTEMA.md](docs/ARQUITECTURA-SISTEMA.md)

### ✅ CONCLUSIÓN: NO REQUIERE ACCIÓN

---

## SECCIÓN 2: PROBLEMA Y JUSTIFICACIÓN

### ✅ ESTADO: CUMPLE (100%)

**Lo que dice el perfil:**
> "Problema: Ejecución manual de RSL es compleja y propensa a errores. Hasta 60% de revisiones tienen deficiencias metodológicas.
> Justificación: Automatización puede reducir errores, garantizar cumplimiento PRISMA, acelerar el proceso."

### ✅ EVIDENCIA DE SOLUCIÓN:

#### ✅ Reducir errores humanos en cribado:
- Sistema de detección automática de duplicados
- Validación IA de inclusión/exclusión
- Sistema de doble ciego (dos revisores independientes)

#### ✅ Garantizar cumplimiento PRISMA:
- **27 ítems PRISMA validados automáticamente**
- Sistema de "gatekeeper" que NO permite avanzar sin aprobación
- Feedback inmediato con issues y sugerencias

#### ✅ Acelerar proceso:
- Importación masiva de referencias (BibTeX/RIS)
- Screening asistido por IA (vs manual 100%)
- Generación automática de cadenas de búsqueda
- Generación automática de contenido PRISMA

#### ✅ Democratizar acceso:
- Sistema web gratuito (nivel free tier)
- Sin requerir experiencia especializada
- Interfaz intuitiva con guías paso a paso

### ✅ CONCLUSIÓN: EL SISTEMA RESUELVE EL PROBLEMA PLANTEADO

---

## SECCIÓN 3: OBJETIVOS Y ACTIVIDADES

### ✅ ESTADO: CUMPLE (100% implementación técnica)

---

### OBJETIVO GENERAL
> "Desarrollar un prototipo funcional de una plataforma web que optimice la planificación y el cribado de una RSL y valide el cumplimiento del estándar PRISMA mediante un flujo de trabajo guiado por IA."

### ✅ CUMPLIMIENTO: PROTOTIPO FUNCIONAL COMPLETO
- ✅ Plataforma web desplegable (Next.js + Node.js)
- ✅ Optimiza planificación (asistente PICO, generador de búsquedas)
- ✅ Optimiza cribado (screening con IA + embeddings)
- ✅ Valida PRISMA (27 ítems con gatekeeper IA)
- ✅ Flujo guiado paso a paso

---

### OBJETIVO ESPECÍFICO 1
> "Desarrollo del Módulo Central para la Gestión del Proceso de Revisión y Cribado de Estudios"

#### Actividad 1.1: Diseñar arquitectura del sistema
**✅ COMPLETADO AL 100%**
- ✅ Arquitectura de 3 capas documentada ([ARQUITECTURA-SISTEMA.md](docs/ARQUITECTURA-SISTEMA.md))
- ✅ Base de datos diseñada (11 tablas, [database-diagram.dbml](database-diagram.dbml))
- ✅ Interfaz de usuario implementada (Next.js + shadcn/ui)
- ✅ Diagramas Mermaid de arquitectura

#### Actividad 1.2: Gestión de proyectos con PICO y asistencia IA
**✅ COMPLETADO AL 100%**
- ✅ [project.controller.js](backend/src/api/controllers/project.controller.js) - CRUD completo
- ✅ Tabla `protocols` con campos PICO:
  ```sql
  population TEXT
  intervention TEXT
  comparison TEXT
  outcomes TEXT
  ```
- ✅ [search-query-generator.use-case.js](backend/src/domain/use-cases/search-query-generator.use-case.js) - Generación con OpenAI (¡NO Gemini!)
- ✅ Cadenas optimizadas para 8 bases de datos (Scopus, IEEE, WoS, PubMed, ACM, etc.)

#### Actividad 1.3: Carga y procesamiento de referencias
**✅ COMPLETADO AL 100%**
- ✅ [reference.repository.js](backend/src/infrastructure/repositories/reference.repository.js)
- ✅ Parsers BibTeX y RIS implementados
- ✅ [detect-duplicates.use-case.js](backend/src/domain/use-cases/detect-duplicates.use-case.js)
- ✅ Algoritmos de similitud (título, DOI, autores)

#### Actividad 1.4: LLM para cribado semiautomático
**✅ COMPLETADO AL 100%**
- ✅ [screen-with-llm.use-case.js](backend/src/domain/use-cases/screen-with-llm.use-case.js)
- ✅ Embeddings con `all-MiniLM-L6-v2` (local, open-source)
- ✅ pgvector para búsqueda de similitud
- ✅ [screening.controller.js](backend/src/api/controllers/screening.controller.js) - Endpoints de cribado
- ✅ Interfaz de validación por pares
- ✅ Generación de diagrama PRISMA flow

**📊 RESULTADO OBJ. ESP. 1: ✅ 100% COMPLETADO**

---

### OBJETIVO ESPECÍFICO 2
> "Implementación del Flujo de Trabajo Guiado por IA para la Validación Secuencial de los Ítems PRISMA"

#### Actividad 2.1: Interfaz del checklist interactivo
**✅ COMPLETADO AL 100%**
- ✅ [frontend/components/prisma/prisma-item-card.tsx](frontend/components/prisma/prisma-item-card.tsx)
- ✅ [frontend/app/projects/[id]/prisma/page.tsx](frontend/app/projects/[id]/prisma/page.tsx)
- ✅ 27 ítems PRISMA estructurados por secciones:
  - Título (1 ítem)
  - Resumen (2 ítems)
  - Introducción (3 ítems)
  - Métodos (13 ítems)
  - Resultados (7 ítems)
  - Discusión (1 ítem)
  - Otra información (4 ítems)
- ✅ Filtrado dinámico por sección
- ✅ Estados visuales (completado, en progreso, pendiente)

#### Actividad 2.2: Integración API IA como gatekeeper
**✅ COMPLETADO AL 100%**
- ✅ [backend/src/config/prisma-validation-prompts.js](backend/src/config/prisma-validation-prompts.js) - **1701 líneas, 27/27 ítems**
- ✅ Cada ítem tiene:
  - `prismaCriteria`: Criterios oficiales PRISMA 2020
  - `systemPrompt`: Instrucciones para la IA
  - `validationTemplate`: Prompt estructurado
  - `minScore`: Puntaje mínimo (70-75%)
  - `evaluationGuide`: Rúbrica de evaluación
- ✅ Provider configurado para **OpenAI ChatGPT** (línea 353 en prisma.controller.js)
- ✅ Formato de respuesta JSON estructurado

#### Actividad 2.3: Lógica de desbloqueo secuencial
**✅ COMPLETADO AL 100%**
- ✅ [backend/src/api/controllers/prisma.controller.js](backend/src/api/controllers/prisma.controller.js) - Método `validateWithAI()`
- ✅ Base de datos con campos:
  ```sql
  ai_validated BOOLEAN
  ai_decision TEXT (APROBADO/NECESITA_MEJORAS/RECHAZADO)
  ai_score NUMERIC
  ai_reasoning TEXT
  ai_issues JSONB
  ai_suggestions JSONB
  locked BOOLEAN -- Desbloqueo secuencial
  ```
- ✅ Lógica: NO se puede avanzar sin `APROBADO`

#### Actividad 2.4: Sistema de retroalimentación
**✅ COMPLETADO AL 100%**
- ✅ Respuesta estructurada con:
  - **Reasoning:** Explicación de la decisión
  - **Issues:** Lista de problemas detectados
  - **Suggestions:** Recomendaciones específicas
  - **CriteriaChecklist:** Evaluación por criterio
- ✅ [generate-prisma-content.use-case.js](backend/src/domain/use-cases/generate-prisma-content.use-case.js) - Sugerencias textuales

**📊 RESULTADO OBJ. ESP. 2: ✅ 100% COMPLETADO**

---

## SECCIÓN 4: MARCO TEÓRICO

### ✅ ESTADO: CUMPLE (100% de tecnologías implementadas)

**Lo que dice el perfil:**

| Concepto | Estado | Evidencia |
|----------|--------|-----------|
| 2.1.1 RSL: Definición y Propósito | ✅ | Sistema completo de RSL implementado |
| 2.1.2 Fases de RSL (PICO, búsqueda, cribado) | ✅ | Workflow completo: planificación → búsqueda → cribado → extracción |
| 2.1.3 Desafíos del proceso manual | ✅ | Sistema automatiza: duplicados, cribado, validación PRISMA |
| 2.2.1 Metodología Cochrane | ✅ | Sistema sigue principios Cochrane (validación, reproducibilidad) |
| 2.2.2 Estándar PRISMA 2020 (27 ítems) | ✅ | **27/27 ítems implementados y validados** |
| 2.2.3 Herramientas existentes (Covidence, Rayyan) | ✅ | Sistema competidor con ventaja: gatekeeper IA |
| 2.3.1 PLN | ✅ | Embeddings, análisis semántico, clasificación |
| 2.3.2 LLMs | ✅ | OpenAI GPT-4/3.5-turbo integrado |
| 2.3.3 Prompt Engineering | ✅ | [PROMPTS-Y-REGLAS-IA.md](docs/PROMPTS-Y-REGLAS-IA.md) |
| 2.4.1 Embeddings (MiniLM-L6-v2) | ✅ | Implementado para cribado local |
| 2.4.2 LLMs generativos (Gemini) | ⚠️ | **NOTA:** Sistema usa OpenAI, no Gemini (actualizar marco teórico) |

### ⚠️ ACCIÓN REQUERIDA:
**ACTUALIZAR Sección 2.4.2 del marco teórico:** Cambiar referencias de "Gemini" por "OpenAI GPT-4" o "ChatGPT". El sistema NO usa Gemini, solo OpenAI.

---

## SECCIÓN 5: METODOLOGÍA (DSR)

### ⚠️ ESTADO: PARCIAL (60%)

**Lo que dice el perfil:**
> "Diseño de Investigación basado en DSR (Design Science Research):
> - Fase 1: Identificación del Problema ✅
> - Fase 2: Diseño y Desarrollo del Artefacto ✅
> - Fase 3: Demostración (Caso de Uso) ❌
> - Fase 4: Evaluación (Experimento + Métricas) ❌"

---

### Fase 1: Identificación del Problema
**✅ COMPLETADO**
- Análisis de complejidad de RSL
- Justificación documentada
- Gap analysis de herramientas existentes

### Fase 2: Diseño y Desarrollo
**✅ COMPLETADO**
- Artefacto tecnológico funcional (plataforma web)
- Arquitectura documentada
- Código fuente completo en GitHub/repositorio

### Fase 3: Demostración (Caso de Uso)
**❌ PENDIENTE (CRÍTICO)**

**Lo que dice el perfil:**
> "Se utilizará el prototipo para ejecutar una RSL completa sobre un tema específico del área de TI. Esto servirá para demostrar la utilidad."

**🔴 FALTA:**
1. Ejecutar una RSL real de demostración (tema: ej. "Aplicaciones de IA en Educación Superior")
2. Documentar:
   - Pregunta de investigación (PICO)
   - Cadenas de búsqueda generadas
   - Resultados de búsqueda (ej. 500 artículos iniciales)
   - Proceso de cribado (ej. 450 excluidos por título, 30 por abstract, 20 aceptados)
   - Diagrama de flujo PRISMA generado
   - Validación de los 27 ítems PRISMA
3. Capturar pantallas del proceso

**⏰ TIEMPO ESTIMADO:** 1-2 semanas (URGENTE)

### Fase 4: Evaluación (Experimento Cuantitativo)
**❌ PENDIENTE (CRÍTICO)**

**Lo que dice el perfil:**
> "Fuentes Primarias: Datos de Rendimiento de la IA - Las respuestas del gatekeeper al ser probada con un conjunto de datos de control.
> Procedimiento: Experimento de Validación del Gatekeeper:
> - Dataset de prueba: 20 ejemplos buenos + 20 malos para ítems PRISMA
> - Experto humano etiqueta (ground truth)
> - Procesar dataset con gatekeeper IA
> - Registrar predicciones
> Técnicas Estadísticas: Matriz de Confusión + Accuracy, Precision, Recall, F1-Score"

**🔴 FALTA:**

#### 4.1. Crear Dataset de Validación
**Ya existe estructura:** [docs/ANEXO-C-DATASET-VALIDACION.md](docs/ANEXO-C-DATASET-VALIDACION.md)

**Pendiente:**
- Recolectar 40 ejemplos reales (20 buenos + 20 malos) por cada ítem o por bloques representativos
- Formato sugerido:
  ```json
  {
    "item_number": 1,
    "content": "Revisión Sistemática sobre IA en Educación Superior",
    "ground_truth": "APROBADO",
    "expert_reasoning": "Identifica como RS, tema claro"
  }
  ```

#### 4.2. Ejecutar Experimento
1. Procesar dataset con `validateWithAI()` endpoint
2. Guardar predicciones:
   ```json
   {
     "ai_decision": "APROBADO",
     "ai_score": 92,
     "ai_reasoning": "..."
   }
   ```
3. Comparar con ground truth

#### 4.3. Calcular Métricas
```javascript
// Matriz de Confusión
VP = correct "APROBADO"
VN = correct "RECHAZADO"
FP = wrong "APROBADO" (debía ser RECHAZADO)
FN = wrong "RECHAZADO" (debía ser APROBADO)

// Métricas
Accuracy = (VP + VN) / Total
Precision = VP / (VP + FP)
Recall = VP / (VP + FN)
F1-Score = 2 * (Precision * Recall) / (Precision + Recall)
```

**⏰ TIEMPO ESTIMADO:** 1 semana (después del caso de uso)

---

### 📋 Encuesta de Validación de Usuarios
**✅ YA CREADO:**
- [docs/ENCUESTA-VALIDACION-SISTEMA.md](docs/ENCUESTA-VALIDACION-SISTEMA.md)
- [docs/GUIA-GOOGLE-FORMS.md](docs/GUIA-GOOGLE-FORMS.md)
- Incluye SUS (System Usability Scale) y NPS

**⚠️ PENDIENTE:**
1. Crear Google Forms siguiendo la guía
2. Reclutar 30-50 participantes (investigadores/estudiantes familiarizados con PRISMA)
3. Recolectar respuestas (2-3 semanas)
4. Analizar resultados (SUS Score, NPS, feedback cualitativo)

**⏰ TIEMPO ESTIMADO:** 3 semanas (puede correr en paralelo)

---

## SECCIÓN 6: PRODUCTOS ACREDITABLES

### Estado de Productos

| Producto | Estado | Evidencia |
|----------|--------|-----------|
| **1. Prototipo Funcional** | ✅ 100% | Sistema completo desplegable |
| **2. Informes de TIC** | ⚠️ 30% | Solo documentación técnica en .md, **falta LaTeX formal** |
| **3. Dataset y Resultados Experimentales** | ❌ 0% | **Pendiente experimento de validación** |
| **4. Artículo Científico (borrador)** | ❌ 0% | **Pendiente redacción** |

---

### Producto 1: Prototipo Funcional ✅
**COMPLETADO AL 100%**

Evidencia:
- Backend: Node.js 20 + Express + PostgreSQL 15
- Frontend: Next.js 14 + React 19 + TypeScript
- 27 endpoints REST documentados
- Autenticación OAuth (Google)
- Sistema de roles (admin, researcher, reviewer)
- Desplegable en Render.com / Vercel (instrucciones en [INSTRUCCIONES-MIGRACION-RENDER.md](INSTRUCCIONES-MIGRACION-RENDER.md))

---

### Producto 2: Informes de TIC ⚠️
**PARCIAL (30%)**

**✅ LO QUE TIENEN:**
- Documentación técnica completa en Markdown:
  - [ARQUITECTURA-SISTEMA.md](docs/ARQUITECTURA-SISTEMA.md)
  - [CAPITULO-III-METODOLOGIA.md](docs/CAPITULO-III-METODOLOGIA.md)
  - [USER-GUIDE.md](docs/USER-GUIDE.md)
  - [TESTING-GUIDE.md](docs/TESTING-GUIDE.md)
  - Anexos A, B, C completos

**🔴 LO QUE FALTA:**
- **Documento formal de tesis en LaTeX** (6 capítulos según perfil):
  - ❌ Capítulo I: Introducción y Estado del Arte
  - ❌ Capítulo II: Marco Teórico
  - ⚠️ Capítulo III: Metodología (parcial en .md)
  - ❌ Capítulo IV: Resultados
  - ❌ Capítulo V: Conclusiones
  - ❌ Capítulo VI: Referencias Bibliográficas

**⏰ ACCIÓN REQUERIDA:** Redactar documento LaTeX formal (3-4 semanas)

---

### Producto 3: Dataset y Resultados Experimentales ❌
**PENDIENTE (0%)**

**🔴 FALTA:**
1. Dataset de validación (40 ejemplos etiquetados)
2. Resultados del caso de uso RSL (diagrama PRISMA, métricas)
3. Resultados del experimento de gatekeeper (matriz de confusión, F1-score)
4. Gráficas y tablas para Capítulo IV

**⏰ TIEMPO:** 2 semanas (urgente para Capítulo IV)

---

### Producto 4: Artículo Científico ❌
**PENDIENTE (0%)**

**🔴 ESTRUCTURA TÍPICA:**
1. Abstract (150-250 palabras)
2. Introduction (problema, gap, contribución)
3. Related Work (Covidence, Rayyan, RobotReviewer)
4. Methodology (DSR, arquitectura, gatekeeper IA)
5. Implementation (stack tecnológico, módulos)
6. Evaluation (caso de uso + experimento + métricas)
7. Discussion (limitaciones, comparación)
8. Conclusions and Future Work

**⏰ TIEMPO:** 1-2 semanas (después de tener resultados)

---

## SECCIÓN 7: ÍNDICE DE CAPÍTULOS (TESIS)

### ⚠️ ESTADO: PENDIENTE (30%)

**Lo que dice el perfil:**

| Capítulo | Secciones | Estado | Prioridad |
|----------|-----------|--------|-----------|
| **I: Introducción y Estado del Arte** | 1.1-1.5 (5 secciones) | ❌ 0% | 🔴 ALTA |
| **II: Marco Teórico** | 2.1-2.4 (4 secciones) | ❌ 0% | 🔴 ALTA |
| **III: Metodología** | 3.1-3.6 (6 secciones) | ⚠️ 40% | 🔴 ALTA |
| **IV: Resultados** | 4.1-4.5 (5 secciones) | ❌ 0% | 🔴 CRÍTICA |
| **V: Conclusiones** | 5.1-5.3 (3 secciones) | ❌ 0% | 🟡 MEDIA |
| **VI: Referencias** | Bibliografía | ❌ 0% | 🟡 MEDIA |
| **VII: Apéndices** | Anexos A, B, C | ✅ 100% | - |

### Capítulo III: Metodología ⚠️
**PARCIALMENTE AVANZADO:**
- ✅ Tiene [docs/CAPITULO-III-METODOLOGIA.md](docs/CAPITULO-III-METODOLOGIA.md)
- ⚠️ Pero necesita ampliarse con:
  - Caso de uso detallado
  - Experimento de validación
  - Encuesta de usuarios

### Capítulo IV: Resultados ❌
**CRÍTICO - BLOQUEADO POR:**
- Falta ejecutar caso de uso RSL
- Falta experimento de validación
- Falta encuesta de usuarios

### Capítulo VII: Apéndices ✅
**COMPLETO:**
- ✅ Anexo A: Manual de Usuario
- ✅ Anexo B: Prompts del Gatekeeper (27 ítems)
- ✅ Anexo C: Protocolo de Validación

---

## 🚨 GAPS CRÍTICOS IDENTIFICADOS

### 🔴 PRIORIDAD CRÍTICA (Bloquean defensa)

#### 1. Caso de Uso RSL Completo
**IMPACTO:** Sin esto, NO hay demostración del artefacto (requisito DSR)
**ACCIÓN:**
- Seleccionar tema (ej. "Aplicaciones de Machine Learning en Diagnóstico Médico")
- Ejecutar RSL completa en el sistema:
  1. Crear proyecto
  2. Definir PICO
  3. Generar cadenas de búsqueda con IA
  4. Importar resultados (mínimo 200 referencias)
  5. Realizar cribado (manual + IA)
  6. Validar 27 ítems PRISMA con gatekeeper
  7. Generar diagrama de flujo
- Documentar TODO con pantallas
**TIEMPO:** 1-2 semanas

#### 2. Experimento de Validación del Gatekeeper
**IMPACTO:** Sin métricas cuantitativas, la tesis carece de rigor científico
**ACCIÓN:**
- Crear dataset de 40 ejemplos (20 buenos + 20 malos) para 5-10 ítems representativos
- Etiquetar con experto
- Ejecutar gatekeeper en cada ejemplo
- Calcular Accuracy, Precision, Recall, F1-Score
- Crear matriz de confusión
**TIEMPO:** 1 semana

#### 3. Documento Formal de Tesis (LaTeX)
**IMPACTO:** No se puede defender sin documento formal
**ACCIÓN:**
- Convertir .md existentes a LaTeX
- Redactar Capítulos I, II, IV, V
- Integrar resultados experimentales
- Formato según guía ESPE
**TIEMPO:** 3 semanas

---

### 🟡 PRIORIDAD ALTA (Mejoran calidad)

#### 4. Encuesta de Validación de Usuarios
**IMPACTO:** Valida aceptabilidad del sistema
**ACCIÓN:**
- Crear Google Forms (guía ya existe)
- Reclutar 30-50 participantes
- Analizar SUS Score y NPS
**TIEMPO:** 3 semanas (puede ser paralelo)

#### 5. Artículo Científico
**IMPACTO:** Cumple producto acreditable del perfil
**ACCIÓN:**
- Redactar manuscrito de 6-8 páginas
- Seleccionar conferencia/revista objetivo
**TIEMPO:** 1-2 semanas (después de resultados)

---

## 📅 PLAN DE ACCIÓN URGENTE (5 SEMANAS)

### Semana 1 (8-14 enero): Caso de Uso
- [ ] Seleccionar tema de RSL
- [ ] Ejecutar workflow completo en el sistema
- [ ] Capturar pantallas y evidencias
- [ ] Documentar métricas (artículos procesados, tiempos)

### Semana 2 (15-21 enero): Experimento
- [ ] Crear dataset de validación (40 ejemplos)
- [ ] Ejecutar gatekeeper
- [ ] Calcular métricas (Accuracy, F1-Score)
- [ ] Crear gráficas de resultados

### Semana 3 (22-28 enero): Redacción Capítulos I-III
- [ ] Cap. I: Introducción y Estado del Arte
- [ ] Cap. II: Marco Teórico (actualizar Gemini → OpenAI)
- [ ] Cap. III: Completar Metodología con experimento

### Semana 4 (29 enero - 4 febrero): Redacción Cap. IV-V
- [ ] Cap. IV: Resultados (caso de uso + experimento + gráficas)
- [ ] Cap. V: Conclusiones y Recomendaciones
- [ ] Cap. VI: Referencias (formato IEEE)

### Semana 5 (5-11 febrero): Finalización
- [ ] Revisar formato ESPE
- [ ] Integrar Anexos
- [ ] Crear artículo científico (borrador)
- [ ] Preparar presentación de defensa

### Semana 6 (12-13 febrero): Buffer
- [ ] Revisión con tutor
- [ ] Correcciones finales
- [ ] Empastado y entrega

---

## ✅ FORTALEZAS DEL TRABAJO

1. **Sistema 100% funcional** - Todos los objetivos técnicos cumplidos
2. **Innovación clara** - Gatekeeper IA secuencial es único vs. competidores
3. **27 ítems PRISMA** - Implementación completa y documentada
4. **Stack moderno** - Next.js 14, PostgreSQL 15, OpenAI, pgvector
5. **Documentación técnica excelente** - Arquitectura, guías, anexos completos
6. **Despliegue listo** - Instrucciones para Render.com/Vercel

---

## ⚠️ DEBILIDADES ACTUALES

1. **Falta documento LaTeX formal** - Solo tienen .md técnicos
2. **No hay evaluación experimental** - Sin caso de uso ni métricas
3. **No hay validación de usuarios** - Encuesta creada pero no ejecutada
4. **Marco teórico desactualizado** - Menciona Gemini pero usan OpenAI
5. **Sin artículo científico** - Producto acreditable pendiente

---

## 🎯 RECOMENDACIONES FINALES

### ✅ LO QUE ESTÁ BIEN
- NO cambien el código del sistema (está completo)
- Mantengan la documentación técnica (.md) como está
- Los Anexos A, B, C ya están perfectos

### 🔴 LO QUE DEBEN HACER CON URGENCIA

#### Prioridad 1: EJECUTAR CASO DE USO (Esta semana)
- Seleccionen un tema simple pero real
- Ejecuten TODO el workflow en el sistema
- Tomen pantallas de cada paso
- Esto desbloqueará Capítulo IV

#### Prioridad 2: CREAR DATASET + EXPERIMENTO (Próxima semana)
- No necesitan 40 ejemplos para CADA ítem
- Enfóquense en 5-10 ítems representativos (ej. ítems 1, 2, 5, 8, 10, 16, 23)
- Total: 40-80 ejemplos
- Ejecuten gatekeeper y calculen métricas
- Objetivo: F1-Score > 0.70 (aceptable), > 0.85 (excelente)

#### Prioridad 3: REDACTAR TESIS LATEX (Semanas 3-4)
- Usen plantilla ESPE
- Conviertan .md existentes a LaTeX
- Integren resultados del caso de uso y experimento
- Capítulo IV es el más crítico

#### Prioridad 4: ARTÍCULO CIENTÍFICO (Semana 5)
- Enfóquense en la innovación: gatekeeper IA secuencial
- Comparen con Covidence/Rayyan (tabla comparativa)
- Incluyan métricas del experimento
- Target: Conferencias latinoamericanas (más accesibles) o LACCEI

### 🟢 OPCIONAL (Si tienen tiempo)
- Encuesta de usuarios (bueno tenerla, no crítica para defensa)
- Despliegue en producción (demo en defensa es suficiente)
- Video demo del sistema

---

## 📊 CHECKLIST DE DEFENSA

### Requisitos Mínimos para Defender
- [ ] Documento LaTeX completo (Capítulos I-VI + Anexos)
- [ ] Caso de uso RSL ejecutado con evidencias
- [ ] Experimento de validación con métricas (Accuracy, F1-Score)
- [ ] Sistema funcional (demo en vivo o video)
- [ ] Presentación PowerPoint/Beamer (30-40 slides)

### Documentos Finales
- [ ] Tesis empastada (3 copias físicas típicamente)
- [ ] Tesis en PDF (firmada digitalmente)
- [ ] Artículo científico (borrador mínimo)
- [ ] Código fuente en repositorio (GitHub/GitLab)
- [ ] Manual de usuario y anexos

---

## 🎓 VEREDICTO FINAL

### ESTADO ACTUAL: **75% COMPLETO**

**El sistema está 100% funcional y cumple todos los objetivos técnicos planteados en el perfil.**

**PERO:** Falta la parte formal de la tesis (documento LaTeX) y la validación experimental (caso de uso + métricas).

### PROGNÓSTICO:
- ✅ **Técnicamente:** El trabajo es EXCELENTE
- ⚠️ **Académicamente:** Falta documentación formal (Capítulos I-VI)
- ⚠️ **Científicamente:** Falta validación experimental (métricas)

### PARA DEFENDER EXITOSAMENTE:
1. Ejecutar caso de uso RSL (1-2 semanas)
2. Realizar experimento con métricas (1 semana)
3. Redactar tesis LaTeX (3 semanas)
4. Crear presentación de defensa (3 días)

### ⏰ TIEMPO DISPONIBLE: 5 SEMANAS
**ES AJUSTADO PERO FACTIBLE** si se enfocan en las 3 prioridades críticas.

---

## 📞 PRÓXIMOS PASOS INMEDIATOS

1. **HOY (8 enero):** Seleccionar tema para caso de uso RSL
2. **Esta semana:** Ejecutar workflow completo con capturas
3. **Próxima semana:** Crear dataset y ejecutar experimento
4. **Semanas 3-4:** Redactar tesis LaTeX intensivamente
5. **Semana 5:** Preparar defensa

---

**¿Listo para empezar? Recomiendo comenzar AHORA con el caso de uso. ¿Qué tema de RSL les gustaría usar para la demostración?**

Opciones sugeridas:
- "Aplicaciones de Machine Learning en Diagnóstico Médico"
- "Métodos de Ciberseguridad en IoT"
- "Técnicas de NLP para Análisis de Sentimientos"
- "Frameworks de Desarrollo Web Modernos"

Elijan un tema donde puedan encontrar fácilmente 200-300 artículos en bases como Scopus/IEEE.
