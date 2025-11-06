# Historias de Usuario Actualizadas - Basadas en Encuesta

## Cambios Principales

Basado en los resultados de la encuesta, se han **repriorizado** y **agregado nuevas historias de usuario** para enfocarse en los mayores dolores identificados:

1. ✅ **Screening con IA** - Ya implementado, mantener prioridad CRÍTICA
2. 🆕 **Extracción automática de datos** - NUEVA, prioridad CRÍTICA
3. 🆕 **Búsqueda centralizada en APIs** - NUEVA, prioridad CRÍTICA
4. 🆕 **Checklists de calidad adicionales** - NUEVA, prioridad ALTA
5. ⬆️ **Exportación LaTeX/BibTeX** - Aumentada a prioridad ALTA

---

## ÉPICA 1: Autenticación y Gestión de Usuarios

### HU-01: Inicio de Sesión con Google OAuth ⭐ ACTUALIZADA

**Como** investigador,  
**Quiero** iniciar sesión con mi cuenta de Google,  
**Para** acceder rápidamente sin crear una nueva cuenta.

**Descripción**: El sistema debe permitir autenticación mediante Google OAuth para facilitar el acceso con cuentas institucionales (@espe.edu.ec).

**Fecha Inicio**: 28 de octubre de 2025  
**Fecha Fin**: 1 de noviembre de 2025  
**Responsable**: Desarrollador Frontend  
**Prioridad**: CRÍTICA ⬆️ (aumentada desde ALTA)  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
- ✅ Botón "Continuar con Google" visible en página de login
- ✅ Integración con Google OAuth 2.0
- ✅ Creación automática de perfil al primer login
- ✅ Asignación de rol "Investigador" por defecto
- ✅ Redirección a dashboard después de autenticación exitosa
- ✅ Manejo de errores de autenticación
- ✅ Compatible con cuentas @espe.edu.ec

---

## ÉPICA 9: Extracción Automática de Datos 🆕

### HU-35: Extracción Automática de Datos con IA

**Como** investigador,  
**Quiero** que la IA extraiga automáticamente datos clave de los artículos incluidos,  
**Para** reducir el tiempo dedicado a la extracción manual de datos.

**Descripción**: El sistema debe usar IA (Gemini) para identificar y extraer automáticamente información estructurada de los PDFs de artículos: metodología, tamaño de muestra, intervenciones, resultados principales, conclusiones.

**Fecha Inicio**: 4 de noviembre de 2025  
**Fecha Fin**: 15 de noviembre de 2025  
**Responsable**: Desarrollador IA/Backend  
**Prioridad**: CRÍTICA  
**Estimación**: 13 puntos

**Criterios de Aceptación**:
- ✅ Carga de PDFs de artículos incluidos
- ✅ Extracción automática de campos: metodología, muestra, intervención, resultados, conclusiones
- ✅ Visualización de datos extraídos en tabla estructurada
- ✅ Edición manual de datos extraídos
- ✅ Indicador de confianza (0-100%) para cada campo extraído
- ✅ Exportación de datos a CSV/Excel
- ✅ Procesamiento en lote de múltiples artículos
- ✅ Historial de extracciones con versiones

---

### HU-36: Configuración de Campos de Extracción

**Como** investigador,  
**Quiero** personalizar qué campos extraer de los artículos,  
**Para** adaptar la extracción a las necesidades específicas de mi RSL.

**Descripción**: Permitir configurar campos personalizados de extracción según el tipo de estudio y objetivos de la revisión.

**Fecha Inicio**: 16 de noviembre de 2025  
**Fecha Fin**: 22 de noviembre de 2025  
**Responsable**: Desarrollador Frontend  
**Prioridad**: ALTA  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
- ✅ Interfaz para definir campos personalizados
- ✅ Tipos de campo: texto, número, fecha, selección múltiple
- ✅ Plantillas predefinidas por tipo de estudio (RCT, observacional, cualitativo)
- ✅ Guardar configuración de campos por proyecto
- ✅ IA adapta extracción según campos definidos

---

## ÉPICA 10: Búsqueda Centralizada en APIs 🆕

### HU-37: Integración con APIs de Bases de Datos

**Como** investigador,  
**Quiero** ejecutar búsquedas en Scopus, Web of Science e IEEE desde el sistema,  
**Para** centralizar la recopilación de referencias sin visitar múltiples sitios.

**Descripción**: Integrar APIs de las principales bases de datos académicas para ejecutar búsquedas directamente desde el sistema y importar resultados automáticamente.

**Fecha Inicio**: 23 de noviembre de 2025  
**Fecha Fin**: 6 de diciembre de 2025  
**Responsable**: Desarrollador Backend  
**Prioridad**: CRÍTICA  
**Estimación**: 21 puntos

**Criterios de Aceptación**:
- ✅ Configuración de credenciales API (Scopus, WoS, IEEE)
- ✅ Interfaz para ejecutar búsquedas con strings del protocolo
- ✅ Selección de bases de datos a consultar
- ✅ Importación automática de resultados al proyecto
- ✅ Detección y eliminación de duplicados entre bases
- ✅ Visualización de resultados por base de datos
- ✅ Límite de resultados configurable
- ✅ Manejo de errores de API (límites, credenciales inválidas)
- ✅ Registro de búsquedas ejecutadas (auditoría)

---

### HU-38: Búsqueda en Google Scholar

**Como** investigador,  
**Quiero** incluir resultados de Google Scholar en mis búsquedas,  
**Para** ampliar la cobertura de literatura gris y artículos de acceso abierto.

**Descripción**: Agregar Google Scholar como fuente adicional de búsqueda con scraping o API no oficial.

**Fecha Inicio**: 7 de diciembre de 2025  
**Fecha Fin**: 13 de diciembre de 2025  
**Responsable**: Desarrollador Backend  
**Prioridad**: MEDIA  
**Estimación**: 8 puntos

**Criterios de Aceptación**:
- ✅ Búsqueda en Google Scholar con strings del protocolo
- ✅ Importación de metadatos (título, autores, año, abstract)
- ✅ Manejo de límites de rate limiting
- ✅ Detección de duplicados con otras bases

---

## ÉPICA 11: Evaluación de Calidad Avanzada 🆕

### HU-39: Checklists de Calidad Adicionales

**Como** investigador,  
**Quiero** aplicar checklists de calidad específicos (CASPe, JADAD, Newcastle-Ottawa),  
**Para** evaluar diferentes tipos de estudios según estándares reconocidos.

**Descripción**: Agregar checklists de evaluación de calidad adicionales al PRISMA ya implementado, adaptados a diferentes diseños de estudio.

**Fecha Inicio**: 14 de diciembre de 2025  
**Fecha Fin**: 20 de diciembre de 2025  
**Responsable**: Desarrollador Frontend  
**Prioridad**: ALTA  
**Estimación**: 8 puntos

**Criterios de Aceptación**:
- ✅ Checklists disponibles: CASPe (11 ítems), JADAD (5 ítems), Newcastle-Ottawa (8 ítems)
- ✅ Selección de checklist según tipo de estudio
- ✅ Interfaz para completar cada checklist por artículo
- ✅ Cálculo automático de puntuación
- ✅ Clasificación de calidad (alta, moderada, baja)
- ✅ Reporte de calidad por estudio
- ✅ Exportación de evaluaciones de calidad

---

### HU-40: Sugerencias de IA para Evaluación de Calidad

**Como** investigador,  
**Quiero** que la IA sugiera respuestas para los ítems de calidad,  
**Para** acelerar la evaluación y reducir sesgos.

**Descripción**: Usar IA para analizar el texto del artículo y sugerir respuestas a los ítems de los checklists de calidad.

**Fecha Inicio**: 21 de diciembre de 2025  
**Fecha Fin**: 3 de enero de 2026  
**Responsable**: Desarrollador IA  
**Prioridad**: MEDIA  
**Estimación**: 13 puntos

**Criterios de Aceptación**:
- ✅ IA analiza PDF del artículo
- ✅ Sugiere respuestas para cada ítem del checklist
- ✅ Muestra evidencia textual que respalda la sugerencia
- ✅ Permite aceptar/rechazar sugerencias
- ✅ Indicador de confianza por sugerencia

---

## ÉPICA 12: Exportación y Gestión de Referencias Mejorada 🆕

### HU-41: Exportación Optimizada a LaTeX/BibTeX

**Como** investigador,  
**Quiero** exportar referencias en formato BibTeX optimizado para Overleaf,  
**Para** facilitar la redacción del artículo final sin errores de formato.

**Descripción**: Mejorar la exportación de referencias con formato BibTeX válido, compatible con Overleaf y gestores de referencias.

**Fecha Inicio**: 4 de enero de 2026  
**Fecha Fin**: 10 de enero de 2026  
**Responsable**: Desarrollador Backend  
**Prioridad**: ALTA ⬆️ (aumentada desde MEDIA)  
**Estimación**: 5 puntos

**Criterios de Aceptación**:
- ✅ Exportación en formato BibTeX válido
- ✅ Selección de estilo de citación (APA, IEEE, Vancouver, Harvard)
- ✅ Generación de claves únicas para cada referencia
- ✅ Inclusión de todos los metadatos (DOI, URL, abstract)
- ✅ Archivo .bib descargable
- ✅ Compatible con Overleaf, LaTeX, BibDesk
- ✅ Exportación de referencias seleccionadas o todas

---

### HU-42: Integración con Zotero/Mendeley

**Como** investigador,  
**Quiero** sincronizar referencias con Zotero o Mendeley,  
**Para** mantener mi biblioteca personal actualizada.

**Descripción**: Permitir exportación e importación bidireccional con gestores de referencias populares.

**Fecha Inicio**: 11 de enero de 2026  
**Fecha Fin**: 17 de enero de 2026  
**Responsable**: Desarrollador Backend  
**Prioridad**: MEDIA  
**Estimación**: 8 puntos

**Criterios de Aceptación**:
- ✅ Exportación a formato RIS (compatible con Zotero/Mendeley)
- ✅ Importación desde Zotero/Mendeley
- ✅ Sincronización de metadatos
- ✅ Manejo de conflictos en sincronización

---

## Resumen de Cambios en Prioridades

| Historia | Prioridad Anterior | Prioridad Nueva | Razón |
|----------|-------------------|-----------------|-------|
| HU-01 (Google OAuth) | ALTA | CRÍTICA ⬆️ | Barrera de adopción identificada |
| HU-35 (Extracción IA) | - | CRÍTICA 🆕 | Mayor dolor identificado (80%) |
| HU-37 (APIs búsqueda) | - | CRÍTICA 🆕 | Frustración con búsquedas manuales |
| HU-39 (Checklists) | - | ALTA 🆕 | Solicitado por 40% de encuestados |
| HU-41 (LaTeX export) | MEDIA | ALTA ⬆️ | Frustración con gestión de referencias |

---

## Nuevos Sprints Propuestos

### Sprint 1 (28 oct - 8 nov): Autenticación Mejorada
- HU-01: Google OAuth (5 pts)
- HU-02: Registro con roles (3 pts)
- HU-03: Gestión de perfil (3 pts)
- **Total**: 11 puntos

### Sprint 2 (9 nov - 22 nov): Extracción Automática de Datos
- HU-35: Extracción con IA (13 pts)
- HU-36: Campos personalizados (5 pts)
- **Total**: 18 puntos

### Sprint 3 (23 nov - 13 dic): Búsqueda Centralizada
- HU-37: APIs de bases de datos (21 pts)
- **Total**: 21 puntos

### Sprint 4 (14 dic - 3 ene): Evaluación de Calidad
- HU-39: Checklists adicionales (8 pts)
- HU-40: Sugerencias IA para calidad (13 pts)
- **Total**: 21 puntos

### Sprint 5 (4 ene - 17 ene): Exportación Mejorada
- HU-41: LaTeX/BibTeX optimizado (5 pts)
- HU-42: Integración Zotero/Mendeley (8 pts)
- **Total**: 13 puntos

---

**Fecha de actualización**: 24 de octubre de 2025  
**Basado en**: Encuesta a 5 docentes investigadores ESPE  
**Próxima revisión**: Después de Sprint 2 (feedback de usuarios beta)
