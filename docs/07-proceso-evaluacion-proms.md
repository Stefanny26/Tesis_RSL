# 📋 Proceso de Evaluación y Validación de PROMs

**Sistema de Revisión Sistemática de Literatura**  
**Fecha:** 27 de noviembre de 2025  
**Versión:** 1.0

---

## 📑 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Definición de PROM](#definición-de-prom)
3. [Flujo del Proceso](#flujo-del-proceso)
4. [Diagrama BPMN](#diagrama-bpmn)
5. [Matriz de Evaluación](#matriz-de-evaluación)
6. [Roles y Responsabilidades](#roles-y-responsabilidades)
7. [Implementación en el Sistema](#implementación-en-el-sistema)

---

## 🎯 Introducción

La evaluación de PROMs (Protocol Review Outcome Measures) es un proceso sistemático y estructurado que permite revisar, validar y aprobar cada resultado del protocolo junto con su documentación asociada. Este proceso se modela utilizando **BPMN (Business Process Model and Notation)** para garantizar trazabilidad, control de calidad y cumplimiento de estándares académicos.

### Objetivos del Proceso:

- ✅ Garantizar la calidad y consistencia de cada PROM
- ✅ Establecer un ciclo de revisión y corrección estructurado
- ✅ Mantener trazabilidad documental completa
- ✅ Facilitar auditorías e ingenierías de procesos
- ✅ Automatizar la validación mediante criterios objetivos

---

## 📖 Definición de PROM

**PROM (Protocol Review Outcome Measure)** es un resultado medible y documentado que se genera durante el proceso de Revisión Sistemática de Literatura. En el contexto de este sistema, los PROMs incluyen:

| PROM | Descripción | Documentación Requerida |
|------|-------------|-------------------------|
| **PROM 1** | Protocolo de Investigación | PICO, criterios, términos de búsqueda |
| **PROM 2** | Estrategia de Búsqueda | Cadenas de búsqueda por base de datos |
| **PROM 3** | Resultados de Búsqueda | Número de artículos por BD, exportaciones |
| **PROM 4** | Cribado de Títulos/Resúmenes | Matriz de decisión, justificaciones |
| **PROM 5** | Cribado de Texto Completo | Artículos incluidos/excluidos con razones |
| **PROM 6** | Extracción de Datos | Tablas de datos extraídos |
| **PROM 7** | Síntesis de Evidencia | Análisis cualitativo/cuantitativo |
| **PROM 8** | Checklist PRISMA | 27 ítems validados con evidencia |
| **PROM 9** | Artículo Final | Manuscrito completo RSL |

---

## 🔄 Flujo del Proceso

### Notación del Flujo (Formato Textual)

```
Inicio →
  Tarea: Ingresar PROM →
  Tarea: Adjuntar documentación del PROM →
  Tarea: Revisión del PROM →
  Gateway Exclusivo (X): ¿PROM Aprobado?
    │
    ├── Sí →
    │     Tarea: Validación Final →
    │     Tarea: Registrar como PROM Aprobado →
    │     Gateway: ¿Existen más PROMs? →
    │       ├── Sí → Tarea: Procesar siguiente PROM → Volver a "Ingresar PROM"
    │       └── No → Fin del Proceso
    │
    └── No →
          Tarea: Registrar Observaciones →
          Tarea: Devolver a Responsable →
          Tarea: Corrección del PROM →
          Flujo de retorno → Volver a "Revisión del PROM"
```

### Descripción General del Proceso

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PROCESO: Evaluación de PROMs                     │
└─────────────────────────────────────────────────────────────────────┘

1. INGRESO DEL PROM
   ↓
   Usuario/Analista sube:
   - PROM N (documento/datos)
   - Documentación asociada
   - Metadatos del proceso

2. REVISIÓN INICIAL
   ↓
   Comité/Responsable revisa:
   ✓ Estructura del PROM
   ✓ Consistencia interna
   ✓ Cumplimiento de requisitos
   ✓ Documentación completa
   ✓ Formato y presentación

3. DECISIÓN (Gateway XOR)
   ↓
   ┌─────────────────────┬─────────────────────┐
   │                     │                     │
   ▼                     ▼                     
¿Cumple?              ¿No Cumple?            
   │                     │                     
   │ SÍ                  │ NO                  
   ▼                     ▼                     

4a. VALIDACIÓN FINAL   4b. CORRECCIÓN DEL PROM
    ↓                      ↓
    - Aprobar PROM         - Registrar observaciones
    - Registrar            - Devolver al responsable
    - Archivar             - Modificar según feedback
                           - Reenviar para revisión
                           ↓
                           └──────→ VOLVER A PASO 2

5. CONTINUAR CON SIGUIENTE PROM
   ↓
   Gateway: ¿Existen más PROMs?
   ├── SÍ → PROM N+1 → Repetir proceso desde paso 1
   └── NO → FIN del proceso
```

### Ciclo de Revisión-Corrección

El proceso implementa un **ciclo iterativo** que garantiza la calidad:

```
┌───────────────────────────────────────────────────────────┐
│                   CICLO DE MEJORA                         │
│                                                           │
│  ┌──────────┐                                             │
│  │ INGRESO  │                                             │
│  └────┬─────┘                                             │
│       │                                                   │
│       ▼                                                   │
│  ┌──────────┐     ┌──────────────┐                       │
│  │ REVISIÓN │────→│   ¿CUMPLE?   │                       │
│  └──────────┘     └───┬──────┬───┘                       │
│       ▲               │      │                            │
│       │              SÍ     NO                            │
│       │               │      │                            │
│       │               ▼      ▼                            │
│       │         ┌──────────────────┐                      │
│       │         │   VALIDACIÓN     │                      │
│       │         └──────────────────┘                      │
│       │                                                   │
│       │         ┌──────────────────┐                      │
│       └─────────│   CORRECCIÓN     │                      │
│                 └──────────────────┘                      │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 📊 Diagrama BPMN

### Modelo BPMN Completo (Bizagi Modeler)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EVALUACIÓN Y VALIDACIÓN DE PROMS                     │
│                                                                             │
│  Pool: Sistema RSL                                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Lane: Usuario/Investigador                                             │ │
│  │                                                                        │ │
│  │  ┌─────┐      ┌──────────────────┐      ┌──────────────────┐          │ │
│  │  │ ○   │─────→│  Cargar PROM N   │─────→│  Adjuntar Docs   │──┐       │ │
│  │  └─────┘      └──────────────────┘      └──────────────────┘  │       │ │
│  │  Inicio                                                        │       │ │
│  │                                                                │       │ │
│  │                  ┌──────────────────┐                          │       │ │
│  │            ┌────→│  Corregir PROM   │←────────────────┐       │       │ │
│  │            │     └──────────────────┘                 │       │       │ │
│  │            │              │                           │       │       │ │
│  └────────────┼──────────────┼───────────────────────────┼───────┼───────┘ │
│               │              │                           │       │         │
│  ┌────────────┼──────────────┼───────────────────────────┼───────┼───────┐ │
│  │ Lane: Comité/Revisor      │                           │       │       │ │
│  │                           ▼                           │       │       │ │
│  │            │     ┌──────────────────┐                 │       │       │ │
│  │            │     │  Revisar PROM    │←────────────────┘       │       │ │
│  │            │     │  - Estructura    │                         │       │ │
│  │            │     │  - Consistencia  │                         │       │ │
│  │            │     │  - Requisitos    │                         │       │ │
│  │            │     │  - Documentación │                         │       │ │
│  │            │     └────────┬─────────┘                         │       │ │
│  │            │              │                                   │       │ │
│  │            │              ▼                                   │       │ │
│  │            │     ┌──────────────────┐                         │       │ │
│  │            │     │   ◇ ¿Cumple?     │                         │       │ │
│  │            │     └───┬──────────┬───┘                         │       │ │
│  │            │         │ NO       │ SÍ                          │       │ │
│  │            │         │          │                             │       │ │
│  │            │         ▼          ▼                             │       │ │
│  │            │  ┌──────────┐  ┌──────────────────┐             │       │ │
│  │            │  │ Registrar│  │  Validación      │             │       │ │
│  │            └─→│Observacio│  │  Final           │             │       │ │
│  │               │  nes     │  │  - Aprobar       │             │       │ │
│  │               └──────────┘  │  - Registrar     │             │       │ │
│  │                             │  - Archivar      │             │       │ │
│  │                             └────────┬─────────┘             │       │ │
│  │                                      │                       │       │ │
│  └──────────────────────────────────────┼───────────────────────────────┘ │
│                                         │                                 │
│  ┌──────────────────────────────────────┼───────────────────────────────┐ │
│  │ Lane: Sistema                        │                               │ │
│  │                                      ▼                               │ │
│  │                          ┌──────────────────┐                        │ │
│  │                          │  Actualizar BD   │                        │ │
│  │                          │  - Estado PROM   │                        │ │
│  │                          │  - Trazabilidad  │                        │ │
│  │                          └────────┬─────────┘                        │ │
│  │                                   │                                  │ │
│  │                                   ▼                                  │ │
│  │                          ┌──────────────────┐                        │ │
│  │                          │◇ ¿Hay más PROMs? │                        │ │
│  │                          └───┬──────────┬───┘                        │ │
│  │                              │ SÍ       │ NO                         │ │
│  │                              │          │                            │ │
│  │                              ▼          ▼                            │ │
│  │                    ┌────────────┐   ┌─────┐                         │ │
│  │                    │ Siguiente  │   │  ●  │ Fin                     │ │
│  │                    │ PROM       │   └─────┘                         │ │
│  │                    └─────┬──────┘                                   │ │
│  │                          │                                          │ │
│  │                          └──────────────────────────────────────────┤ │
│  │                                 (loop)                              │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

### Elementos BPMN Utilizados

| Elemento | Símbolo | Descripción |
|----------|---------|-------------|
| **Evento Inicio** | ○ | Inicio del proceso de evaluación |
| **Tarea** | ▭ | Actividad a realizar (Cargar, Revisar, Corregir) |
| **Gateway Exclusivo** | ◇ | Decisión (¿Cumple? / ¿Hay más PROMs?) |
| **Evento Fin** | ● | Fin del proceso |
| **Flujo de Secuencia** | → | Orden de ejecución |
| **Pool** | Contenedor | Representa al Sistema RSL |
| **Lane** | División | Roles: Usuario, Comité, Sistema |

---

## 📝 Matriz de Evaluación

### Matriz de Evaluación de PROMs

La siguiente matriz respalda la trazabilidad del proceso y fortalece la ingeniería de PROMs mediante control documental:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                     MATRIZ DE EVALUACIÓN DE PROMS                         │
├──────┬──────────────┬──────────────┬──────────────┬──────────┬──────────┤
│ ID   │ PROM         │ CRITERIOS    │ CUMPLIMIENTO │ OBSERV.  │ ESTADO   │
├──────┼──────────────┼──────────────┼──────────────┼──────────┼──────────┤
│ P001 │ Protocolo    │ □ Doc.       │ □ Sí  □ No   │          │ □ Aprob. │
│      │ Investigación│   Completa   │              │          │ □ Correc.│
│      │              │ □ PICO       │              │          │ □ Rechaz.│
│      │              │ □ Criterios  │              │          │          │
│      │              │ □ Términos   │              │          │          │
├──────┼──────────────┼──────────────┼──────────────┼──────────┼──────────┤
│ P002 │ Estrategia   │ □ Cadenas    │ □ Sí  □ No   │          │ □ Aprob. │
│      │ de Búsqueda  │   Correctas  │              │          │ □ Correc.│
│      │              │ □ Sintaxis   │              │          │ □ Rechaz.│
│      │              │   Validada   │              │          │          │
│      │              │ □ BDs Config.│              │          │          │
├──────┼──────────────┼──────────────┼──────────────┼──────────┼──────────┤
│ P003 │ Resultados   │ □ # Artículos│ □ Sí  □ No   │          │ □ Aprob. │
│      │ de Búsqueda  │ □ Exportación│              │          │ □ Correc.│
│      │              │ □ Metadatos  │              │          │ □ Rechaz.│
├──────┼──────────────┼──────────────┼──────────────┼──────────┼──────────┤
│ P004 │ Cribado      │ □ Matriz     │ □ Sí  □ No   │          │ □ Aprob. │
│      │ T/R          │   Decisión   │              │          │ □ Correc.│
│      │              │ □ Justif.    │              │          │ □ Rechaz.│
│      │              │ □ Kappa      │              │          │          │
├──────┼──────────────┼──────────────┼──────────────┼──────────┼──────────┤
│ P005 │ Cribado TC   │ □ Artículos  │ □ Sí  □ No   │          │ □ Aprob. │
│      │              │   Incluidos  │              │          │ □ Correc.│
│      │              │ □ Razones    │              │          │ □ Rechaz.│
│      │              │   Exclusión  │              │          │          │
├──────┼──────────────┼──────────────┼──────────────┼──────────┼──────────┤
│ P006 │ Extracción   │ □ Tabla      │ □ Sí  □ No   │          │ □ Aprob. │
│      │ de Datos     │   Completa   │              │          │ □ Correc.│
│      │              │ □ Variables  │              │          │ □ Rechaz.│
│      │              │ □ Validación │              │          │          │
├──────┼──────────────┼──────────────┼──────────────┼──────────┼──────────┤
│ P007 │ Síntesis     │ □ Análisis   │ □ Sí  □ No   │          │ □ Aprob. │
│      │ de Evidencia │ □ Tablas/Fig │              │          │ □ Correc.│
│      │              │ □ Narrativa  │              │          │ □ Rechaz.│
├──────┼──────────────┼──────────────┼──────────────┼──────────┼──────────┤
│ P008 │ PRISMA       │ □ 27 Ítems   │ □ Sí  □ No   │          │ □ Aprob. │
│      │ Checklist    │ □ Evidencia  │              │          │ □ Correc.│
│      │              │ □ Diagrama   │              │          │ □ Rechaz.│
├──────┼──────────────┼──────────────┼──────────────┼──────────┼──────────┤
│ P009 │ Artículo     │ □ Estructura │ □ Sí  □ No   │          │ □ Aprob. │
│      │ Final        │ □ Referencias│              │          │ □ Correc.│
│      │              │ □ Formato    │              │          │ □ Rechaz.│
└──────┴──────────────┴──────────────┴──────────────┴──────────┴──────────┘
```

### Criterios de Evaluación Detallados

#### PROM 1: Protocolo de Investigación

| Criterio | Descripción | Peso |
|----------|-------------|------|
| **Documentación Completa** | Todos los campos obligatorios llenos | 25% |
| **PICO Definido** | Population, Intervention, Comparison, Outcome | 20% |
| **Criterios I/E** | Al menos 3 criterios de inclusión y 3 de exclusión | 20% |
| **Términos de Búsqueda** | Matriz Es/No Es completa | 15% |
| **Consistencia** | No contradicciones entre secciones | 20% |

#### PROM 2: Estrategia de Búsqueda

| Criterio | Descripción | Peso |
|----------|-------------|------|
| **Cadenas Correctas** | Sintaxis válida para cada BD | 30% |
| **Sintaxis Validada** | Sin errores de operadores booleanos | 25% |
| **BDs Configuradas** | Al menos 3 bases de datos seleccionadas | 20% |
| **Cobertura** | Términos cubren PICO completo | 25% |

#### PROM 8: PRISMA Checklist

| Criterio | Descripción | Peso |
|----------|-------------|------|
| **27 Ítems Completos** | Todos los ítems respondidos | 40% |
| **Evidencia Adjunta** | Cada ítem tiene evidencia documental | 30% |
| **Diagrama de Flujo** | PRISMA flow diagram generado | 30% |

---

## 👥 Roles y Responsabilidades

### Matriz RACI

```
┌─────────────────────────┬──────────┬─────────┬──────────┬─────────┐
│ Actividad               │  Usuario │ Comité  │  Sistema │  Admin  │
│                         │ (Invest.)│ Revisor │          │         │
├─────────────────────────┼──────────┼─────────┼──────────┼─────────┤
│ Cargar PROM             │    R     │    I    │    A     │    I    │
├─────────────────────────┼──────────┼─────────┼──────────┼─────────┤
│ Adjuntar Documentación  │    R     │    I    │    A     │    I    │
├─────────────────────────┼──────────┼─────────┼──────────┼─────────┤
│ Revisar PROM            │    I     │    R    │    A     │    I    │
├─────────────────────────┼──────────┼─────────┼──────────┼─────────┤
│ Decidir Cumplimiento    │    I     │    R    │    A     │    C    │
├─────────────────────────┼──────────┼─────────┼──────────┼─────────┤
│ Registrar Observaciones │    I     │    R    │    A     │    I    │
├─────────────────────────┼──────────┼─────────┼──────────┼─────────┤
│ Corregir PROM           │    R     │    I    │    A     │    I    │
├─────────────────────────┼──────────┼─────────┼──────────┼─────────┤
│ Validar Final           │    I     │    R    │    A     │    C    │
├─────────────────────────┼──────────┼─────────┼──────────┼─────────┤
│ Actualizar Base Datos   │    I     │    I    │    R     │    A    │
├─────────────────────────┼──────────┼─────────┼──────────┼─────────┤
│ Generar Reportes        │    I     │    C    │    R     │    A    │
└─────────────────────────┴──────────┴─────────┴──────────┴─────────┘

Leyenda:
R = Responsible (Responsable de ejecutar)
A = Accountable (Aprueba/autoriza)
C = Consulted (Consultado)
I = Informed (Informado)
```

### Descripción de Roles

#### 👤 Usuario/Investigador
- Crea y carga PROMs al sistema
- Adjunta documentación requerida
- Realiza correcciones cuando se solicitan
- Recibe notificaciones de estado

#### 👔 Comité/Revisor
- Revisa estructura y contenido de PROMs
- Evalúa cumplimiento de criterios
- Registra observaciones y feedback
- Aprueba o solicita correcciones
- Valida versiones finales

#### 🖥️ Sistema
- Almacena PROMs y documentación
- Aplica reglas de validación automática
- Registra trazabilidad completa
- Genera notificaciones
- Produce reportes y métricas

#### 🔧 Administrador
- Configura criterios de evaluación
- Gestiona usuarios y permisos
- Audita procesos
- Genera reportes de gestión

---

## 💻 Implementación en el Sistema

### Modelo de Datos

```sql
-- Tabla: proms
CREATE TABLE proms (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  prom_number INTEGER NOT NULL,
  prom_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Estados posibles: draft, in_review, needs_correction, approved, rejected
  CONSTRAINT valid_status CHECK (status IN (
    'draft', 'in_review', 'needs_correction', 'approved', 'rejected'
  ))
);

-- Tabla: prom_reviews
CREATE TABLE prom_reviews (
  id SERIAL PRIMARY KEY,
  prom_id INTEGER REFERENCES proms(id) ON DELETE CASCADE,
  reviewer_id INTEGER REFERENCES users(id),
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Criterios de evaluación
  documentation_complete BOOLEAN,
  structure_valid BOOLEAN,
  requirements_met BOOLEAN,
  consistency_check BOOLEAN,
  
  -- Decisión
  decision VARCHAR(50) NOT NULL,
  observations TEXT,
  
  CONSTRAINT valid_decision CHECK (decision IN ('approved', 'needs_correction', 'rejected'))
);

-- Tabla: prom_corrections
CREATE TABLE prom_corrections (
  id SERIAL PRIMARY KEY,
  prom_id INTEGER REFERENCES proms(id) ON DELETE CASCADE,
  review_id INTEGER REFERENCES prom_reviews(id),
  correction_description TEXT NOT NULL,
  corrected_by INTEGER REFERENCES users(id),
  corrected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN DEFAULT FALSE
);

-- Tabla: prom_documentation
CREATE TABLE prom_documentation (
  id SERIAL PRIMARY KEY,
  prom_id INTEGER REFERENCES proms(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100),
  file_path TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: prom_audit_log
CREATE TABLE prom_audit_log (
  id SERIAL PRIMARY KEY,
  prom_id INTEGER REFERENCES proms(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details JSONB
);
```

### Endpoints de API

```javascript
// Backend: api/routes/prom.routes.js

const express = require('express');
const router = express.Router();
const promController = require('../controllers/prom.controller');
const authMiddleware = require('../../infrastructure/middlewares/auth.middleware');

// Crear nuevo PROM
router.post('/proms', authMiddleware, promController.createProm);

// Subir PROM a revisión
router.post('/proms/:id/submit-review', authMiddleware, promController.submitForReview);

// Revisar PROM (solo revisores)
router.post('/proms/:id/review', authMiddleware, promController.reviewProm);

// Corregir PROM
router.post('/proms/:id/correct', authMiddleware, promController.correctProm);

// Aprobar PROM
router.post('/proms/:id/approve', authMiddleware, promController.approveProm);

// Obtener historial de PROM
router.get('/proms/:id/history', authMiddleware, promController.getPromHistory);

// Obtener matriz de evaluación
router.get('/projects/:projectId/evaluation-matrix', authMiddleware, promController.getEvaluationMatrix);

module.exports = router;
```

### Use Case: Revisar PROM

```javascript
// Backend: domain/use-cases/review-prom.use-case.js

class ReviewPromUseCase {
  constructor(promRepository, notificationService) {
    this.promRepository = promRepository;
    this.notificationService = notificationService;
  }

  async execute({
    promId,
    reviewerId,
    criteria,
    decision,
    observations
  }) {
    // 1. Obtener PROM
    const prom = await this.promRepository.findById(promId);
    
    if (!prom) {
      throw new Error('PROM no encontrado');
    }

    if (prom.status !== 'in_review') {
      throw new Error('PROM no está en revisión');
    }

    // 2. Evaluar criterios
    const allCriteriaMet = Object.values(criteria).every(c => c === true);

    // 3. Validar decisión
    if (decision === 'approved' && !allCriteriaMet) {
      throw new Error('No se puede aprobar: criterios no cumplidos');
    }

    // 4. Crear revisión
    const review = await this.promRepository.createReview({
      prom_id: promId,
      reviewer_id: reviewerId,
      documentation_complete: criteria.documentation_complete,
      structure_valid: criteria.structure_valid,
      requirements_met: criteria.requirements_met,
      consistency_check: criteria.consistency_check,
      decision: decision,
      observations: observations
    });

    // 5. Actualizar estado del PROM
    let newStatus;
    switch (decision) {
      case 'approved':
        newStatus = 'approved';
        break;
      case 'needs_correction':
        newStatus = 'needs_correction';
        break;
      case 'rejected':
        newStatus = 'rejected';
        break;
    }

    await this.promRepository.updateStatus(promId, newStatus);

    // 6. Registrar en auditoría
    await this.promRepository.logAudit({
      prom_id: promId,
      action: `PROM_REVIEWED_${decision.toUpperCase()}`,
      user_id: reviewerId,
      details: {
        review_id: review.id,
        criteria: criteria,
        observations: observations
      }
    });

    // 7. Notificar al usuario
    const promOwner = await this.promRepository.getPromOwner(promId);
    await this.notificationService.send({
      to: promOwner.email,
      subject: `PROM #${prom.prom_number} - ${decision}`,
      template: 'prom-review-result',
      data: {
        prom_name: prom.prom_name,
        decision: decision,
        observations: observations,
        review_url: `/projects/${prom.project_id}/proms/${promId}`
      }
    });

    return {
      success: true,
      review_id: review.id,
      new_status: newStatus,
      message: `PROM ${decision === 'approved' ? 'aprobado' : 'requiere corrección'}`
    };
  }
}

module.exports = ReviewPromUseCase;
```

### Componente Frontend: Panel de Revisión

```typescript
// Frontend: components/prom/prom-review-panel.tsx

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface PromReviewPanelProps {
  prom: {
    id: number;
    prom_number: number;
    prom_name: string;
    status: string;
  };
  onReviewSubmit: (reviewData: any) => Promise<void>;
}

export function PromReviewPanel({ prom, onReviewSubmit }: PromReviewPanelProps) {
  const [criteria, setCriteria] = useState({
    documentation_complete: false,
    structure_valid: false,
    requirements_met: false,
    consistency_check: false,
  });

  const [observations, setObservations] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const allCriteriaMet = Object.values(criteria).every(c => c);

  const handleSubmit = async (decision: 'approved' | 'needs_correction') => {
    setSubmitting(true);
    try {
      await onReviewSubmit({
        promId: prom.id,
        criteria,
        decision,
        observations,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Revisión de PROM #{prom.prom_number}</span>
          <Badge variant={prom.status === 'approved' ? 'success' : 'warning'}>
            {prom.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Criterios de Evaluación */}
        <div className="space-y-2">
          <h3 className="font-semibold">Criterios de Evaluación</h3>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="documentation_complete"
              checked={criteria.documentation_complete}
              onCheckedChange={(checked) =>
                setCriteria({ ...criteria, documentation_complete: !!checked })
              }
            />
            <label htmlFor="documentation_complete">
              ✓ Documentación Completa
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="structure_valid"
              checked={criteria.structure_valid}
              onCheckedChange={(checked) =>
                setCriteria({ ...criteria, structure_valid: !!checked })
              }
            />
            <label htmlFor="structure_valid">
              ✓ Estructura Válida
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requirements_met"
              checked={criteria.requirements_met}
              onCheckedChange={(checked) =>
                setCriteria({ ...criteria, requirements_met: !!checked })
              }
            />
            <label htmlFor="requirements_met">
              ✓ Cumplimiento de Requisitos
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="consistency_check"
              checked={criteria.consistency_check}
              onCheckedChange={(checked) =>
                setCriteria({ ...criteria, consistency_check: !!checked })
              }
            />
            <label htmlFor="consistency_check">
              ✓ Consistencia Verificada
            </label>
          </div>
        </div>

        {/* Observaciones */}
        <div className="space-y-2">
          <label htmlFor="observations" className="font-semibold">
            Observaciones
          </label>
          <Textarea
            id="observations"
            placeholder="Ingrese observaciones, sugerencias o correcciones necesarias..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={4}
          />
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <Button
            variant="default"
            disabled={!allCriteriaMet || submitting}
            onClick={() => handleSubmit('approved')}
          >
            ✓ Aprobar PROM
          </Button>
          
          <Button
            variant="outline"
            disabled={submitting}
            onClick={() => handleSubmit('needs_correction')}
          >
            ⚠️ Solicitar Corrección
          </Button>
        </div>

        {!allCriteriaMet && (
          <p className="text-sm text-muted-foreground">
            * Todos los criterios deben cumplirse para aprobar el PROM
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### Dashboard de Estado de PROMs

```typescript
// Frontend: components/prom/prom-status-dashboard.tsx

interface PromStatusDashboardProps {
  projectId: number;
}

export function PromStatusDashboard({ projectId }: PromStatusDashboardProps) {
  const proms = [
    { id: 1, name: 'Protocolo', status: 'approved', progress: 100 },
    { id: 2, name: 'Estrategia de Búsqueda', status: 'approved', progress: 100 },
    { id: 3, name: 'Resultados de Búsqueda', status: 'in_review', progress: 75 },
    { id: 4, name: 'Cribado T/R', status: 'needs_correction', progress: 50 },
    { id: 5, name: 'Cribado TC', status: 'draft', progress: 25 },
    { id: 6, name: 'Extracción', status: 'draft', progress: 0 },
    { id: 7, name: 'Síntesis', status: 'draft', progress: 0 },
    { id: 8, name: 'PRISMA', status: 'draft', progress: 0 },
    { id: 9, name: 'Artículo Final', status: 'draft', progress: 0 },
  ];

  return (
    <div className="space-y-4">
      {proms.map((prom) => (
        <Card key={prom.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-semibold">PROM {prom.id}</span>
                <span>{prom.name}</span>
              </div>
              <Badge variant={getStatusVariant(prom.status)}>
                {getStatusLabel(prom.status)}
              </Badge>
            </div>
            <Progress value={prom.progress} className="mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'approved': return 'success';
    case 'in_review': return 'warning';
    case 'needs_correction': return 'destructive';
    case 'draft': return 'secondary';
    default: return 'default';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'approved': return '✓ Aprobado';
    case 'in_review': return '🔍 En Revisión';
    case 'needs_correction': return '⚠️ Requiere Corrección';
    case 'draft': return '📝 Borrador';
    default: return status;
  }
}
```

---

## 📈 Métricas y KPIs

### Indicadores de Desempeño del Proceso

| KPI | Descripción | Meta | Cálculo |
|-----|-------------|------|---------|
| **Tiempo de Revisión** | Tiempo promedio desde ingreso hasta decisión | < 48h | Avg(fecha_revisión - fecha_ingreso) |
| **Tasa de Aprobación Primera** | % de PROMs aprobados sin correcciones | > 70% | (Aprobados 1ra / Total) × 100 |
| **Ciclos de Corrección** | Promedio de ciclos revisar-corregir | < 2 | Avg(num_correcciones por PROM) |
| **Cumplimiento de Criterios** | % de criterios cumplidos por PROM | > 90% | (Criterios OK / Total Criterios) × 100 |
| **Completitud Documental** | % de PROMs con docs completas | 100% | (Docs completas / Total PROMs) × 100 |

---

## ✅ Checklist de Implementación

### Fase 1: Modelado (Semana 1)
- [x] Definir estructura de PROMs
- [x] Crear diagrama BPMN en Bizagi
- [x] Documentar matriz de evaluación
- [x] Definir roles y responsabilidades

### Fase 2: Base de Datos (Semana 2)
- [ ] Crear tablas: proms, prom_reviews, prom_corrections
- [ ] Crear triggers de auditoría
- [ ] Implementar constraints de validación
- [ ] Crear índices de rendimiento

### Fase 3: Backend (Semana 3-4)
- [ ] Implementar endpoints de API
- [ ] Crear use cases de revisión
- [ ] Implementar sistema de notificaciones
- [ ] Crear servicio de auditoría

### Fase 4: Frontend (Semana 5-6)
- [ ] Crear panel de revisión de PROMs
- [ ] Implementar dashboard de estado
- [ ] Crear formulario de corrección
- [ ] Implementar matriz de evaluación interactiva

### Fase 5: Testing (Semana 7)
- [ ] Tests unitarios de use cases
- [ ] Tests de integración API
- [ ] Tests E2E del flujo completo
- [ ] Validación de proceso BPMN

### Fase 6: Despliegue (Semana 8)
- [ ] Deploy a staging
- [ ] Capacitación de usuarios
- [ ] Deploy a producción
- [ ] Monitoreo y ajustes

---

## 📚 Referencias

- **BPMN 2.0 Specification** - Object Management Group (OMG)
- **Bizagi Modeler** - Herramienta de modelado BPMN
- **ISO 9001:2015** - Sistemas de gestión de calidad
- **PRISMA 2020** - Preferred Reporting Items for Systematic Reviews
- **Cochrane Handbook** - Metodología de revisiones sistemáticas

---

**Documento creado:** 27 de noviembre de 2025  
**Última actualización:** 27 de noviembre de 2025  
**Versión:** 1.0  
**Autor:** Thesis RSL Team  
**Licencia:** MIT
