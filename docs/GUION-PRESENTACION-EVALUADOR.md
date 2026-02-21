# GUIÓN DE PRESENTACIÓN  DEFENSA DE TESIS
**Autoras**: Stefanny Hernández & Adriana González  
**Tutor**: Ing. Paulo Galarza, MSc.  
**Tiempo total disponible**: 40 minutos

---

##  DISTRIBUCIÓN DE TIEMPO

| Sección | Minutos |
|---------|---------|
| 1. Introducción + Problema | 5 min |
| 2. Objetivos | 2 min |
| 3. Marco Teórico | 5 min |
| 4. Metodología | 5 min |
| 5. Diseño + Arquitectura | 10 min |
| 6. Resultados | 8 min |
| 7. Conclusiones | 3 min |
| 8. Preguntas del tribunal | 2 min buffer |

---

## 1. INTRODUCCIÓN (5 min)

### Hook de apertura (15 seg)
> *"Saben cuánto tarda en promedio completar una revisión sistemática de literatura? Entre 4 y 12 meses. Nosotros lo redujimos a 2-4 semanas sin sacrificar rigor metodológico."*

### El problema en 3 puntos
- Las RSL son el gold standard de investigación científica: sintetizan evidencia de múltiples estudios bajo un protocolo riguroso
- El estándar PRISMA 2020 exige cumplir **27 ítems obligatorios**  muchos investigadores no los conocen o los omiten
- Las herramientas existentes (Covidence, Rayyan) ayudan con el cribado, pero **ninguna genera el artículo completo ni valida PRISMA automáticamente**

### La brecha que llenamos
| Herramienta | Cribado | Genera artículo | Valida PRISMA |
|-------------|---------|-----------------|---------------|
| Covidence / Rayyan | Semi |  |  |
| **Nuestro sistema** |  Automático |  |  |

---

## 2. OBJETIVOS (2 min)

### Objetivo General
> Desarrollar un sistema web para la gestión automatizada de revisiones sistemáticas de literatura con validación de cumplimiento del estándar PRISMA 2020 mediante inteligencia artificial.

### Objetivos Específicos
- **OE1**: Diseñar la arquitectura del sistema y el modelo Entidad-Relación (MER)
- **OE2**: Implementar el módulo de gestión y cribado con asistente IA para PICO y cadenas de búsqueda
- **OE3**: Desarrollar la carga y filtrado semiautomático de referencias (CSV) usando LLM MiniLM-L6-v2
- **OE4**: Implementar la validación secuencial de los 27 ítems PRISMA 2020  AI Gatekeeper
- **OE5**: Implementar la generación automática del borrador del artículo científico

---

## 3. MARCO TEÓRICO (5 min)

### Qué es una RSL?
- Investigación secundaria: sintetiza evidencia de estudios primarios under un protocolo explícito y reproducible
- PRISMA 2020: guía internacional con **27 ítems obligatorios** para garantizar calidad metodológica

### Qué es un LLM?  Explicar con analogía
> *"Un LLM (Modelo de Lenguaje de Gran Escala) es un modelo de IA entrenado con billones de textos. No piensa, pero aprendió patrones del lenguaje y puede seguir instrucciones muy específicas para generar texto coherente. Imaginen un asistente que leyó toda Internet y puede redactar una sección de artículo científico si le das las reglas exactas de PRISMA y los datos de tu proyecto."*

**En el sistema usamos 2 tipos de IA:**
| Modelo | Función | Costo |
|--------|---------|-------|
| ChatGPT gpt-4o-mini | Genera PICO, cadenas de búsqueda y artículo | API OpenAI |
| MiniLM-L6-v2 | Embeddings para similitud semántica en cribado | Local (gratis) |

### Qué son los Embeddings?
> *"Transformamos cada resumen de referencia en un vector de números de 384 dimensiones. Los artículos similares quedan cerca en ese espacio matemático. El sistema mide la distancia entre el protocolo PICO y cada referencia  si están cerca, la referencia es relevante."*

### Técnica RAG
> *"RAG combina recuperación de datos con generación de lenguaje. El sistema recupera los datos reales del proyecto (protocolo, estadísticas de cribado, referencias) y los inyecta en el prompt del LLM. Así el modelo genera usando solo datos reales, no inventa."*

---

## 4. METODOLOGÍA (5 min)

### Por qué Design Science Research (DSR)?
> *"DSR de Hevner (2004) es la metodología estándar para proyectos cuyo resultado es un artefacto tecnológico. No medimos un fenómeno, construimos y evaluamos un sistema. DSR nos estructura en 6 pasos: identificar el problema, definir objetivos, diseñar el artefacto, demostrarlo, evaluarlo con métricas y comunicar resultados. Nuestro trabajo cumple los 6."*

**Si preguntan: "Por qué no investigación experimental pura?"**
> *"La investigación experimental estudia fenómenos ya existentes bajo condiciones controladas. DSR es apropiado cuando el objetivo es CREAR algo nuevo para resolver un problema práctico documentado. Aquí creamos el sistema; las métricas (F1-Score, SUS, Lighthouse) son la evaluación del artefacto, no de una hipótesis teórica."*

### Por qué Scrum?
- Los requerimientos evolucionaron durante el desarrollo  planes rígidos habrían fallado
- Sprints cortos = validación continua con el tutor
- **5 Sprints, Oct 2025  Feb 2026, 520 horas totales**

| Sprint | Entregable |
|--------|-----------|
| S1 | Arquitectura + MER + requerimientos |
| S2 | Frontend + Backend + módulo PICO |
| S3 | Cribado con MiniLM + AI Gatekeeper |
| S4 | Generación artículo + exportación |
| S5 | 91 pruebas + despliegue en producción |

---

## 5. DISEÑO Y ARQUITECTURA (10 min)

### Arquitectura de 3 capas  MOSTRAR DIAGRAMA

| Capa | Tecnología | Despliegue |
|------|-----------|------------|
| Presentación | Next.js 14 + React + TypeScript | Vercel |
| Lógica de negocio | Node.js + Express + Clean Architecture | Render |
| Datos | PostgreSQL 15 + pgvector | Cloud |

### Por qué PostgreSQL?
> *"Necesitábamos dos capacidades en la misma base de datos: relaciones estructuradas entre proyectos, protocolos y referencias, Y búsqueda vectorial para los embeddings de cribado. PostgreSQL con la extensión pgvector es el único gestor relacional open-source maduro que ofrece ambas."*

**Si preguntan "por qué no MongoDB o Pinecone?"**
> *"MongoDB es documental y pierde integridad referencial entre las 9 entidades del dominio  crítico cuando actualizamos múltiples tablas en una transacción. Pinecone es excelente para vectores pero requeriría una segunda BD para los datos relacionales, duplicando complejidad y costo operacional. PostgreSQL + pgvector resuelve todo con transacciones ACID garantizadas."*

### Flujo del sistema  MOSTRAR DIAGRAMA DE FASES

**FASE 1  Protocolo PICO**
- Input: idea inicial + área de investigación
- Output: análisis PICO + criterios inclusión/exclusión + cadenas de búsqueda (generados por ChatGPT)

**FASE 2  Cribado de referencias**
- Input: archivo CSV/BibTeX con referencias
- Proceso: detección duplicados  embeddings MiniLM (similitud semántica)  ChatGPT (criterios explícitos)
- Output: referencias clasificadas como incluidas/excluidas

**FASE 3  Extracción de datos (RQS)**
- LLM extrae metodología, resultados y limitaciones de cada referencia incluida

**FASE 4  AI Gatekeeper PRISMA** 
> *"Esta es la innovación principal. El Gatekeeper ejecuta 27 prompts en secuencia  uno por ítem PRISMA. Cada prompt contiene las reglas exactas del estándar, todos los datos del proyecto y la instrucción 'usa solo estos datos, no inventes'. En 2-3 minutos: borrador completo del artículo científico."*

**FASE 5  Artículo y Exportación**
- Interfaz tipo Google Docs para edición
- Exportación: Word, PDF, LaTeX

---

## 6. RESULTADOS (8 min)

### Números clave  MEMORIZAR ESTOS

| Métrica | Valor | Contexto |
|---------|-------|---------|
| Pruebas funcionales aprobadas | **91/91 (100%)** | Jest + Supertest |
| FCP (primera carga) | **88 ms** | Top 1% mundial; umbral Google: 1.8 s |
| LCP (contenido principal) | **432 ms** | Top 5% mundial; umbral Google: 2.5 s |
| Accesibilidad (Lighthouse) | **98/100** | Cumple WCAG 2.1 nivel AA |
| Usabilidad (SUS Score) | **84.5/100** | Percentil 90 = Excelente |
| F1-Score cribado IA | **0.863** | Supera umbral científico 0.80 |
| Costo por proyecto | **$0.082 USD** | vs Covidence $20-40/mes |
| Reducción de tiempo | **85%** | 4-12 meses  2-4 semanas |

### Precisión del cribado
- Dataset: 200 referencias etiquetadas manualmente (100 rel. + 100 no rel.)
- F1-Score **0.863 supera el umbral científico de 0.80**  precisión confiable

### Usabilidad
- 5 participantes: estudiantes de maestría y doctorado
- Score promedio: **84.5/100 = Excelente (percentil 90)**
- Cita real: *"Nunca había hecho una RSL. Con este sistema la completé en 3 semanas."*

---

## 7. CONCLUSIONES (3 min)

### Los 3 números que lo resumen

| # | Número | Qué significa |
|---|--------|--------------|
| 1 | **85%** | Reducción de tiempo (meses  semanas) |
| 2 | **27/27** | Ítems PRISMA generados automáticamente |
| 3 | **$0.08** | Costo por proyecto completo |

### Cumplimiento de objetivos
- OE1  Arquitectura + MER documentados y validados
- OE2  Módulo PICO + cadenas de búsqueda con ChatGPT
- OE3  Cribado con MiniLM, F1-Score = 0.863
- OE4  AI Gatekeeper: 27 prompts especializados
- OE5  Borrador artículo en 2-3 minutos

### Limitaciones (decirlas antes de que las pregunten)
- Dependencia de OpenAI API  mitigado con arquitectura patrón Strategy (cambiar proveedor solo editando el adaptador)
- Sin integración directa con bases académicas  el usuario importa manualmente
- TBT de 599ms supera umbral de 300ms  trabajo futuro: code splitting

---

##  CÓMO EXPLICAR CADA OBJETIVO  EJEMPLOS LISTOS

### OE1  Arquitectura y MER (texto para decir)
> *"El primer objetivo fue diseñar la base estructural del sistema. Elaboramos el diagrama de arquitectura de 3 capas y el Modelo Entidad-Relación que define cómo interactúan las 9 entidades del dominio: usuario, proyecto, protocolo, referencia, decisión de cribado, RQS, artículo y versionado. Por qué importa? Porque el AI Gatekeeper necesita leer del protocolo, del cribado y de las RQS en una sola operación. Sin un MER bien diseñado, esas relaciones no existen y el sistema no funciona. El diseño fue validado con el tutor antes de escribir código de negocio."*

**Apuntar a**: diagrama ER en diapositiva

### OE2  Módulo PICO con IA
> *"El usuario llega al sistema solo con una idea. ChatGPT le propone 5 temas especializados, el usuario elige uno, y el asistente construye automáticamente el análisis PICO completo con términos clave, criterios de inclusión y exclusión, y cadenas de búsqueda para varias bases de datos."*

### OE3  Cribado con MiniLM
> *"El cribado es la fase más propensa a sesgos humanos. Automatizamos con dos capas: MiniLM mide similitud semántica entre cada resumen y el protocolo PICO  si supera el umbral, pasa. Los que quedan en zona gris los analiza ChatGPT aplicando los criterios del protocolo. El F1-Score de 0.863 confirma que la precisión es confiable."*

### OE4  AI Gatekeeper
> *"El Gatekeeper no es un formulario que el usuario llena. Es un proceso interno que:  recopila todos los datos del proyecto, ejecuta 27 prompts en secuencia con las reglas exactas de PRISMA, y valida que cada ítem esté completo. El usuario recibe el borrador en 2-3 minutos, listo para revisar."*

### OE5  Generación del artículo
> *"El borrador llega en una interfaz de edición donde el investigador puede modificar, agregar criterio científico y exportar en Word, PDF o LaTeX. La IA hace la estructura; el investigador hace el pensamiento crítico."*

---

##  PREGUNTAS Y RESPUESTAS CORTAS

**Por qué DSR y no otra metodología?**
> "DSR es el estándar cuando el resultado es un artefacto tecnológico  no una hipótesis teórica. Nos estructura para: identificar el problema, diseñar, evaluar y comunicar. Nuestro trabajo cumple sus 6 pasos documentados."

**Por qué PostgreSQL y no MongoDB/Pinecone?**
> "Necesitamos relaciones estructuradas Y búsqueda vectorial en la misma base de datos. MongoDB pierde integridad relacional. Pinecone es solo vectorial y requeriría una segunda BD. PostgreSQL + pgvector resuelve ambas con transacciones ACID."

**Cómo evitan que la IA invente datos?**
> "Tres capas: temperatura baja (0.3), prompts que dicen explícitamente 'usa solo los datos del contexto, no inventes', y técnica RAG que solo inyecta datos reales del proyecto. Más la revisión final del usuario."

**Por qué ChatGPT y no Gemini o Llama?**
> "Gemini fue inconsistente en prompts de 1000+ tokens. Llama requiere GPU costosa y tarda 10-15 segundos. ChatGPT gpt-4o-mini: $0.15/millón de tokens, 2-4 segundos de respuesta, seguimiento preciso de instrucciones. La arquitectura permite cambiar de proveedor editando solo el adaptador."

**Por qué solo 5 participantes en SUS?**
> "Nielsen (1993) establece que 5 participantes detectan el 85% de los problemas de usabilidad. El objetivo fue validación de concepto, no estudio a gran escala. Los resultados (84.5/100, percentil 90) son consistentes."

**El sistema reemplaza al investigador?**
> "No. Genera la estructura y el borrador; el investigador aporta juicio crítico, interpretación y responsabilidad del contenido. La IA automatiza lo repetitivo; el investigador hace lo que la IA no puede: pensar."

---

##  CIERRE  60 SEGUNDOS

> *"En resumen: construimos el primer sistema documentado que automatiza el flujo completo de una RSL, desde el protocolo PICO hasta el borrador del artículo con validación PRISMA integrada.*
> *85% menos tiempo. 27 ítems automatizados. $0.08 por proyecto.*
> *El código está en GitHub, disponible para la comunidad académica.*
> *Muchas gracias. Quedamos a disposición para sus preguntas."*

---

##  CHECKLIST FINAL

- [ ] Diagramas cargados: arquitectura, flujo de fases, ER
- [ ] Métricas memorizadas: FCP 88ms, F1=0.863, SUS=84.5, $0.082, 91/91 pruebas
- [ ] GitHub abierto en pestaña del navegador
- [ ] Tesis impresa con objetivos marcados
- [ ] Cronometrar presentación: objetivo  38 minutos
- [ ] Practicar respuestas a preguntas del tribunal

---
*Actualizado: Febrero 2026  Objetivos según versión final de tesis*