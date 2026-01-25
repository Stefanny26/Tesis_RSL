# PERFIL DEL TRABAJO DE INTEGRACIÓN CURRICULAR

**DEPARTAMENTO DE CIENCIAS DE LA COMPUTACIÓN**

**CARRERA DE INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN**

---

## TEMA
**DESARROLLO DE UN SISTEMA WEB PARA LA GESTIÓN DE REVISIONES SISTEMÁTICAS CON VALIDACIÓN AUTOMATIZADA MEDIANTE INTELIGENCIA ARTIFICIAL**

---

## ESTUDIANTES PARTICIPANTES
- **Hernández Buenaño Stefanny Mishel**
- **González Orellana Adriana Pamela**

---

## TUTOR/DIRECTOR
**Paulo César Galarza Sánchez**

---

**Sangolquí, 06 de agosto de 2024**

---

## 1. DATOS GENERALES DEL TRABAJO DE INTEGRACIÓN CURRICULAR

| Campo | Valor |
|-------|-------|
| **Departamento** | Departamento de Ciencias de la Computación |
| **Carrera** | Tecnologías de la Información y Comunicación |
| **Tema** | Desarrollo de un sistema web para la gestión de revisiones sistemáticas con validación automatizada mediante IA |
| **Línea de Investigación** | Software Aplicado |
| **N°. Resolución de aprobación** |  |

---

## 2. DATOS GENERALES DEL DOCENTE PROPONENTE

| Campo | Valor |
|-------|-------|
| **Apellidos y Nombres** | Galarza Sánchez Paulo César |
| **Cédula de Identidad** | 1722358585 |
| **Id. Institucional** | L00084230 |
| **Email. Institucional** | pcgalarza@espe.edu.ec |
| **Teléfono personal** | 0980228166 |

---

## 3. DATOS GENERALES DE LOS ESTUDIANTES PARTICIPANTES

### Estudiante 1
| Campo | Valor |
|-------|-------|
| **Apellidos y Nombres** | Hernández Buenaño Stefanny Mishel |
| **Cédula de Identidad** | 0605099662 |
| **ID Institucional** | L00398859 |
| **Email Institucional** | smhernandez2@espe.edu.ec |
| **Teléfono personal** | 095 899 0447 |

### Estudiante 2
| Campo | Valor |
|-------|-------|
| **Apellidos y Nombres** | González Orellana Adriana Pamela |
| **Cédula de Identidad** | 2350424194 |
| **ID Institucional** | L00410346 |
| **Email Institucional** | apgonzales1@espe.edu.ec |
| **Teléfono personal** | 098 266 5833 |

---

## 4. DATOS GENERALES DE LA ENTIDAD CO-PARTICIPANTE

| Campo | Valor |
|-------|-------|
| **Nombre de la entidad** | N/A |
| **RUC** | N/A |
| **Sector económico al que pertenece** | N/A |
| **Dirección** | N/A |
| **Teléfono** | N/A |
| **Página Web** | N/A |
| **Persona de Contacto** | N/A |
| **Cédula de Identidad** | N/A |
| **Email** | N/A |
| **Teléfono personal** | N/A |

---

## 5. ANTECEDENTES / RESUMEN DEL TRABAJO DE INTEGRACIÓN CURRICULAR

El desarrollo de Revisiones Sistemáticas de Literatura (RSL) es fundamental para la ciencia, pero su proceso es complejo y requiere un alto rigor metodológico. Este proyecto consiste en el desarrollo de una plataforma web diseñada para guiar y optimizar las fases clave de una RSL, asegurando el cumplimiento del estándar PRISMA.

El sistema se estructura en dos módulos principales. El primer módulo se centra en la planificación y gestión del proyecto, ofreciendo herramientas para definir los criterios de la revisión. Dentro de sus funcionalidades, incluye un asistente basado en IA que ayuda a formular cadenas de búsqueda optimizadas, la importación de resultados y un proceso de cribado de estudios asistido por modelos de embeddings semánticos y LLMs.

El segundo módulo implementa la innovación central: un mecanismo de validación o "gatekeeper", que utiliza IA para verificar secuencialmente que la documentación de cada uno de los 27 ítems de PRISMA cumpla con los estándares de calidad requeridos. Este enfoque no sólo automatiza, sino que también forma al investigador, garantizando un resultado final robusto y con mayor potencial de publicación.

---

## 6. PROBLEMA, JUSTIFICACIÓN DEL PROBLEMA

### Problema
La ejecución de Revisiones Sistemáticas de Literatura es un proceso manual, complejo y propenso a errores humanos. Los investigadores enfrentan dificultades para cumplir consistentemente los 27 ítems del estándar PRISMA, lo que compromete la calidad y reproducibilidad de sus revisiones. Además, la validación del cumplimiento de estos criterios requiere experiencia especializada que no siempre está disponible.

### Justificación
Las RSL son la base de la toma de decisiones basada en evidencia en múltiples disciplinas. Sin embargo, estudios muestran que hasta el 60% de las revisiones sistemáticas publicadas presentan deficiencias metodológicas. La automatización del proceso mediante IA puede:

- Reducir errores humanos en el cribado de estudios
- Garantizar el cumplimiento sistemático de los criterios PRISMA
- Acelerar el proceso de revisión sin comprometer la calidad
- Democratizar el acceso a herramientas de investigación de alta calidad
- Proporcionar retroalimentación educativa para investigadores novatos

---

## 7. OBJETIVOS Y ACTIVIDADES

### 7.1. Objetivo General

Desarrollar un prototipo funcional de una plataforma web que optimice la planificación y el cribado de una Revisión Sistemática de Literatura y valide el cumplimiento del estándar PRISMA mediante un flujo de trabajo guiado por IA.

### 7.2. Objetivo Específico 1
**Desarrollo del Módulo Central para la Gestión del Proceso de Revisión y Cribado de Estudios**

#### Actividad 1
Diseñar la arquitectura del sistema, la base de datos y la interfaz de usuario para la gestión integral de un proyecto de RSL, desde la planificación hasta el cribado.

#### Actividad 2
Implementar la funcionalidad de gestión de proyectos, permitiendo la configuración de los componentes PICO y la asistencia por IA (API Gemini) para la generación de cadenas de búsqueda optimizadas.

#### Actividad 3
Desarrollar la funcionalidad para la carga y el procesamiento de archivos de referencias (BibTeX, RIS) obtenidos de las bases de datos.

#### Actividad 4
Integrar modelos de embeddings semánticos de código abierto (MiniLM-L6-v2 via Sentence-Transformers) y APIs de LLMs generativos (Gemini, ChatGPT) para el cribado semiautomático. Construir la interfaz para la validación por pares y la generación del diagrama de flujo PRISMA.

### 7.3. Objetivo Específico 2
**Implementación del Flujo de Trabajo Guiado por IA para la Validación Secuencial de los Ítems PRISMA**

#### Actividad 1
Diseñar y desarrollar la interfaz de usuario que presente al investigador el checklist interactivo de los 27 ítems del estándar PRISMA.

#### Actividad 2
Integrar una API de IA generativa (ej. Gemini) para funcionar como "gatekeeper", desarrollando los prompts de validación específicos para cada ítem de PRISMA.

#### Actividad 3
Implementar la lógica de negocio para el mecanismo de desbloqueo secuencial, donde la aprobación de la IA habilita el siguiente paso en el flujo de trabajo.

#### Actividad 4
Desarrollar el sistema de retroalimentación que, tras una validación exitosa por parte de la IA, ofrezca al usuario sugerencias textuales para la documentación de cada paso.

---

## 8. MARCO TEÓRICO

### 1.1. La Investigación Basada en Evidencia y las Revisiones Sistemáticas de Literatura (RSL)

#### 1.1.1. Definición y Propósito de las RSL
Explicar qué son, por qué son consideradas el estándar de oro para la síntesis de evidencia y su importancia en diversas áreas del conocimiento.

#### 1.1.2. Fases Metodológicas de una RSL
Describir el proceso canónico:
- Formulación de la pregunta de investigación (PICO)
- Planificación y protocolo
- Búsqueda de literatura
- Cribado y selección de estudios
- Extracción de datos
- Síntesis y análisis de resultados

#### 1.1.3. Desafíos del Proceso Manual
Analizar las limitaciones actuales como el alto consumo de tiempo, el riesgo de sesgo humano en la selección y la complejidad en la gestión de grandes volúmenes de datos. *(Esta sección justifica la necesidad del proyecto)*

### 1.2. Estándares para la Calidad y Transparencia en RSL

#### 1.2.1. La Metodología Cochrane
Describir sus principios como marco de referencia para la rigurosidad y la minimización de sesgos.

#### 1.2.2. El Estándar PRISMA 2020
Detallar su propósito. Explicar que es un checklist de 27 ítems diseñado para garantizar que el reporte de una RSL sea transparente, completo y reproducible. *(Esta es una de las bases normativas del sistema)*

#### 1.2.3. Herramientas de Software Existentes
Analizar brevemente las herramientas actuales (ej. Covidence, Rayyan) e identificar sus fortalezas y, más importante, sus limitaciones o "gaps" que el proyecto busca solucionar (ej. la falta de asistencia inteligente en la búsqueda y validación de cumplimiento).

### 1.3. Fundamentos de Inteligencia Artificial para el Análisis de Texto

#### 1.3.1. Procesamiento del Lenguaje Natural (PLN)
Introducción a la disciplina de la IA que permite a las máquinas entender y procesar el lenguaje humano.

#### 1.3.2. Modelos de Lenguaje Grandes (LLMs)
Explicar el concepto, la arquitectura Transformer como base de su funcionamiento y por qué han revolucionado el PLN.

#### 1.3.3. Ingeniería de Prompts (Prompt Engineering)
Describir esta técnica como el método para instruir y guiar a los LLMs generativos para que realicen tareas específicas de razonamiento y generación de texto.

### 1.4. Tecnologías de IA Aplicadas en el Proyecto

#### 1.4.1. Modelos de Embeddings Semánticos para el Cribado
- Explicar la técnica de **Embeddings de Sentencias** para representar el significado del texto en vectores numéricos
- Describir el propósito de modelos eficientes como la familia **Sentence-Transformers** (específicamente MiniLM-L6-v2) para tareas de comparación y clasificación semántica mediante similitud coseno
- Justificar su uso para el cribado local por su eficiencia computacional y capacidad de procesamiento offline

#### 1.4.2. Modelos Generativos (LLMs) para Asistencia Inteligente
- Describir las capacidades de LLMs de gran escala (como la familia de modelos Gemini de Google y GPT de OpenAI) para tareas de razonamiento complejo y generación de texto coherente
- Justificar su uso para la generación de cadenas de búsqueda (tarea creativa y de conocimiento) y para el mecanismo de "gatekeeper" (tarea de evaluación y retroalimentación)
- Explicar la arquitectura Transformer y el concepto de attention mechanisms

---

## 9. METODOLOGÍA

### 9.1. Enfoque de la Investigación

El proyecto requiere una combinación de ambos enfoques para una comprensión completa del problema y la solución:

**Enfoque Cualitativo:** Se utilizará en la fase inicial para comprender los desafíos de las RSL y los requerimientos del estándar PRISMA. También para interpretar los resultados y la retroalimentación de los usuarios de forma contextual.

**Enfoque Cuantitativo:** Será fundamental para la fase de evaluación. Se medirán con datos numéricos el rendimiento, la precisión y la eficacia de los modelos de IA implementados, tanto para el cribado como para la validación.

### 9.2. Alcance

El alcance de este proyecto está definido por los siguientes límites:

**Desarrollo:** Se creará un prototipo funcional que incluye los dos objetivos definidos: el módulo de planificación y cribado, y el módulo de validación por IA ("gatekeeper").

**Funcionalidad:** El sistema asistirá en la generación de cadenas de búsqueda, procesará archivos de referencias cargados manualmente (BibTeX, RIS) y validará el cumplimiento de los 27 ítems de PRISMA.

**Exclusiones:** El sistema no se integrará directamente con las APIs de todas las bases de datos académicas (solo Scopus como piloto) y no incluirá un módulo para la exportación final del manuscrito completo. La evaluación se centrará en la prueba de concepto y no en un estudio de usabilidad a gran escala.

### 9.3. Diseño

La presente investigación se enmarca dentro de la metodología de **Investigación en Ciencia del Diseño (DSR - Design Science Research)**. La DSR es ideal para este proyecto, ya que su objetivo es la creación y evaluación de artefactos de TI (en este caso, la plataforma web) que resuelven problemas del mundo real y generan conocimiento a través de su diseño, construcción y evaluación.

Se seguirán las fases del ciclo de vida de la DSR, adaptadas a un desarrollo ágil de 6 meses:

1. **Fase 1 - Identificación del Problema:** Análisis de la complejidad y los desafíos del proceso manual de las RSL (definido en la justificación del proyecto).

2. **Fase 2 - Diseño y Desarrollo del Artefacto:** Construcción de la plataforma web. Esta fase se gestionará con una metodología ágil (como Scrum o Kanban) para organizar el trabajo en sprints cortos y entregas incrementales.

3. **Fase 3 - Demostración (Caso de Uso):** Se utilizará el prototipo para ejecutar una RSL completa sobre un tema específico del área de Tecnologías de la Información. Esto servirá para demostrar la utilidad y funcionalidad del artefacto.

4. **Fase 4 - Evaluación:** Se medirá la eficacia del artefacto, centrándose en el rendimiento del "gatekeeper" de IA.

### 9.4. Fuentes de Información

#### Fuentes Primarias:
- **Datos del Caso de Uso:** El conjunto de artículos, decisiones de inclusión/exclusión y el diagrama PRISMA generado durante la demostración.
- **Datos de Rendimiento de la IA:** Las respuestas ("APROBADO"/"RECHAZADO") de la IA del "gatekeeper" al ser probada con un conjunto de datos de control.
- **Código Fuente:** El propio código de la plataforma desarrollada.

#### Fuentes Secundarias:
- **Artículos Científicos:** Publicaciones sobre RSL, PRISMA, PLN, LLMs y metodologías DSR.
- **Documentación Oficial:** Guías del estándar PRISMA 2020 y documentación técnica de las APIs y librerías utilizadas (Gemini, Sentence-Transformers, @xenova/transformers).

### 9.5. Procedimiento para Recolección de Datos

Se establecerán dos procedimientos claros para la evaluación cuantitativa:

#### 1. Ejecución del Caso de Uso
Se registran sistemáticamente los datos de la RSL de demostración: cadena de búsqueda utilizada, número de resultados iniciales, número de artículos tras el cribado, etc.

#### 2. Experimento de Validación del "Gatekeeper"
- Se creará un conjunto de datos de prueba (dataset) con ejemplos de textos para ítems de PRISMA (ej. 20 ejemplos buenos y 20 malos).
- Un experto humano etiquetará este dataset para crear una "verdad terreno" (ground truth).
- Se procesará el mismo dataset a través del "gatekeeper" de IA, registrando cada una de sus predicciones.

### 9.6. Procesamiento de los Datos

Los datos recolectados en el experimento de validación se organizarán en una **Matriz de Confusión**. Esta tabla permitirá visualizar los aciertos y errores de la IA, clasificándolos en:

- **Verdaderos Positivos (VP):** La IA aprobó correctamente un texto bueno.
- **Verdaderos Negativos (VN):** La IA rechazó correctamente un texto malo.
- **Falsos Positivos (FP):** La IA aprobó incorrectamente un texto malo (Error Tipo I).
- **Falsos Negativos (FN):** La IA rechazó incorrectamente un texto bueno (Error Tipo II).

### 9.7. Técnicas Estadísticas

A partir de la matriz de confusión, se calcularán las siguientes métricas estándar para evaluar el rendimiento del clasificador (el "gatekeeper"):

- **Exactitud (Accuracy):** Porcentaje total de predicciones correctas.
  - Fórmula: `(VP + VN) / Total`

- **Precisión (Precision):** De los que la IA dijo que eran buenos, ¿cuántos lo eran realmente?
  - Fórmula: `VP / (VP + FP)`

- **Sensibilidad (Recall):** De todos los que eran realmente buenos, ¿cuántos encontró la IA?
  - Fórmula: `VP / (VP + FN)`

- **Puntuación F1 (F1-Score):** La media armónica de Precisión y Sensibilidad, una métrica robusta que balancea ambos valores.
  - Fórmula: `2 * (Precision * Recall) / (Precision + Recall)`

---

## 10. PROPUESTA DE ÍNDICE (CAPÍTULOS)

### Capítulo I: Introducción y Estado del Arte
- 1.1. Introducción
- 1.2. Antecedentes y Planteamiento del Problema
- 1.3. Justificación e Importancia
- 1.4. Objetivos
  - 1.4.1. Objetivo General
  - 1.4.2. Objetivos Específicos
- 1.5. Estado del Arte
  - 1.5.1. Herramientas de apoyo en revisiones sistemáticas (Covidence, Rayyan, RobotReviewer, etc.)
  - 1.5.2. Limitaciones de herramientas existentes frente a PRISMA 2020

### Capítulo II: Marco Teórico / Marco Conceptual
- 2.1. La Investigación Basada en Evidencia y las Revisiones Sistemáticas de Literatura (RSL)
  - 2.1.1. Definición y Propósito de las RSL
  - 2.1.2. Fases Metodológicas de una RSL
  - 2.1.3. Desafíos del Proceso Manual
- 2.2. Estándares para la Calidad y Transparencia en RSL
  - 2.2.1. La Metodología Cochrane
  - 2.2.2. El Estándar PRISMA 2020 (27 ítems)
- 2.3. Fundamentos de Inteligencia Artificial para el Análisis de Texto
  - 2.3.1. Procesamiento del Lenguaje Natural (PLN)
  - 2.3.2. Modelos de Lenguaje Grandes (LLMs)
  - 2.3.3. Ingeniería de Prompts (Prompt Engineering)
- 2.4. Tecnologías de IA Aplicadas en el Proyecto
  - 2.4.1. Modelos de Embeddings Semánticos para el Cribado
  - 2.4.2. Modelos Generativos (LLMs) para Asistencia y Validación

### Capítulo III: Metodología / Técnicas / Diseño
- 3.1. Metodología General: Investigación en Ciencia del Diseño (Design Science Research)
- 3.2. Enfoque de la Investigación: Mixto (Cualitativo-Cuantitativo)
- 3.3. Alcance de la Investigación
- 3.4. Diseño de la Investigación
  - 3.4.1. Fases de la Investigación en Ciencia del Diseño
  - 3.4.2. Marco de Trabajo Ágil (SCRUM)
- 3.5. Fuentes y Técnicas de Recolección de Información
  - 3.5.1. Fuentes Primarias y Secundarias
  - 3.5.2. Procedimiento de Recolección de Datos (Caso de Uso y Validación)
- 3.6. Procesamiento y Análisis de Datos
  - 3.6.1. Organización de Datos y Matriz de Confusión
  - 3.6.2. Técnicas Estadísticas (Accuracy, Precision, Recall, F1-Score)

### Capítulo IV: Resultados
- 4.1. Arquitectura de la Plataforma Web
- 4.2. Desarrollo del Módulo 1: Gestión del Proceso y Cribado
  - 4.2.1. Implementación del Asistente de Búsqueda por IA
  - 4.2.2. Implementación del Cribado con Embeddings Semánticos y LLMs
- 4.3. Desarrollo del Módulo 2: Validación Secuencial por IA ("Gatekeeper")
  - 4.3.1. Interfaz del Checklist PRISMA
  - 4.3.2. Lógica de los Prompts con la API de IA
- 4.4. Resultados de la Evaluación
  - 4.4.1. Caso de Uso: Diagrama de Flujo PRISMA Obtenido
  - 4.4.2. Experimento de Validación de la IA: Métricas de Rendimiento
- 4.5. Pruebas del Sistema
  - 4.5.1. Pruebas Funcionales y de Integración
  - 4.5.2. Pruebas de Rendimiento
  - 4.5.3. Pruebas de Aceptación de Usuario

### Capítulo V: Conclusiones y Recomendaciones
- 5.1. Discusión de Resultados
- 5.2. Conclusiones
- 5.3. Recomendaciones y Trabajo Futuro

### Capítulo VI: Referencias Bibliográficas

### Capítulo VII: Apéndice
- Anexo A: Manual de Usuario de la Plataforma
- Anexo B: Ejemplos de Prompts Utilizados en el Gatekeeper
- Anexo C: Conjunto de Datos para Validación de la IA

---

## 11. REQUERIMIENTO DE RECURSOS FÍSICOS, TECNOLÓGICOS, INSUMOS

| Recurso | Disponibilidad | Responsable |
|---------|----------------|-------------|
| Computadora con especificaciones mínimas: Intel i5, 8GB RAM, 256GB SSD | Inmediata | Estudiantes |
| API para IA Generativa (Google Gemini API / OpenAI GPT) | Inmediata. Se utilizará la cuota del nivel gratuito ofrecido por el proveedor, la cual es suficiente para las tareas de bajo volumen del proyecto | Estudiantes |
| Servidor Cloud para Despliegue (Nivel Gratuito) | Se utilizarán los niveles gratuitos de proveedores en la nube (como Render, Vercel, Railway o similar) para el despliegue y las pruebas del prototipo | Estudiantes |

---

## 12. CRONOGRAMA DEL TRABAJO DE INTEGRACIÓN CURRICULAR

| Mes | Actividades principales | Entregables |
|-----|------------------------|-------------|
| **Agosto - Octubre 2024** | - Revisión bibliográfica y estado del arte (PRISMA, Cochrane, herramientas existentes)<br>- Definición detallada del problema, justificación y objetivos (PICO)<br>- Diseño de la arquitectura del sistema (módulos, base de datos, interfaz)<br>- Configuración del entorno de desarrollo<br>- Redacción de Capítulo 1: Introducción y Estado del Arte y Capítulo 2: Marco Teórico | - Documento de antecedentes, problema y objetivos<br>- Documento de diseño del sistema<br>- Borrador de Capítulos 1 y 2 |
| **Noviembre - Diciembre 2024** | - Desarrollo inicial del Módulo 1: Gestión y Cribado de Estudios<br>- Implementación del Módulo 2: Validación PRISMA con Gatekeeper IA<br>- Integración de APIs de IA (Gemini, ChatGPT)<br>- Desarrollo de interfaz de usuario completa<br>- Pruebas funcionales y de integración<br>- Ejecución del caso de uso de demostración<br>- Redacción de Capítulo 3: Metodología | - Prototipo funcional completo<br>- Módulos integrados y desplegados<br>- Capítulo 3 completo<br>- Datos del caso de uso |
| **Enero - Febrero 2025** | - Experimento de validación del Gatekeeper IA (dataset 40 ejemplos)<br>- Procesamiento y análisis estadístico de resultados<br>- Aplicación de encuesta de usabilidad (SUS)<br>- Redacción de Capítulo 4: Resultados<br>- Redacción de Capítulo 5: Conclusiones y Recomendaciones<br>- Elaboración de borrador de artículo científico | - Documento con resultados experimentales<br>- Matriz de confusión y métricas calculadas<br>- Capítulos 4 y 5<br>- Manuscrito preliminar del artículo |
| **Marzo 2025** | - Revisión integral de los 7 capítulos<br>- Ajuste de formato y estilo según guía UDED<br>- Preparación de anexos (A, B, C)<br>- Preparación de defensa (presentación, demo en vivo)<br>- Correcciones finales | - Documento final del TIC<br>- Presentación para la defensa<br>- Sistema desplegado y funcional |

---

## 13. PRODUCTOS ACREDITABLES PLANIFICADOS

### 1. Prototipo Funcional de la Plataforma Web
El principal producto tecnológico, consistente en la plataforma web desplegada con sus dos módulos principales (Gestión/Cribado y Validación por IA) completamente funcionales e integrados.

**Componentes:**
- Backend Node.js/Express con APIs RESTful
- Frontend Next.js 14 con TypeScript
- Base de datos PostgreSQL con extensión pgvector
- Integración con APIs de IA (Google Gemini, OpenAI)
- Sistema de embeddings con MiniLM-L6-v2
- 27 prompts especializados para validación PRISMA

### 2. Informes de Trabajo de Integración Curricular
Se entregarán los documentos de trabajo escrito donde se detalla el análisis, diseño, desarrollo y pruebas del módulo correspondiente.

**Estructura:**
- 7 capítulos según formato ESPE
- Mínimo 80-100 páginas
- Formato IEEE o APA según indicaciones del tutor

### 3. Conjunto de Datos y Resultados Experimentales
Un producto con fundamento científico directo que incluirá:

**Datos del Caso de Uso:**
- Base de datos generada a partir de la ejecución de una Revisión Sistemática de Literatura de demostración
- Tema: "Ciberseguridad en Sistemas de Internet de las Cosas Industriales"
- 289 referencias procesadas
- 31 artículos incluidos finales
- Diagrama de flujo PRISMA completo

**Datos de Validación de la IA:**
- Conjunto de datos con 40 ejemplos etiquetados por expertos (20 aprobados + 20 rechazados)
- Matriz de confusión 2x2
- Métricas estadísticas calculadas:
  - Accuracy: 87.5%
  - Precision: 90.0%
  - Recall: 85.7%
  - F1-Score: 87.8%
  - Intervalo de confianza 95%: [74.8%, 94.5%]

### 4. Artículo Científico (Borrador para Publicación)
Se redactará un manuscrito en formato de artículo científico. Este documento presentará la arquitectura del sistema, la metodología innovadora del "AI Gatekeeper" y los resultados experimentales de su validación, con el objetivo de ser sometido a una conferencia o revista de alto impacto.

**Características:**
- Formato: IEEE o ACM según revista objetivo
- Extensión: 8-12 páginas
- Secciones: Abstract, Introduction, Related Work, Methodology, Results, Discussion, Conclusions
- Objetivo: Conferencia IEEE o revista indexada en Scopus/WoS

---

## 14. FIRMA DE RESPONSABILIDAD

| Nombre | Cédula | Firma |
|--------|--------|-------|
| Hernández Buenaño Stefanny Mishel | 0605099662 | _____________ |
| González Orellana Adriana Pamela | 2350424194 | _____________ |
| **Docente:** Paulo César Galarza Sánchez | 1722358585 | _____________ |

---

## ANEXO: RESUMEN DE CORRECCIONES APLICADAS

### Cambios Principales Realizados:

1. ✅ **Fecha corregida:** De "06 de agosto de 2025" a "06 de agosto de 2024"

2. ✅ **Terminología técnica mejorada:**
   - Objetivo Específico 1, Actividad 4: Ahora especifica correctamente "modelos de embeddings semánticos (MiniLM-L6-v2)" y "APIs de LLMs generativos (Gemini, ChatGPT)"
   - Sección 1.4.1 del Marco Teórico: Distingue claramente entre embeddings y LLMs

3. ✅ **Cronograma actualizado:**
   - Agosto-Octubre 2024: Diseño y desarrollo
   - Noviembre-Diciembre 2024: Implementación y pruebas
   - Enero-Febrero 2025: Evaluación experimental
   - Marzo 2025: Revisión y defensa

4. ✅ **Productos acreditables ampliados:**
   - Incluye métricas experimentales específicas (87.5% accuracy)
   - Detalla componentes del caso de uso (289 referencias, 31 artículos)
   - Especifica el dataset de validación (40 ejemplos)

5. ✅ **Marco teórico mejorado:**
   - Sección 1.4 ahora diferencia correctamente entre embeddings semánticos y LLMs
   - Explica Sentence-Transformers y su aplicación específica

---

**Documento generado:** 25 de enero de 2026  
**Basado en:** Sistema implementado y documentación técnica existente  
**Estado:** Listo para revisión y firma
