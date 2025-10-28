# Análisis de Resultados de Encuesta - Sistema RSL

## Resumen Ejecutivo

Se realizó una encuesta a 5 docentes investigadores de la Universidad de las Fuerzas Armadas ESPE para identificar necesidades y prioridades en el desarrollo del sistema de gestión de revisiones sistemáticas.

---

## Perfil de Participantes

- **Áreas de conocimiento**: Ciencias de la Computación (3), Ciencias Exactas (1), Arquitectura (1)
- **Experiencia**: 0-10+ años como docentes investigadores
- **Participación en RSL**: Desde nunca hasta continua
- **Familiaridad con metodologías**: Nivel 1-5 (promedio: 2.6)

---

## Hallazgos Clave

### 1. Fases Más Difíciles (Escala 1-5)

| Fase | Dificultad Promedio | Prioridad |
|------|---------------------|-----------|
| **Screening (Título/Abstract)** | 4.2 | 🔴 CRÍTICA |
| **Screening (Texto Completo)** | 4.4 | 🔴 CRÍTICA |
| **Extracción de datos** | 4.4 | 🔴 CRÍTICA |
| **Evaluación de calidad** | 4.2 | 🔴 CRÍTICA |
| **Síntesis y análisis** | 4.4 | 🔴 CRÍTICA |
| **Eliminación de duplicados** | 2.6 | 🟡 MEDIA |
| **Definición de protocolo** | 2.6 | 🟡 MEDIA |

### 2. Fases Que Consumen Más Tiempo

**Top 3 más mencionadas:**
1. **Screening** (títulos/abstracts y texto completo) - 80% de participantes
2. **Extracción de datos** - 80% de participantes
3. **Síntesis y generación de reportes** - 60% de participantes

### 3. Principales Frustraciones

> "Cuando debo realizar el cribado y extraer todos los datos de estudios"

> "Acoplar y ordenar todas las referencias de los artículos seleccionados usando latex y/o overleaf"

> "Encontrar información similar"

> "La seguridad en el resultado"

**Patrones identificados:**
- ⏱️ **Tiempo excesivo** en tareas manuales repetitivas
- 📚 **Gestión de referencias** compleja (especialmente LaTeX/BibTeX)
- 🔍 **Búsqueda de información similar** es difícil
- ✅ **Confianza en resultados** es una preocupación

### 4. Nivel de Acuerdo con Automatización

| Afirmación | Acuerdo Promedio (1-5) |
|------------|------------------------|
| Automatización mejora productividad | 4.4 | ✅
| IA para validar inclusión/exclusión | 4.0 | ✅
| Confianza en sugerencias de IA | 3.8 | ✅
| IA para generar borradores | 4.2 | ✅
| Preocupación por sesgo de IA | 3.2 | ⚠️

**Conclusión**: Alta aceptación de automatización con IA, pero existe preocupación moderada sobre sesgos.

---

## Funcionalidades Críticas Identificadas

### Importancia de Funcionalidades (Escala 1-5)

| Funcionalidad | Importancia | Implementación Actual |
|---------------|-------------|----------------------|
| **Screening asistido por IA** | 5.0 | ✅ Implementado |
| **Extracción de datos con IA** | 4.8 | ❌ **FALTA** |
| **Validación PRISMA** | 4.8 | ✅ Implementado |
| **Búsqueda centralizada (APIs)** | 4.6 | ❌ **FALTA** |
| **Evaluación de calidad digital** | 4.6 | ⚠️ Parcial |
| **Gestión de referencias** | 4.8 | ⚠️ Parcial |
| **Generación de reportes** | 4.8 | ✅ Implementado |
| **Exportación LaTeX/BibTeX** | 4.6 | ⚠️ Básico |

---

## Funcionalidades Más Solicitadas

### 1. Screening Asistido por IA (100% de solicitudes)
> "Que la IA 'aprenda' de mis decisiones y sugiera incluir/excluir títulos y abstracts"

**Estado**: ✅ Implementado con embeddings MiniLM

### 2. Extracción de Datos Asistida por IA (60% de solicitudes)
> "Que la IA identifique y extraiga datos clave (ej. tamaño de muestra, metodología) del texto completo"

**Estado**: ❌ **NO IMPLEMENTADO - ALTA PRIORIDAD**

### 3. Búsqueda Centralizada (40% de solicitudes)
> "Conectarse a APIs (Scopus, WoS, IEEE) y ejecutar búsquedas desde el sistema"

**Estado**: ❌ **NO IMPLEMENTADO - ALTA PRIORIDAD**

### 4. Evaluación de Calidad Digital (40% de solicitudes)
> "Plataforma para aplicar checklists de calidad (ej. CASPe, JADAD) de forma digital"

**Estado**: ⚠️ Parcial - Solo PRISMA implementado

### 5. Generación de Resultados (20% de solicitudes)
> "Que la IA ayude a sintetizar y redactar un primer borrador de los hallazgos"

**Estado**: ✅ Implementado

---

## Barreras de Adopción

| Barrera | Menciones | Mitigación Propuesta |
|---------|-----------|---------------------|
| **Costo/Licencia** | 2 | Modelo freemium o licencia institucional |
| **Seguridad/Privacidad** | 2 | Implementar RLS, encriptación, cumplimiento GDPR |
| **Integración con herramientas** | 2 | APIs para Zotero, Mendeley, EndNote |
| **Curva de aprendizaje** | 1 | Tutoriales interactivos, onboarding guiado |

---

## Recomendaciones Prioritarias

### 🔴 Prioridad CRÍTICA (Implementar inmediatamente)

1. **Extracción Automática de Datos con IA**
   - Identificar y extraer: metodología, tamaño de muestra, resultados clave
   - Usar Gemini API para análisis de texto completo
   - Permitir revisión y corrección manual

2. **Búsqueda Centralizada en APIs**
   - Integrar Scopus, Web of Science, IEEE Xplore
   - Ejecutar búsquedas desde el sistema
   - Importación automática de resultados

3. **Mejora en Gestión de Referencias**
   - Exportación mejorada a LaTeX/BibTeX
   - Integración con Zotero/Mendeley
   - Formateo automático según estilo (APA, IEEE, etc.)

### 🟡 Prioridad ALTA (Implementar en Sprint 2-3)

4. **Checklists de Calidad Adicionales**
   - CASPe (Critical Appraisal Skills Programme)
   - JADAD Scale
   - Newcastle-Ottawa Scale
   - Personalización de checklists

5. **Autenticación con Google OAuth**
   - Facilitar acceso con cuentas institucionales
   - Reducir fricción en registro

### 🟢 Prioridad MEDIA (Implementar en Sprint 4-5)

6. **Sistema de Colaboración**
   - Comentarios en referencias
   - Resolución de conflictos entre revisores
   - Notificaciones en tiempo real

7. **Dashboard de Seguridad y Confianza**
   - Métricas de confiabilidad de IA
   - Explicabilidad de decisiones
   - Auditoría de cambios

---

## Impacto en Historias de Usuario

### Nuevas Historias de Usuario Requeridas

**ÉPICA 9: Extracción Automática de Datos**

**HU-35**: Como investigador, quiero que la IA extraiga automáticamente datos clave de los artículos, para ahorrar tiempo en la fase de extracción manual.

**Criterios de Aceptación**:
- Sistema identifica y extrae: metodología, muestra, resultados, conclusiones
- Permite revisión y corrección manual de datos extraídos
- Exporta datos en formato estructurado (CSV, Excel)
- Muestra nivel de confianza de cada extracción

**Estimación**: 13 puntos | **Prioridad**: CRÍTICA

---

**ÉPICA 10: Búsqueda Centralizada en APIs**

**HU-36**: Como investigador, quiero ejecutar búsquedas en múltiples bases de datos desde el sistema, para centralizar la recopilación de referencias.

**Criterios de Aceptación**:
- Conecta con APIs de Scopus, WoS, IEEE
- Permite configurar credenciales de API
- Ejecuta búsquedas con strings definidos en protocolo
- Importa resultados automáticamente al proyecto
- Elimina duplicados entre bases de datos

**Estimación**: 21 puntos | **Prioridad**: CRÍTICA

---

**HU-37**: Como investigador, quiero exportar referencias en formato LaTeX/BibTeX optimizado, para facilitar la redacción del artículo final.

**Criterios de Aceptación**:
- Exporta referencias en formato BibTeX válido
- Permite seleccionar estilo de citación (APA, IEEE, etc.)
- Genera archivo .bib compatible con Overleaf
- Incluye todos los metadatos necesarios

**Estimación**: 5 puntos | **Prioridad**: ALTA

---

**HU-38**: Como investigador, quiero aplicar checklists de calidad adicionales (CASPe, JADAD), para evaluar diferentes tipos de estudios.

**Criterios de Aceptación**:
- Incluye checklists: CASPe, JADAD, Newcastle-Ottawa
- Permite seleccionar checklist según tipo de estudio
- Calcula puntuación automática
- Genera reporte de calidad por estudio

**Estimación**: 8 puntos | **Prioridad**: ALTA

---

## Métricas de Éxito

Para validar el éxito del sistema, se medirán:

1. **Reducción de tiempo** en screening (objetivo: -60%)
2. **Reducción de tiempo** en extracción de datos (objetivo: -70%)
3. **Precisión de IA** en clasificación (objetivo: >85%)
4. **Satisfacción de usuarios** (objetivo: >4/5)
5. **Tasa de adopción** (objetivo: >70% de investigadores ESPE)

---

## Próximos Pasos

1. ✅ Implementar Google OAuth
2. 🔴 Desarrollar módulo de extracción automática de datos
3. 🔴 Integrar APIs de búsqueda (Scopus, WoS, IEEE)
4. 🟡 Mejorar exportación LaTeX/BibTeX
5. 🟡 Agregar checklists de calidad adicionales
6. 🟢 Implementar sistema de colaboración
7. 🟢 Crear dashboard de confianza y seguridad

---

**Fecha de análisis**: 24 de octubre de 2025  
**Analista**: Sistema de Gestión RSL - ESPE  
**Participantes**: 5 docentes investigadores
