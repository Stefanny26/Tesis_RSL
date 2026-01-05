# Análisis de Requerimientos Actualizado
## Sistema Web para Gestión de Revisiones Sistemáticas con IA
### Basado en Encuesta a Investigadores - Universidad de las Fuerzas Armadas ESPE

---

## HALLAZGOS CLAVE DE LA ENCUESTA

### Participantes
- **5 investigadores** con experiencia variada (0-10+ años)
- **Frecuencia de RSL**: Anual a múltiples por año
- **Familiaridad**: Alta con PRISMA (4.2/5), media con Cochrane y Kitchenham

### Fases Más Difíciles (Escala 1-5)
1. **Screening de títulos/abstracts**: 4.4/5 ⭐ PRIORIDAD MÁXIMA
2. **Screening de texto completo**: 4.4/5 ⭐ PRIORIDAD MÁXIMA
3. **Extracción de datos**: 4.4/5 ⭐ PRIORIDAD MÁXIMA
4. **Evaluación de calidad**: 4.2/5 ⭐ ALTA PRIORIDAD
5. **Síntesis y reporte**: 4.0/5

### Fases Más Consumidoras de Tiempo
- Screening (100% de encuestados)
- Extracción de datos (80%)
- Síntesis y análisis (60%)

### Principales Frustraciones
- "Screening manual consume demasiado tiempo"
- "Organizar referencias en LaTeX/Overleaf es tedioso"
- "Encontrar información similar en múltiples estudios"
- "Mantener consistencia en extracción de datos"

### Funcionalidades Más Valoradas (Importancia 1-5)
1. **IA que aprende de decisiones de screening**: 5.0/5 ⭐
2. **Extracción automática de datos**: 5.0/5 ⭐
3. **Búsqueda centralizada en APIs**: 4.8/5 ⭐
4. **Checklists digitales de calidad**: 4.6/5 ⭐
5. **Validación PRISMA automática**: 4.6/5
6. **Generación de reportes**: 4.4/5

---

## 1. REQUERIMIENTOS FUNCIONALES PRIORIZADOS

### RF-01: Autenticación y Gestión de Usuarios ⭐ CRÍTICO
- **RF-01.1**: Autenticación con Google OAuth (Sign-In with Google)
- **RF-01.2**: Autenticación tradicional con correo y contraseña
- **RF-01.3**: Tres roles: Administrador, Investigador, Revisor
- **RF-01.4**: Gestión básica de perfiles de usuario
- **RF-01.5**: Sesiones seguras con tokens JWT

### RF-02: Gestión de Proyectos RSL ⭐ CRÍTICO
- **RF-02.1**: Crear y gestionar proyectos de revisión sistemática
- **RF-02.2**: Dashboard con estadísticas y progreso en tiempo real
- **RF-02.3**: Asignar miembros a proyectos con roles
- **RF-02.4**: Estados de proyecto (borrador, en progreso, completado)

### RF-03: Definición de Protocolo PICO ⭐ CRÍTICO
- **RF-03.1**: Asistente guiado para protocolo de investigación
- **RF-03.2**: Framework PICO (Población, Intervención, Comparación, Outcome)
- **RF-03.3**: Criterios de inclusión y exclusión
- **RF-03.4**: Preguntas de investigación
- **RF-03.5**: Estrategia de búsqueda

### RF-04: Búsqueda Centralizada en APIs ⭐⭐ NUEVA - ALTA PRIORIDAD
- **RF-04.1**: Integración con Scopus API para búsqueda directa
- **RF-04.2**: Integración con Web of Science API
- **RF-04.3**: Integración con IEEE Xplore API
- **RF-04.4**: Integración con PubMed/MEDLINE API
- **RF-04.5**: Búsqueda unificada en múltiples bases de datos
- **RF-04.6**: Importación automática de resultados
- **RF-04.7**: Eliminación de duplicados automática

### RF-05: Cribado Inteligente con IA que Aprende ⭐⭐ PRIORIDAD MÁXIMA
- **RF-05.1**: Generación de embeddings vectoriales (MiniLM)
- **RF-05.2**: Clasificación automática basada en protocolo PICO
- **RF-05.3**: **IA que aprende de decisiones manuales** (Machine Learning incremental)
- **RF-05.4**: Ajuste dinámico de umbral de clasificación
- **RF-05.5**: Revisión manual con interfaz optimizada
- **RF-05.6**: Acciones masivas (incluir/excluir múltiples)
- **RF-05.7**: Estadísticas de cribado en tiempo real
- **RF-05.8**: Sugerencias de IA basadas en patrones aprendidos

### RF-06: Extracción Automática de Datos con IA ⭐⭐ NUEVA - PRIORIDAD MÁXIMA
- **RF-06.1**: Definir plantilla de extracción personalizada
- **RF-06.2**: Extracción automática de datos usando IA (Gemini)
- **RF-06.3**: Campos comunes: metodología, muestra, intervención, resultados, conclusiones
- **RF-06.4**: Revisión y corrección manual de datos extraídos
- **RF-06.5**: Exportación de datos en formato tabular (CSV, Excel)
- **RF-06.6**: Validación de consistencia entre estudios
- **RF-06.7**: Detección de datos faltantes

### RF-07: Evaluación de Calidad con Checklists Digitales ⭐⭐ NUEVA - ALTA PRIORIDAD
- **RF-07.1**: Checklist CASPe (Critical Appraisal Skills Programme)
- **RF-07.2**: Escala JADAD para ensayos clínicos
- **RF-07.3**: Escala Newcastle-Ottawa para estudios observacionales
- **RF-07.4**: Evaluación por pares (dos revisores independientes)
- **RF-07.5**: Cálculo automático de scores de calidad
- **RF-07.6**: Resolución de conflictos entre revisores
- **RF-07.7**: Sugerencias de IA para evaluación

### RF-08: Validación PRISMA 2020 ⭐ ALTA PRIORIDAD
- **RF-08.1**: Checklist PRISMA 2020 completo (27 ítems)
- **RF-08.2**: Validación automática con IA
- **RF-08.3**: Sugerencias contextuales para cada ítem
- **RF-08.4**: Cálculo de porcentaje de cumplimiento
- **RF-08.5**: Generación de diagrama de flujo PRISMA

### RF-09: Generación de Artículos con IA
- **RF-09.1**: Editor estructurado por secciones estándar
- **RF-09.2**: Generación de borradores con IA (Gemini)
- **RF-09.3**: Control de versiones básico
- **RF-09.4**: Edición manual del contenido

### RF-10: Exportación Mejorada ⭐ ALTA PRIORIDAD
- **RF-10.1**: Exportación a LaTeX optimizada (soluciona frustración #2)
- **RF-10.2**: Exportación a PDF profesional
- **RF-10.3**: Exportación a DOCX
- **RF-10.4**: Referencias en BibTeX, RIS, EndNote
- **RF-10.5**: Diagrama PRISMA en PNG/SVG
- **RF-10.6**: Tabla de extracción de datos en Excel/CSV
- **RF-10.7**: Reportes ejecutivos

---

## 2. REQUERIMIENTOS NO FUNCIONALES

### RNF-01: Rendimiento ⭐ CRÍTICO
- **RNF-01.1**: Carga de interfaz < 3 segundos
- **RNF-01.2**: Clasificación de 100 referencias/minuto
- **RNF-01.3**: Búsqueda en APIs < 10 segundos
- **RNF-01.4**: Extracción de datos por estudio < 30 segundos

### RNF-02: Seguridad ⭐ CRÍTICO
- **RNF-02.1**: Autenticación OAuth 2.0 (Google)
- **RNF-02.2**: Row Level Security (RLS) en Supabase
- **RNF-02.3**: Encriptación de datos sensibles
- **RNF-02.4**: HTTPS obligatorio
- **RNF-02.5**: Protección contra inyección SQL

### RNF-03: Usabilidad ⭐ ALTA PRIORIDAD
- **RNF-03.1**: Interfaz intuitiva sin capacitación extensa
- **RNF-03.2**: Responsive (móvil, tablet, desktop)
- **RNF-03.3**: Accesibilidad WCAG 2.1 nivel AA
- **RNF-03.4**: Retroalimentación visual clara
- **RNF-03.5**: Mensajes de error orientadores

### RNF-04: Escalabilidad
- **RNF-04.1**: Soporte para 50+ usuarios simultáneos
- **RNF-04.2**: Proyectos con hasta 5,000 referencias
- **RNF-04.3**: Caché para optimizar rendimiento

### RNF-05: Disponibilidad
- **RNF-05.1**: Disponibilidad del 99%
- **RNF-05.2**: Respaldos automáticos diarios
- **RNF-05.3**: Recuperación de fallos < 10 minutos

### RNF-06: Compatibilidad
- **RNF-06.1**: Chrome, Firefox, Safari, Edge (últimas 2 versiones)
- **RNF-06.2**: Compatible con lectores de pantalla
- **RNF-06.3**: Importación desde gestores bibliográficos comunes

### RNF-07: Integridad de Datos
- **RNF-07.1**: Transacciones ACID en base de datos
- **RNF-07.2**: Autoguardado cada 30 segundos
- **RNF-07.3**: Historial de cambios para auditoría

### RNF-08: Cumplimiento Normativo
- **RNF-08.1**: Cumplimiento PRISMA 2020
- **RNF-08.2**: Estándares académicos de RSL
- **RNF-08.3**: GDPR para protección de datos

### RNF-09: Tecnología
- **RNF-09.1**: Next.js 16+ con App Router
- **RNF-09.2**: Supabase (PostgreSQL + Auth)
- **RNF-09.3**: Gemini API para IA
- **RNF-09.4**: MiniLM para embeddings
- **RNF-09.5**: TypeScript para type safety
- **RNF-09.6**: Google OAuth para autenticación

---

## 3. CAMBIOS RESPECTO A VERSIÓN ANTERIOR

### Funcionalidades Agregadas (Basadas en Encuesta)
1. ✅ **Búsqueda centralizada en APIs** (Scopus, WoS, IEEE, PubMed)
2. ✅ **Extracción automática de datos con IA**
3. ✅ **Checklists de calidad adicionales** (CASPe, JADAD, Newcastle-Ottawa)
4. ✅ **IA que aprende de decisiones** (Machine Learning incremental)
5. ✅ **Google Sign-In** (OAuth)
6. ✅ **Exportación mejorada a LaTeX**

### Funcionalidades Simplificadas
- Matriz Es/No Es → Integrada en protocolo PICO
- Control de versiones → Versión básica
- Gestión de miembros → Simplificada

### Prioridades Ajustadas
- **Máxima prioridad**: Screening con IA + Extracción de datos
- **Alta prioridad**: Búsqueda centralizada + Checklists de calidad
- **Media prioridad**: Generación de artículos

---

## 4. MÉTRICAS DE ÉXITO

### Métricas de Adopción
- Al menos 10 investigadores ESPE usen el sistema
- 80% de usuarios completen al menos 1 proyecto RSL

### Métricas de Eficiencia (vs. Proceso Manual)
- **Reducción de tiempo en screening**: 60-70%
- **Reducción de tiempo en extracción de datos**: 50-60%
- **Reducción de tiempo en validación PRISMA**: 40-50%
- **Tiempo total de RSL**: Reducción de 30-40%

### Métricas de Calidad
- Precisión de clasificación automática: > 85%
- Precisión de extracción de datos: > 80%
- Cumplimiento PRISMA promedio: > 90%

### Métricas de Satisfacción
- Satisfacción general: > 4.0/5
- Recomendarían el sistema: > 80%
- Percepción de ahorro de tiempo: > 4.0/5

---

**Fecha de elaboración**: Enero 2025  
**Basado en**: Encuesta a 5 investigadores ESPE  
**Elaborado por**: Estudiante Tesista - ESPE  
**Versión**: 2.0 (Actualizada con hallazgos de encuesta)
