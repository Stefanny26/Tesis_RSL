# ANEXO A: MANUAL DE USUARIO DE LA PLATAFORMA

> **Sistema RSL - Revisión Sistemática de Literatura con Validación IA**  
> Versión 1.0 | Enero 2026

---

## 📑 TABLA DE CONTENIDOS

1. [Introducción](#introducción)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Acceso a la Plataforma](#acceso-a-la-plataforma)
4. [Gestión de Proyectos](#gestión-de-proyectos)
5. [Fase 1: Protocolo de Investigación](#fase-1-protocolo-de-investigación)
6. [Fase 2: Búsqueda y Cribado](#fase-2-búsqueda-y-cribado)
7. [Fase 3: Validación PRISMA](#fase-3-validación-prisma)
8. [Fase 4: Redacción de Artículo](#fase-4-redacción-de-artículo)
9. [Solución de Problemas](#solución-de-problemas)

---

## 1. INTRODUCCIÓN

### 1.1 ¿Qué es el Sistema RSL?

El Sistema RSL es una plataforma web que guía y automatiza el proceso completo de una Revisión Sistemática de Literatura, desde la planificación hasta la validación del cumplimiento del estándar PRISMA 2020.

### 1.2 Características Principales

- ✅ **Asistente PICO con IA** para formular preguntas de investigación
- ✅ **Generación automática** de cadenas de búsqueda para 8 bases de datos
- ✅ **Cribado inteligente** con embeddings semánticos y análisis por LLM
- ✅ **Validación PRISMA** con gatekeeper de IA (27 ítems)
- ✅ **Editor de artículos** con generación asistida por IA
- ✅ **Diagrama de flujo PRISMA** automático

### 1.3 Flujo de Trabajo

```
1. Crear Proyecto → 2. Protocolo PICO → 3. Búsqueda/Importar → 
4. Cribado → 5. Validación PRISMA → 6. Redacción Artículo
```

---

## 2. REQUISITOS DEL SISTEMA

### 2.1 Navegadores Compatibles

- ✅ Google Chrome 90+ (recomendado)
- ✅ Microsoft Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

### 2.2 Conexión a Internet

- Velocidad mínima: 5 Mbps
- Recomendada: 10 Mbps o superior

### 2.3 Resolución de Pantalla

- Mínima: 1366x768 px
- Recomendada: 1920x1080 px (Full HD)

---

## 3. ACCESO A LA PLATAFORMA

### 3.1 Registro de Usuario

1. Accede a: `http://localhost:3000` (desarrollo) o URL de producción
2. Haz clic en **"Iniciar Sesión"**
3. Selecciona **"Registrarse con Google"**
4. Autoriza el acceso con tu cuenta de Google
5. Completa tu perfil (opcional)

![Pantalla de login](../screenshots/01-login.png)

### 3.2 Inicio de Sesión

**Opción 1: Con Google OAuth**
- Clic en "Continuar con Google"
- Selecciona tu cuenta

**Opción 2: Con Email/Contraseña** (si configurado)
- Ingresa email y contraseña
- Clic en "Iniciar Sesión"

### 3.3 Recuperar Contraseña

1. Clic en "¿Olvidaste tu contraseña?"
2. Ingresa tu email
3. Revisa tu bandeja de entrada
4. Sigue las instrucciones del correo

---

## 4. GESTIÓN DE PROYECTOS

### 4.1 Crear Nuevo Proyecto

**Pasos:**

1. Desde el Dashboard, clic en **"+ Nuevo Proyecto"**
2. Completa el formulario:
   - **Título del Proyecto**: "Aplicaciones de IA en Educación Superior"
   - **Descripción**: Breve resumen del objetivo de la revisión
   - **Fecha Límite**: (opcional)
3. Clic en **"Crear Proyecto"**

![Crear proyecto](../screenshots/02-crear-proyecto.png)

### 4.2 Panel de Proyectos (Dashboard)

El dashboard muestra todos tus proyectos con:

- 📊 **Progreso general**: Barra de completitud (0-100%)
- 🎯 **Fase actual**: Protocolo / Cribado / PRISMA / Artículo
- 📅 **Última actualización**: Fecha y hora
- 👥 **Colaboradores**: Miembros del equipo

**Acciones disponibles:**
- 👁️ Ver detalles
- ✏️ Editar información
- 🗑️ Eliminar proyecto
- 📤 Exportar datos

### 4.3 Gestionar Colaboradores

1. Abre el proyecto
2. Clic en ⚙️ **"Configuración"**
3. Ve a pestaña **"Miembros"**
4. Clic en **"+ Invitar Colaborador"**
5. Ingresa el email
6. Selecciona rol:
   - **Propietario**: Control total
   - **Editor**: Editar y revisar
   - **Visualizador**: Solo lectura

---

## 5. FASE 1: PROTOCOLO DE INVESTIGACIÓN

### 5.1 Paso 1: Pregunta de Investigación

**Objetivo:** Formular una pregunta clara usando el framework PICO

**Instrucciones:**

1. En tu proyecto, clic en **"Protocolo"**
2. Ingresa tu pregunta de investigación en lenguaje natural:
   ```
   Ejemplo: "¿Qué beneficios tiene el uso de inteligencia artificial 
   en la enseñanza de programación en universidades?"
   ```
3. Clic en **"Analizar con IA"** ✨
4. La IA descompondrá tu pregunta en componentes PICO
5. Revisa y ajusta la descomposición

![Análisis PICO](../screenshots/03-pico-analisis.png)

**Componentes PICO:**
- **P (Population)**: Estudiantes universitarios de programación
- **I (Intervention)**: Uso de herramientas con IA
- **C (Comparison)**: Métodos tradicionales de enseñanza
- **O (Outcomes)**: Mejora en rendimiento académico, motivación

### 5.2 Paso 2: Generar Títulos

1. Clic en **"Siguiente: Títulos"**
2. Clic en **"Generar Títulos con IA"** ✨
3. La IA generará 5 títulos siguiendo metodología Cochrane
4. Selecciona el más apropiado o edítalo
5. Guarda

**Ejemplo de títulos generados:**
```
1. "Impacto de la Inteligencia Artificial en el Aprendizaje de 
   Programación: Una Revisión Sistemática"
   
2. "Efectividad de Herramientas de IA como Apoyo Pedagógico en 
   Educación Superior de Programación"
```

### 5.3 Paso 3: Definir PICO Detallado

1. Revisa los campos PICO prellenados por la IA
2. Completa información adicional:
   - **Contexto geográfico**: (opcional)
   - **Rango temporal**: 2015-2024
   - **Tipos de estudio**: Experimental, cuasi-experimental
3. Guarda cambios

### 5.4 Paso 4: Términos del Protocolo

La IA genera automáticamente:

- **Términos tecnológicos**: AI, machine learning, chatbots, tutoring systems
- **Términos de dominio**: programming, computer science, coding
- **Focos de investigación**: learning outcomes, student performance

**Acciones:**
- ✏️ Editar términos
- ➕ Agregar nuevos
- 🗑️ Eliminar irrelevantes

### 5.5 Paso 5: Criterios de Inclusión/Exclusión

**Generación Automática:**

1. Clic en **"Generar Criterios con IA"** ✨
2. La IA propone criterios basados en PICO
3. Revisa y ajusta

**Ejemplo:**

**Criterios de Inclusión:**
- ✅ Estudios publicados entre 2015-2024
- ✅ Idiomas: inglés, español
- ✅ Población: estudiantes universitarios
- ✅ Intervención con IA claramente descrita

**Criterios de Exclusión:**
- ❌ Estudios no revisados por pares
- ❌ Resúmenes de conferencias sin texto completo
- ❌ Estudios en educación primaria/secundaria

### 5.6 Paso 6: Cadenas de Búsqueda

**Generación Automática para 8 Bases de Datos:**

1. Clic en **"Generar Cadenas"** ✨
2. El sistema genera búsquedas optimizadas para:
   - 📚 Scopus
   - 📚 IEEE Xplore
   - 📚 ACM Digital Library
   - 📚 Web of Science
   - 📚 PubMed
   - 📚 ScienceDirect
   - 📚 SpringerLink
   - 📚 Google Scholar

**Ejemplo de cadena (Scopus):**
```
TITLE-ABS-KEY(("artificial intelligence" OR "machine learning" OR 
"AI tutoring") AND ("programming education" OR "computer science 
education") AND ("university" OR "higher education"))
```

**Acciones:**
- 📋 Copiar cadena al portapapeles
- ✏️ Refinar manualmente
- 🔄 Re-generar con IA

### 5.7 Paso 7: Estrategia de Búsqueda

Completa el plan de búsqueda:

- 📅 **Fecha de ejecución**: [Fecha]
- 👤 **Responsable**: [Nombre]
- 🗂️ **Orden de bases de datos**: Priorizar por cobertura
- 📝 **Notas adicionales**: Límites, filtros especiales

---

## 6. FASE 2: BÚSQUEDA Y CRIBADO

### 6.1 Importar Referencias

**Opción A: Importar desde archivo**

1. Navega a **"Referencias"**
2. Clic en **"Importar Referencias"**
3. Selecciona formato:
   - 📄 BibTeX (.bib)
   - 📄 RIS (.ris)
4. Arrastra archivo o selecciona
5. Clic en **"Procesar"**
6. Revisa resumen de importación

**Opción B: Búsqueda en Scopus** (API automática)

1. Clic en **"Buscar en Scopus"**
2. Pega tu cadena de búsqueda
3. Clic en **"Ejecutar Búsqueda"**
4. Las referencias se importan automáticamente

![Importar referencias](../screenshots/04-importar-refs.png)

### 6.2 Detección de Duplicados

**Automático:**
El sistema detecta duplicados usando:
- DOI idéntico
- Título similar (>90% similitud)
- Autores + año coincidentes

**Manual:**
1. Ve a **"Duplicados Detectados"**
2. Revisa cada grupo
3. Selecciona la versión a conservar
4. Clic en **"Resolver"**

### 6.3 Cribado por Título/Abstract

**Opción 1: Cribado Manual**

1. Ve a pestaña **"Screening"**
2. Para cada referencia:
   - Lee título y abstract
   - Clic en ✅ **"Incluir"** o ❌ **"Excluir"**
   - (Opcional) Agrega justificación
3. El progreso se guarda automáticamente

![Cribado manual](../screenshots/05-screening.png)

**Opción 2: Cribado Asistido por IA**

1. Selecciona referencias (Ctrl + clic para múltiples)
2. Clic en **"Analizar con IA"** 🤖
3. Selecciona método:
   - **Embeddings**: Rápido, basado en similitud semántica
   - **LLM (Gemini/ChatGPT)**: Más preciso, análisis contextual
4. La IA sugiere INCLUIR/EXCLUIR con justificación
5. Revisa y confirma cada decisión

**Embeddings vs LLM:**

| Característica | Embeddings | LLM |
|----------------|------------|-----|
| Velocidad | ⚡ Muy rápido | 🐢 Más lento |
| Costo | Gratis (local) | Usa API (cuota) |
| Precisión | 75-85% | 85-95% |
| Justificación | Basada en similitud | Razonamiento detallado |

**Recomendación:** Usar embeddings para pre-filtrado (500+ refs) y LLM para casos dudosos.

### 6.4 Vista Rayyan (Simplificada)

Para revisión rápida:

1. Activa vista **"Rayyan"** (switch arriba)
2. Usa atajos de teclado:
   - `I` = Incluir
   - `E` = Excluir
   - `M` = Marcar como "Tal vez"
   - `→` = Siguiente referencia
   - `←` = Anterior
3. Modo de 2 revisores (validación por pares)

### 6.5 Cribado de Texto Completo

1. Ve a **"Texto Completo"**
2. Para referencias incluidas:
   - Sube PDF (clic en 📎 "Adjuntar PDF")
   - O ingresa DOI para descarga automática
3. La IA extrae datos clave:
   - Metodología
   - Resultados principales
   - Limitaciones
4. Realiza cribado final (INCLUIR/EXCLUIR)

### 6.6 Generar Diagrama de Flujo PRISMA

1. Clic en **"Generar Diagrama PRISMA"**
2. El sistema calcula automáticamente:
   - Registros identificados (N)
   - Duplicados removidos (N)
   - Tras cribado título/abstract (N)
   - Tras cribado texto completo (N)
   - Estudios incluidos finales (N)
3. Descarga en formato:
   - PNG (para insertar en documento)
   - SVG (editable)
   - Datos tabulares (Excel)

![Diagrama PRISMA](../screenshots/06-prisma-diagram.png)

---

## 7. FASE 3: VALIDACIÓN PRISMA

### 7.1 Introducción a PRISMA 2020

La checklist PRISMA 2020 consta de **27 ítems** organizados en 7 secciones:

1. **TÍTULO** (1 ítem)
2. **RESUMEN** (1 ítem)
3. **INTRODUCCIÓN** (2 ítems)
4. **MÉTODOS** (11 ítems)
5. **RESULTADOS** (6 ítems)
6. **DISCUSIÓN** (1 ítem)
7. **OTRA INFORMACIÓN** (5 ítems)

### 7.2 Acceder al Checklist PRISMA

1. En tu proyecto, navega a **"PRISMA"**
2. Verás los 27 ítems organizados por sección
3. Estados posibles:
   - ⚪ **Pending**: Sin completar
   - 🤖 **Automated**: Generado automáticamente
   - ✍️ **Human**: Escrito manualmente
   - 🔀 **Hybrid**: Automatizado + editado

### 7.3 Completar Ítems Automáticamente

**Para los primeros 10 ítems (generables desde protocolo):**

1. Clic en **"Generar Contenido Automático"** ✨
2. El sistema extrae datos de:
   - Protocolo PICO
   - Cadenas de búsqueda
   - Criterios I/E
   - Resultados de screening
3. Se completan automáticamente:
   - Ítem 1: Título
   - Ítem 5: Criterios de elegibilidad
   - Ítem 6: Fuentes de información
   - Ítem 7: Estrategia de búsqueda
   - (Y más)

![PRISMA automático](../screenshots/07-prisma-auto.png)

### 7.4 Editar Ítems Manualmente

Para ítems que requieren análisis humano:

1. Clic en la tarjeta del ítem
2. Se abre editor de texto enriquecido
3. Escribe o pega el contenido
4. Usa formateo:
   - **Negrita**, *cursiva*
   - Listas numeradas/viñetas
   - Tablas
5. Clic en **"Guardar"**
6. El estado cambia a ✍️ **Human**

### 7.5 Validación con IA (Gatekeeper) 🛡️

**EL CORE DEL SISTEMA - Funcionalidad Innovadora**

**Para cada ítem:**

1. Clic en **"Validar con IA"** 🤖
2. La IA analiza el contenido contra criterios PRISMA 2020
3. Respuesta en 3-5 segundos:
   - ✅ **APROBADO**: Cumple estándar
   - ⚠️ **NECESITA MEJORAS**: Cumple parcialmente
   - ❌ **RECHAZADO**: No cumple

**Ejemplo de feedback:**

```
ESTADO: ⚠️ NECESITA MEJORAS

ANÁLISIS:
El ítem 16 (Selección de estudios) incluye el número de registros 
identificados (N=342) y el proceso general de screening. 

PROBLEMAS DETECTADOS:
❌ No menciona la herramienta usada para detección de duplicados
⚠️ Falta referencia al diagrama de flujo PRISMA

SUGERENCIAS:
1. Agregar: "Se utilizó el sistema RSL para detección automatizada 
   de duplicados"
2. Incluir: "Ver Figura 1 para diagrama de flujo PRISMA completo"
3. Especificar número de revisores en cada fase

CRITERIOS PRISMA NO CUMPLIDOS:
- PRISMA 16a: Proceso de selección detallado
```

### 7.6 Desbloqueo Secuencial

**Mecanismo de Calidad:**

- Los ítems se desbloquean secuencialmente
- Para editar ítem N+1, el ítem N debe estar:
  - ✅ Completado (con contenido)
  - ✅ Validado por IA (APROBADO o usuario overrideó)

**Ejemplo:**
```
Ítem 1 (Título): ✅ APROBADO → Desbloquea Ítem 2
Ítem 2 (Abstract): ⚠️ NECESITA MEJORAS → Ítem 3 bloqueado 🔒
```

**Override manual:**
Si no estás de acuerdo con la IA:
1. Clic en **"Forzar Aprobación"**
2. Ingresa justificación
3. El ítem se marca como aprobado manualmente

### 7.7 Estadísticas de Cumplimiento

El panel superior muestra:

- 📊 **Progreso**: 15/27 ítems completados (55%)
- 🤖 **Automatizados**: 10 ítems
- ✍️ **Manuales**: 5 ítems
- ✅ **Validados por IA**: 12 ítems (80% aprobados)

---

## 8. FASE 4: REDACCIÓN DE ARTÍCULO

### 8.1 Editor de Artículos

1. Navega a **"Artículo"**
2. El editor tiene 8 secciones pre-configuradas:
   - Abstract
   - Introduction
   - Methods
   - Results
   - Discussion
   - Conclusion
   - References
   - Acknowledgments

### 8.2 Generar Contenido desde PRISMA

**Funcionalidad Clave:**

1. Asegúrate de tener PRISMA completo (27/27)
2. Clic en **"Generar desde PRISMA"** ✨
3. El sistema transforma los 27 ítems en secciones del artículo
4. Generación tarda ~30 segundos
5. Resultado: Borrador completo del artículo en formato académico

![Generación artículo](../screenshots/08-articulo-gen.png)

### 8.3 Editar y Refinar

- Editor WYSIWYG (What You See Is What You Get)
- Soporte para:
  - Tablas
  - Figuras (sube imágenes)
  - Referencias bibliográficas
  - Fórmulas matemáticas (LaTeX)
  - Citas en formato APA/IEEE

### 8.4 Control de Versiones

- Cada cambio crea una versión
- Accede a **"Historial de Versiones"**
- Compara versiones (diff side-by-side)
- Restaurar versión anterior

### 8.5 Exportar Artículo

1. Clic en **"Exportar"**
2. Selecciona formato:
   - 📄 **Word (.docx)**: Editable en MS Word
   - 📄 **PDF**: Listo para envío
   - 📄 **LaTeX (.tex)**: Para journals académicos
   - 📄 **Markdown (.md)**: Formato plano
3. Descarga

---

## 9. SOLUCIÓN DE PROBLEMAS

### 9.1 No puedo iniciar sesión

**Problema:** "Credenciales inválidas"

**Soluciones:**
1. Verifica que estés usando el email correcto
2. Si usas Google OAuth, asegúrate de tener cookies habilitadas
3. Limpia caché del navegador (Ctrl + Shift + Del)
4. Intenta en modo incógnito
5. Contacta al administrador si persiste

### 9.2 La IA no genera contenido

**Problema:** "Error al generar con IA"

**Posibles causas:**
1. **Límite de API alcanzado**: Espera 1 hora o usa cuota de pago
2. **Protocolo incompleto**: Completa todos los campos PICO
3. **Conexión perdida**: Revisa tu internet

**Solución:**
- Revisa el protocolo está completo
- Intenta de nuevo en 5 minutos
- Si falla 3 veces, completa manualmente

### 9.3 Referencias no se importan

**Problema:** "Error al procesar archivo BibTeX"

**Soluciones:**
1. Verifica el archivo es BibTeX válido (abre en editor de texto)
2. Asegúrate de tener campos obligatorios: `title`, `author`, `year`
3. Prueba con archivo RIS si BibTeX falla
4. Importa en lotes pequeños (< 500 referencias)

### 9.4 El cribado con IA es muy lento

**Problema:** Tarda >30 segundos por referencia

**Soluciones:**
1. Usa embeddings para pre-filtrado (mucho más rápido)
2. Procesa en lotes de 10-20 referencias
3. Revisa tu conexión a internet
4. Usa modo manual para referencias claramente irrelevantes

### 9.5 No puedo validar ítems PRISMA

**Problema:** Botón "Validar con IA" deshabilitado

**Causas:**
1. El ítem está vacío (sin contenido)
2. El ítem anterior no está validado (desbloqueo secuencial)
3. Límite de API alcanzado

**Solución:**
- Completa el contenido primero
- Valida ítems en orden (1 → 2 → 3...)
- Usa "Forzar Aprobación" si necesitas saltear

### 9.6 El sistema está lento

**Optimizaciones:**
1. Cierra pestañas no usadas
2. Limpia referencias no necesarias
3. Evita tener >1000 referencias simultáneas
4. Actualiza navegador a última versión
5. Desactiva extensiones que bloqueen JavaScript

### 9.7 Perdí mi trabajo

**Recuperación:**
- El sistema guarda automáticamente cada 30 segundos
- Revisa **"Historial de Versiones"** en el artículo
- Contacta soporte para restauración de backup

---

## 📞 SOPORTE Y CONTACTO

**Documentación adicional:**
- 📖 [Guía de Usuario Completa](USER-GUIDE.md)
- 🎥 [Video Tutoriales](https://youtube.com/...)
- 💬 [Preguntas Frecuentes (FAQ)](FAQ.md)

**Contacto técnico:**
- 📧 Email: smhernandez2@espe.edu.ec, apgonzales1@espe.edu.ec
- 🐛 Reportar bug: [GitHub Issues](https://github.com/...)
- 💡 Sugerencias: [Formulario de feedback](...)

---

## 📝 NOTAS FINALES

### Buenas Prácticas

1. ✅ **Guarda frecuentemente** (aunque hay autoguardado)
2. ✅ **Revisa las validaciones de IA** antes de aprobar
3. ✅ **Completa el protocolo PICO detalladamente** para mejores resultados
4. ✅ **Usa cribado por pares** para mayor rigor
5. ✅ **Documenta tus decisiones** en el historial

### Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + S` | Guardar |
| `Ctrl + Z` | Deshacer |
| `Ctrl + Shift + Z` | Rehacer |
| `Alt + N` | Nuevo proyecto |
| `Alt + I` | Incluir referencia |
| `Alt + E` | Excluir referencia |

---

**Versión del Manual:** 1.0  
**Última actualización:** Enero 8, 2026  
**Autores:** Hernández Buenaño S., González Orellana A.  
**Universidad:** ESPE - Departamento de Ciencias de la Computación
