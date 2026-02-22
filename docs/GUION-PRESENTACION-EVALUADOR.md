# GUIÓN DE PRESENTACIÓN — DEFENSA DE TESIS
**Autoras**: Stefanny Mishel Hernández Buenaño & Adriana Pamela González Orellana
**Tutor**: Ing. Paulo Galarza, MSc.
**Tiempo total disponible**: 50 minutos (30 min exposición + 20 min preguntas del tribunal)

---

## RÚBRICA DE EVALUACIÓN — COMPONENTE EXPOSICIÓN ORAL

> El tribunal evalúa los siguientes rubros (escala 0–20 cada uno):

| Aspecto evaluado | Lo cubro en... |
|------------------|----------------|
| **Exposición de objetivos** | Sección 2 — Objetivos |
| **Descripción de la metodología aplicada** | Sección 4 — Metodología (DSR + Scrum) |
| **Presentación de los resultados alcanzados** | Sección 7 — Resultados |
| **Conclusiones y recomendaciones** | Sección 8 — Conclusiones |
| **Respuestas a las interrogantes del tribunal** | Sección 9 — Preguntas |

> **Ponderación**: 40% de la nota final.

---

## EQUIPO SCRUM DEL PROYECTO

| Rol | Responsable |
|-----|-------------|
| Stakeholder | Ing. Germán Rodríguez |
| Product Owner | Ing. Paulo Galarza |
| Scrum Master | Ing. Paulo Galarza |
| Development Team | Stefanny Mishel Hernández Buenaño |
| Development Team | Adriana Pamela González Orellana |

---

## DISTRIBUCIÓN DE ROLES EN LA EXPOSICIÓN

| Bloque | Sección | Quién expone | Tiempo |
|--------|---------|-------------|--------|
| A | 1. Introducción + Problema | **Stefanny** | 4 min |
| A | 2. Objetivos | **Stefanny** | 3 min |
| A | 3. Marco Teórico | **Stefanny** | 4 min |
| A | 4. Metodología | **Stefanny** | 4 min |
| B | 5. Arquitectura del sistema | **Adriana** | 5 min |
| B | 6. Fases del sistema (demo) | **Adriana** | 6 min |
| B | 7. Resultados | **Adriana** | 3 min |
| B | 8. Conclusiones y cierre | **Adriana** | 1 min |
| — | 9. Preguntas del tribunal | **Ambas** | 20 min |
| **Total** | | | **50 min** |

> **Regla de oro:** cada una habla solo de su bloque. Si el tribunal pregunta algo del bloque de la otra, esa persona responde; si es pregunta general, cualquiera inicia y la otra complementa.

---

---

# BLOQUE A — STEFANNY (15 minutos)

---

## 1. INTRODUCCIÓN (4 min) — STEFANNY

### Frase de apertura (decir mirando al tribunal)
> *"¿Saben cuánto tiempo tarda en completarse una revisión sistemática de literatura? Entre cuatro y doce meses. Nosotras lo redujimos a dos o cuatro semanas, sin sacrificar rigor metodológico."*

### Contextualizamos el problema (sin jerga técnica)
Antes de explicar el sistema, necesitamos que el tribunal entienda **qué es lo que automatizamos**:

- Una **revisión sistemática de literatura (RSL)** es una investigación en la que se recopila, filtra y sintetiza el conocimiento publicado sobre un tema, siguiendo reglas internacionales muy estrictas.
- Esas reglas se llaman **PRISMA 2020** y obligan a cumplir 27 ítems documentados; si falta uno, la publicación puede ser rechazada por las revistas científicas.
- Las herramientas que existen hoy (Covidence, Rayyan) ayudan a organizar referencias, pero **ninguna genera el artículo completo ni verifica automáticamente esos 27 ítems**.

### La brecha que llenamos
| Herramienta | Cribado | Genera artículo | Valida PRISMA |
|-------------|---------|-----------------|---------------|
| Covidence / Rayyan | Semi |  |  |
| **Nuestro sistema** |  Automático |  |  |

---

## 2. OBJETIVOS (3 min) — STEFANNY

### Objetivo General
> *"El objetivo general de este trabajo fue desarrollar un sistema web que automatice el proceso completo de una revisión sistemática de literatura, desde la idea inicial hasta el borrador del artículo científico, con validación del estándar PRISMA 2020 mediante inteligencia artificial."*

### Objetivos Específicos — leer y señalar en la diapositiva
- **OE1**: Diseñar la arquitectura del sistema y el modelo Entidad-Relación (la base de datos)
- **OE2**: Implementar el módulo de protocolo PICO con asistente de IA que genera cadenas de búsqueda
- **OE3**: Desarrollar el cribado semiautomático de referencias usando el modelo de lenguaje MiniLM-L6-v2
- **OE4**: Implementar el validador secuencial de los 27 ítems PRISMA 2020 — el AI Gatekeeper
- **OE5**: Implementar la generación automática del borrador del artículo científico y su exportación

> *"Al finalizar, Adriana mostrará cómo cada uno de estos objetivos se traduce en una fase concreta del sistema."*

---

## 3. MARCO TEÓRICO (4 min) — STEFANNY

> **Consejo:** usar analogías simples, no asumir que el tribunal conoce los términos técnicos.

### ¿Qué es una RSL? (analogía rápida)
> *"Imaginen que quieren saber si tomar café realmente mejora la concentración. No basta con leer un solo artículo; hay que revisar todos los estudios publicados sobre ese tema, compararlos y sacar una conclusión basada en la evidencia acumulada. Eso es una RSL. PRISMA 2020 es la lista de verificación que garantiza que lo hicieron correctamente."*

### ¿Qué es un LLM? (analogía sencilla)
> *"Un LLM —Modelo de Lenguaje de Gran Escala— es un programa entrenado con miles de millones de textos. No piensa, pero aprendió los patrones del lenguaje y puede redactar texto coherente si le damos instrucciones precisas. En el sistema usamos dos modelos de IA con roles distintos:"*

**En el sistema usamos 2 tipos de IA:**
| Modelo de IA | ¿Qué hace en el sistema? | ¿Dónde corre? |
|-------------|--------------------------|---------------|
| ChatGPT gpt-4o-mini | Genera el protocolo PICO, las cadenas de búsqueda y el borrador del artículo | API de OpenAI (en la nube) |
| MiniLM-L6-v2 | Mide qué tan relevante es cada referencia para el protocolo del investigador | En el servidor del proyecto (gratuito) |

### ¿Qué son los Embeddings? (para tribunal no técnico)
> *"Cada resumen de artículo se convierte en una lista de 384 números — un vector. Los artículos sobre temas similares quedan cerca entre sí en ese espacio matemático. El sistema mide la distancia entre el protocolo del investigador y cada referencia: si están cerca, la referencia es relevante."*

### Técnica RAG (en una frase)
> *"RAG significa que la IA no inventa: primero recupera los datos reales del proyecto —estadísticas de cribado, referencias incluidas, protocolo— y luego los usa para generar el texto. Sin datos reales, no escribe nada."*

---

## 4. METODOLOGÍA (4 min) — STEFANNY

### Design Science Research (DSR) — por qué la elegimos
> *"DSR de Hevner (2004) es la metodología estándar en ingeniería de sistemas cuando el resultado del trabajo es un artefacto tecnológico, no una hipótesis teórica. Define 6 pasos: identificar el problema, definir objetivos, diseñar el artefacto, demostrarlo, evaluarlo y comunicar los resultados. Nuestro trabajo cumple los 6 pasos documentados."*

> **Si preguntan "¿por qué no investigación experimental?"**
> *"La investigación experimental estudia fenómenos que ya existen. DSR es apropiado cuando creamos algo nuevo para resolver un problema real. Las métricas —F1-Score, SUS, Lighthouse— son la evaluación del artefacto, no de una hipótesis."*

### Por qué Scrum?
- Los requerimientos evolucionaron durante el desarrollo — planes rígidos habrían fallado
- Sprints cortos permitieron validación continua con el tutor
- **5 Sprints, octubre 2025 – febrero 2026, 520 horas totales**

**Equipo Scrum:**
| Rol | Responsable |
|-----|-------------|
| Stakeholder | Ing. Germán Rodríguez |
| Product Owner | Ing. Paulo Galarza |
| Scrum Master | Ing. Paulo Galarza |
| Development Team | Stefanny Hernández + Adriana González |

| Sprint | Entregable principal |
|--------|----------------------|
| S1 | Arquitectura + MER + requerimientos |
| S2 | Frontend + Backend + módulo PICO |
| S3 | Cribado con MiniLM + AI Gatekeeper |
| S4 | Generación del artículo + exportación |
| S5 | 91 pruebas + despliegue en producción |

> **Transición a Adriana:** *"Ya explicamos el problema, los objetivos, la base teórica y la metodología. Adriana nos va a mostrar cómo todo eso se construyó en el sistema."*

---

---

# BLOQUE B — ADRIANA (15 minutos)

---

---

## 5. ARQUITECTURA DEL SISTEMA (5 min) — ADRIANA

### Estructura de 3 capas — señalar diagrama
> *"El sistema se divide en tres capas independientes: la interfaz que ve el usuario, la lógica que procesa los datos, y la base de datos donde se guarda todo."*

| Capa | Tecnología | ¿Dónde está desplegado? |
|------|-----------|------------------------|
| Presentación (lo que ve el usuario) | Next.js 14 + React + TypeScript | Vercel |
| Lógica del negocio (lo que procesa) | Node.js + Express + Clean Architecture | Render |
| Datos (lo que guarda) | PostgreSQL 15 + pgvector | Base de datos en la nube |

### ¿Por qué PostgreSQL y no otra base de datos?
> *"Necesitábamos que la base de datos hiciera dos cosas a la vez: guardar relaciones entre proyectos, usuarios y referencias —como cualquier base de datos relacional— y además buscar por similitud semántica entre los embeddings del cribado. PostgreSQL con la extensión pgvector es el único motor relacional open-source maduro que hace ambas cosas con transacciones garantizadas."*

> **Si preguntan "¿por qué no MongoDB o Pinecone?"**
> *"MongoDB es documental y pierde integridad entre las 9 entidades del dominio. Pinecone solo maneja vectores y requeriría una segunda base de datos para los datos relacionales, duplicando la complejidad. PostgreSQL + pgvector resuelve todo en un solo sistema."*

---

## 6. FASES DEL SISTEMA — DEMO (6 min) — ADRIANA

> *"El sistema tiene tres fases. El investigador las recorre en orden: primero define qué va a buscar, luego filtra lo que encontró, y finalmente obtiene el borrador del artículo."*

---

### FASE 1 — Protocolo PICO

**¿Qué hace el investigador? (4 datos de entrada):**
1. **Idea** de investigación (un párrafo libre)
2. **Descripción** del contexto del problema
3. **Área** de conocimiento
4. **Año** de inicio del estudio

**¿Qué genera el sistema automáticamente?**
Con esos cuatro datos, ChatGPT produce:
- **Marca PICO y matriz Es / No es** — define con precisión qué entra y qué no en el estudio
- **5 opciones de título** — el investigador elige el que mejor describe su trabajo
- **Terminología clave** — tecnologías relevantes y dominio del problema
- **Criterios de inclusión y exclusión** — las reglas para filtrar referencias
- **Cadenas de búsqueda** — consultas listas para PubMed, Scopus, Web of Science, etc.

**Cierre de la fase:**
El investigador copia las cadenas de búsqueda, las usa en las bases académicas y luego **importa las referencias encontradas** al sistema (formatos CSV, RIS, BibTeX). El sistema genera un resumen completo del protocolo con todos los datos definidos.

---

### FASE 2 — Cribado de Referencias

**¿Qué hace el investigador?**
Hace clic en **"Ejecutar cribado"**. A partir de ahí el sistema trabaja solo.

**¿Qué hace el sistema?**
1. **Detecta y elimina duplicados** automáticamente
2. **MiniLM mide similitud semántica** entre cada resumen y el protocolo PICO — si supera el umbral, la referencia es relevante
3. **ChatGPT aplica los criterios** de inclusión/exclusión a las referencias en zona gris
4. Clasifica cada referencia como **incluida** o **excluida** con justificación

**Revisión manual (trabajo del investigador):**
El investigador abre cada referencia, lee el resumen, puede subir el PDF del artículo completo, y confirma o cambia la decisión del sistema. Cuando termina, cierra esta sección.

**Resultados visibles al investigador:**
- **Diagrama PRISMA actualizado** — muestra cuántas referencias entraron, cuántas se descartaron y por qué
- **Estadísticas globales** — cifras del protocolo comparadas con los resultados del cribado

**Al cerrar el cribado:**
El sistema completa internamente los 27 ítems PRISMA y realiza la extracción de datos RQS de cada referencia incluida. Luego redirige automáticamente al artículo.

---

### FASE 3 — Artículo Científico

**¿Qué hace el sistema?**
Recopila toda la información de las fases anteriores —protocolo, estadísticas de cribado, datos RQS— y genera el **borrador completo del artículo científico** en 2 a 3 minutos.

> *"Esto es posible gracias al AI Gatekeeper: ejecuta 27 prompts en secuencia, uno por ítem PRISMA, con los datos reales del proyecto. No inventa nada."*

**¿Qué puede hacer el investigador?**
- Editar el borrador en una interfaz tipo Google Docs
- Cada cambio queda guardado como versión independiente
- Exportar el trabajo completo listo para publicación:

| Archivo exportado | Para qué sirve |
|-------------------|----------------|
| LaTeX (.tex) | Redacción en Overleaf o Texmaker |
| BibTeX (.bib) | Bibliografía automática en cualquier editor |
| CSV de datos | Los datos RQS para análisis estadístico |
| Gráficos PNG + PDF | Figuras en alta resolución para journals (300 DPI) |
| Scripts Python | Código para regenerar o personalizar gráficos |
| Paquete ZIP completo | Todo lo anterior en un solo archivo |

---

## 7. RESULTADOS (3 min) — ADRIANA

### Los 8 números clave — señalar en diapositiva

| Métrica | Valor | Referencia |
|---------|-------|-----------|
| Pruebas funcionales aprobadas | **91 / 91 (100%)** | Jest + Supertest |
| Primera carga (FCP) | **88 ms** | Umbral Google: 1800 ms — top 1% mundial |
| Carga del contenido principal (LCP) | **432 ms** | Umbral Google: 2500 ms — top 5% mundial |
| Accesibilidad | **98 / 100** | Cumple WCAG 2.1 nivel AA |
| Usabilidad (SUS Score) | **84.5 / 100** | Percentil 90 = Excelente |
| F1-Score del cribado IA | **0.863** | Supera umbral científico de 0.80 |
| Costo por proyecto completo | **$0.082 USD** | vs. Covidence: $20–40/mes |
| Reducción de tiempo | **85%** | 4–12 meses → 2–4 semanas |

### Cribado IA — F1-Score 0.863
> *"Evaluamos el cribado con 200 referencias etiquetadas manualmente: 100 relevantes y 100 no relevantes. Un F1-Score de 0.863 supera el umbral científico aceptado de 0.80, lo que confirma que el sistema clasifica con precisión confiable."*

### Usabilidad — SUS 84.5
> *"Evaluamos la experiencia de usuario con 5 participantes: estudiantes de maestría y doctorado. Un puntaje de 84.5 equivale al percentil 90 en la escala SUS —calificación de 'Excelente'. Un participante comentó: 'Nunca había hecho una RSL. Con este sistema la completé en 3 semanas.'"*

> **Si preguntan por qué solo 5 participantes:** *"Nielsen (1993) establece que 5 participantes detectan el 85% de los problemas de usabilidad. El objetivo fue validación del concepto, no un estudio a gran escala."*

---

## 8. CONCLUSIONES Y RECOMENDACIONES (1 min) — ADRIANA

### Los 3 números que resumen el trabajo

| # | Número | Qué significa |
|---|--------|--------------|
| 1 | **85%** | Reducción de tiempo: meses → semanas |
| 2 | **27 / 27** | Ítems PRISMA generados y validados automáticamente |
| 3 | **$0.08** | Costo por proyecto completo |

### Cumplimiento de objetivos
- ✅ OE1 — Arquitectura de 3 capas + MER con 9 entidades documentado y validado
- ✅ OE2 — Módulo PICO con asistente ChatGPT; genera cadenas de búsqueda
- ✅ OE3 — Cribado con MiniLM; F1-Score = 0.863
- ✅ OE4 — AI Gatekeeper: 27 prompts en secuencia con reglas PRISMA
- ✅ OE5 — Borrador del artículo en 2–3 minutos; exportación en 6 formatos

### Limitaciones (mencionarlas antes de que las señale el tribunal)
- **Dependencia de OpenAI API** — mitigado con patrón Strategy: cambiar de proveedor de IA requiere editar solo el adaptador, sin tocar el núcleo del sistema
- **Sin integración directa con bases académicas** — el investigador importa las referencias manualmente; es trabajo futuro
- **TBT de 599 ms supera el umbral de 300 ms** — trabajo futuro: code splitting del frontend

### Recomendación principal
> *"Se recomienda integrar conectores directos con PubMed y Scopus, e incorporar LLMs open-source locales como Llama para reducir la dependencia de APIs de pago."*

### Cierre (decir mirando al tribunal)
> *"En resumen: construimos el primer sistema documentado que automatiza el flujo completo de una revisión sistemática de literatura, desde el protocolo PICO hasta el borrador del artículo con validación PRISMA integrada. 85% menos tiempo. 27 ítems automatizados. $0.08 por proyecto. El código está en GitHub, disponible para la comunidad académica. Muchas gracias — quedamos a disposición del tribunal."*

---

---

# SECCIÓN 9 — PREGUNTAS DEL TRIBUNAL (20 minutos) — AMBAS

> **Protocolo:** escuchar la pregunta completa → identificar de qué bloque es (A = Stefanny, B = Adriana) → esa persona responde primero → la otra complementa si es necesario.

---

## Banco de respuestas preparadas

**¿Por qué DSR y no investigación experimental?** _(Stefanny)_
> *"DSR es el estándar cuando el resultado es un artefacto tecnológico. La investigación experimental estudia fenómenos que ya existen; aquí construimos algo nuevo para resolver un problema real. Las métricas son la evaluación del artefacto, no de una hipótesis."*

**¿Por qué PostgreSQL y no MongoDB o Pinecone?** _(Adriana)_
> *"Necesitamos relaciones estructuradas Y búsqueda vectorial en la misma base de datos con transacciones ACID. MongoDB pierde integridad relacional. Pinecone es solo vectorial y requeriría una segunda base de datos. PostgreSQL + pgvector resuelve ambas necesidades en un sistema único."*

**¿Cómo evitan que la IA invente datos?** _(Ambas)_
> *"Tres capas: temperatura baja (0.3) para reducir variabilidad, prompts con la instrucción explícita 'usa solo los datos del contexto, no inventes', y técnica RAG que inyecta únicamente datos reales del proyecto. La revisión final siempre es del investigador."*

**¿Por qué ChatGPT y no Gemini o Llama?** _(Ambas)_
> *"Gemini fue inconsistente en prompts largos de más de 1000 tokens. Llama requiere GPU costosa y tarda 10 a 15 segundos. ChatGPT gpt-4o-mini cuesta $0.15 por millón de tokens, responde en 2 a 4 segundos y sigue instrucciones complejas con precisión. La arquitectura permite cambiar de proveedor editando solo el adaptador."*

**¿Por qué solo 5 participantes en el estudio SUS?** _(Adriana)_
> *"Nielsen (1993) establece que 5 participantes detectan el 85% de los problemas de usabilidad. El objetivo fue validación de concepto, no un estudio epidemiológico. El resultado —84.5/100, percentil 90— es consistente con la literatura."*

**¿El sistema reemplaza al investigador?** _(Ambas)_
> *"No. Genera la estructura y el borrador; el investigador aporta juicio crítico, interpretación de resultados y responsabilidad intelectual del contenido. La IA automatiza lo repetitivo; el investigador hace lo que la IA no puede: pensar."*

**¿Qué pasa si OpenAI sube los precios o deja de funcionar?** _(Adriana)_
> *"La arquitectura usa el patrón Strategy en la capa de infraestructura. Cambiar de proveedor requiere crear un nuevo adaptador e indicarlo en la configuración; el núcleo del sistema no cambia. Es trabajo futuro implementar un adaptador para Gemini o Claude."*

**Si el investigador importa referencias manualmente, ¿dónde está la automatización?** _(Adriana)_
> *"La importación es el único paso manual porque implica acceder a bases académicas con credenciales institucionales. Todo lo demás —detección de duplicados, cribado, extracción RQS, generación del artículo, validación PRISMA— es completamente automático."*

**¿Por qué el rol de Stakeholder corresponde al Ing. Germán Rodríguez?** _(Stefanny)_
> *"En Scrum, el Stakeholder representa los intereses externos al equipo: usuarios finales, beneficiarios del sistema, o el contexto institucional. El Ing. Rodríguez cumple ese rol orientando el alcance del trabajo desde la perspectiva de la carrera, mientras el Product Owner —Ing. Galarza— gestiona el backlog y las prioridades del producto."*

---

## CHECKLIST ANTES DE ENTRAR

- [ ] Diapositivas cargadas: portada, brecha de herramientas, equipo Scrum, arquitectura 3 capas, flujo de fases, diagrama ER, métricas
- [ ] Métricas memorizadas: FCP 88 ms · LCP 432 ms · F1 = 0.863 · SUS = 84.5 · 91/91 pruebas · $0.082
- [ ] GitHub abierto en pestaña del navegador
- [ ] Tesis impresa con objetivos marcados
- [ ] Cronometrar la exposición: objetivo 28 minutos (2 de margen)
- [ ] Practicar respuestas del banco de preguntas en voz alta
- [ ] Confirmar quién habla en cada bloque y respetar el orden

---
*Actualizado: Febrero 2026 — Rúbrica ESPE · Equipo Scrum completo con Stakeholder · Fases corregidas · Distribución en pareja Stefanny / Adriana*