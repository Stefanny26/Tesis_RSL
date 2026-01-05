# Épicas del Proyecto - Actualizado
## Sistema Web para Gestión de Revisiones Sistemáticas con IA
### Basado en Hallazgos de Encuesta

---

## ÉPICA 1: Autenticación y Gestión de Usuarios

**Descripción**: Sistema de autenticación con Google OAuth y gestión básica de usuarios con tres roles (Administrador, Investigador, Revisor).

**Valor de Negocio**: Acceso seguro y rápido al sistema, eliminando barreras de entrada.

**Justificación (Encuesta)**: Los investigadores valoran la facilidad de uso y acceso rápido.

**Estimación Total**: 8 puntos

**Prioridad**: Alta (Requisito base)

---

## ÉPICA 2: Gestión de Proyectos y Protocolo PICO

**Descripción**: Dashboard para gestionar proyectos RSL y asistente guiado para definir protocolo de investigación con framework PICO, criterios y estrategia de búsqueda.

**Valor de Negocio**: Centralizar y estandarizar la definición de protocolos de investigación.

**Justificación (Encuesta)**: Base necesaria para todas las funcionalidades de IA.

**Estimación Total**: 12 puntos

**Prioridad**: Alta (Requisito base)

---

## ÉPICA 3: Búsqueda Centralizada en APIs ⭐ NUEVA

**Descripción**: Integración con APIs de bases de datos académicas (Scopus, Web of Science, IEEE, PubMed) para búsqueda unificada y eliminación automática de duplicados.

**Valor de Negocio**: Eliminar la necesidad de buscar manualmente en múltiples plataformas y consolidar resultados.

**Justificación (Encuesta)**: 
- Importancia: 4.8/5
- Comentario: "Sería útil tener búsqueda centralizada"
- Ahorra horas de trabajo manual

**Estimación Total**: 15 puntos

**Prioridad**: Alta (Diferenciador importante)

---

## ÉPICA 4: Cribado Inteligente con IA que Aprende ⭐⭐ PRIORIDAD MÁXIMA

**Descripción**: Sistema de clasificación automática de referencias usando embeddings y machine learning que aprende de las decisiones manuales del investigador para mejorar continuamente.

**Valor de Negocio**: Reducir drásticamente el tiempo de screening (de semanas a días) manteniendo alta precisión.

**Justificación (Encuesta)**:
- **Dificultad de screening**: 4.4/5 (máxima)
- **Tiempo consumido**: 100% de encuestados
- **Frustración #1**: "Screening manual consume demasiado tiempo"
- **Funcionalidad más valorada**: IA que aprende (5.0/5)

**Estimación Total**: 20 puntos

**Prioridad**: Máxima (Core de la tesis + Mayor dolor identificado)

---

## ÉPICA 5: Extracción Automática de Datos con IA ⭐⭐ NUEVA - PRIORIDAD MÁXIMA

**Descripción**: Sistema de extracción automática de datos de estudios usando IA (Gemini), con plantillas personalizables y revisión manual.

**Valor de Negocio**: Reducir el tiempo de extracción de datos de días a horas, manteniendo consistencia.

**Justificación (Encuesta)**:
- **Dificultad de extracción**: 4.4/5 (máxima)
- **Tiempo consumido**: 80% de encuestados
- **Frustración**: "Encontrar información similar en múltiples estudios"
- **Importancia**: 5.0/5

**Estimación Total**: 18 puntos

**Prioridad**: Máxima (Mayor dolor identificado)

---

## ÉPICA 6: Evaluación de Calidad con Checklists Digitales ⭐ NUEVA

**Descripción**: Implementación de checklists digitales de calidad (CASPe, JADAD, Newcastle-Ottawa) con evaluación por pares y sugerencias de IA.

**Valor de Negocio**: Estandarizar y agilizar la evaluación de calidad metodológica de estudios.

**Justificación (Encuesta)**:
- **Dificultad de evaluación**: 4.2/5
- **Importancia de checklists**: 4.6/5
- **Comentario**: "Checklists digitales serían muy útiles"

**Estimación Total**: 12 puntos

**Prioridad**: Alta (Requisito metodológico)

---

## ÉPICA 7: Validación PRISMA y Generación de Reportes

**Descripción**: Checklist PRISMA 2020 con validación automática, diagrama de flujo y generación básica de artículos con IA.

**Valor de Negocio**: Asegurar cumplimiento de estándares internacionales y acelerar escritura.

**Justificación (Encuesta)**:
- **Dificultad de síntesis/reporte**: 4.0/5
- **Importancia de validación PRISMA**: 4.6/5
- **Importancia de generación de reportes**: 4.4/5

**Estimación Total**: 10 puntos

**Prioridad**: Alta (Requisito metodológico)

---

## ÉPICA 8: Exportación Mejorada y Despliegue

**Descripción**: Exportación optimizada en múltiples formatos (especialmente LaTeX), reportes ejecutivos y deployment en producción.

**Valor de Negocio**: Facilitar publicación y compartición de resultados.

**Justificación (Encuesta)**:
- **Frustración #2**: "Organizar referencias en LaTeX/Overleaf es tedioso"
- **Necesidad**: Exportación en formatos académicos estándar

**Estimación Total**: 5 puntos

**Prioridad**: Media (Necesaria para completitud)

---

## Resumen de Épicas

| # | Épica | Estimación | Prioridad | Justificación Encuesta |
|---|-------|------------|-----------|------------------------|
| 1 | Autenticación y Usuarios | 8 pts | Alta | Requisito base |
| 2 | Proyectos y Protocolo PICO | 12 pts | Alta | Requisito base |
| 3 | Búsqueda Centralizada APIs | 15 pts | Alta | 4.8/5 importancia |
| 4 | Cribado IA que Aprende | 20 pts | **Máxima** | 5.0/5 + Dolor #1 |
| 5 | Extracción Automática Datos | 18 pts | **Máxima** | 5.0/5 + Dolor #1 |
| 6 | Checklists de Calidad | 12 pts | Alta | 4.6/5 importancia |
| 7 | PRISMA y Reportes | 10 pts | Alta | 4.6/5 importancia |
| 8 | Exportación y Deploy | 5 pts | Media | Soluciona frustración |

**Total Estimado**: 100 puntos de historia ✅

**Duración Estimada**: 5 sprints de 2 semanas (10 semanas)

---

## Cambios Respecto a Versión Anterior

### Épicas Agregadas
- ✅ **Épica 3**: Búsqueda Centralizada en APIs (15 pts)
- ✅ **Épica 5**: Extracción Automática de Datos (18 pts)
- ✅ **Épica 6**: Checklists de Calidad (12 pts)

### Épicas Consolidadas
- Protocolo de Investigación → Integrado en Épica 2
- Generación de Artículos → Simplificado en Épica 7
- Infraestructura → Distribuido en otras épicas

### Redistribución de Puntos
- Total anterior: 234 puntos
- Total nuevo: **100 puntos** ✅
- Reducción: 57% (enfoque en funcionalidades críticas)

---

**Fecha de elaboración**: Enero 2025  
**Basado en**: Encuesta a 5 investigadores ESPE  
**Elaborado por**: Estudiante Tesista - ESPE  
**Versión**: 2.0 (Actualizada)
