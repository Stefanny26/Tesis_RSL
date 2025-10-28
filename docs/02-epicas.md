# Épicas del Proyecto
## Sistema Web para Gestión de Revisiones Sistemáticas con IA

---

## ÉPICA 1: Gestión de Usuarios y Seguridad

**Descripción**: Implementar un sistema completo de autenticación, autorización y gestión de usuarios con tres roles diferenciados (Administrador, Investigador, Revisor) que garantice la seguridad y privacidad de los datos.

**Valor de Negocio**: Proteger la información sensible de investigación y permitir colaboración controlada entre equipos.

**Criterios de Aceptación Épica**:
- Los usuarios pueden registrarse, iniciar sesión y gestionar sus perfiles
- El sistema implementa control de acceso basado en roles
- Los datos están protegidos con RLS y autenticación segura
- Se registra toda la actividad de usuarios para auditoría

**Estimación Total**: 21 puntos

**Prioridad**: Alta (Crítica)

---

## ÉPICA 2: Gestión de Proyectos de Revisión Sistemática

**Descripción**: Desarrollar el módulo central para crear, gestionar y monitorear proyectos de revisión sistemática de literatura, incluyendo dashboard con estadísticas, asignación de miembros y seguimiento de progreso.

**Valor de Negocio**: Proporcionar una vista centralizada del estado de todos los proyectos de investigación y facilitar la colaboración en equipo.

**Criterios de Aceptación Épica**:
- Los investigadores pueden crear y gestionar múltiples proyectos RSL
- El dashboard muestra estadísticas y progreso en tiempo real
- Los proyectos pueden tener múltiples colaboradores con roles
- El sistema calcula automáticamente el progreso del proyecto

**Estimación Total**: 13 puntos

**Prioridad**: Alta (Crítica)

---

## ÉPICA 3: Definición de Protocolo de Investigación

**Descripción**: Implementar un asistente guiado paso a paso para definir el protocolo de revisión sistemática, incluyendo Matriz Es/No Es, framework PICO, preguntas de investigación, criterios de inclusión/exclusión y estrategia de búsqueda.

**Valor de Negocio**: Estandarizar y facilitar la creación de protocolos de investigación rigurosos siguiendo mejores prácticas académicas.

**Criterios de Aceptación Épica**:
- El asistente guía al usuario a través de 6 pasos estructurados
- Se implementan todos los componentes del protocolo (Es/No Es, PICO, criterios, etc.)
- El sistema valida la completitud del protocolo
- Los protocolos se almacenan y pueden editarse posteriormente

**Estimación Total**: 21 puntos

**Prioridad**: Alta (Crítica)

---

## ÉPICA 4: Cribado Inteligente de Referencias con IA

**Descripción**: Desarrollar el módulo de clasificación automática de referencias bibliográficas usando embeddings vectoriales (MiniLM) y machine learning para acelerar el proceso de cribado, con capacidad de revisión manual y ajuste de umbrales.

**Valor de Negocio**: Reducir drásticamente el tiempo de cribado manual de referencias (de semanas a horas) manteniendo alta precisión.

**Criterios de Aceptación Épica**:
- El sistema genera embeddings de referencias y las clasifica automáticamente
- Los investigadores pueden ajustar umbrales de clasificación
- Se proporciona interfaz para revisión manual y corrección
- El sistema aprende de las correcciones manuales
- Se muestran estadísticas de cribado en tiempo real

**Estimación Total**: 34 puntos

**Prioridad**: Alta (Crítica - Componente innovador de la tesis)

---

## ÉPICA 5: Validación y Cumplimiento PRISMA

**Descripción**: Implementar el checklist completo PRISMA 2020 con 27 ítems, validación automática con IA, sugerencias contextuales y seguimiento de cumplimiento para garantizar calidad metodológica.

**Valor de Negocio**: Asegurar que las revisiones sistemáticas cumplan con estándares internacionales de calidad y rigor metodológico.

**Criterios de Aceptación Épica**:
- Se implementan los 27 ítems PRISMA 2020 organizados por secciones
- La IA valida automáticamente el cumplimiento de cada ítem
- Se generan sugerencias específicas para mejorar cada ítem
- Se calcula y muestra el porcentaje de cumplimiento PRISMA
- Se genera diagrama de flujo PRISMA automáticamente

**Estimación Total**: 21 puntos

**Prioridad**: Alta (Crítica - Requisito metodológico)

---

## ÉPICA 6: Generación Automatizada de Artículos con IA

**Descripción**: Desarrollar un sistema de generación automática de borradores de artículos científicos usando IA (Gemini), con editor estructurado, control de versiones y capacidad de refinamiento iterativo.

**Valor de Negocio**: Acelerar la escritura de artículos científicos generando borradores de alta calidad basados en los datos del proyecto.

**Criterios de Aceptación Épica**:
- La IA genera borradores de secciones individuales o artículos completos
- Se implementa editor estructurado por secciones estándar
- El sistema mantiene control de versiones con historial completo
- Los usuarios pueden editar y refinar el contenido generado
- Se calculan estadísticas del artículo (palabras, completitud)

**Estimación Total**: 21 puntos

**Prioridad**: Media-Alta (Diferenciador importante)

---

## ÉPICA 7: Exportación y Generación de Reportes

**Descripción**: Implementar funcionalidades completas de exportación en múltiples formatos (PDF, DOCX, LaTeX, BibTeX, RIS) y generación de reportes ejecutivos y diagramas PRISMA.

**Valor de Negocio**: Facilitar la publicación y compartición de resultados en formatos estándar académicos.

**Criterios de Aceptación Épica**:
- El sistema exporta artículos en PDF, DOCX y LaTeX
- El sistema exporta referencias en BibTeX, RIS, EndNote
- Se genera diagrama de flujo PRISMA automáticamente
- Se generan reportes ejecutivos con estadísticas del proyecto
- Los usuarios pueden seleccionar qué contenido exportar

**Estimación Total**: 21 puntos

**Prioridad**: Media (Necesaria para completitud)

---

## ÉPICA 8: Infraestructura y Despliegue

**Descripción**: Configurar la infraestructura completa del sistema incluyendo base de datos Supabase, integración con APIs de IA, deployment en Vercel, monitoreo y respaldos automáticos.

**Valor de Negocio**: Garantizar que el sistema sea confiable, escalable y esté disponible para los usuarios.

**Criterios de Aceptación Épica**:
- Base de datos Supabase configurada con todas las tablas y RLS
- Integración con Gemini API funcionando correctamente
- Sistema desplegado en Vercel con CI/CD
- Respaldos automáticos configurados
- Monitoreo y logging implementados

**Estimación Total**: 13 puntos

**Prioridad**: Alta (Requisito técnico)

---

## Resumen de Épicas

| # | Épica | Estimación | Prioridad | Sprint Sugerido |
|---|-------|------------|-----------|-----------------|
| 1 | Gestión de Usuarios y Seguridad | 21 pts | Alta | Sprint 1 |
| 2 | Gestión de Proyectos RSL | 13 pts | Alta | Sprint 1 |
| 3 | Definición de Protocolo | 21 pts | Alta | Sprint 2 |
| 4 | Cribado con IA | 34 pts | Alta | Sprint 3-4 |
| 5 | Validación PRISMA | 21 pts | Alta | Sprint 5 |
| 6 | Generación de Artículos | 21 pts | Media-Alta | Sprint 6 |
| 7 | Exportación y Reportes | 21 pts | Media | Sprint 7 |
| 8 | Infraestructura | 13 pts | Alta | Transversal |

**Total Estimado**: 165 puntos de historia

**Duración Estimada**: 7-8 sprints de 2 semanas (14-16 semanas)

---

**Fecha de elaboración**: Enero 2025  
**Elaborado por**: Estudiante Tesista - ESPE  
**Versión**: 1.0
