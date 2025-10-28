# Product Backlog Priorizado - Actualizado
## Sistema Web para Gestión de Revisiones Sistemáticas con IA
### Total: 100 Puntos | 5 Sprints de 2 Semanas

---

## Sprint 1: Fundamentos (Semanas 1-2) - 20 puntos

### Objetivo del Sprint
Establecer la base del sistema con autenticación Google OAuth, gestión de proyectos y definición de protocolos PICO.

| ID | Historia de Usuario | Prioridad | Estimación | Responsable |
|----|---------------------|-----------|------------|-------------|
| HU-001 | Iniciar Sesión con Google | Alta | 5 pts | Full-Stack |
| HU-002 | Gestión Básica de Usuarios | Media | 3 pts | Full-Stack |
| HU-003 | Crear y Gestionar Proyectos RSL | Alta | 5 pts | Full-Stack |
| HU-004 | Definir Protocolo PICO | Alta | 7 pts | Frontend |

**Total Sprint 1**: 20 puntos

**Entregables**:
- ✅ Autenticación con Google funcionando
- ✅ Dashboard con gestión de proyectos
- ✅ Asistente de protocolo PICO completo
- ✅ Base de datos Supabase configurada

**Riesgos**: Configuración de Google OAuth puede tomar tiempo extra

---

## Sprint 2: Búsqueda Centralizada (Semanas 3-4) - 25 puntos

### Objetivo del Sprint
Implementar búsqueda unificada en APIs académicas y comenzar el módulo de cribado con IA.

| ID | Historia de Usuario | Prioridad | Estimación | Responsable |
|----|---------------------|-----------|------------|-------------|
| HU-005 | Configurar Búsqueda en APIs Académicas | Alta | 10 pts | Backend |
| HU-006 | Importar y Eliminar Duplicados | Alta | 5 pts | Backend |
| HU-007 | Generar Embeddings y Clasificar | Máxima | 10 pts | Backend/IA |

**Total Sprint 2**: 25 puntos

**Entregables**:
- ✅ Búsqueda en al menos 2 APIs (PubMed + IEEE)
- ✅ Importación y eliminación de duplicados
- ✅ Generación de embeddings con MiniLM
- ✅ Clasificación automática básica

**Riesgos**: 
- APIs pueden tener límites de rate
- Configuración de embeddings puede ser compleja

**Mitigación**: Empezar con PubMed (API gratuita) y IEEE

---

## Sprint 3: Cribado Inteligente (Semanas 5-6) - 23 puntos

### Objetivo del Sprint
Completar el módulo de cribado con IA que aprende y revisión manual optimizada. **SPRINT CRÍTICO**.

| ID | Historia de Usuario | Prioridad | Estimación | Responsable |
|----|---------------------|-----------|------------|-------------|
| HU-008 | IA que Aprende de Decisiones | Máxima | 8 pts | IA/ML |
| HU-009 | Revisión Manual Optimizada | Alta | 5 pts | Frontend |
| HU-010 | Definir Plantilla de Extracción | Alta | 5 pts | Full-Stack |
| HU-011 | Extracción Automática con IA | Máxima | 10 pts | Backend/IA |

**Total Sprint 3**: 28 puntos (sobrecarga intencional para priorizar)

**Entregables**:
- ✅ **IA que aprende de decisiones manuales** (diferenciador clave)
- ✅ Interfaz de revisión con atajos de teclado
- ✅ Plantilla de extracción personalizable
- ✅ Extracción automática de datos funcionando

**Riesgos**: 
- Machine learning incremental es complejo
- Extracción de datos puede requerir muchas iteraciones

**Mitigación**: 
- Empezar con modelo simple que se ajusta
- Limitar extracción a campos básicos inicialmente

---

## Sprint 4: Calidad y PRISMA (Semanas 7-8) - 20 puntos

### Objetivo del Sprint
Implementar checklists de calidad, validación PRISMA y comenzar generación de reportes.

| ID | Historia de Usuario | Prioridad | Estimación | Responsable |
|----|---------------------|-----------|------------|-------------|
| HU-012 | Revisar y Exportar Datos Extraídos | Alta | 3 pts | Full-Stack |
| HU-013 | Implementar Checklists de Calidad | Alta | 8 pts | Full-Stack |
| HU-014 | Evaluación por Pares y Sugerencias IA | Media | 4 pts | Full-Stack |
| HU-015 | Validación PRISMA 2020 | Alta | 5 pts | Full-Stack |

**Total Sprint 4**: 20 puntos

**Entregables**:
- ✅ Revisión de datos extraídos con exportación
- ✅ 3 checklists de calidad (CASPe, JADAD, Newcastle-Ottawa)
- ✅ Evaluación por pares con resolución de conflictos
- ✅ Checklist PRISMA completo con diagrama de flujo

**Riesgos**: Implementar 3 checklists puede tomar más tiempo

**Mitigación**: Priorizar CASPe y JADAD, Newcastle-Ottawa opcional

---

## Sprint 5: Reportes y Producción (Semanas 9-10) - 12 puntos

### Objetivo del Sprint
Completar generación de artículos, exportación optimizada y desplegar en producción.

| ID | Historia de Usuario | Prioridad | Estimación | Responsable |
|----|---------------------|-----------|------------|-------------|
| HU-016 | Generación Básica de Artículos | Media | 5 pts | Full-Stack |
| HU-017 | Exportación Optimizada | Alta | 3 pts | Backend |
| HU-018 | Despliegue en Producción | Alta | 2 pts | DevOps |

**Total Sprint 5**: 10 puntos (sprint ligero para refinamiento)

**Entregables**:
- ✅ Editor con generación de borradores con IA
- ✅ Exportación en múltiples formatos (PDF, DOCX, LaTeX, BibTeX)
- ✅ **Sistema desplegado en producción**
- ✅ **Proyecto completo y funcional**

**Actividades Adicionales**:
- Testing con usuarios reales (investigadores ESPE)
- Corrección de bugs
- Refinamiento de UI/UX
- Documentación de usuario
- Preparación de presentación de tesis

---

## Resumen del Product Backlog

| Sprint | Semanas | Puntos | Foco Principal | Riesgo |
|--------|---------|--------|----------------|--------|
| Sprint 1 | 1-2 | 20 | Fundamentos y Protocolo | Bajo |
| Sprint 2 | 3-4 | 25 | Búsqueda APIs + Embeddings | Medio |
| Sprint 3 | 5-6 | 28 | **Cribado IA + Extracción** | **Alto** |
| Sprint 4 | 7-8 | 20 | Calidad + PRISMA | Medio |
| Sprint 5 | 9-10 | 10 | Reportes + Deploy | Bajo |

**Total**: 103 puntos planificados (3 puntos de buffer)  
**Duración**: 10 semanas (2.5 meses)

---

## Velocity y Capacidad

### Velocity Esperada
- **Sprint 1**: 20 puntos (setup inicial)
- **Sprint 2**: 25 puntos (ritmo normal)
- **Sprint 3**: 23 puntos (sprint crítico, enfoque máximo)
- **Sprint 4**: 20 puntos (ritmo normal)
- **Sprint 5**: 10 puntos (refinamiento y deploy)

**Promedio**: 19.6 puntos por sprint

### Capacidad del Equipo
- **Equipo**: 1 desarrollador full-stack
- **Horas por sprint**: 80 horas (40 horas/semana × 2 semanas)
- **Horas por punto**: ~4 horas
- **Disponibilidad**: 100% dedicación al proyecto

---

## Priorización Basada en Encuesta

### Funcionalidades Críticas (Máxima Prioridad)
1. ✅ **Cribado con IA que aprende** (HU-007, HU-008, HU-009)
   - Justificación: Dificultad 4.4/5, Importancia 5.0/5, Frustración #1
   - Puntos: 23 pts (23% del proyecto)

2. ✅ **Extracción automática de datos** (HU-010, HU-011, HU-012)
   - Justificación: Dificultad 4.4/5, Importancia 5.0/5
   - Puntos: 18 pts (18% del proyecto)

### Funcionalidades Importantes (Alta Prioridad)
3. ✅ **Búsqueda centralizada en APIs** (HU-005, HU-006)
   - Justificación: Importancia 4.8/5
   - Puntos: 15 pts (15% del proyecto)

4. ✅ **Checklists de calidad** (HU-013, HU-014)
   - Justificación: Dificultad 4.2/5, Importancia 4.6/5
   - Puntos: 12 pts (12% del proyecto)

5. ✅ **Validación PRISMA** (HU-015)
   - Justificación: Importancia 4.6/5, Requisito metodológico
   - Puntos: 5 pts (5% del proyecto)

### Funcionalidades Complementarias
6. ✅ **Generación de artículos** (HU-016)
   - Justificación: Importancia 4.4/5
   - Puntos: 5 pts (5% del proyecto)

7. ✅ **Exportación mejorada** (HU-017)
   - Justificación: Soluciona frustración #2 (LaTeX)
   - Puntos: 3 pts (3% del proyecto)

---

## Métricas de Éxito por Sprint

### Sprint 1
- ✅ 100% de usuarios pueden autenticarse con Google
- ✅ 100% de usuarios pueden crear proyectos
- ✅ 100% de usuarios pueden definir protocolo PICO

### Sprint 2
- ✅ Búsqueda en al menos 2 APIs funciona
- ✅ Eliminación de duplicados > 95% precisión
- ✅ Generación de embeddings < 2 seg/referencia

### Sprint 3 (CRÍTICO)
- ✅ Clasificación automática > 80% precisión inicial
- ✅ IA mejora precisión en 10%+ después de 50 decisiones
- ✅ Extracción de datos > 75% precisión
- ✅ Tiempo de screening reducido en 60%+

### Sprint 4
- ✅ 3 checklists implementados y funcionales
- ✅ Cumplimiento PRISMA > 90% en proyectos de prueba
- ✅ Diagrama PRISMA se genera correctamente

### Sprint 5
- ✅ Sistema desplegado y accesible
- ✅ Exportación en 5+ formatos funciona
- ✅ 5+ investigadores ESPE prueban el sistema
- ✅ Satisfacción de usuarios > 4.0/5

---

## Riesgos y Mitigaciones

### Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| APIs académicas con límites de rate | Alta | Medio | Empezar con APIs gratuitas (PubMed), implementar caché |
| Complejidad de ML incremental | Media | Alto | Empezar con modelo simple, iterar |
| Extracción de datos imprecisa | Media | Alto | Validación manual, ajuste de prompts |
| Integración Gemini API costosa | Media | Medio | Optimizar uso de tokens, considerar plan de pago |

### Riesgos de Tiempo

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Sprint 3 toma más tiempo | Alta | Alto | Buffer de 3 puntos, priorizar funcionalidad core |
| Checklists de calidad complejos | Media | Medio | Implementar 2 de 3 inicialmente |
| Testing con usuarios retrasa | Media | Bajo | Testing en paralelo con Sprint 5 |

---

## Definición de "Hecho" (Definition of Done)

Una historia de usuario está "Hecha" cuando:

### Código
- ✅ Código escrito y funciona según criterios de aceptación
- ✅ Código sigue estándares TypeScript y React
- ✅ Sin errores en consola del navegador
- ✅ Código documentado con comentarios claros

### Funcionalidad
- ✅ Funcionalidad probada manualmente
- ✅ Funcionalidad probada en diferentes navegadores
- ✅ UI es responsive (móvil, tablet, desktop)
- ✅ Accesibilidad básica implementada

### Datos
- ✅ Datos se persisten correctamente en Supabase
- ✅ RLS configurado y probado
- ✅ Validaciones de datos funcionan

### Integración
- ✅ Funcionalidad integrada con resto del sistema
- ✅ No rompe funcionalidades existentes
- ✅ APIs externas funcionan correctamente

### Aprobación
- ✅ Product Owner (tesista) ha revisado y aprobado
- ✅ Cumple con requisitos de la encuesta (si aplica)

---

## Ceremonias Scrum

### Sprint Planning (Inicio de cada Sprint)
- **Duración**: 2 horas
- **Participantes**: Tesista, Director de tesis
- **Objetivo**: Seleccionar historias y planificar sprint
- **Entregables**: Sprint backlog, objetivos claros

### Daily Standup (Diario - Personal)
- **Duración**: 15 minutos
- **Formato**: Registro personal escrito
- **Preguntas**: ¿Qué hice? ¿Qué haré? ¿Impedimentos?

### Sprint Review (Fin de cada Sprint)
- **Duración**: 1-2 horas
- **Participantes**: Tesista, Director, Usuarios de prueba (opcional)
- **Objetivo**: Demostrar funcionalidades completadas
- **Entregables**: Demo funcional, feedback

### Sprint Retrospective (Fin de cada Sprint)
- **Duración**: 1 hora
- **Participantes**: Tesista, Director
- **Objetivo**: Mejorar proceso
- **Formato**: ¿Qué salió bien? ¿Qué mejorar? ¿Acciones?

---

## Cronograma Detallado

| Semana | Sprint | Actividades Principales | Hitos |
|--------|--------|-------------------------|-------|
| 1-2 | Sprint 1 | Auth Google, Proyectos, Protocolo PICO | ✅ Base funcional |
| 3-4 | Sprint 2 | APIs académicas, Embeddings, Clasificación | ✅ Búsqueda centralizada |
| 5-6 | Sprint 3 | IA que aprende, Extracción de datos | ✅ **Core de la tesis** |
| 7-8 | Sprint 4 | Checklists calidad, PRISMA | ✅ Validación completa |
| 9-10 | Sprint 5 | Artículos, Exportación, Deploy | ✅ **Sistema en producción** |

**Fecha Inicio**: Febrero 2025  
**Fecha Fin**: Abril 2025  
**Presentación Tesis**: Mayo 2025

---

**Fecha de elaboración**: Enero 2025  
**Basado en**: Encuesta a 5 investigadores ESPE  
**Elaborado por**: Estudiante Tesista - ESPE  
**Versión**: 2.0 (Actualizada - 100 puntos)
