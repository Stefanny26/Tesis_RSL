# Product Backlog Priorizado
## Sistema Web para Gestión de Revisiones Sistemáticas con IA

---

## Sprint 1: Fundamentos y Autenticación (Semanas 1-2)

### Objetivo del Sprint
Establecer la infraestructura base del proyecto y implementar el sistema completo de autenticación y gestión de usuarios con control de acceso por roles.

| ID | Historia de Usuario | Prioridad | Estimación | Responsable |
|----|---------------------|-----------|------------|-------------|
| HU-032 | Configurar Base de Datos Supabase | Alta | 8 pts | Backend |
| HU-001 | Registro de Usuario | Alta | 5 pts | Full-Stack |
| HU-002 | Inicio de Sesión | Alta | 5 pts | Full-Stack |
| HU-003 | Gestión de Perfil | Media | 3 pts | Full-Stack |
| HU-004 | Control de Acceso por Roles | Alta | 8 pts | Backend |
| HU-005 | Crear Proyecto RSL | Alta | 5 pts | Full-Stack |
| HU-006 | Visualizar Dashboard de Proyectos | Alta | 5 pts | Frontend |
| HU-007 | Editar Proyecto | Media | 3 pts | Full-Stack |

**Total Sprint 1**: 42 puntos

**Entregables**:
- Sistema de autenticación funcional con 3 roles
- Base de datos configurada con RLS
- Dashboard básico con gestión de proyectos
- Usuarios pueden registrarse, iniciar sesión y crear proyectos

---

## Sprint 2: Protocolo de Investigación (Semanas 3-4)

### Objetivo del Sprint
Implementar el asistente completo de definición de protocolo con todos sus pasos: Matriz Es/No Es, PICO, preguntas, criterios y estrategia de búsqueda.

| ID | Historia de Usuario | Prioridad | Estimación | Responsable |
|----|---------------------|-----------|------------|-------------|
| HU-008 | Definir Matriz Es/No Es | Alta | 5 pts | Frontend |
| HU-009 | Definir Framework PICO | Alta | 5 pts | Frontend |
| HU-010 | Definir Preguntas de Investigación | Alta | 3 pts | Frontend |
| HU-011 | Definir Criterios de Inclusión/Exclusión | Alta | 5 pts | Frontend |
| HU-012 | Definir Estrategia de Búsqueda | Alta | 3 pts | Frontend |
| HU-013 | Revisar y Finalizar Protocolo | Media | 3 pts | Frontend |

**Total Sprint 2**: 24 puntos

**Entregables**:
- Asistente de protocolo completo con 6 pasos
- Validación de completitud de protocolo
- Protocolos se guardan en base de datos
- Usuarios pueden definir protocolos completos para sus proyectos

---

## Sprint 3: Fundamentos de Cribado con IA - Parte 1 (Semanas 5-6)

### Objetivo del Sprint
Implementar la importación de referencias y la generación de embeddings vectoriales para preparar la clasificación automática.

| ID | Historia de Usuario | Prioridad | Estimación | Responsable |
|----|---------------------|-----------|------------|-------------|
| HU-033 | Integrar API de Gemini | Alta | 5 pts | Backend/IA |
| HU-014 | Importar Referencias Bibliográficas | Alta | 8 pts | Backend |
| HU-015 | Generar Embeddings de Referencias | Alta | 13 pts | Backend/IA |

**Total Sprint 3**: 26 puntos

**Entregables**:
- API de Gemini integrada y funcional
- Sistema de importación de referencias (BibTeX, RIS)
- Generación automática de embeddings con MiniLM
- Referencias almacenadas con vectores en base de datos

---

## Sprint 4: Cribado con IA - Parte 2 (Semanas 7-8)

### Objetivo del Sprint
Completar el módulo de cribado con clasificación automática, revisión manual y acciones masivas.

| ID | Historia de Usuario | Prioridad | Estimación | Responsable |
|----|---------------------|-----------|------------|-------------|
| HU-016 | Clasificación Automática con IA | Alta | 13 pts | Backend/IA |
| HU-017 | Revisión Manual de Referencias | Alta | 8 pts | Frontend |
| HU-018 | Acciones Masivas en Referencias | Media | 5 pts | Frontend |
| HU-019 | Filtrar y Buscar Referencias | Media | 5 pts | Frontend |

**Total Sprint 4**: 31 puntos

**Entregables**:
- Clasificación automática funcionando con scores de relevancia
- Interfaz completa de revisión manual
- Acciones masivas (incluir/excluir múltiples)
- Filtros y búsqueda de referencias
- **Módulo de cribado completamente funcional** (componente clave de la tesis)

---

## Sprint 5: Validación PRISMA (Semanas 9-10)

### Objetivo del Sprint
Implementar el checklist PRISMA completo con validación automática y sugerencias de IA.

| ID | Historia de Usuario | Prioridad | Estimación | Responsable |
|----|---------------------|-----------|------------|-------------|
| HU-020 | Visualizar Checklist PRISMA | Alta | 5 pts | Frontend |
| HU-021 | Marcar Ítems PRISMA como Completados | Alta | 5 pts | Full-Stack |
| HU-022 | Obtener Sugerencias de IA para PRISMA | Alta | 8 pts | Backend/IA |
| HU-023 | Validación Automática con IA | Media | 8 pts | Backend/IA |

**Total Sprint 5**: 26 puntos

**Entregables**:
- Checklist PRISMA 2020 completo (27 ítems)
- Sugerencias de IA para cada ítem
- Validación automática de cumplimiento
- Cálculo de porcentaje de cumplimiento PRISMA

---

## Sprint 6: Generación de Artículos con IA (Semanas 11-12)

### Objetivo del Sprint
Desarrollar el editor de artículos con generación automática de contenido usando IA y control de versiones.

| ID | Historia de Usuario | Prioridad | Estimación | Responsable |
|----|---------------------|-----------|------------|-------------|
| HU-024 | Crear Estructura de Artículo | Alta | 5 pts | Frontend |
| HU-025 | Generar Borrador con IA | Alta | 13 pts | Backend/IA |
| HU-026 | Control de Versiones de Artículo | Media | 5 pts | Full-Stack |
| HU-027 | Editar y Refinar Contenido | Media | 3 pts | Frontend |

**Total Sprint 6**: 26 puntos

**Entregables**:
- Editor estructurado por secciones
- Generación automática de borradores con IA
- Sistema de versiones funcional
- Usuarios pueden generar y editar artículos completos

---

## Sprint 7: Exportación y Finalización (Semanas 13-14)

### Objetivo del Sprint
Implementar todas las funcionalidades de exportación, reportes y desplegar el sistema en producción.

| ID | Historia de Usuario | Prioridad | Estimación | Responsable |
|----|---------------------|-----------|------------|-------------|
| HU-028 | Exportar Artículo en PDF | Alta | 8 pts | Backend |
| HU-029 | Exportar Referencias Bibliográficas | Alta | 5 pts | Backend |
| HU-030 | Generar Diagrama de Flujo PRISMA | Alta | 8 pts | Frontend |
| HU-031 | Generar Reporte Ejecutivo | Media | 5 pts | Full-Stack |
| HU-034 | Desplegar en Vercel | Alta | 3 pts | DevOps |

**Total Sprint 7**: 29 puntos

**Entregables**:
- Exportación en múltiples formatos (PDF, DOCX, LaTeX, BibTeX)
- Diagrama de flujo PRISMA automático
- Reportes ejecutivos
- **Sistema desplegado en producción**
- **Proyecto completo y funcional**

---

## Resumen del Product Backlog

| Sprint | Semanas | Puntos | Foco Principal | Estado |
|--------|---------|--------|----------------|--------|
| Sprint 1 | 1-2 | 42 | Autenticación y Proyectos | ✅ Completado |
| Sprint 2 | 3-4 | 24 | Protocolo de Investigación | 🔄 Pendiente |
| Sprint 3 | 5-6 | 26 | Cribado IA - Parte 1 | 🔄 Pendiente |
| Sprint 4 | 7-8 | 31 | Cribado IA - Parte 2 | 🔄 Pendiente |
| Sprint 5 | 9-10 | 26 | Validación PRISMA | 🔄 Pendiente |
| Sprint 6 | 11-12 | 26 | Generación de Artículos | 🔄 Pendiente |
| Sprint 7 | 13-14 | 29 | Exportación y Deploy | 🔄 Pendiente |

**Total**: 204 puntos en 7 sprints (14 semanas)

---

## Velocity Esperada

- **Velocity promedio**: 29 puntos por sprint (2 semanas)
- **Capacidad del equipo**: 1 desarrollador full-stack
- **Horas por sprint**: ~80 horas (40 horas/semana)
- **Horas por punto**: ~2.75 horas

---

## Riesgos y Mitigaciones

### Riesgos Técnicos
1. **Riesgo**: Complejidad de embeddings y clasificación con IA
   - **Mitigación**: Dedicar Sprint 3 y 4 completos, investigar previamente, usar bibliotecas probadas

2. **Riesgo**: Integración con API de Gemini puede tener límites de rate
   - **Mitigación**: Implementar caché, optimizar prompts, considerar plan de pago

3. **Riesgo**: Exportación a PDF/DOCX puede ser compleja
   - **Mitigación**: Usar bibliotecas establecidas (jsPDF, docx), simplificar formato si es necesario

### Riesgos de Tiempo
1. **Riesgo**: Sprints 3-4 (Cribado IA) pueden tomar más tiempo
   - **Mitigación**: Priorizar funcionalidad core, dejar refinamientos para después

2. **Riesgo**: Generación de artículos con IA puede requerir muchas iteraciones
   - **Mitigación**: Empezar con generación simple, mejorar iterativamente

---

## Definición de "Hecho" (Definition of Done)

Una historia de usuario se considera "Hecha" cuando:

1. ✅ El código está escrito y funciona según los criterios de aceptación
2. ✅ El código sigue estándares de TypeScript y React
3. ✅ La funcionalidad está probada manualmente
4. ✅ La UI es responsive y accesible
5. ✅ Los datos se persisten correctamente en Supabase
6. ✅ No hay errores en consola
7. ✅ El código está documentado con comentarios
8. ✅ La funcionalidad está integrada con el resto del sistema
9. ✅ El Product Owner (tesista) ha revisado y aprobado

---

## Ceremonias Scrum Sugeridas

### Planning (Inicio de cada Sprint)
- **Duración**: 2 horas
- **Objetivo**: Seleccionar historias del backlog y planificar el sprint
- **Participantes**: Tesista, Director de tesis

### Daily Standup (Diario)
- **Duración**: 15 minutos
- **Formato**: ¿Qué hice ayer? ¿Qué haré hoy? ¿Hay impedimentos?
- **Nota**: Como es un equipo de 1, puede ser un registro personal

### Review (Fin de cada Sprint)
- **Duración**: 1 hora
- **Objetivo**: Demostrar funcionalidades completadas
- **Participantes**: Tesista, Director de tesis, posibles usuarios de prueba

### Retrospective (Fin de cada Sprint)
- **Duración**: 1 hora
- **Objetivo**: Reflexionar sobre el proceso y mejorar
- **Formato**: ¿Qué salió bien? ¿Qué mejorar? ¿Acciones para el próximo sprint?

---

**Fecha de elaboración**: Enero 2025  
**Elaborado por**: Estudiante Tesista - ESPE  
**Versión**: 1.0
