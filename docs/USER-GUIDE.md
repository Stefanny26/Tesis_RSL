# PRISMA AI - Guía de Usuario

## 📘 Introducción

Bienvenido al sistema **PRISMA AI**, tu asistente inteligente para realizar Revisiones Sistemáticas de Literatura con garantía de cumplimiento del estándar PRISMA 2020.

Esta guía te acompañará paso a paso en todo el proceso, desde la creación de tu proyecto hasta la validación final de los 27 ítems PRISMA.

---

## 🚀 Inicio Rápido

### 1. Acceso al Sistema

1. Abre tu navegador y ve a: `http://localhost:3000` (o la URL proporcionada)
2. **Primera vez:**
   - Click en "Registrarse"
   - Completa tus datos (nombre, email, contraseña)
   - Confirma tu cuenta por email
3. **Ya tienes cuenta:**
   - Click en "Iniciar Sesión"
   - Ingresa tu email y contraseña

### 2. Tu Primer Proyecto

Una vez dentro, verás el **Panel Principal** con tus estadísticas. Para crear tu primera revisión sistemática:

1. Click en el botón **"+ Nuevo Proyecto"**
2. Serás guiado por un asistente de 4 pasos
3. Al finalizar, tendrás tu proyecto listo para comenzar

---

## 📝 Fases de una Revisión Sistemática

El sistema te guía a través de 4 fases principales:

```
1️⃣ Protocolo PICO → 2️⃣ Búsqueda → 3️⃣ Cribado → 4️⃣ Validación PRISMA
```

Cada fase se desbloquea al completar la anterior, asegurando un flujo metodológico correcto.

---

## 1️⃣ Fase 1: Protocolo PICO

### ¿Qué es PICO?

PICO es un framework para formular preguntas de investigación claras:

- **P (Population):** ¿Quién es tu población de estudio?
  - *Ejemplo:* "Desarrolladores de software en equipos ágiles"
  
- **I (Intervention):** ¿Qué intervención estás evaluando?
  - *Ejemplo:* "Uso de metodología Scrum"
  
- **C (Comparison):** ¿Con qué lo comparas?
  - *Ejemplo:* "Metodología tradicional Waterfall"
  
- **O (Outcome):** ¿Qué resultados esperas medir?
  - *Ejemplo:* "Productividad, calidad del software, satisfacción del equipo"

### Asistente de IA para Cadenas de Búsqueda

Una vez definido tu PICO, la IA te ayudará a generar cadenas de búsqueda optimizadas:

1. Click en **"Generar Cadena con IA"**
2. La IA analizará tu protocolo PICO
3. Recibirás cadenas optimizadas para diferentes bases de datos:
   - **PubMed:** Con términos MeSH
   - **IEEE Xplore:** Con operadores booleanos específicos
   - **Scopus:** Con campos de búsqueda avanzada

**Ejemplo de cadena generada:**
```
("agile methodolog*" OR "scrum" OR "kanban") AND 
("software development" OR "software engineering") AND 
("productivity" OR "quality" OR "team satisfaction")
```

### Criterios de Elegibilidad

Define claramente qué estudios incluirás y excluirás:

**Criterios de Inclusión:**
- ✅ Estudios empíricos publicados en revistas peer-reviewed
- ✅ Idioma: inglés o español
- ✅ Fecha: 2015-2024
- ✅ Tipo: Ensayos controlados, estudios de caso, experimentos

**Criterios de Exclusión:**
- ❌ Literatura gris (tesis, informes técnicos)
- ❌ Estudios sin datos cuantitativos
- ❌ Revisiones secundarias (meta-análisis, revisiones narrativas)
- ❌ Artículos de opinión o editoriales

---

## 2️⃣ Fase 2: Búsqueda e Importación

### Búsqueda en Bases de Datos

1. Ve a la sección **"Cribado"**
2. Click en **"Buscar en Bases de Datos"**
3. Selecciona las bases de datos:
   - 🔬 PubMed/MEDLINE
   - 💻 IEEE Xplore
   - 📚 Scopus
   - 📖 Web of Science
   - 🏛️ ACM Digital Library
4. Pega tu cadena de búsqueda generada
5. Ejecuta la búsqueda
6. Exporta resultados en formato BibTeX o RIS

### Importación de Referencias

1. Desde la sección **"Cribado"**, click en **"Importar"**
2. Arrastra y suelta tu archivo o click para seleccionar
3. Formatos soportados:
   - `.bib` (BibTeX)
   - `.ris` (Research Information Systems)
   - `.csv` (valores separados por comas)
4. El sistema detectará y eliminará automáticamente duplicados
5. Revisa las referencias importadas
6. Click en **"Confirmar Importación"**

**💡 Tip:** Puedes importar desde múltiples bases de datos. El sistema consolidará todo y eliminará duplicados.

---

## 3️⃣ Fase 3: Cribado de Referencias

Esta es la fase más crítica. El sistema ofrece **dos métodos de cribado automático** y revisión manual.

### Método 1: Cribado con Embeddings (Recomendado para primer filtro)

**¿Cómo funciona?**
- Usa el modelo `all-MiniLM-L6-v2` para generar vectores semánticos
- Calcula la similitud de coseno entre tu protocolo PICO y cada referencia
- Clasifica basándose en un umbral de similitud

**Ventajas:**
- ⚡ **Muy rápido:** ~3 minutos por 1000 referencias
- 💰 **Sin costo:** No consume créditos de API
- 📊 **Consistente:** Siempre produce los mismos resultados

**Cómo usar:**
1. En el panel de **"Cribado Automático con IA"**, selecciona tab **"Embeddings"**
2. Ajusta el **umbral** con el slider (recomendado: 70%)
   - Umbral alto (80-90%): Más estricto, menos falsos positivos
   - Umbral bajo (60-70%): Más inclusivo, menos falsos negativos
3. Click en **"Ejecutar Cribado con Embeddings"**
4. Espera mientras se procesan (verás una barra de progreso)
5. Revisa los resultados con sus **scores de similitud**

**Interpretación de scores:**
- 🟢 **≥ 70%:** Altamente relevante → Revisar con prioridad
- 🟡 **60-69%:** Moderadamente relevante → Revisar manualmente
- 🔴 **< 60%:** Baja relevancia → Candidato a exclusión

### Método 2: Cribado con LLM (Para análisis detallado)

**¿Cómo funciona?**
- Envía cada referencia (título + abstract) a un LLM
- El LLM analiza con razonamiento contextual basado en tu PICO
- Proporciona una decisión (incluir/excluir) con explicación

**Proveedores disponibles:**

#### 🌟 Gemini 1.5 Pro (Google)
- **Modelo:** gemini-1.5-pro
- **Ventaja:** Razonamiento avanzado, contexto largo
- **Costo:** Bajo (API de Google)

#### 💎 ChatGPT GPT-4o-mini (OpenAI)
- **Modelo:** gpt-4o-mini
- **Ventaja:** Respuestas muy precisas
- **Costo:** Moderado

**Cómo usar:**
1. Tab **"LLM"** en el panel de cribado
2. Selecciona tu **proveedor** preferido (Gemini o ChatGPT)
3. Ajusta umbral si es necesario
4. Click en **"Ejecutar Cribado con [Proveedor]"**
5. El proceso será más lento (~30 seg por cada 10 referencias)
6. Revisa cada resultado con su **explicación**

**Ejemplo de explicación generada:**
```
✅ INCLUIR

Justificación:
Este estudio cumple con los criterios PICO:
- Población: Equipo de 8 desarrolladores usando Scrum
- Intervención: Implementación de Scrum en proyecto real
- Comparación: Se compara con fase previa usando Waterfall
- Outcomes: Mide productividad (story points), calidad (bugs) 
  y satisfacción (encuestas)

El diseño es un estudio de caso longitudinal con datos 
cuantitativos, publicado en revista indexada IEEE (2022).
```

### Revisión Manual

Independientemente del método automático usado, **siempre debes revisar manualmente**:

1. **Filtrar por estado:**
   - `Todas` - Ver todo
   - `Pendiente` - Sin revisar
   - `Incluida` - Marcadas para inclusión
   - `Excluida` - Descartadas

2. **Revisar cada referencia:**
   - Click en una fila para ver detalles completos
   - Lee título, abstract, autores, año
   - Verifica que cumple todos los criterios PICO
   - Verifica criterios de inclusión/exclusión

3. **Tomar decisión:**
   - **Incluir:** Click en botón verde "✓ Incluir"
   - **Excluir:** Click en botón rojo "✗ Excluir"
   - **Opcional:** Agrega una nota justificando tu decisión

4. **Acciones masivas:**
   - Selecciona múltiples referencias (checkbox)
   - Click en "Incluir seleccionadas" o "Excluir seleccionadas"

### Revisión por Pares (Metodología Cochrane)

Para mayor rigor, se recomienda **validación dual**:

1. **Revisor 1:**
   - Realiza el primer cribado completo
   - Marca todas las referencias como incluir/excluir

2. **Revisor 2:**
   - Revisa las mismas referencias independientemente
   - Sin ver las decisiones del Revisor 1

3. **Resolución de conflictos:**
   - El sistema detecta automáticamente desacuerdos
   - Los revisores discuten y alcanzan consenso
   - Se calcula el **Cohen's Kappa** para medir acuerdo:
     - κ > 0.80: Excelente acuerdo
     - κ 0.60-0.80: Buen acuerdo
     - κ < 0.60: Acuerdo moderado/pobre → Requiere más discusión

### Diagrama de Flujo PRISMA

Una vez completado el cribado:

1. Ve a **"Generar Diagrama PRISMA"**
2. El sistema generará automáticamente el flow chart:
   ```
   Registros identificados: 1,247
   ├─ Registros tras eliminar duplicados: 1,089
   ├─ Registros cribados: 1,089
   │  └─ Excluidos: 1,002
   ├─ Artículos a texto completo evaluados: 87
   │  └─ Excluidos (con razones): 64
   └─ Estudios incluidos en revisión: 23
   ```
3. Exporta como PNG o SVG para tu publicación

---

## 4️⃣ Fase 4: Validación PRISMA (AI Gatekeeper)

Esta es la **innovación central** del sistema. El AI Gatekeeper valida secuencialmente los 27 ítems PRISMA.

### ¿Cómo funciona el Gatekeeper?

1. **Secuencial:** Solo puedes trabajar en un ítem a la vez
2. **Bloqueado:** Los siguientes ítems están bloqueados hasta que el actual sea validado
3. **IA como validador:** La IA revisa tu contenido y decide si cumple el estándar
4. **Retroalimentación:** Si no aprueba, te da sugerencias específicas de mejora
5. **Desbloqueo:** Solo al aprobar, el siguiente ítem se desbloquea

### Proceso paso a paso

#### Paso 1: Seleccionar Ítem
1. Ve a **"Validación PRISMA"** en el menú del proyecto
2. Verás el checklist de 27 ítems en la barra lateral
3. Ítem 1 (Título) estará **desbloqueado** (🔓)
4. Ítems 2-27 estarán **bloqueados** (🔒)

#### Paso 2: Escribir Contenido
1. Click en Ítem 1
2. Lee la descripción del ítem:
   > "Identificar el reporte como una revisión sistemática"
3. En el editor de texto, escribe tu título:
   ```
   Efectividad de Metodologías Ágiles en el Desarrollo 
   de Software: Una Revisión Sistemática
   ```

#### Paso 3: Validar con IA
1. Click en **"Validar con IA"** (botón con ✨)
2. La IA analizará tu contenido en ~5 segundos
3. Recibirás una de dos respuestas:

**✅ Caso A: Aprobado**
```
✅ Validación Aprobada

Retroalimentación del AI Gatekeeper:
El título cumple correctamente con el ítem 1 de PRISMA:
- Identifica claramente el documento como "Revisión Sistemática"
- Es específico sobre el tema (metodologías ágiles)
- Es conciso y descriptivo
- Incluye población de estudio implícita (desarrollo de software)

✓ Este ítem ha sido validado exitosamente.
El Ítem 2 (Resumen Estructurado) ha sido desbloqueado.

[Botón: Continuar al Siguiente Ítem →]
```

**⚠️ Caso B: Requiere Mejoras**
```
⚠️ Requiere Mejoras

Retroalimentación del AI Gatekeeper:
El título proporcionado no cumple completamente con el ítem 1:

Problemas identificados:
❌ No identifica explícitamente el documento como 
   "revisión sistemática"

Sugerencias de mejora:
1. Agrega explícitamente las palabras "Revisión Sistemática" 
   o "Systematic Review" al título
2. Recomendación de estructura:
   "[Tema]: Una Revisión Sistemática" o 
   "Una Revisión Sistemática sobre [Tema]"

Ejemplo sugerido:
"Efectividad de Metodologías Ágiles en el Desarrollo de 
 Software: Una Revisión Sistemática de la Literatura"

[Botón: Editar y Reenviar]
```

#### Paso 4: Aplicar Mejoras (si es necesario)
1. Lee las sugerencias cuidadosamente
2. Edita tu contenido aplicando las mejoras
3. Click nuevamente en **"Validar con IA"**
4. Repite hasta obtener aprobación

#### Paso 5: Continuar al Siguiente Ítem
1. Una vez aprobado el Ítem 1, click en **"Continuar al Siguiente Ítem"**
2. El Ítem 2 se desbloqueará automáticamente
3. Repite el proceso para los 27 ítems

### Progreso y Estadísticas

En la parte superior verás tu progreso:

```
┌─────────────────────────────────────┐
│ Progreso de Validación       5/27   │
│ ─────────────────────── 19%         │
│ Completaste 5 de 27 ítems PRISMA    │
└─────────────────────────────────────┘
```

### Ítems con Contenido Pre-generado

Algunos ítems se completan automáticamente con datos de fases anteriores:

- **Ítem 3 (Justificación):** Se llena con tu descripción del proyecto
- **Ítem 4 (Objetivos):** Se llena con tu protocolo PICO
- **Ítem 5 (Criterios):** Se llena con tus criterios de elegibilidad
- **Ítem 6 (Fuentes):** Se llena con las bases de datos que consultaste
- **Ítem 16a (Diagrama PRISMA):** Se genera automáticamente del cribado

**💡 Tip:** Aunque estén pre-completados, la IA validará que estén bien formulados según PRISMA.

---

## 📊 Exportación de Resultados

### 1. Exportar Referencias
1. Ve a **"Cribado"**
2. Selecciona las referencias a exportar (o todas)
3. Click en **"Exportar"**
4. Elige formato:
   - **BibTeX (.bib):** Para gestores de referencias
   - **RIS (.ris):** Compatible con EndNote, Mendeley
   - **CSV (.csv):** Para análisis en Excel
   - **PDF:** Reporte formateado para imprimir

### 2. Exportar Diagrama PRISMA
1. Ve a **"Cribado"** → **"Diagrama PRISMA"**
2. Click en **"Exportar Diagrama"**
3. Formatos disponibles:
   - **PNG (alta resolución):** Para artículos
   - **SVG (vectorial):** Para edición posterior
   - **PDF:** Para documentos oficiales

### 3. Exportar Reporte PRISMA Completo
1. Ve a **"Validación PRISMA"**
2. Asegúrate de tener 27/27 ítems validados ✅
3. Click en **"Exportar Reporte Completo"**
4. Recibirás un PDF estructurado con:
   - Portada con información del proyecto
   - Los 27 ítems PRISMA con su contenido validado
   - Tablas de características de estudios
   - Diagrama de flujo PRISMA
   - Anexos con criterios y búsquedas

---

## ❓ Preguntas Frecuentes (FAQ)

### Generales

**P: ¿Es gratuito?**
R: El sistema es de uso académico. Los costos son solo por las APIs de IA (Gemini/ChatGPT) cuando usas el cribado con LLM.

**P: ¿Puedo trabajar en varios proyectos a la vez?**
R: Sí, puedes crear y gestionar múltiples proyectos de forma simultánea.

**P: ¿Mis datos están seguros?**
R: Sí. Todo se almacena en una base de datos PostgreSQL con conexión cifrada. Las contraseñas usan hash bcrypt.

### Sobre el Cribado

**P: ¿Qué método de cribado debo usar?**
R: Recomendamos comenzar con **Embeddings** (rápido y gratuito) y luego usar **LLM** solo en referencias dudosas.

**P: ¿Puedo combinar ambos métodos?**
R: Sí. Usa Embeddings para un primer filtro rápido, luego LLM para validar referencias en la zona gris (scores 60-75%).

**P: ¿Cuánto cuestan las llamadas a la API?**
R: **Gemini:** ~$0.0001 por referencia | **ChatGPT:** ~$0.0003 por referencia. 
Para 1000 referencias: Gemini ~$0.10, ChatGPT ~$0.30

**P: ¿El cribado automático reemplaza la revisión manual?**
R: **No.** El cribado automático es una **asistencia**, no un reemplazo. Siempre debes revisar manualmente las referencias importantes.

### Sobre PRISMA

**P: ¿Puedo saltarme ítems de PRISMA?**
R: No. El sistema es secuencial para garantizar metodología rigurosa. Cada ítem desbloquea el siguiente.

**P: ¿Qué pasa si la IA rechaza mi contenido repetidamente?**
R: Lee cuidadosamente las sugerencias. Si crees que es un error, puedes:
1. Revisar la documentación oficial de PRISMA 2020
2. Consultar con tu tutor/director
3. Ajustar el contenido hasta cumplir el estándar

**P: ¿Cuánto tiempo toma validar los 27 ítems?**
R: Depende de tu contenido. En promedio:
- Con contenido bien preparado: 2-3 horas
- Primera vez sin experiencia: 6-8 horas
- El sistema guía el proceso para hacerlo más eficiente

---

## 💡 Mejores Prácticas

### 1. Planificación
- ✅ Define un PICO específico y claro antes de comenzar
- ✅ Consulta con expertos para validar tus criterios
- ✅ Revisa ejemplos de RSLs publicadas en tu área

### 2. Búsqueda
- ✅ Usa múltiples bases de datos (mínimo 3)
- ✅ Documenta TODAS tus búsquedas con fechas
- ✅ Guarda las cadenas exactas que usaste
- ✅ Exporta resultados inmediatamente (las bases cambian)

### 3. Cribado
- ✅ Haz un piloto con 50 referencias antes del cribado masivo
- ✅ Si trabajas en equipo, calibra criterios entre revisores
- ✅ Usa Embeddings primero, LLM después
- ✅ Siempre revisa manualmente las incluidas finales

### 4. Validación PRISMA
- ✅ Lee la guía oficial de PRISMA 2020 antes de comenzar
- ✅ Prepara borradores de todos los ítems antes de validar
- ✅ No tengas prisa: la calidad es más importante que la velocidad
- ✅ Si la IA rechaza algo, es por una razón válida

### 5. Documentación
- ✅ Guarda copias de seguridad frecuentes
- ✅ Exporta resultados parciales regularmente
- ✅ Mantén un log de decisiones importantes
- ✅ Documenta cualquier desviación del protocolo

---

## 🆘 Solución de Problemas

### Error: "No se pudo conectar con la API de IA"
**Causas posibles:**
- API key inválida o expirada
- Límite de cuota de API alcanzado
- Problema de red

**Soluciones:**
1. Verifica tu conexión a internet
2. Contacta al administrador para verificar API keys
3. Espera unos minutos y reintenta (puede ser límite temporal)

### Error: "No se pudieron cargar las referencias"
**Causas posibles:**
- Formato de archivo incompatible
- Archivo corrupto
- Problema con la base de datos

**Soluciones:**
1. Verifica que el archivo sea .bib, .ris o .csv válido
2. Intenta abrir el archivo en un editor de texto para verificar
3. Exporta nuevamente desde la base de datos original
4. Contacta soporte si el problema persiste

### El cribado con Embeddings es muy lento
**Causas:**
- Muchas referencias (>5000)
- Recursos limitados del servidor

**Soluciones:**
1. Divide la importación en lotes más pequeños
2. Espera a horas de menor carga del sistema
3. Usa filtros previos en la base de datos (años, tipo de documento)

### La IA rechaza mi contenido pero creo que está correcto
**Qué hacer:**
1. Lee ATENTAMENTE las sugerencias de la IA
2. Consulta la guía oficial de PRISMA 2020 (ítem específico)
3. Compara con ejemplos de RSLs publicadas
4. Discute con tu tutor si persiste la duda
5. Recuerda: PRISMA es un estándar estricto por una razón

---

## 📞 Soporte y Contacto

### Soporte Técnico
- 📧 Email: pcgalarza@espe.edu.ec
- 🏫 Departamento de Ciencias de la Computación - ESPE
- 📍 Av. General Rumiñahui s/n, Sangolquí, Ecuador

### Recursos Adicionales
- 📖 [Guía oficial PRISMA 2020](http://www.prisma-statement.org/)
- 📚 [Cochrane Handbook](https://training.cochrane.org/handbook)
- 🎓 [Tutorials ESPE](https://www.espe.edu.ec)

---

**¡Éxito en tu Revisión Sistemática!** 🎓📚

*Esta guía es parte del sistema PRISMA AI desarrollado en la Universidad de las Fuerzas Armadas ESPE - 2025*
