# Historias de Usuario - Actualizado
## Sistema Web para Gestión de Revisiones Sistemáticas con IA
### Total: 100 Puntos de Historia

---

# ÉPICA 1: Autenticación y Gestión de Usuarios (8 pts)

## HU-001: Iniciar Sesión con Google

**Como** investigador  
**Quiero** iniciar sesión con mi cuenta de Google  
**Para** acceder rápidamente sin crear otra contraseña

**Descripción**: El sistema debe permitir autenticación mediante Google OAuth 2.0, creando automáticamente el perfil del usuario en el primer inicio de sesión.

**Fecha Inicio**: Sprint 1 - Día 1  
**Fecha Fin**: Sprint 1 - Día 3  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. Botón "Continuar con Google" visible en login y registro
2. Flujo OAuth 2.0 funciona correctamente
3. Se crea usuario automáticamente en primera autenticación
4. Usuario es redirigido al dashboard después de autenticar
5. Sesión persiste al recargar página
6. Se almacena foto de perfil y nombre de Google
7. Funciona en todos los navegadores modernos

---

## HU-002: Gestión Básica de Usuarios

**Como** usuario autenticado  
**Quiero** ver mi perfil y gestionar configuración básica  
**Para** personalizar mi experiencia en el sistema

**Descripción**: Dashboard básico con perfil de usuario, selección de rol (Investigador/Revisor) y cierre de sesión.

**Fecha Inicio**: Sprint 1 - Día 3  
**Fecha Fin**: Sprint 1 - Día 5  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Media  
**Estimación**: 3 puntos

**Criterios de Aceptación**:
1. Usuario puede ver su perfil (nombre, email, foto, rol)
2. Usuario puede seleccionar su rol principal
3. Usuario puede cerrar sesión
4. Navegación clara entre secciones
5. Control de acceso por roles funciona
6. Administradores ven opciones adicionales
7. Interfaz responsive

---

# ÉPICA 2: Gestión de Proyectos y Protocolo PICO (12 pts)

## HU-003: Crear y Gestionar Proyectos RSL

**Como** investigador  
**Quiero** crear proyectos de revisión sistemática y ver mi dashboard  
**Para** organizar mis investigaciones

**Descripción**: Dashboard con estadísticas, lista de proyectos y formulario de creación con información básica.

**Fecha Inicio**: Sprint 1 - Día 5  
**Fecha Fin**: Sprint 1 - Día 8  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. Dashboard muestra: total proyectos, activos, completados, referencias
2. Lista de proyectos con filtros por estado
3. Formulario de creación: título, descripción, área, fechas
4. Proyectos se guardan en Supabase
5. Usuario puede editar y eliminar proyectos
6. Búsqueda de proyectos por título
7. Estadísticas se actualizan en tiempo real

---

## HU-004: Definir Protocolo PICO

**Como** investigador  
**Quiero** definir mi protocolo de investigación con framework PICO  
**Para** establecer la base de mi revisión sistemática

**Descripción**: Asistente guiado con 4 pasos: PICO, preguntas de investigación, criterios de inclusión/exclusión, estrategia de búsqueda.

**Fecha Inicio**: Sprint 1 - Día 8  
**Fecha Fin**: Sprint 2 - Día 2  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Alta  
**Estimación**: 7 puntos

**Criterios de Aceptación**:
1. Paso 1: Framework PICO (Población, Intervención, Comparación, Outcome)
2. Paso 2: Preguntas de investigación (principales y secundarias)
3. Paso 3: Criterios de inclusión y exclusión
4. Paso 4: Estrategia de búsqueda (bases de datos, cadena de búsqueda)
5. Validación de completitud en cada paso
6. Autoguardado automático
7. Resumen final antes de confirmar
8. Protocolo se guarda en base de datos

---

# ÉPICA 3: Búsqueda Centralizada en APIs (15 pts)

## HU-005: Configurar Búsqueda en APIs Académicas

**Como** investigador  
**Quiero** buscar referencias en múltiples bases de datos desde un solo lugar  
**Para** ahorrar tiempo y no tener que acceder a cada plataforma por separado

**Descripción**: Interfaz unificada para buscar en Scopus, Web of Science, IEEE Xplore y PubMed usando sus APIs.

**Fecha Inicio**: Sprint 2 - Día 2  
**Fecha Fin**: Sprint 2 - Día 7  
**Responsable**: Desarrollador Backend  
**Prioridad**: Alta  
**Estimación**: 10 puntos

**Criterios de Aceptación**:
1. Integración con al menos 2 APIs (PubMed + IEEE como mínimo viable)
2. Interfaz de búsqueda unificada con cadena de búsqueda
3. Selección de bases de datos a consultar
4. Filtros: año, tipo de documento, idioma
5. Resultados se muestran en tabla unificada
6. Indicador de fuente para cada resultado
7. Manejo de errores de API (rate limits, timeouts)
8. Progreso de búsqueda en tiempo real

---

## HU-006: Importar y Eliminar Duplicados

**Como** investigador  
**Quiero** importar resultados de búsqueda y eliminar duplicados automáticamente  
**Para** tener una lista limpia de referencias únicas

**Descripción**: Importación de resultados de APIs y detección automática de duplicados por DOI, título y autores.

**Fecha Inicio**: Sprint 2 - Día 7  
**Fecha Fin**: Sprint 2 - Día 10  
**Responsable**: Desarrollador Backend  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. Importación de resultados de búsqueda API
2. Importación manual de archivos BibTeX/RIS
3. Detección de duplicados por: DOI, título similar (>90%), autores
4. Interfaz para revisar duplicados detectados
5. Usuario puede confirmar o rechazar eliminación
6. Referencias se guardan en base de datos
7. Estadísticas de importación (total, duplicados, únicos)

---

# ÉPICA 4: Cribado Inteligente con IA que Aprende (20 pts) ⭐⭐

## HU-007: Generar Embeddings y Clasificar Automáticamente

**Como** investigador  
**Quiero** que el sistema clasifique automáticamente mis referencias  
**Para** reducir drásticamente el tiempo de screening manual

**Descripción**: Generación de embeddings vectoriales (MiniLM) y clasificación automática basada en similitud con protocolo PICO.

**Fecha Inicio**: Sprint 2 - Día 10  
**Fecha Fin**: Sprint 3 - Día 5  
**Responsable**: Desarrollador Backend/IA  
**Prioridad**: Máxima  
**Estimación**: 10 puntos

**Criterios de Aceptación**:
1. Generación de embeddings de 384 dimensiones (MiniLM)
2. Embeddings se calculan de título + resumen
3. Cálculo de similitud coseno con protocolo PICO
4. Score de relevancia (0-100) para cada referencia
5. Clasificación automática: Incluida (>umbral) / Excluida (<umbral)
6. Umbral ajustable por usuario (default: 70)
7. Proceso asíncrono con barra de progreso
8. Manejo de referencias sin resumen

---

## HU-008: IA que Aprende de Decisiones Manuales

**Como** investigador  
**Quiero** que la IA aprenda de mis decisiones de screening  
**Para** que mejore continuamente su precisión

**Descripción**: Sistema de machine learning incremental que ajusta el modelo basándose en correcciones manuales del investigador.

**Fecha Inicio**: Sprint 3 - Día 5  
**Fecha Fin**: Sprint 3 - Día 10  
**Responsable**: Desarrollador IA/ML  
**Prioridad**: Máxima  
**Estimación**: 8 puntos

**Criterios de Aceptación**:
1. Sistema registra todas las decisiones manuales (incluir/excluir)
2. Modelo se reentrena cada 20 decisiones manuales
3. Ajuste de pesos del modelo basado en feedback
4. Notificación al usuario cuando modelo mejora
5. Métricas de precisión visibles (accuracy, precision, recall)
6. Usuario puede ver cómo ha mejorado el modelo
7. Opción de revertir a modelo original
8. Modelo personalizado por proyecto

---

## HU-009: Revisión Manual Optimizada

**Como** investigador  
**Quiero** revisar referencias de forma eficiente con interfaz optimizada  
**Para** validar y corregir la clasificación automática rápidamente

**Descripción**: Interfaz de revisión con atajos de teclado, navegación rápida y acciones masivas.

**Fecha Inicio**: Sprint 3 - Día 10  
**Fecha Fin**: Sprint 4 - Día 2  
**Responsable**: Desarrollador Frontend  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. Vista detallada de referencia con toda la información
2. Atajos de teclado: I (incluir), E (excluir), P (pendiente), → (siguiente)
3. Navegación rápida entre referencias
4. Filtros: todas, incluidas, excluidas, pendientes, por score
5. Búsqueda de texto completo
6. Selección múltiple con checkboxes
7. Acciones masivas: incluir/excluir múltiples
8. Estadísticas de progreso en tiempo real
9. Indicador visual de score de relevancia

---

# ÉPICA 5: Extracción Automática de Datos con IA (18 pts) ⭐⭐

## HU-010: Definir Plantilla de Extracción

**Como** investigador  
**Quiero** crear una plantilla personalizada de extracción de datos  
**Para** definir qué información necesito de cada estudio

**Descripción**: Constructor de plantillas con campos predefinidos y personalizados para extracción de datos.

**Fecha Inicio**: Sprint 4 - Día 2  
**Fecha Fin**: Sprint 4 - Día 5  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. Campos predefinidos: autor, año, metodología, muestra, intervención, resultados, conclusiones
2. Usuario puede agregar campos personalizados
3. Tipos de campo: texto corto, texto largo, número, fecha, selección múltiple
4. Plantilla se guarda por proyecto
5. Vista previa de plantilla
6. Validación de campos requeridos
7. Plantilla se puede editar después de crear

---

## HU-011: Extracción Automática con IA

**Como** investigador  
**Quiero** que la IA extraiga automáticamente datos de mis estudios incluidos  
**Para** ahorrar días de trabajo manual tedioso

**Descripción**: Sistema de extracción automática usando IA (Gemini) que lee el PDF/texto del estudio y extrae datos según la plantilla.

**Fecha Inicio**: Sprint 4 - Día 5  
**Fecha Fin**: Sprint 4 - Día 10  
**Responsable**: Desarrollador Backend/IA  
**Prioridad**: Máxima  
**Estimación**: 10 puntos

**Criterios de Aceptación**:
1. Usuario selecciona estudios para extracción
2. IA lee el contenido del estudio (texto o PDF)
3. IA extrae datos según plantilla definida
4. Extracción usa Gemini API con prompts optimizados
5. Proceso asíncrono con progreso visible
6. Manejo de estudios sin texto completo
7. Detección de datos faltantes
8. Confianza de extracción por campo (alta/media/baja)
9. Tiempo de extracción < 30 segundos por estudio

---

## HU-012: Revisar y Exportar Datos Extraídos

**Como** investigador  
**Quiero** revisar y corregir los datos extraídos automáticamente  
**Para** asegurar precisión antes de análisis

**Descripción**: Interfaz de revisión de datos extraídos con edición manual y exportación a formatos tabulares.

**Fecha Inicio**: Sprint 4 - Día 10  
**Fecha Fin**: Sprint 5 - Día 2  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Alta  
**Estimación**: 3 puntos

**Criterios de Aceptación**:
1. Tabla con todos los estudios y datos extraídos
2. Indicador de confianza por campo (color)
3. Edición inline de cualquier campo
4. Validación de consistencia entre estudios
5. Detección de valores atípicos
6. Exportación a CSV y Excel
7. Exportación incluye metadatos (fecha, proyecto, plantilla)
8. Autoguardado de cambios

---

# ÉPICA 6: Checklists de Calidad Digitales (12 pts)

## HU-013: Implementar Checklists de Calidad

**Como** investigador  
**Quiero** evaluar la calidad metodológica con checklists digitales  
**Para** determinar qué estudios son de alta calidad

**Descripción**: Implementación de 3 checklists: CASPe, JADAD y Newcastle-Ottawa con cálculo automático de scores.

**Fecha Inicio**: Sprint 5 - Día 2  
**Fecha Fin**: Sprint 5 - Día 7  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Alta  
**Estimación**: 8 puntos

**Criterios de Aceptación**:
1. Checklist CASPe (11 preguntas para estudios cualitativos/cuantitativos)
2. Escala JADAD (5 ítems para ensayos clínicos, score 0-5)
3. Escala Newcastle-Ottawa (8 ítems para estudios observacionales, score 0-9)
4. Usuario selecciona checklist apropiado por estudio
5. Interfaz clara con preguntas y opciones de respuesta
6. Cálculo automático de score total
7. Clasificación: alta/media/baja calidad
8. Resultados se guardan por estudio
9. Vista resumen de calidad de todos los estudios

---

## HU-014: Evaluación por Pares y Sugerencias IA

**Como** investigador  
**Quiero** que dos revisores evalúen independientemente y recibir sugerencias de IA  
**Para** aumentar la confiabilidad de la evaluación

**Descripción**: Sistema de evaluación por pares con detección de conflictos y sugerencias de IA para evaluación.

**Fecha Inicio**: Sprint 5 - Día 7  
**Fecha Fin**: Sprint 5 - Día 10  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Media  
**Estimación**: 4 puntos

**Criterios de Aceptación**:
1. Asignación de estudios a dos revisores
2. Evaluaciones independientes (no ven respuesta del otro)
3. Detección automática de conflictos (diferencia > 2 puntos)
4. Interfaz de resolución de conflictos
5. IA sugiere respuestas basadas en contenido del estudio
6. Usuario puede aceptar o rechazar sugerencias
7. Estadísticas de acuerdo inter-evaluador (Kappa)
8. Exportación de resultados de calidad

---

# ÉPICA 7: PRISMA y Generación de Reportes (10 pts)

## HU-015: Validación PRISMA 2020

**Como** investigador  
**Quiero** validar mi cumplimiento con PRISMA 2020  
**Para** asegurar que mi revisión cumple estándares internacionales

**Descripción**: Checklist PRISMA 2020 (27 ítems) con validación automática y sugerencias de IA.

**Fecha Inicio**: Sprint 5 - Día 10  
**Fecha Fin**: Sprint 6 - Día 3  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Alta  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. Checklist PRISMA 2020 completo (27 ítems)
2. Ítems organizados por secciones
3. Usuario marca ítems como completados
4. IA valida automáticamente cumplimiento
5. Sugerencias de IA para cada ítem
6. Cálculo de porcentaje de cumplimiento
7. Generación de diagrama de flujo PRISMA
8. Diagrama muestra: identificación, cribado, elegibilidad, inclusión
9. Exportación de diagrama en PNG/SVG

---

## HU-016: Generación Básica de Artículos

**Como** investigador  
**Quiero** generar un borrador de mi artículo con IA  
**Para** acelerar el proceso de escritura

**Descripción**: Editor básico con generación de borradores de secciones usando IA basándose en protocolo y resultados.

**Fecha Inicio**: Sprint 6 - Día 3  
**Fecha Fin**: Sprint 6 - Día 7  
**Responsable**: Desarrollador Full-Stack  
**Prioridad**: Media  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
1. Editor con secciones: Resumen, Introducción, Métodos, Resultados, Discusión, Conclusiones
2. IA genera borrador de cada sección
3. Generación usa protocolo PICO, resultados de cribado y datos extraídos
4. Usuario puede editar contenido generado
5. Autoguardado cada 30 segundos
6. Conteo de palabras por sección
7. Versión básica (sin control de versiones complejo)
8. Exportación a texto plano

---

# ÉPICA 8: Exportación Mejorada y Despliegue (5 pts)

## HU-017: Exportación Optimizada

**Como** investigador  
**Quiero** exportar mi trabajo en múltiples formatos académicos  
**Para** publicar y compartir mis resultados fácilmente

**Descripción**: Exportación mejorada en PDF, DOCX, LaTeX (optimizado), BibTeX y reportes ejecutivos.

**Fecha Inicio**: Sprint 6 - Día 7  
**Fecha Fin**: Sprint 6 - Día 10  
**Responsable**: Desarrollador Backend  
**Prioridad**: Alta  
**Estimación**: 3 puntos

**Criterios de Aceptación**:
1. Exportación de artículo a PDF profesional
2. Exportación a DOCX con formato
3. **Exportación a LaTeX optimizada** (soluciona frustración)
4. Exportación de referencias a BibTeX, RIS, EndNote
5. Exportación de tabla de datos extraídos a Excel/CSV
6. Diagrama PRISMA en PNG/SVG
7. Reporte ejecutivo con estadísticas del proyecto
8. Selección de qué contenido exportar
9. Descarga automática de archivos

---

## HU-018: Despliegue en Producción

**Como** desarrollador  
**Quiero** desplegar el sistema en Vercel con Supabase  
**Para** que esté disponible para usuarios reales

**Descripción**: Configuración completa de producción con base de datos, APIs y deployment automático.

**Fecha Inicio**: Sprint 6 - Día 10  
**Fecha Fin**: Sprint 7 - Día 2  
**Responsable**: Desarrollador DevOps  
**Prioridad**: Alta  
**Estimación**: 2 puntos

**Criterios de Aceptación**:
1. Base de datos Supabase configurada con todas las tablas
2. Row Level Security (RLS) implementado
3. Variables de entorno configuradas
4. Integración con Google OAuth en producción
5. Integración con Gemini API configurada
6. Sistema desplegado en Vercel
7. CI/CD con GitHub funcionando
8. Dominio personalizado (opcional)
9. Sistema funciona correctamente en producción
10. Monitoreo básico configurado

---

## Resumen de Historias de Usuario

| Épica | # Historias | Puntos | Prioridad |
|-------|-------------|--------|-----------|
| 1. Autenticación | 2 | 8 | Alta |
| 2. Proyectos y Protocolo | 2 | 12 | Alta |
| 3. Búsqueda APIs | 2 | 15 | Alta |
| 4. Cribado IA | 3 | 20 | **Máxima** |
| 5. Extracción Datos | 3 | 18 | **Máxima** |
| 6. Checklists Calidad | 2 | 12 | Alta |
| 7. PRISMA y Reportes | 2 | 10 | Alta |
| 8. Exportación y Deploy | 2 | 5 | Alta |

**Total**: 18 Historias de Usuario  
**Estimación Total**: 100 puntos ✅

---

**Fecha de elaboración**: Enero 2025  
**Basado en**: Encuesta a 5 investigadores ESPE  
**Elaborado por**: Estudiante Tesista - ESPE  
**Versión**: 2.0 (Actualizada con hallazgos de encuesta)
